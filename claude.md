# DIMO FC — Dashboard Nội Bộ

## Tổng quan dự án
Website quản lý đội bóng DIMO FC (thành lập 2012). Dữ liệu load realtime từ Google Sheets public CSV, không có backend.

**URL Google Sheets:** `https://docs.google.com/spreadsheets/d/1lw8_DGDWDezkbIO78YNLpgZ8viM0j-7qa6n_XIlOFGQ`

---

## Kiến trúc

### Stack
- **Frontend only** — HTML + Vanilla JS + CSS (không có framework, không có build tool)
- **Data source** — Google Sheets (fetch CSV qua `gviz/tq?tqx=out:csv&sheet=...`)
- **Thư viện ngoài** — jsPDF 2.5.1 (CDN, dùng cho xuất PDF đăng ký giải)
- **Analytics** — Google Analytics GA4 (`G-RKWCT26RBY`)
- **Hosting** — GitHub Pages (repo: `anhiniesta9989/dimo-fc`)

### Cấu trúc file
```
index.html              # HTML shell + modal đăng ký giải
css/
  style.css             # Toàn bộ CSS (dark theme, CSS variables)
js/
  config.js             # SHEET_ID, YEARS, currentYear, DB object, helpers (vnd, short, kqBadge...)
  parse.js              # fetchCSV(), parseCSV(), parseLichKQ(), parseThuChi(), parseChiTiet(), parseThanhVien()
  ui.js                 # setPage(), toggleMatch(), toggleTable(), showLoading(), showError(), renderAll()
  render-thu-chi.js     # renderThuChi()
  render-lich-kq.js     # renderLichKQ()
  render-dong-quy.js    # renderDongQuy()
  render-thanh-vien.js  # renderThanhVien()
  dang-ky-giai.js       # openDangKy(), closeDangKy(), exportPDF(), chonTatCa()
QRQuy.png               # QR code tài khoản TPBank
logodimofc.jpg          # Logo đội (cũng host trên GitHub raw)
```

> ⚠️ **Thứ tự load JS quan trọng**: config.js → parse.js → ui.js → render-*.js → dang-ky-giai.js

---

## Data Model (Google Sheets)

### Sheets theo năm
| Sheet name | Mô tả |
|---|---|
| `{YEAR} - LỊCH & KẾT QUẢ` | Lịch thi đấu + kết quả + điểm danh cầu thủ |
| `{YEAR} - THU & CHI` | Tài chính đội (chi từng trận, quỹ từng người) |
| `{YEAR} - Chi tiết đóng quỹ` | Lịch sử các lần đóng quỹ |
| `Thành Viên` | Danh sách thành viên (không phân năm) |

### Sheet LỊCH & KẾT QUẢ — cấu trúc cột
- Row 1: title/merge, Row 2: header, Row 3+: data
- Col 0: STT, 1: Ngày (`04 Jan 26`), 2: Giờ, 3: Sân, 4: Đối thủ, 5: Ta, 6: `-`, 7: Địch, 8: KQ (W/L/D)
- Col 9+: tên cầu thủ — giá trị: `0` = có mặt, `N` = vắng, số nguyên = số bàn ghi

> **QUAN TRỌNG**: Cột cầu thủ bị lệch do merged cells khi export CSV. Phải hardcode `PLAYER_COLS_MAP` theo từng năm trong `parse.js`. Không được tự động detect từ header row.

### Sheet THU & CHI — vùng dữ liệu
- `A3:I30` — Quỹ đội từng người (STT, Họ, Tên, Tổng, Tồn, Q1, Q2, Q3, Q4)
- `K2:AN82` — Chi từng trận (col K=id, L=địa điểm, M=chi, ...)
- Row 83 — Tổng chi từng cầu thủ (col 13–40)
- Row 85 — Còn lại từng cầu thủ
- Row 85–105 — Danh sách âm quỹ (col B=số, C=tên)

### Sheet Chi tiết đóng quỹ
- Col A: Ngày (`5 Jan`), B: Tên, C: Số tiền, D: Quý, E: Ghi chú

### Sheet Thành Viên
- Row 2: header, Row 3+: data
- Col: STT, Họ, Tên, Số áo, SĐT, Ngày sinh, Email, Status

---

## Design System (CSS Variables)

```css
--green: #00e676      /* màu chính — thắng, tích cực, active */
--red:   #ff3d57      /* thua, âm quỹ, cảnh báo */
--yellow:#ffd740      /* hòa, đang cập nhật, lưu ý */
--blue:  #448aff      /* thống kê phụ */
--bg:    #080b0e      /* background trang */
--bg2:   #0e1318      /* card */
--bg3:   #141b22      /* header table, input */
--bg4:   #1a232c      /* hover */
--text:  #dde5ee
--muted: #556070
--muted2:#8899aa
--r:     12px         /* border-radius chuẩn */
```

---

## Các tính năng chính

1. **Lịch & Kết Quả** — Thống kê mùa giải, top ghi bàn, top chuyên cần, danh sách trận (có expand/collapse detail)
2. **Quỹ Đội** — Tổng thu/chi, quỹ từng người, chi tiết từng trận
3. **Chi Tiết Đóng Quỹ** — Danh sách âm quỹ, lịch sử giao dịch, QR code tài khoản
4. **Thành Viên** — Card từng thành viên với avatar initials, số áo, trạng thái
5. **Đăng Ký Giải** — Modal chọn cầu thủ → xuất PDF danh sách đăng ký

---

## Quy tắc khi sửa code

### Parse & Data
- Khi thêm cầu thủ mới: cập nhật `PLAYER_COLS_MAP` trong `parse.js` và `FINANCE_COLS` trong phần parseThuChi — **phải khớp số cột thực tế trong sheet**
- Thêm năm mới: thêm entry vào `YEARS` array và `DB` object trong `config.js`
- Format ngày từ sheet: `"04 Jan 26"` (ngày tháng năm 2 chữ số) — dùng `parseNgay()` để convert

### UI / Render
- Mỗi page render trong `<section id="page-{name}">` — không render cross-page
- Toggle expand/collapse dùng class pattern: `{id}-extra` + `style="display:none"`
- Match card toggle: `toggleMatch(id)` → `mc-detail` + `mc-chevron`
- Loading state: `showLoading(pageId)` trước khi fetch, `showError(pageId, msg)` nếu lỗi

### CSS
- Không dùng framework — chỉ vanilla CSS với variables đã định nghĩa
- Responsive breakpoints: `max-width:900px` (grid3→1col), `max-width:720px` (grid2→1col), `max-width:600px` (mobile)
- Animation classes: `.fade-in`, `.d1`–`.d6` (delay 0.05s–0.30s)

### Tài khoản & thông tin nhạy cảm
- Số TK TPBank: `61609091989` — VÕ ĐỨC ANH
- QR code: `QRQuy.png` (cũng host tại GitHub raw)
- Không hardcode thông tin cá nhân khác vào code

---

## Lưu ý khi test / debug

- **Phải chạy qua Live Server** hoặc HTTP server — không mở `file://` trực tiếp (CORS block fetch CSV)
- Nếu data parse sai → check số cột thực tế bằng `console.log(rows[2])` trong `parseLichKQ()`
- Merged cells khi export CSV từ Google Sheets sẽ làm lệch cột — đây là known issue, hardcode là intentional
- Sheet name phân biệt hoa thường và dấu: `"2026 - LỊCH & KẾT QUẢ"` (có dấu &, có dấu tiếng Việt)