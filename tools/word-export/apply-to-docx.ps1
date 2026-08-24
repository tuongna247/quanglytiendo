#Requires -Version 5.1
<#
.SYNOPSIS
    Apply Kinh Thanh tool (VBA + Ribbon + KT-* styles) to an existing .docx.

.DESCRIPTION
    Opens a .docx, imports the 3 VBA modules, creates all KT-* character
    and paragraph styles, saves as .docm, then injects customUI14.xml
    for the Ribbon.

.EXAMPLE
    PS> ./apply-to-docx.ps1 -In ../Mac_NghieemCuu_LoiChua.docx
    -> writes Mac_NghieemCuu_LoiChua.docm next to the source

    PS> ./apply-to-docx.ps1 -In C:\ban\Mac.docx -Out C:\out\Mac.docm

.PREREQUISITE
    - Word 2016+ installed
    - "Trust access to the VBA project object model" enabled in Word
#>

param(
    [Parameter(Mandatory)][string]$In,
    [string]$Out,
    [string]$SrcDir = (Join-Path $PSScriptRoot 'src'),
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

$In = (Resolve-Path $In).Path
if (-not $Out) {
    $Out = [IO.Path]::ChangeExtension($In, '.docm')
}

if ((Test-Path $Out) -and -not $Force) {
    Write-Host "File already exists: $Out" -ForegroundColor Yellow
    Write-Host "Use -Force to overwrite." -ForegroundColor Yellow
    exit 1
}

# Ensure JsonConverter.bas exists
$jc = Join-Path $SrcDir 'JsonConverter.bas'
if (-not (Test-Path $jc)) {
    Write-Host "Downloading JsonConverter.bas..." -ForegroundColor Cyan
    Invoke-WebRequest -UseBasicParsing `
        -Uri 'https://raw.githubusercontent.com/VBA-tools/VBA-JSON/master/JsonConverter.bas' `
        -OutFile $jc
}

foreach ($f in 'KinhThanh.bas','KinhThanhBible.bas','JsonConverter.bas','customUI14.xml') {
    $p = Join-Path $SrcDir $f
    if (-not (Test-Path $p)) { throw "Missing source: $p" }
}

# ---------- helper functions ----------
function Ensure-CharStyle($doc, $name, $r, $g, $b, $bold, $italic) {
    try { $null = $doc.Styles.Item($name); return $false } catch {}
    $s = $doc.Styles.Add($name, 2)  # wdStyleTypeCharacter
    $s.Font.Color = ($b -shl 16) -bor ($g -shl 8) -bor $r
    $s.Font.Bold = $bold
    $s.Font.Italic = $italic
    return $true
}

function Ensure-ParaStyle($doc, $name, $bgR, $bgG, $bgB, $brR, $brG, $brB) {
    try { $null = $doc.Styles.Item($name); return $false } catch {}
    $s = $doc.Styles.Add($name, 1)  # wdStyleTypeParagraph
    $s.ParagraphFormat.LeftIndent = 14
    $s.ParagraphFormat.RightIndent = 14
    $s.ParagraphFormat.SpaceBefore = 4
    $s.ParagraphFormat.SpaceAfter = 4
    $bg = ($bgB -shl 16) -bor ($bgG -shl 8) -bor $bgR
    $br = ($brB -shl 16) -bor ($brG -shl 8) -bor $brR
    $s.ParagraphFormat.Shading.BackgroundPatternColor = $bg
    foreach ($side in -1,-2,-3,-4) {
        $b = $s.ParagraphFormat.Borders.Item($side)
        $b.LineStyle = 1; $b.LineWidth = 4; $b.Color = $br
    }
    $s.Font.Size = 11
    return $true
}

# ---------- start ----------
Stop-Process -Name winword -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "1. Open: $In" -ForegroundColor Cyan
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Open($In)
    Start-Sleep -Seconds 2

    Write-Host "2. Import VBA modules" -ForegroundColor Cyan
    foreach ($bas in 'JsonConverter.bas','KinhThanh.bas','KinhThanhBible.bas') {
        try {
            $doc.VBProject.VBComponents.Import((Join-Path $SrcDir $bas)) | Out-Null
        } catch {
            throw "Import $bas failed. Enable 'Trust access to the VBA project object model'. $($_.Exception.Message)"
        }
        Write-Host "  -> $bas" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }

    Write-Host "3. Create KT-* character styles" -ForegroundColor Cyan
    $c = 0
    if (Ensure-CharStyle $doc 'KT-LoiHua'     0   0   0    $false $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-DanhXung'   0   32  96   $true  $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-MenhLenh'   0   112 0    $true  $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-CanhBao'    192 0   0    $false $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-TienTri'    112 48  160  $false $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-BoiCanh'    96  96  96   $false $true)  { $c++ }
    if (Ensure-CharStyle $doc 'KT-LapLai'     0   0   0    $false $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-TuongPhan'  128 0   0    $true  $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-NhanQua'    197 90  17   $true  $false) { $c++ }
    if (Ensure-CharStyle $doc 'KT-TuGoc'      0   0   0    $false $true)  { $c++ }
    Write-Host "  $c character styles" -ForegroundColor Green

    Write-Host "4. Create KT-* paragraph styles" -ForegroundColor Cyan
    $p = 0
    if (Ensure-ParaStyle $doc 'KT-GhiChu'     240 245 255  180 200 230) { $p++ }
    if (Ensure-ParaStyle $doc 'KT-HopBoiCanh' 245 245 245  180 180 180) { $p++ }
    if (Ensure-ParaStyle $doc 'KT-HopTuGoc'   255 250 235  210 180 130) { $p++ }
    if (Ensure-ParaStyle $doc 'KT-UngDung'    232 245 233  120 180 130) { $p++ }
    if (Ensure-ParaStyle $doc 'KT-CauHoi'     255 245 230  230 180 100) { $p++ }
    if (Ensure-ParaStyle $doc 'KT-CanTraCuu'  255 235 235  220 100 100) { $p++ }
    Write-Host "  $p paragraph styles" -ForegroundColor Green

    Start-Sleep -Seconds 2

    Write-Host "5. SaveAs .docm" -ForegroundColor Cyan
    $doc.SaveAs($Out, 13)  # wdFormatXMLDocumentMacroEnabled
    Write-Host "  Saved: $((Get-Item $Out).Length) bytes" -ForegroundColor Green

    $doc.Close()
} finally {
    try { $word.Quit() } catch {}
    if ($word) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null }
    Remove-Variable doc, word -ErrorAction SilentlyContinue
    [gc]::Collect(); [gc]::WaitForPendingFinalizers()
}

