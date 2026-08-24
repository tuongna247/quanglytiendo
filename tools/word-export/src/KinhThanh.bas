Attribute VB_Name = "KinhThanh"
'------------------------------------------------------------
' KinhThanh.bas — VBA macros cho bible-learning.dotm
' Tuân theo bible-learning.md muc 4, 6.
'
' Cach dung:
'   1. Mo Word 2016 -> Alt+F11 -> File > Import File > chon file .bas
'   2. Chay AutoExec_KinhThanh 1 lan (hoac dong/mo lai Word neu la .dotm)
'   3. Cac phim tat + Ribbon "Kinh Thanh" san sang.
'
' Quy uoc dat ten Style:
'   Character Style: KT-LoiHua, KT-DanhXung, KT-MenhLenh, ...
'   Paragraph Style: KT-GhiChu, KT-HopBoiCanh, KT-HopTuGoc, ...
'
' Ten style dung dau gach ngang, khong dau (de tuong thich Pandoc + shortcut).
'------------------------------------------------------------

Option Explicit

'============================================================
' 1. AUTO-INIT
'============================================================
Public Sub AutoExec_KinhThanh()
    ' Chay tu dong khi mo .dotm hoac chay tay 1 lan
    EnsureAllStyles ActiveDocument
    BindShortcuts
    ' Skip prompt when Word is invisible (headless build)
    If Application.Visible Then
        MsgBox "Kinh Thanh tool san sang." & vbCrLf & _
               "Xem phim tat trong menu Ribbon > Kinh Thanh.", vbInformation, "bible-learning"
    End If
End Sub

'============================================================
' 2. HIGHLIGHT (CHARACTER STYLES) — muc 4 spec
'============================================================
Public Sub ApplyLoiHua():     ApplyCharStyle "KT-LoiHua":     End Sub
Public Sub ApplyDanhXung():   ApplyCharStyle "KT-DanhXung":   End Sub
Public Sub ApplyMenhLenh():   ApplyCharStyle "KT-MenhLenh":   End Sub
Public Sub ApplyCanhBao():    ApplyCharStyle "KT-CanhBao":    End Sub
Public Sub ApplyTienTri():    ApplyCharStyle "KT-TienTri":    End Sub
Public Sub ApplyBoiCanh():    ApplyCharStyle "KT-BoiCanh":    End Sub
Public Sub ApplyLapLai():     ApplyCharStyle "KT-LapLai":     End Sub
Public Sub ApplyTuongPhan():  ApplyCharStyle "KT-TuongPhan":  End Sub
Public Sub ApplyNhanQua():    ApplyCharStyle "KT-NhanQua":    End Sub
Public Sub ApplyTuGoc():      ApplyCharStyle "KT-TuGoc":      End Sub

Public Sub ClearHighlight()
    ' Xoa Character Style ve Default Paragraph Font
    Dim rng As Range
    Set rng = TargetRange()
    If rng Is Nothing Then Exit Sub
    rng.Style = ActiveDocument.Styles(wdStyleDefaultParagraphFont)
    rng.HighlightColorIndex = wdNoHighlight
End Sub

'------------------------------------------------------------
Private Sub ApplyCharStyle(styleName As String)
    Dim rng As Range
    Set rng = TargetRange()
    If rng Is Nothing Then Exit Sub

    EnsureAllStyles ActiveDocument ' idempotent

    On Error Resume Next
    rng.Style = ActiveDocument.Styles(styleName)
    ' Highlight khong luu duoc trong Character Style (read-only).
    ' Ap dung o cap character khi apply.
    rng.HighlightColorIndex = HighlightForStyle(styleName)
    On Error GoTo 0
End Sub

Private Function HighlightForStyle(styleName As String) As WdColorIndex
    Select Case styleName
        Case "KT-LoiHua":  HighlightForStyle = wdYellow
        Case "KT-LapLai":  HighlightForStyle = wdBrightGreen
        Case Else:         HighlightForStyle = wdNoHighlight
    End Select
