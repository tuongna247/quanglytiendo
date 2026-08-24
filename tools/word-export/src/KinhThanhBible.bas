Attribute VB_Name = "KinhThanhBible"
'------------------------------------------------------------
' KinhThanhBible.bas — Doc bible.json, chen cau, gop song song
'
' Yeu cau:
'   - JsonConverter.bas (Tim Hall VBA-JSON) da import
'   - Reference: Tools > References > Microsoft Scripting Runtime
'   - bible.json nam cung folder voi tai lieu Word, hoac dat path
'     bang SetBibleJsonPath()
'
' Ban dich viet tat -> id trong bible.json xem BOOK_MAP.
'------------------------------------------------------------

Option Explicit

Private m_Bible As Object       ' Collection cua Dictionary theo id
Private m_BibleByID As Object   ' Dictionary id -> book object
Private m_JsonPath As String

'============================================================
' 1. PATH & LOAD
'============================================================
Public Sub SetBibleJsonPath(path As String)
    m_JsonPath = path
    Set m_Bible = Nothing
    Set m_BibleByID = Nothing
End Sub

Private Function GetBiblePath() As String
    If Len(m_JsonPath) > 0 Then
        GetBiblePath = m_JsonPath
        Exit Function
    End If

    ' Mac dinh: bible.json canh tai lieu, hoac canh template dinh kem.
    Dim candidates(1) As String
    candidates(0) = ActiveDocument.path & "\bible.json"
    candidates(1) = ActiveDocument.AttachedTemplate.path & "\bible.json"

    Dim i As Long
    For i = 0 To UBound(candidates)
        If Len(Dir(candidates(i))) > 0 Then
            GetBiblePath = candidates(i)
            Exit Function
        End If
    Next i

    ' Fallback: prompt
    Dim fd As FileDialog
    Set fd = Application.FileDialog(msoFileDialogFilePicker)
    fd.Title = "Chon bible.json"
    fd.Filters.Clear
    fd.Filters.Add "JSON", "*.json"
    If fd.Show = -1 Then
        GetBiblePath = fd.SelectedItems(1)
        m_JsonPath = GetBiblePath
    End If
End Function

Private Sub LoadBible()
    If Not m_Bible Is Nothing Then Exit Sub

    Dim path As String
    path = GetBiblePath()
    If Len(path) = 0 Then
        Err.Raise vbObjectError + 513, , "Khong tim thay bible.json"
    End If

    Dim jsonText As String
    jsonText = ReadFile(path)

    Set m_Bible = JsonConverter.ParseJson(jsonText)

    ' Xay dictionary id -> book
    Set m_BibleByID = CreateObject("Scripting.Dictionary")
    Dim book As Object
    For Each book In m_Bible
        m_BibleByID(LCase$(book("id"))) = book
    Next book
End Sub

Private Function ReadFile(path As String) As String
    Dim fso As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    Dim ts As Object
    Set ts = fso.OpenTextFile(path, 1, False, -1) ' -1 = TristateTrue = Unicode
    ' bible.json luu UTF-8. Doc bang ADO Stream de dung UTF-8:
    ts.Close

    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2 ' Text
    stream.Charset = "utf-8"
    stream.Open
    stream.LoadFromFile path
    ReadFile = stream.ReadText
    stream.Close
End Function

