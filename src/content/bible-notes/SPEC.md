# Quy ước ghi chú học Kinh Thánh

> File này là **bản đặc tả (spec)** cho việc soạn ghi chú Kinh Thánh.
> Mở file này cùng workspace trong VS Code để Claude đọc và tuân theo khi soạn/chuẩn hóa ghi chú.
> Đích đến: viết bằng Markdown → xuất ra Word bằng Pandoc với đầy đủ Style thật.

---

## 1. Cách dùng file này

**Trong VS Code:**

- Đặt file này ở gốc repo, hoặc copy vào `.claude/CLAUDE.md` để Claude tự đọc mỗi phiên.
- Khi nhờ Claude soạn bài: *"Soạn ghi chú Mác 1:1–13 theo `bible-learning.md`"*.
- Khi chuẩn hóa file cũ: *"Chuẩn hóa `mac-01.md` theo `bible-learning.md`, chỉ sửa định dạng, không đổi nội dung thần học."*

**Nguyên tắc bất di bất dịch:** Markdown chỉ ghi **ý nghĩa** (semantic), không ghi **hình thức**. Không có mã màu, không có cỡ chữ, không có tên font trong file `.md`. Toàn bộ hình thức nằm ở `template.dotx` và `styles.css`.

---

## 2. Cấu trúc thư mục

```
bible-notes/
├── bible-learning.md          # file này — spec
├── template.dotx              # Word reference doc, chứa toàn bộ Style
├── styles.css                 # để preview trong VS Code
├── Makefile                   # lệnh build
├── ban-dich/                  # văn bản Kinh Thánh thuần, không ghi chú
│   └── mac.md
├── ghi-chu/                   # ghi chú theo phân đoạn
│   ├── mac-01-01-08.md
│   └── mac-01-09-13.md
├── giao-an/                   # giáo án Trường Chúa Nhật
│   └── 2026-08-02-mac-01.md
├── tu-vung/                   # word study, từ gốc Hy Lạp / Hê-bơ-rơ
│   └── baptizo.md
├── chu-de/                    # ghi chú theo chủ đề, xuyên sách
│   └── phep-bap-tem.md
└── out/                       # kết quả build (.docx, .pdf) — gitignore
```

**Quy ước đặt tên file:** `{sách}-{đoạn}-{câu đầu}-{câu cuối}.md`, số 2 chữ số, không dấu, chữ thường, nối bằng gạch ngang.
Ví dụ: `mac-01-01-08.md`, `kh-02-01-07.md`, `1co-13-01-13.md`

---

## 3. Frontmatter bắt buộc

Mỗi file trong `ghi-chu/` và `giao-an/` bắt đầu bằng khối YAML:

```yaml
---
sach: Mác
ma_sach: Mac
doan: 1
cau: "1-13"
tieu_de: "Giăng Báp-tít dọn đường"
ban_dich: BD1925          # BD1925 | BTTHĐ | BDM | ESV | NIV
song_song: ["Mat 3:1-12", "Lu 3:1-18", "Gi 1:19-28"]
chu_de: ["phép báp-têm", "ăn năn", "Đấng Christ"]
tu_goc: ["βαπτίζω", "μετάνοια"]
ngay_soan: 2026-07-25
trang_thai: nhap           # nhap | dang-soan | hoan-tat | da-day
---
```

Trường `chu_de` chính là nguồn để sinh **Index** trong Word — hãy giữ tên chủ đề nhất quán tuyệt đối giữa các file (dùng `chu-de/_danh-muc.md` làm từ điển kiểm soát).

---

## 4. Bảng đánh dấu ngữ nghĩa

Cú pháp: `[nội dung]{.tên-lớp}` (Pandoc span).

| Lớp | Ý nghĩa | Style Word | Màu hiển thị |
|---|---|---|---|
| `.loi-hua` | Lời hứa của Đức Chúa Trời | `KT-LờiHứa` | Nền vàng |
| `.danh-xung` | Danh xưng, bản tính Đức Chúa Trời | `KT-DanhXưng` | Xanh dương đậm |
| `.menh-lenh` | Mệnh lệnh phải vâng theo | `KT-MệnhLệnh` | Xanh lá, đậm |
| `.canh-bao` | Tội lỗi, cảnh báo, sự phán xét | `KT-CảnhBáo` | Đỏ |
| `.tien-tri` | Lời tiên tri, hình bóng về Đấng Christ | `KT-TiênTri` | Tím |
| `.boi-canh` | Bối cảnh lịch sử, văn hóa, địa lý | `KT-BốiCảnh` | Xám |
| `.lap-lai` | Từ/cụm lặp lại có chủ đích | `KT-LặpLại` | Highlight vàng |
| `.tuong-phan` | Từ nối tương phản: *nhưng, song, bèn* | `KT-TươngPhản` | Đỏ đậm |
| `.nhan-qua` | Từ nối nhân quả: *vì, cho nên, hầu cho* | `KT-NhânQuả` | Cam |
| `.tu-goc` | Từ gốc Hy Lạp / Hê-bơ-rơ | `KT-TừGốc` | Nghiêng, font SBL |

