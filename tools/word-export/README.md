# word-tool — Công cụ Word cho `bible-learning.md`

Tài liệu này là **cấu phần Word** của dự án. Mục tiêu: soạn ghi chú Kinh
Thánh **trực tiếp trong Word 2016** với đúng bộ Style của
[`bible-learning.md`](../bible-learning.md), thao tác bằng phím tắt và
Ribbon riêng.

Cụ thể:

1. **Highlight từng từ** — chọn 1 từ/cụm → 1 phím tắt = tô đúng màu +
   Style tương ứng (Lời Hứa, Danh Xưng, Mệnh Lệnh…).
2. **Gộp phần song song** — nhập `Mat 3:1-12 | Mac 1:1-8 | Lu 3:1-18 |
   Gi 1:19-28` → tự chèn bảng 4 cột lấy văn bản từ `bible.json`.
3. **Kiểm tra tham chiếu** — quét mọi `[[Mac 1:8]]` trong tài liệu, báo
   sai cú pháp / sai mã sách.

---

## 1. Cấu trúc thư mục

```
word-tool/
├── README.md            # File này
├── build.ps1            # Script tự dựng bible-learning.dotm
└── src/
    ├── KinhThanh.bas       # VBA: highlight, hộp ghi chú, phím tắt, ribbon callback
    ├── KinhThanhBible.bas  # VBA: đọc bible.json, chèn câu, gộp song song
    ├── customUI14.xml      # Ribbon "Kinh Thánh"
    └── JsonConverter.bas   # (tự tải khi build) VBA-JSON của Tim Hall
```

---

## 2. Cài đặt tự động (khuyến nghị)

### Bước 1: Bật quyền cho macro build

Word > File > Options > Trust Center > **Trust Center Settings** >
Macro Settings:

- [x] Trust access to the VBA project object model

Không tick ô này thì `build.ps1` không import được module.

### Bước 2: Chạy build.ps1

Mở PowerShell tại thư mục `word-tool/` rồi chạy:

```powershell
./build.ps1
```

Script sẽ:

1. Tải `JsonConverter.bas` từ GitHub nếu chưa có.
2. Mở Word ngầm, tạo tài liệu mới.
3. Import 3 module VBA vào tài liệu.
4. Lưu thành `bible-learning.dotm` (Word Template with Macros).
5. Nhúng `customUI14.xml` vào ZIP để có Ribbon "Kinh Thánh".

Kết quả: `word-tool/bible-learning.dotm`.

### Bước 3: Đặt template vào thư mục Templates của Word

```powershell
copy .\bible-learning.dotm "$env:APPDATA\Microsoft\Templates\"
```

Hoặc dùng đường dẫn tuỳ ý — chỉ cần từ Word > File > New > Personal
thấy được nó.

### Bước 4: Tạo tài liệu mới từ template

- Word > File > New > **Personal** > `bible-learning`.
- Word sẽ hỏi có tin cậy macro không → **Enable Content**.
- Alt+F8 > chạy `AutoExec_KinhThanh` **một lần** để gán phím tắt và
  đảm bảo mọi Style đã được tạo trong tài liệu.

---

## 3. Cài đặt thủ công (nếu build.ps1 lỗi)

### 3.1. Tạo template rỗng

1. Mở Word > New > Blank document.
2. File > Save As > chọn định dạng **Word Macro-Enabled Template
   (`*.dotm`)**, đặt tên `bible-learning.dotm`. Lưu tạm ra Desktop.

### 3.2. Import module VBA

Alt+F11 mở VBA Editor.

1. Tải `JsonConverter.bas` từ
   <https://raw.githubusercontent.com/VBA-tools/VBA-JSON/master/JsonConverter.bas>
   và lưu vào `word-tool/src/`.
2. Trong VBA Editor: File > Import File… → import lần lượt:
   - `src/JsonConverter.bas`
   - `src/KinhThanh.bas`
   - `src/KinhThanhBible.bas`
3. Vào Tools > References… > tick **Microsoft Scripting Runtime**.