'============================================================
' 2. BOOK MAP — ten VN -> id JSON
'============================================================
Private Function BookIdFromVi(nameVi As String) As String
    ' Bo dau, thuong hoa, so sanh
    Dim key As String
    key = LCase$(NormalizeAscii(nameVi))
    key = Replace(key, " ", "")
    key = Replace(key, "-", "")
    key = Replace(key, ".", "")

    Select Case key
        ' Cuu Uoc
        Case "sang", "sangthe", "sangtheky":                BookIdFromVi = "gn"
        Case "xuat", "xuatai", "xuataicap":                 BookIdFromVi = "ex"
        Case "le", "leky":                                  BookIdFromVi = "lv"
        Case "dan", "danso", "dansoky":                     BookIdFromVi = "nm"
        Case "phuc", "phuctruyen":                          BookIdFromVi = "dt"
        Case "gios", "giosue":                              BookIdFromVi = "js"
        Case "quan", "quanxet":                             BookIdFromVi = "jud"
        Case "ru", "rutow", "rut":                          BookIdFromVi = "rt"
        Case "isa", "isamuen":                              BookIdFromVi = "1sm"
        Case "iisa", "iisamuen":                            BookIdFromVi = "2sm"
        Case "ivua":                                        BookIdFromVi = "1kgs"
        Case "iivua":                                       BookIdFromVi = "2kgs"
        Case "isu", "isuky":                                BookIdFromVi = "1ch"
        Case "iisu", "iisuky":                              BookIdFromVi = "2ch"
        Case "exo", "exora":                                BookIdFromVi = "ezr"
        Case "ne", "nehemi":                                BookIdFromVi = "ne"
        Case "et", "exote":                                 BookIdFromVi = "et"
        Case "giop", "giob":                                BookIdFromVi = "job"
        Case "thi", "thithien":                             BookIdFromVi = "ps"
        Case "cham", "chamngon":                            BookIdFromVi = "prv"
        Case "truyen", "truyendao":                         BookIdFromVi = "ec"
        Case "nha", "nhaca":                                BookIdFromVi = "so"
        Case "es", "esai":                                  BookIdFromVi = "is"
        Case "gie", "gieremi":                              BookIdFromVi = "jr"
        Case "ca", "caithuong":                             BookIdFromVi = "lm"
        Case "exe", "exechien":                             BookIdFromVi = "ez"
        Case "dan2", "danien":                              BookIdFromVi = "dn"
        Case "ose":                                         BookIdFromVi = "ho"
        Case "gioen":                                       BookIdFromVi = "jl"
        Case "amot":                                        BookIdFromVi = "am"
        Case "apdia":                                       BookIdFromVi = "ob"
        Case "giona":                                       BookIdFromVi = "jn"
        Case "miche":                                       BookIdFromVi = "mi"
        Case "nahum":                                       BookIdFromVi = "na"
        Case "habacuc":                                     BookIdFromVi = "hk"
        Case "sophoni":                                     BookIdFromVi = "zp"
        Case "aghe":                                        BookIdFromVi = "hg"
        Case "xachari":                                     BookIdFromVi = "zc"
        Case "malachi":                                     BookIdFromVi = "ml"
        ' Tan Uoc
        Case "mat", "mathio":                               BookIdFromVi = "mt"
        Case "mac":                                         BookIdFromVi = "mk"
        Case "lu", "luca":                                  BookIdFromVi = "lk"
        Case "gi", "giang":                                 BookIdFromVi = "jo"
        Case "cong", "congvu":                              BookIdFromVi = "act"
        Case "ro", "roma":                                  BookIdFromVi = "rm"
        Case "ico":                                         BookIdFromVi = "1co"
        Case "iico":                                        BookIdFromVi = "2co"
        Case "ga", "galati":                                BookIdFromVi = "gl"
        Case "eph", "ephe", "epheso":                       BookIdFromVi = "eph"
        Case "phi", "philip":                               BookIdFromVi = "ph"
        Case "col", "cole":                                 BookIdFromVi = "cl"
        Case "ite", "itesalonica":                          BookIdFromVi = "1ts"
        Case "iite", "iitesalonica":                        BookIdFromVi = "2ts"
        Case "iti", "itimothe":                             BookIdFromVi = "1tm"
        Case "iiti", "iitimothe":                           BookIdFromVi = "2tm"
        Case "tit":                                         BookIdFromVi = "tt"
        Case "philemon":                                    BookIdFromVi = "phm"
        Case "he", "hoboro":                                BookIdFromVi = "hb"
        Case "gia", "giaco":                                BookIdFromVi = "jm"
        Case "iphi":                                        BookIdFromVi = "1pe"
        Case "iiphi":                                       BookIdFromVi = "2pe"
        Case "igi":                                         BookIdFromVi = "1jo"
        Case "iigi":                                        BookIdFromVi = "2jo"
        Case "iiigi":                                       BookIdFromVi = "3jo"
        Case "giu":                                         BookIdFromVi = "jd"
        Case "kh", "khai", "khaihuyen":                     BookIdFromVi = "re"
        Case Else
            BookIdFromVi = ""
    End Select
End Function