**Ví dụ áp dụng** (đúng đoạn Mác 1:7–8 trong file của bạn):

```markdown
⁷ Người [giảng dạy]{.menh-lenh} rằng:

> Có [Đấng quyền phép]{.danh-xung} hơn [ta]{.lap-lai} đến sau [ta]{.lap-lai};
>> [ta]{.lap-lai} không đáng cúi xuống mở dây giày Ngài.

⁸ [Ta]{.lap-lai} làm phép báp-têm cho các ngươi bằng nước;
[nhưng]{.tuong-phan} [Ngài]{.danh-xung} sẽ làm phép báp-têm cho các ngươi
bằng [Đức Thánh Linh]{.loi-hua}.
```

**Quy tắc:** một cụm chỉ mang **một** lớp. Nếu thấy cần hai lớp, nghĩa là đang lẫn hai tầng ý nghĩa — hãy tách cụm ra.

---

## 5. Sơ đồ mệnh đề (phrasing / block diagram)

Đây là kỹ thuật cốt lõi: thụt lề để lộ cấu trúc câu.

| Cấp | Cú pháp | Ý nghĩa |
|---|---|---|
| 1 | không thụt | Mệnh đề chính |
| 2 | `> ` | Mệnh đề phụ thuộc, bổ nghĩa cho cấp 1 |
| 3 | `>> ` | Bổ nghĩa cho cấp 2 |
| 4 | `>>> ` | Hiếm dùng — nếu cần thì câu quá dài, nên tách |

**Nguyên tắc thụt lề:**

1. Mệnh đề chính (chủ ngữ + động từ chính) luôn ở cấp 1.
2. Mệnh đề phụ thụt vào **ngay dưới từ mà nó bổ nghĩa**.
3. Các thành phần **đồng đẳng** (nối bằng *và, hoặc*) phải nằm **cùng một cấp**.
4. Từ nối (*và, nhưng, vì*) đặt riêng một dòng ở cấp trung gian để làm bật lên mối quan hệ.

**Đánh số câu:** dùng ký tự superscript Unicode ⁰¹²³⁴⁵⁶⁷⁸⁹, đặt sát đầu câu, không có khoảng trắng.
Ví dụ: `⁵ Cả xứ Giu-đê...` — Pandoc giữ nguyên, Word hiển thị đúng, và `grep '⁵'` vẫn tìm được.

---

## 6. Ghi chú lề

Thay cho các hộp Shape màu xanh trong Word (vốn hay trôi lệch), dùng khối `::: ghi-chu`:

```markdown
⁶ [Giăng]{.danh-xung} mặc áo lông lạc đà, buộc dây lưng da ngang hông.

::: {.ghi-chu}
Trang phục cố ý gợi lại Ê-li (IIVua 1:8). Đây là dấu hiệu của một tiên tri,
không phải sự khổ hạnh đơn thuần.
:::
```

Các loại khối ghi chú:

| Khối | Dùng cho | Style Word |
|---|---|---|
| `::: {.ghi-chu}` | Quan sát, giải nghĩa | `KT-GhiChú` |
| `::: {.boi-canh-box}` | Bối cảnh lịch sử, văn hóa | `KT-HộpBốiCảnh` |
| `::: {.tu-goc-box}` | Word study từ gốc | `KT-HộpTừGốc` |
| `::: {.ung-dung}` | Ứng dụng cho đời sống | `KT-ỨngDụng` |
| `::: {.cau-hoi}` | Câu hỏi thảo luận cho lớp | `KT-CâuHỏi` |
| `::: {.can-tra-cuu}` | **Chưa giải quyết** — cần tra thêm | `KT-CầnTraCứu` |

`::: {.can-tra-cuu}` là hàng đợi công việc. Chạy `grep -rn "can-tra-cuu" ghi-chu/` để liệt kê mọi chỗ còn bỏ ngỏ.

---

## 7. Tham chiếu và liên kết

**Tham chiếu Kinh Thánh** — luôn viết dạng chuẩn: `[[Mac 1:8]]`

Cú pháp: `[[Mã sách Đoạn:Câu]]` — dấu cách sau mã sách, dấu hai chấm không có khoảng trắng.
Khoảng: `[[Mac 1:1-8]]` · Nhiều câu rời: `[[Mac 1:5,8]]` · Nhiều đoạn: `[[Mac 1:1-2:12]]`

Viết đúng cú pháp này cho phép: tự sinh Bookmark trong Word, tự sinh Cross-reference, tự dựng bản đồ liên kết giữa các file, và tự kiểm tra tham chiếu sai.

**Mã sách chuẩn** (theo bản 1925):