Lưu template (Ctrl+S).

### 3.3. Thêm Ribbon "Kinh Thánh"

Cần **Custom UI Editor for Microsoft Office** (miễn phí, tải tại
<https://github.com/OfficeDev/office-custom-ui-editor/releases>).

1. Mở `bible-learning.dotm` bằng Custom UI Editor.
2. Insert > Office 2010 Custom UI Part.
3. Copy nội dung `src/customUI14.xml` dán vào.
4. Save.

### 3.4. Kích hoạt

Copy `bible-learning.dotm` vào
`%APPDATA%\Microsoft\Templates\`. Tạo tài liệu mới từ template.
Chạy `AutoExec_KinhThanh` một lần.

---

## 4. Phím tắt

### Character Styles — `Ctrl+Alt+<phím>`

| Phím tắt      | Style           | Ý nghĩa                                       |
| ------------- | --------------- | --------------------------------------------- |
| Ctrl+Alt+**L**| KT-LoiHua       | Lời hứa của Đức Chúa Trời (nền vàng)          |
| Ctrl+Alt+**D**| KT-DanhXung     | Danh xưng, bản tính (xanh dương đậm)          |
| Ctrl+Alt+**M**| KT-MenhLenh     | Mệnh lệnh phải vâng theo (xanh lá đậm)        |
| Ctrl+Alt+**C**| KT-CanhBao      | Tội lỗi, phán xét, cảnh báo (đỏ)              |
| Ctrl+Alt+**T**| KT-TienTri      | Lời tiên tri, hình bóng về Đấng Christ (tím)  |
| Ctrl+Alt+**B**| KT-BoiCanh      | Bối cảnh lịch sử, văn hoá (xám, nghiêng)      |
| Ctrl+Alt+**R**| KT-LapLai       | Từ/cụm lặp lại có chủ đích (highlight xanh)   |
| Ctrl+Alt+**P**| KT-TuongPhan    | Từ nối tương phản (đỏ đậm)                    |
| Ctrl+Alt+**N**| KT-NhanQua      | Từ nối nhân quả (cam)                         |
| Ctrl+Alt+**G**| KT-TuGoc        | Từ gốc Hy Lạp / Hê-bơ-rơ (nghiêng)            |
| Ctrl+Alt+**0**| —               | **Xoá highlight** (về Default Paragraph Font) |

Không cần bôi đen: đặt con trỏ trong từ rồi nhấn phím tắt — macro tự
chọn `Selection.Words(1)`. Nếu bôi đen thì tô cả vùng chọn.

### Paragraph Styles — `Ctrl+Shift+<phím>`

| Phím tắt        | Style          | Loại hộp                          |
| --------------- | -------------- | --------------------------------- |
| Ctrl+Shift+**G**| KT-GhiChu      | Ghi chú, quan sát, giải nghĩa     |
| Ctrl+Shift+**B**| KT-HopBoiCanh  | Bối cảnh lịch sử, văn hoá         |
| Ctrl+Shift+**T**| KT-HopTuGoc    | Word study từ gốc                 |
| Ctrl+Shift+**U**| KT-UngDung     | Ứng dụng đời sống                 |
| Ctrl+Shift+**H**| KT-CauHoi      | Câu hỏi thảo luận                 |
| Ctrl+Shift+**R**| KT-CanTraCuu   | **Chưa giải quyết — cần tra thêm**|

Đặt con trỏ tại vị trí muốn chèn → nhấn phím tắt → macro chèn đoạn mới
với style tương ứng và tiền tố ("Ghi chu: ", "Boi canh: ", …).

---

## 5. Ribbon "Kinh Thánh"

Bên cạnh phím tắt, có Ribbon riêng với 3 nhóm:

- **Tô nghĩa** — 11 nút (10 style + Xoá tô).
- **Hộp ghi chú** — 6 nút.
- **Kinh Thánh** —
  - **Chèn câu** → hiện dialog "Tham chiếu (vd: Mac 1:1-8)" → chèn văn
    bản có đánh số câu superscript.
  - **Song song** → hiện dialog "Mat 3:1-12 | Mac 1:1-8 | Lu 3:1-18 |
    Gi 1:19-28" → chèn bảng 4 cột.
  - **Kiểm tra** → quét mọi `[[…]]` trong tài liệu, báo cáo tham chiếu
    sai cú pháp hoặc sai mã sách.

---

## 6. Bible.json — nguồn văn bản

- `bible-learning/bible.json` là bản dịch **1925** dạng JSON.
- `KinhThanhBible.LoadBible()` tự tìm file theo thứ tự:
  1. `<đường dẫn tài liệu>\bible.json`
  2. `<đường dẫn template>\bible.json`
  3. Prompt chọn file nếu không thấy.
- Ép đường dẫn khác:

    ```vba
    Sub SetBible(): KinhThanhBible.SetBibleJsonPath "D:\ban-dich\bible.json": End Sub
    ```

**Book ID mapping** (VN → JSON id) nằm trong hàm `BookIdFromVi` của
`KinhThanhBible.bas`. Ví dụ: `Mac` → `mk`, `Gi` → `jo`, `Kh` → `re`.
Bổ sung sách mới: sửa `Select Case` và re-import module.

---

## 7. Style — tên đầy đủ và cách chỉnh

Tên style **không dấu** (do VBA/Ribbon dễ vỡ với ký tự Unicode phức
tạp). Nếu muốn hiển thị đúng tên tiếng Việt trong pane Styles của Word:

1. Alt+F11 → mở module `KinhThanh`.
2. Trong `EnsureAllStyles`, đổi tên đối số (`"KT-LoiHua"` → `"KT-LờiHứa"`).
3. Đồng bộ tên trong `ApplyCharStyle` calls và `customUI14.xml`.
4. Nhớ đổi tên tương ứng trong `bible-learning.md` mục 4.

Chỉnh **màu** hoặc **font** của style: sửa 2 chỗ:

- Trong `EnsureAllStyles` (nếu muốn re-apply khi mở doc mới).
- Trong Word > Styles pane > Modify (áp dụng ngay cho doc hiện tại).

---

## 8. Troubleshooting

| Lỗi                                                          | Nguyên nhân / Giải pháp                                                                                                    |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `build.ps1` — "Trust access to the VBA project object model" | Bật ô đó trong Word > Options > Trust Center > Macro Settings.                                                             |
| Word không hỏi macro khi mở doc mới từ template              | Kiểm tra Trust Center > Trusted Locations → `%APPDATA%\Microsoft\Templates` đã trong danh sách.                            |
| Phím tắt không chạy                                          | Chạy lại `AutoExec_KinhThanh` (Alt+F8). `KeyBindings.Add` dán vào tài liệu hiện hành, không dán được vào `Normal.dotm`.    |
| `[?] Khong tim thay id: mk`                                  | Sai đường dẫn `bible.json`, hoặc file rỗng. Kiểm tra `KinhThanhBible.SetBibleJsonPath`.                                    |
| `[?] Khong ro sach: Mác`                                     | Đang gõ dấu — `BookIdFromVi` chấp nhận cả có dấu (đã `NormalizeAscii`). Nếu vẫn lỗi: `Mac` không dấu là chắc.               |
| Ribbon "Kinh Thánh" không xuất hiện                          | ZIP inject `customUI14.xml` không thành công. Mở `.dotm` bằng Custom UI Editor để chèn tay (mục 3.3).                       |

---

## 9. Kế hoạch tiếp

- [ ] `[[…]]` → tự tạo Hyperlink + Bookmark trong Word (macro).
- [ ] Xuất Word → Markdown (Pandoc) mà giữ đúng `[text]{.loi-hua}`.
- [ ] Từ điển chủ đề `chu-de/_danh-muc.md` → sinh Index tự động.
- [ ] Snippet "Khung giáo án" chèn nhanh theo mục 8 của
  `bible-learning.md`.