End Function

Private Function TargetRange() As Range
    ' Neu co selection -> tra ve selection.
    ' Neu khong co selection -> chon word hien tai (word.Range).
    Dim rng As Range
    If Selection.Type = wdSelectionIP Then
        ' Insertion point: chon word hien tai
        Set rng = Selection.Words(1)
        ' Loai bo khoang trang cuoi word
        Do While rng.Characters.Count > 0 And _
                 (Right(rng.Text, 1) = " " Or Right(rng.Text, 1) = vbTab Or _
                  Right(rng.Text, 1) = vbCr Or Right(rng.Text, 1) = vbLf)
            rng.MoveEnd wdCharacter, -1
        Loop
    Else
        Set rng = Selection.Range
    End If
    Set TargetRange = rng
End Function

'============================================================
' 3. HOP GHI CHU (PARAGRAPH STYLES) — muc 6 spec
'============================================================
Public Sub InsertGhiChu():     InsertBoxPara "KT-GhiChu",     "Ghi chu: ": End Sub
Public Sub InsertBoiCanhBox(): InsertBoxPara "KT-HopBoiCanh", "Boi canh: ": End Sub
Public Sub InsertTuGocBox():   InsertBoxPara "KT-HopTuGoc",   "Tu goc: ":   End Sub
Public Sub InsertUngDung():    InsertBoxPara "KT-UngDung",    "Ung dung: ": End Sub
Public Sub InsertCauHoi():     InsertBoxPara "KT-CauHoi",     "Cau hoi: ":  End Sub
Public Sub InsertCanTraCuu():  InsertBoxPara "KT-CanTraCuu",  "[CAN TRA CUU] ": End Sub

Private Sub InsertBoxPara(styleName As String, prefix As String)
    EnsureAllStyles ActiveDocument
    Dim rng As Range
    Set rng = Selection.Range
    rng.Collapse wdCollapseEnd
    rng.InsertParagraphAfter
    rng.Move wdParagraph, 1
    On Error Resume Next
    rng.Style = ActiveDocument.Styles(styleName)
    On Error GoTo 0
    rng.InsertAfter prefix
    rng.Collapse wdCollapseEnd
    rng.Select
End Sub

'============================================================
' 4. ENSURE STYLES — tao style neu chua co
'============================================================
Public Sub EnsureAllStyles(Optional doc As Document = Nothing)
    If doc Is Nothing Then Set doc = ActiveDocument
    ' Character styles (muc 4) — highlight ap dung o ApplyCharStyle
    EnsureCharStyle doc, "KT-LoiHua",     RGB(0, 0, 0),     False, False
    EnsureCharStyle doc, "KT-DanhXung",   RGB(0, 32, 96),   True,  False
    EnsureCharStyle doc, "KT-MenhLenh",   RGB(0, 112, 0),   True,  False
    EnsureCharStyle doc, "KT-CanhBao",    RGB(192, 0, 0),   False, False
    EnsureCharStyle doc, "KT-TienTri",    RGB(112, 48, 160), False, False
    EnsureCharStyle doc, "KT-BoiCanh",    RGB(96, 96, 96),  False, True
    EnsureCharStyle doc, "KT-LapLai",     RGB(0, 0, 0),     False, False
    EnsureCharStyle doc, "KT-TuongPhan",  RGB(128, 0, 0),   True,  False
    EnsureCharStyle doc, "KT-NhanQua",    RGB(197, 90, 17), True,  False
    EnsureCharStyle doc, "KT-TuGoc",      RGB(0, 0, 0),     False, True

    ' Paragraph styles (muc 6)
    EnsureParaBox doc, "KT-GhiChu",     RGB(240, 245, 255), RGB(180, 200, 230)
    EnsureParaBox doc, "KT-HopBoiCanh", RGB(245, 245, 245), RGB(180, 180, 180)
    EnsureParaBox doc, "KT-HopTuGoc",   RGB(255, 250, 235), RGB(210, 180, 130)
    EnsureParaBox doc, "KT-UngDung",    RGB(232, 245, 233), RGB(120, 180, 130)
    EnsureParaBox doc, "KT-CauHoi",     RGB(255, 245, 230), RGB(230, 180, 100)
    EnsureParaBox doc, "KT-CanTraCuu",  RGB(255, 235, 235), RGB(220, 100, 100)