| | | | |
|---|---|---|---|
| Sáng, Xuất, Lê, Dân, Phục | Giôs, Quan, Ru | ISa, IISa, IVua, IIVua | ISử, IISử, Exơ, Nê, Ết |
| Gióp, Thi, Châm, Truyền, Nhã | Ês, Giê, Ca, Êxê, Đan | Ôsê, Giôên, Amốt, Ápđia, Giôna | Michê, Nahum, Habacúc, Sôphôni |
| Aghê, Xachari, Malachi | Mat, Mac, Lu, Gi, Công | Rô, ICô, IICô, Ga, Êph | Phil, Côl, ITê, IITê |
| ITi, IITi, Tít, Philêmôn | Hê, Gia, IPhi, IIPhi | IGi, IIGi, IIIGi, Giu | Khải |

**Liên kết nội bộ:** `[xem thêm](../chu-de/phep-bap-tem.md)`

**Đánh dấu chủ đề để sinh Index:** `[phép báp-têm]{.index}` — Pandoc sẽ chuyển thành mục Index trong Word.

---

## 8. Khung giáo án Trường Chúa Nhật

File trong `giao-an/` theo đúng thứ tự sau, không đảo, không bỏ mục:

```markdown
# {Tiêu đề bài}

## Câu gốc
> {Trích dẫn} — [[Mã sách Đoạn:Câu]]

## Mục tiêu bài học
- Biết: {kiến thức}
- Cảm: {thái độ}
- Làm: {hành động cụ thể}

## Bối cảnh
## Giải nghĩa phân đoạn
### {Câu x-y} — {Tiểu đề}
## Chân lý trọng tâm
## Ứng dụng
## Câu hỏi thảo luận
1.
2.
3.
## Sinh hoạt / minh họa
## Cầu nguyện kết thúc
```

---

## 9. Xuất ra Word

```bash
pandoc ghi-chu/mac-01-01-08.md \
  --reference-doc=template.dotx \
  --from=markdown+bracketed_spans+fenced_divs \
  --to=docx \
  --output=out/mac-01-01-08.docx
```

Để `[text]{.loi-hua}` biến thành Style thật trong Word, cần một filter Lua ánh xạ tên lớp sang `custom-style`. Trong `template.dotx` phải **tạo sẵn** các Character Style và Paragraph Style đúng tên ở cột "Style Word" của mục 4 và 6 — Pandoc không tự tạo style mới, nó chỉ áp dụng style đã có.

Gộp cả sách thành một tài liệu:

```bash
pandoc ghi-chu/mac-*.md --reference-doc=template.dotx \
  --toc --toc-depth=3 -o out/mac-toan-sach.docx
```

---

## 10. Hướng dẫn dành cho Claude

Khi soạn hoặc chuẩn hóa ghi chú theo file này:

**Bắt buộc**

1. Chỉ đánh dấu những gì **thật sự** có trong văn bản. Không tô màu để cho đẹp.
2. Giữ nguyên chính tả bản dịch cũ: *Jêsus, báp-têm, Giu-đê, Giê-ru-sa-lem, Đức Thánh Linh*. Không hiện đại hóa.
3. Mọi tham chiếu Kinh Thánh phải đúng cú pháp `[[Mac 1:8]]`.
4. Khi chuẩn hóa file có sẵn: **chỉ đổi định dạng**, không sửa nội dung thần học của người dùng.
5. Không chắc chắn về một chi tiết lịch sử, từ gốc, hay cách phân đoạn → đặt vào `::: {.can-tra-cuu}` kèm câu hỏi cụ thể. Tuyệt đối không đoán rồi viết như sự thật.

**Về quan điểm thần học**

Người dùng thuộc Hội Thánh Tin Lành Việt Nam (Tin Lành, Phúc Âm). Khi một phân đoạn có nhiều cách giải thích chính thống khác nhau (thuyết cánh chung, phép báp-têm trẻ em, ân tứ...), hãy **trình bày các quan điểm** và ghi rõ đâu là quan điểm nào, thay vì áp đặt một cách đọc duy nhất. Ghi vào khối `::: {.ghi-chu}`.

**Nên làm**

- Ưu tiên chỉ ra **cấu trúc** văn bản (lặp lại, đối xứng, tương phản, tiến triển) hơn là bình luận cảm tính.
- Với từ gốc: ghi từ Hy Lạp/Hê-bơ-rơ, phiên âm, nghĩa đen, số Strong nếu biết chắc.
- Câu hỏi thảo luận phải mở, dẫn về văn bản, không phải câu hỏi có/không.

**Không làm**

- Không thêm mã màu, cỡ chữ, tên font vào file `.md`.
- Không dùng emoji trong ghi chú.
- Không viết lời cầu nguyện thay người dùng trừ khi được yêu cầu rõ.

---

## 11. Việc cần làm

- [ ] Tạo `template.dotx` với đầy đủ Style ở mục 4 và 6
- [ ] Viết Lua filter ánh xạ tên lớp → `custom-style`
- [ ] Tạo `styles.css` để preview trong VS Code
- [ ] Lập `chu-de/_danh-muc.md` làm từ điển chủ đề kiểm soát
- [ ] Viết script kiểm tra tham chiếu `[[...]]` sai cú pháp hoặc sai mã sách
- [ ] Makefile: `make docx`, `make check`, `make todo`
