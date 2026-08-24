#Requires -Version 5.1
<#
.SYNOPSIS
    Build bible-learning.dotm (Word Template with Macros + Ribbon).

.DESCRIPTION
    - Download JsonConverter.bas if missing (Tim Hall VBA-JSON, MIT).
    - Use Word COM to create a .docm with the 3 VBA modules imported.
    - Rename to .dotm and patch [Content_Types].xml.
    - Inject customUI14.xml so the "Kinh Thanh" Ribbon shows up.
    - Output: bible-learning.dotm in the current folder.

.PREREQUISITE
    - Microsoft Word 2016+ installed.
    - Word > File > Options > Trust Center > Trust Center Settings >
      Macro Settings: enable "Trust access to the VBA project object model".

.EXAMPLE
    PS> ./build.ps1
    PS> ./build.ps1 -Force        # overwrite existing bible-learning.dotm
#>

param(
    [string]$OutDir = $PSScriptRoot,
    [string]$SrcDir = (Join-Path $PSScriptRoot 'src'),
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

# ============================================================
# 1. Check prerequisites
# ============================================================
try {
    Get-ItemProperty 'HKLM:\SOFTWARE\Classes\Word.Application\CLSID' -ErrorAction Stop | Out-Null
} catch {
    throw "Microsoft Word not installed or COM not registered."
}

$outFile = Join-Path $OutDir 'bible-learning.dotm'
if ((Test-Path $outFile) -and -not $Force) {
    Write-Host "File already exists: $outFile" -ForegroundColor Yellow
    Write-Host "Use -Force to overwrite." -ForegroundColor Yellow
    exit 1
}

# ============================================================
# 2. Download JsonConverter.bas if missing
# ============================================================
$jsonConverter = Join-Path $SrcDir 'JsonConverter.bas'
if (-not (Test-Path $jsonConverter)) {
    Write-Host "Downloading JsonConverter.bas..." -ForegroundColor Cyan
    $url = 'https://raw.githubusercontent.com/VBA-tools/VBA-JSON/master/JsonConverter.bas'
    Invoke-WebRequest -Uri $url -OutFile $jsonConverter -UseBasicParsing
    Write-Host "  -> $jsonConverter" -ForegroundColor Green
}

foreach ($f in 'KinhThanh.bas','KinhThanhBible.bas','JsonConverter.bas','customUI14.xml') {
    $p = Join-Path $SrcDir $f
    if (-not (Test-Path $p)) { throw "Missing source file: $p" }
}

# ============================================================
# 3. Create .docm via Word COM
#
# NOTES:
#   - We save as .docm (format 13) not .dotm (15) because SaveAs to
#     .dotm hangs on some Word installs when driven headless. We rename
#     to .dotm below and patch [Content_Types].xml.
#   - Sleeps after Import are required so Word can finish compiling
#     the module; without them SaveAs returns RPC_E_CALL_REJECTED.
#   - Use $word.Quit() NOT $word.Quit(0). PowerShell rejects the arg
#     because Quit's parameter is [ref] optional.
# ============================================================
Stop-Process -Name winword -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$rand = [guid]::NewGuid().ToString('N').Substring(0,8)
$tmpDocm = Join-Path $env:TEMP "bl-build-$rand.docm"
$tmpDotm = Join-Path $env:TEMP "bl-build-$rand.dotm"

Write-Host "Starting Word..." -ForegroundColor Cyan
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Add()
    Start-Sleep -Seconds 2

    Write-Host "Importing VBA modules..." -ForegroundColor Cyan
    foreach ($basName in 'JsonConverter.bas','KinhThanh.bas','KinhThanhBible.bas') {
        $basPath = Join-Path $SrcDir $basName
        try {
            $doc.VBProject.VBComponents.Import($basPath) | Out-Null
        } catch {
            throw @"
Could not import $basName. Enable this Word setting first:
  File > Options > Trust Center > Trust Center Settings > Macro Settings
  [x] Trust access to the VBA project object model

Detail: $($_.Exception.Message)
"@
        }
        Write-Host "  -> $basName" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    Start-Sleep -Seconds 3

    Write-Host "Saving as .docm..." -ForegroundColor Cyan
    $doc.SaveAs($tmpDocm, 13)
    Write-Host "  Saved ($((Get-Item $tmpDocm).Length) bytes)." -ForegroundColor Green

    $doc.Close()
} finally {
    try { $word.Quit() } catch {}
    if ($word) {
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    }
    Remove-Variable doc, word -ErrorAction SilentlyContinue
    [gc]::Collect()
    [gc]::WaitForPendingFinalizers()
}

if (-not (Test-Path $tmpDocm)) { throw "Word did not produce $tmpDocm" }

# ============================================================
# 4. Rename .docm -> .dotm and patch [Content_Types].xml
# ============================================================
Write-Host "Converting to .dotm..." -ForegroundColor Cyan
Move-Item -Path $tmpDocm -Destination $tmpDotm -Force

Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($tmpDotm, 'Update')
try {
    # 4a. Patch content type: document -> template
    $ctEntry = $zip.GetEntry('[Content_Types].xml')
    $s = $ctEntry.Open()
    $reader = New-Object System.IO.StreamReader($s)
    $ctXml = $reader.ReadToEnd()
    $reader.Close()

    $ctXml = $ctXml -replace `
        'application/vnd\.ms-word\.document\.macroEnabled\.main\+xml', `
        'application/vnd.ms-word.template.macroEnabledTemplate.main+xml'

    $ctEntry.Delete()
    $newCt = $zip.CreateEntry('[Content_Types].xml', 'Optimal')
    $ns = $newCt.Open()
    $writer = New-Object System.IO.StreamWriter($ns, [System.Text.Encoding]::UTF8)
    $writer.Write($ctXml); $writer.Flush(); $ns.Dispose()

    # 4b. Inject customUI/customUI14.xml
    Write-Host "Injecting Ribbon (customUI14.xml)..." -ForegroundColor Cyan
    $cui = [System.IO.File]::ReadAllBytes((Join-Path $SrcDir 'customUI14.xml'))
    $cuiEntry = $zip.CreateEntry('customUI/customUI14.xml', 'Optimal')
    $cs = $cuiEntry.Open()
    $cs.Write($cui, 0, $cui.Length); $cs.Dispose()

    # 4c. Add ribbon relationship in _rels/.rels
    $relsEntry = $zip.GetEntry('_rels/.rels')
    $rs = $relsEntry.Open()
    $rr = New-Object System.IO.StreamReader($rs)
    $relsXml = $rr.ReadToEnd(); $rr.Close()

    if ($relsXml -notmatch 'ribbonExtensibility') {
        $relsXml = $relsXml -replace `
            '</Relationships>', `
            '<Relationship Id="rId101" Type="http://schemas.microsoft.com/office/2007/relationships/ui/extensibility" Target="customUI/customUI14.xml"/></Relationships>'

        $relsEntry.Delete()
        $newR = $zip.CreateEntry('_rels/.rels', 'Optimal')
        $rns = $newR.Open()
        $wr = New-Object System.IO.StreamWriter($rns, [System.Text.Encoding]::UTF8)
        $wr.Write($relsXml); $wr.Flush(); $rns.Dispose()
    }
} finally {
    $zip.Dispose()
}

# ============================================================
# 5. Move to output
# ============================================================
Copy-Item -Path $tmpDotm -Destination $outFile -Force
Remove-Item -Path $tmpDotm -Force

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  $outFile ($((Get-Item $outFile).Length) bytes)"
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. Copy $outFile to `$env:APPDATA\Microsoft\Templates\"
Write-Host "  2. Word > File > New > Personal > bible-learning"
Write-Host "  3. Enable macros when prompted."
Write-Host "  4. Alt+F8 -> run AutoExec_KinhThanh once to bind shortcuts."