End Sub

Private Sub EnsureCharStyle(doc As Document, name As String, _
                            colorRGB As Long, isBold As Boolean, _
                            isItalic As Boolean)
    Dim st As Style
    On Error Resume Next
    Set st = doc.Styles(name)
    On Error GoTo 0

    If st Is Nothing Then
        Set st = doc.Styles.Add(name, wdStyleTypeCharacter)
    End If

    With st.Font
        .Color = colorRGB
        .Bold = isBold
        .Italic = isItalic
    End With
End Sub

Private Sub EnsureParaBox(doc As Document, name As String, _
                          bgColor As Long, borderColor As Long)
    Dim st As Style
    On Error Resume Next
    Set st = doc.Styles(name)
    On Error GoTo 0

    If st Is Nothing Then
        Set st = doc.Styles.Add(name, wdStyleTypeParagraph)
    End If

    With st.ParagraphFormat
        .LeftIndent = CentimetersToPoints(0.5)
        .RightIndent = CentimetersToPoints(0.5)
        .SpaceBefore = 4
        .SpaceAfter = 4
        .Shading.BackgroundPatternColor = bgColor
        Dim brd As Variant
        For Each brd In Array(wdBorderTop, wdBorderBottom, wdBorderLeft, wdBorderRight)
            With .Borders(brd)
                .LineStyle = wdLineStyleSingle
                .LineWidth = wdLineWidth050pt
                .Color = borderColor
            End With
        Next brd
    End With

    st.Font.Size = 11
End Sub

'============================================================
' 5. PHIM TAT
'============================================================
Public Sub BindShortcuts()
    ' Ctrl+Alt+<letter> conflict voi AltGr tren ban phim VN (® ¢ ™ €...).
    ' Dung Ctrl+Shift cho highlight, Ctrl+Alt+Shift cho box.
    UnbindOldShortcuts

    ' Character styles - Ctrl+Shift+<letter>
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyL), "ApplyLoiHua"     ' L = Loi hua
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyD), "ApplyDanhXung"   ' D = Danh xung
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyM), "ApplyMenhLenh"   ' M = Menh lenh
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyC), "ApplyCanhBao"    ' C = Canh bao
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyY), "ApplyTienTri"    ' Y = prophecY (T dung cho box TuGoc)
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyO), "ApplyBoiCanh"    ' O = cOntext
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyE), "ApplyLapLai"     ' E = rEpeat (R dung cho box CanTraCuu)
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyP), "ApplyTuongPhan"  ' P = tuong Phan
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyN), "ApplyNhanQua"    ' N = Nhan qua
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKeyK), "ApplyTuGoc"      ' K = greeK
    BindKey BuildKeyCode2(wdKeyControl, wdKeyShift, wdKey0), "ClearHighlight"

    ' Box styles - Ctrl+Alt+Shift+<letter>
    ' AltGr = Ctrl+Alt (khong Shift), nen them Shift la tranh duoc conflict.
    BindKey BuildKeyCode2(wdKeyControl, wdKeyAlt, wdKeyShift, wdKeyG), "InsertGhiChu"
    BindKey BuildKeyCode2(wdKeyControl, wdKeyAlt, wdKeyShift, wdKeyB), "InsertBoiCanhBox"
    BindKey BuildKeyCode2(wdKeyControl, wdKeyAlt, wdKeyShift, wdKeyT), "InsertTuGocBox"
    BindKey BuildKeyCode2(wdKeyControl, wdKeyAlt, wdKeyShift, wdKeyU), "InsertUngDung"
    BindKey BuildKeyCode2(wdKeyControl, wdKeyAlt, wdKeyShift, wdKeyH), "InsertCauHoi"
    BindKey BuildKeyCode2(wdKeyControl, wdKeyAlt, wdKeyShift, wdKeyR), "InsertCanTraCuu"