Private Function NormalizeAscii(s As String) As String
    ' Bo dau tieng Viet don gian
    Dim src As String, dst As String
    src = "aaaaaaaaaaaaaaaaaAAAAAAAAAAAAAAAAAeeeeeeeeeeeEEEEEEEEEEEiiiiiIIIIIooooooooooooooooOOOOOOOOOOOOOOOOOuuuuuuuuuuuUUUUUUUUUUUyyyyyYYYYYdD"
    Dim vSrc As String
    vSrc = ChrW(225) & ChrW(224) & ChrW(7843) & ChrW(227) & ChrW(7841) & _
           ChrW(226) & ChrW(7845) & ChrW(7847) & ChrW(7849) & ChrW(7851) & ChrW(7853) & _
           ChrW(259) & ChrW(7855) & ChrW(7857) & ChrW(7859) & ChrW(7861) & ChrW(7863)
    ' Rut gon: dung phuong phap don gian - replace tung ky tu Unicode dau tieng Viet -> ascii
    Dim result As String
    Dim i As Long, ch As Long
    result = ""
    For i = 1 To Len(s)
        ch = AscW(Mid$(s, i, 1))
        result = result & StripDiacritic(ch)
    Next i
    NormalizeAscii = result
End Function

Private Function StripDiacritic(ch As Long) As String
    ' Map Unicode Vietnamese chars to ASCII base
    Select Case ch
        Case &HE1, &HE0, &H1EA3, &HE3, &H1EA1, _
             &HE2, &H1EA5, &H1EA7, &H1EA9, &H1EAB, &H1EAD, _
             &H103, &H1EAF, &H1EB1, &H1EB3, &H1EB5, &H1EB7
            StripDiacritic = "a"
        Case &HC1, &HC0, &H1EA2, &HC3, &H1EA0, _
             &HC2, &H1EA4, &H1EA6, &H1EA8, &H1EAA, &H1EAC, _
             &H102, &H1EAE, &H1EB0, &H1EB2, &H1EB4, &H1EB6
            StripDiacritic = "A"
        Case &HE9, &HE8, &H1EBB, &H1EBD, &H1EB9, _
             &HEA, &H1EBF, &H1EC1, &H1EC3, &H1EC5, &H1EC7
            StripDiacritic = "e"
        Case &HC9, &HC8, &H1EBA, &H1EBC, &H1EB8, _
             &HCA, &H1EBE, &H1EC0, &H1EC2, &H1EC4, &H1EC6
            StripDiacritic = "E"
        Case &HED, &HEC, &H1EC9, &H129, &H1ECB
            StripDiacritic = "i"
        Case &HCD, &HCC, &H1EC8, &H128, &H1ECA
            StripDiacritic = "I"
        Case &HF3, &HF2, &H1ECF, &HF5, &H1ECD, _
             &HF4, &H1ED1, &H1ED3, &H1ED5, &H1ED7, &H1ED9, _
             &H1A1, &H1EDB, &H1EDD, &H1EDF, &H1EE1, &H1EE3
            StripDiacritic = "o"
        Case &HD3, &HD2, &H1ECE, &HD5, &H1ECC, _
             &HD4, &H1ED0, &H1ED2, &H1ED4, &H1ED6, &H1ED8, _
             &H1A0, &H1EDA, &H1EDC, &H1EDE, &H1EE0, &H1EE2
            StripDiacritic = "O"
        Case &HFA, &HF9, &H1EE7, &H169, &H1EE5, _
             &H1B0, &H1EE9, &H1EEB, &H1EED, &H1EEF, &H1EF1
            StripDiacritic = "u"
        Case &HDA, &HD9, &H1EE6, &H168, &H1EE4, _
             &H1AF, &H1EE8, &H1EEA, &H1EEC, &H1EEE, &H1EF0
            StripDiacritic = "U"
        Case &HFD, &H1EF3, &H1EF7, &H1EF9, &H1EF5
            StripDiacritic = "y"
        Case &HDD, &H1EF2, &H1EF6, &H1EF8, &H1EF4
            StripDiacritic = "Y"
        Case &H111
            StripDiacritic = "d"
        Case &H110
            StripDiacritic = "D"
        Case Else
            StripDiacritic = ChrW(ch)
    End Select
End Function