Write-Host "6. Inject customUI14.xml (Ribbon)" -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($Out, 'Update')
try {
    $cui = [System.IO.File]::ReadAllBytes((Join-Path $SrcDir 'customUI14.xml'))
    $existing = $zip.Entries | Where-Object { $_.FullName -eq 'customUI/customUI14.xml' }
    if ($existing) { $existing.Delete() }
    $cuiE = $zip.CreateEntry('customUI/customUI14.xml', 'Optimal')
    $cs = $cuiE.Open()
    $cs.Write($cui, 0, $cui.Length); $cs.Dispose()

    $relsE = $zip.GetEntry('_rels/.rels')
    $rs = $relsE.Open()
    $rr = New-Object System.IO.StreamReader($rs)
    $rx = $rr.ReadToEnd(); $rr.Close()
    if ($rx -notmatch 'ribbonExtensibility') {
        $rx = $rx -replace '</Relationships>', `
            '<Relationship Id="rId101" Type="http://schemas.microsoft.com/office/2007/relationships/ui/extensibility" Target="customUI/customUI14.xml"/></Relationships>'
        $relsE.Delete()
        $newR = $zip.CreateEntry('_rels/.rels', 'Optimal')
        $rns = $newR.Open()
        $wr = New-Object System.IO.StreamWriter($rns, [System.Text.Encoding]::UTF8)
        $wr.Write($rx); $wr.Flush(); $rns.Dispose()
    }
} finally { $zip.Dispose() }

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  $Out ($((Get-Item $Out).Length) bytes)"
Write-Host ""
Write-Host "Open it in Word, enable macros, and use Ribbon > Kinh Thanh."
Write-Host "Run AutoExec_KinhThanh (Alt+F8) once to bind keyboard shortcuts."