End Sub

Private Sub UnbindOldShortcuts()
    ' Xoa cac binding Ctrl+Alt+<letter> cu tren Normal.dotm (neu con).
    Dim ctx As Variant
    ctx = CustomizationContext
    On Error Resume Next

    CustomizationContext = NormalTemplate
    Dim macros As Variant, m As Variant
    macros = Array("ApplyLoiHua", "ApplyDanhXung", "ApplyMenhLenh", _
                   "ApplyCanhBao", "ApplyTienTri", "ApplyBoiCanh", _
                   "ApplyLapLai", "ApplyTuongPhan", "ApplyNhanQua", _
                   "ApplyTuGoc", "ClearHighlight", _
                   "InsertGhiChu", "InsertBoiCanhBox", "InsertTuGocBox", _
                   "InsertUngDung", "InsertCauHoi", "InsertCanTraCuu")
    For Each m In macros
        Dim kb As KeyBinding
        Dim i As Long
        For i = KeyBindings.Count To 1 Step -1
            Set kb = KeyBindings(i)
            If kb.Command = CStr(m) Then kb.Clear
        Next i
    Next m

    CustomizationContext = ctx
    On Error GoTo 0
End Sub

Private Sub BindKey(keyCode As Long, macroName As String)
    ' Luu key binding vao chinh tai lieu (khong ghi de Normal.dotm).
    On Error Resume Next
    CustomizationContext = ActiveDocument
    KeyBindings.Add KeyCode:=keyCode, _
                    KeyCategory:=wdKeyCategoryMacro, _
                    Command:=macroName
    On Error GoTo 0
End Sub

Private Function BuildKeyCode(k1 As Long, k2 As Long, k3 As Long) As Long
    BuildKeyCode = BuildKeyCode2(k1, k2, k3)
End Function

Private Function BuildKeyCode2(ParamArray keys() As Variant) As Long
    Dim result As Long, i As Long
    result = 0
    For i = LBound(keys) To UBound(keys)
        result = result + CLng(keys(i))
    Next i
    BuildKeyCode2 = result
End Function

'============================================================
' 6. CALLBACKS RIBBON (customUI14.xml)
'============================================================
Public Sub RibbonHighlight(control As Object)
    Select Case control.ID
        Case "btnLoiHua":    ApplyLoiHua
        Case "btnDanhXung":  ApplyDanhXung
        Case "btnMenhLenh":  ApplyMenhLenh
        Case "btnCanhBao":   ApplyCanhBao
        Case "btnTienTri":   ApplyTienTri
        Case "btnBoiCanh":   ApplyBoiCanh
        Case "btnLapLai":    ApplyLapLai
        Case "btnTuongPhan": ApplyTuongPhan
        Case "btnNhanQua":   ApplyNhanQua
        Case "btnTuGoc":     ApplyTuGoc
        Case "btnClear":     ClearHighlight
    End Select
End Sub

Public Sub RibbonBox(control As Object)
    Select Case control.ID
        Case "btnGhiChu":     InsertGhiChu
        Case "btnBoiCanhBox": InsertBoiCanhBox
        Case "btnTuGocBox":   InsertTuGocBox
        Case "btnUngDung":    InsertUngDung
        Case "btnCauHoi":     InsertCauHoi
        Case "btnCanTraCuu":  InsertCanTraCuu
    End Select
End Sub

Public Sub RibbonBible(control As Object)
    Select Case control.ID
        Case "btnChenCau":     KinhThanhBible.InsertPassageDialog
        Case "btnSongSong":    KinhThanhBible.InsertParallelDialog
        Case "btnCheckRef":    KinhThanhBible.CheckReferences
    End Select
End Sub