'============================================================
' 3. LAY VAN BAN CAU
'============================================================
Public Function GetVerse(bookVi As String, chapter As Long, verse As Long) As String
    LoadBible

    Dim id As String
    id = BookIdFromVi(bookVi)
    If Len(id) = 0 Then
        GetVerse = "[?] Khong ro sach: " & bookVi
        Exit Function
    End If

    If Not m_BibleByID.Exists(id) Then
        GetVerse = "[?] Khong tim thay id: " & id
        Exit Function
    End If

    Dim book As Object
    Set book = m_BibleByID(id)
    Dim chapters As Object
    Set chapters = book("chapters")

    If chapter < 1 Or chapter > chapters.Count Then
        GetVerse = "[?] Doan " & chapter & " ngoai pham vi (" & book("id") & " co " & chapters.Count & " doan)"
        Exit Function
    End If

    ' chapters(chapter) la mot Collection cac item: hoac Dictionary heading, hoac String cau
    Dim chapObj As Object
    Set chapObj = chapters(chapter)

    Dim verseCount As Long
    Dim item As Variant
    verseCount = 0
    For Each item In chapObj
        If VarType(item) = vbString Then
            verseCount = verseCount + 1
            If verseCount = verse Then
                GetVerse = item
                Exit Function
            End If
        End If
    Next item

    GetVerse = "[?] Cau " & verse & " ngoai pham vi (doan " & chapter & " co " & verseCount & " cau)"
End Function

Public Function GetPassage(bookVi As String, chapter As Long, _
                           vStart As Long, vEnd As Long) As String
    Dim v As Long, result As String
    For v = vStart To vEnd
        Dim text As String
        text = GetVerse(bookVi, chapter, v)
        result = result & ChrW(&H207F + v - 48) & " " ' fallback: use superscript approach
        result = result & GetVerse(bookVi, chapter, v) & " "
    Next v
    GetPassage = Trim$(result)
End Function

Public Function GetPassageWithNumbers(bookVi As String, chapter As Long, _
                                      vStart As Long, vEnd As Long) As String
    Dim v As Long, result As String
    For v = vStart To vEnd
        Dim text As String
        text = GetVerse(bookVi, chapter, v)
        result = result & SuperscriptNumber(v) & " " & text
        If v < vEnd Then result = result & vbCr
    Next v
    GetPassageWithNumbers = result
End Function

Private Function SuperscriptNumber(n As Long) As String
    Dim s As String, digits As String, i As Long
    digits = CStr(n)
    For i = 1 To Len(digits)
        Select Case Mid$(digits, i, 1)
            Case "0": s = s & ChrW(&H2070)
            Case "1": s = s & ChrW(&HB9)
            Case "2": s = s & ChrW(&HB2)
            Case "3": s = s & ChrW(&HB3)
            Case Else: s = s & ChrW(&H2070 + CLng(Mid$(digits, i, 1)))
        End Select
    Next i
    SuperscriptNumber = s
End Function

'============================================================
' 4. CHEN CAU O CON TRO
'============================================================
Public Sub InsertPassageDialog()
    Dim refText As String
    refText = InputBox("Tham chieu (vd: Mac 1:1-8):", "Chen cau Kinh Thanh")
    If Len(refText) = 0 Then Exit Sub

    Dim parsed As Object
    Set parsed = ParseRef(refText)
    If parsed Is Nothing Then
        MsgBox "Cu phap sai. Dung: Mac 1:1-8 hoac Mac 1:5", vbExclamation
        Exit Sub
    End If

    Dim passage As String
    passage = GetPassageWithNumbers( _
        parsed("book"), parsed("chapter"), _
        parsed("vStart"), parsed("vEnd"))

    ' Chen header + passage
    Dim rng As Range
    Set rng = Selection.Range
    rng.InsertAfter refText & vbCr & passage & vbCr
    rng.Collapse wdCollapseEnd
    rng.Select
End Sub

'============================================================
' 5. SONG SONG (PARALLEL) - BANG
'============================================================
Public Sub InsertParallelDialog()
    Dim input As String
    input = InputBox( _
        "Danh sach tham chieu song song, cach nhau bang dau |." & vbCr & _
        "Vi du: Mat 3:1-12 | Mac 1:1-8 | Lu 3:1-18 | Gi 1:19-28", _
        "Chen phan song song")
    If Len(input) = 0 Then Exit Sub

    Dim refs() As String
    refs = Split(input, "|")

    Dim n As Long
    n = UBound(refs) - LBound(refs) + 1

    ' Tao bang 2 hang x n cot: hang 1 = header, hang 2 = noi dung
    Dim rng As Range
    Set rng = Selection.Range
    rng.Collapse wdCollapseEnd
    rng.InsertParagraphAfter
    rng.Move wdParagraph, 1

    Dim tbl As Table
    Set tbl = ActiveDocument.Tables.Add(Range:=rng, NumRows:=2, NumColumns:=n)
    tbl.Borders.Enable = True
    tbl.PreferredWidthType = wdPreferredWidthPercent
    tbl.PreferredWidth = 100

    Dim i As Long
    For i = 0 To n - 1
        Dim refText As String
        refText = Trim$(refs(LBound(refs) + i))

        Dim parsed As Object
        Set parsed = ParseRef(refText)

        tbl.Cell(1, i + 1).Range.Text = refText
        tbl.Cell(1, i + 1).Range.Bold = True

        If parsed Is Nothing Then
            tbl.Cell(2, i + 1).Range.Text = "[Sai cu phap]"
        Else
            tbl.Cell(2, i + 1).Range.Text = GetPassageWithNumbers( _
                parsed("book"), parsed("chapter"), _
                parsed("vStart"), parsed("vEnd"))
        End If
    Next i

    ' Di chuyen con tro ra sau bang
    Selection.EndOf wdTable
End Sub

'============================================================
' 6. PARSE REF: "Mac 1:1-8", "Mac 1:5", "Mac 1", "ICo 13:1-13"
'============================================================
Public Function ParseRef(refText As String) As Object
    Dim s As String
    s = Trim$(refText)

    ' Tach book va phan so
    Dim posColon As Long, posDash As Long
    Dim lastSpace As Long
    ' Tim khoang trang cuoi cung truoc phan digit
    Dim i As Long
    Dim inDigit As Boolean
    inDigit = False
    For i = Len(s) To 1 Step -1
        If Mid$(s, i, 1) Like "#" Then
            inDigit = True
        ElseIf inDigit And Mid$(s, i, 1) = " " Then
            lastSpace = i
            Exit For
        End If
    Next i

    If lastSpace = 0 Then
        Set ParseRef = Nothing
        Exit Function
    End If

    Dim book As String, numPart As String
    book = Trim$(Left$(s, lastSpace - 1))
    numPart = Trim$(Mid$(s, lastSpace + 1))

    ' Parse doan:cau
    Dim chapter As Long, vStart As Long, vEnd As Long
    posColon = InStr(numPart, ":")
    If posColon = 0 Then
        ' Ca doan
        chapter = CLng(numPart)
        vStart = 1
        vEnd = 999
    Else
        chapter = CLng(Left$(numPart, posColon - 1))
        Dim vPart As String
        vPart = Mid$(numPart, posColon + 1)
        posDash = InStr(vPart, "-")
        If posDash = 0 Then
            vStart = CLng(vPart)
            vEnd = vStart
        Else
            vStart = CLng(Left$(vPart, posDash - 1))
            vEnd = CLng(Mid$(vPart, posDash + 1))
        End If
    End If

    Dim d As Object
    Set d = CreateObject("Scripting.Dictionary")
    d("book") = book
    d("chapter") = chapter
    d("vStart") = vStart
    d("vEnd") = vEnd
    Set ParseRef = d
End Function

'============================================================
' 7. CHECK REFERENCES trong tai lieu
'============================================================
Public Sub CheckReferences()
    ' Quet tat ca [[...]] va bao neu sai cu phap hoac ngoai pham vi
    LoadBible

    Dim rng As Range
    Set rng = ActiveDocument.Content

    With rng.Find
        .ClearFormatting
        .Text = "\[\[*\]\]"
        .MatchWildcards = True
        .Forward = True
    End With

    Dim errors As String
    Dim errorCount As Long
    errorCount = 0

    Do While rng.Find.Execute
        Dim raw As String, inner As String
        raw = rng.Text
        inner = Mid$(raw, 3, Len(raw) - 4)

        Dim parsed As Object
        Set parsed = ParseRef(inner)
        If parsed Is Nothing Then
            errors = errors & "Sai cu phap: " & raw & vbCr
            errorCount = errorCount + 1
        Else
            Dim id As String
            id = BookIdFromVi(parsed("book"))
            If Len(id) = 0 Then
                errors = errors & "Khong ro sach: " & raw & vbCr
                errorCount = errorCount + 1
            ElseIf Not m_BibleByID.Exists(id) Then
                errors = errors & "ID khong ton tai: " & raw & " -> " & id & vbCr
                errorCount = errorCount + 1
            End If
        End If

        rng.Collapse wdCollapseEnd
    Loop

    If errorCount = 0 Then
        MsgBox "Tat ca tham chieu hop le.", vbInformation, "Kiem tra tham chieu"
    Else
        MsgBox errorCount & " loi:" & vbCr & vbCr & errors, vbExclamation, "Kiem tra tham chieu"
    End If
End Sub
