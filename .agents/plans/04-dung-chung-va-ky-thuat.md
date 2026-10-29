# 04 — MÀN DÙNG CHUNG & KẾ HOẠCH KỸ THUẬT

> Các màn/khối dùng chung cho nhiều vai trò, cùng hướng dẫn triển khai theo
> `build.js` và `DESIGN_RULES.MD`. Đây là cầu nối giữa bản quy hoạch (00–03) và
> việc dựng thật trong `screens/`.

---

## 1. MÀN XÁC THỰC (shell auth — tách khỏi header marketing)

Bố cục chuẩn: 2 cột — trái là **khối thương hiệu/minh hoạ nền navy** (dùng lại
`.driver-panel`/`.hero-visual`), phải là **panel form** trắng (dùng `.booking-form`
+ `.field`). Trên mobile → 1 cột, ẩn minh hoạ.

### AU1. Đăng nhập — `screens/dang-nhap/`
- **Tác dụng:** xác thực để vào khu khách hàng.
- **Nhiệm vụ:** nhập SĐT/email + mật khẩu; ghi nhớ đăng nhập; liên kết tới
  đăng ký; đăng nhập Google/Apple.
- **Thành phần:** panel form, `.field` (icon `i-mail`/`i-shield`), checkbox
  "ghi nhớ", `.btn.is-loading`, `.form-status`.
- **Trạng thái:** sai thông tin, tài khoản bị khoá, quá nhiều lần thử, loading.
- **Ưu tiên:** P0.

### AU2. Đăng ký — `screens/dang-ky/`
- **Tác dụng:** tạo tài khoản khách mới.
- **Nhiệm vụ:** nhập họ tên, SĐT, email, mật khẩu (+ xác nhận), đồng ý điều
  khoản ("Tôi là khách" mặc định).
- **Thành phần:** panel form, `.field` + validate, chỉ báo độ mạnh mật khẩu
  (mới), `.form-status`, `.btn`.
- **Trạng thái:** SĐT/email đã tồn tại, mật khẩu yếu, lỗi validate.
- **Ưu tiên:** P0.

### AU3. Đăng nhập admin — `screens/admin-dang-nhap/`
- **Tác dụng:** cổng vào back-office với bảo mật cao hơn.
- **Nhiệm vụ:** đăng nhập tài khoản admin; nhớ thiết bị tin cậy; cảnh báo thiết
  bị lạ; tự đăng xuất khi hết phiên.
- **Thành phần:** panel form, `.field` (icon `i-mail`/`i-shield`), `.form-status`,
  ghi chú chính sách bảo mật (`.intro-note`).
- **Trạng thái:** sai mật khẩu, tài khoản bị tạm khoá, thiết bị không tin cậy.
- **Ưu tiên:** P1.

---

## 2. MÀN LỖI & TIỆN ÍCH DÙNG CHUNG

### SH1. Trang lỗi — `screens/loi/`
- **Tác dụng:** xử lý 404 / 500 / mất kết nối / bảo trì gọn gàng, không làm mất
  niềm tin.
- **Nhiệm vụ:** hiển thị mã lỗi + thông điệp thân thiện; gợi ý hành động (về
  trang chủ, tìm chuyến, liên hệ hỗ trợ); tự thử lại khi lỗi mạng.
- **Thành phần:** khối giữa trang (minh hoạ `components/art.html`), `.btn`
  (Về trang chủ / Thử lại), `.support-card`, hotline.
- **Chỉ dùng 1 `h1`/trang** theo §9.
- **Ưu tiên:** P1.

### SH2. Khối dùng chung bổ trợ (không phải màn riêng — partial)
| Khối | Đặt ở | Dùng cho |
|------|-------|----------|
| Modal xác nhận | `components/modal.html` | mọi hành động phá huỷ |
| Toast | `components/toast.html` | phản hồi thao tác toàn cục |
| Empty state | `css/states.css` | mọi danh sách trống |
| Skeleton loading | `css/states.css` | mọi danh sách/bảng |
| Cart panel mã giảm giá | partial khu U | áp voucher ở chi tiết chuyến |

---

## 3. KẾ HOẠCH COMPONENT & FILE (theo §1 DESIGN_RULES)

Khi chuyển từ quy hoạch sang code, thêm **tối thiểu** file mới; ưu tiên tái dùng.
Mỗi file nguồn **≤ 300 dòng, mỗi dòng ≤ 100 ký tự**.

### 3.1 CSS mới đề xuất (thứ tự load giữ đúng §1: sau component, trước motion)
`table.css` · `filters.css` · `stats.css` · `tabs.css` · `modal.css` ·
`toast.css` · `states.css` · `timeline.css` · `toggle.css` · `map.css` ·
`seat-map.css` · `upload.css` · `admin.css` (sidebar/layout) ·
`app-shell.css`.

> Gộp nhóm khi có thể (vd `states.css` chứa cả empty + skeleton + loader) để
> không phình file. **Không** hardcode màu/kích thước — luôn `var(--...)`.

### 3.2 JS mới đề xuất (IIFE thuần, `<script defer>`; đặt trước `reveal`)
`app-shell.js` (menu app/sidebar, active nav) · `table.js` (sort, chọn dòng,
phân trang client) · `modal.js` (mở/đóng, focus trap) · `toast.js` ·
`tabs.js` · `filters.js` ·
`upload.js` (preview/nén ảnh) · `seat-map.js` (chọn ghế) · `dashboard.js`
(biểu đồ), và cập nhật `sprite.html` với icon mới (§4 trong `00-tong-quan.md`).

### 3.3 Shell / partial dùng chung mới
- `components/app-header.html` — topbar cho shell U và D (avatar, thông báo,
  hotline; biến thể có toggle Online cho tài xế).
- `components/app-sidebar.html` — điều hướng dọc khu khách/tài xế (mobile →
  bottom nav hoặc drawer).
- `components/admin-shell.html` + `components/admin-sidebar.html` — khung admin
  2 cấp + topbar + breadcrumb.
- `components/auth-layout.html` — bố cục 2 cột cho các màn đăng nhập.

---

## 4. QUY TRÌNH TẠO MỘT MÀN MỚI (checklist triển khai)

1. Tạo `screens/<ten>/screen.json` khai báo: `output` (tên file `.html`),
   `title`, `description`, `css[]` (đúng thứ tự §1), `js[]`, `partials[]`.
2. Tạo `screens/<ten>/partials/*.html` — các section của màn, dựng **từ
   component/token có sẵn**; chỉ tạo CSS/JS mới khi component chưa tồn tại.
3. Chèn partial giữa `components/header.html` (hoặc shell tương ứng) và
   `components/footer.html`; **không** lặp block CSS/JS trong màn.
4. Chạy `node build.js` → phải pass (không file nào > 300 dòng / > 100 ký tự).
5. Kiểm desktop + mobile (≤400px), console sạch, đối chiếu **CHECKLIST §10**.
6. Đảm bảo đủ 4 trạng thái (rỗng/tải/lỗi/có dữ liệu) cho màn danh sách;
   đủ hover/focus/active/loading cho control; a11y §9 (1 `h1`, label, focus ring).

---

## 5. THỨ TỰ LÀM GỢI Ý (theo phase ở `00-tong-quan.md` §5)

| Phase | Màn ưu tiên làm trước |
|-------|------------------------|
| **1 — MVP khách** | AU1, AU2 (auth) → B1, B2, B3, B4, B5 → B6, B7, B8 → B10, B11 → shell U |
| **2 — Tài xế + vận hành** | D1, D2, D3, D5, D6, D9 → AD1, AD3, AD4, AD6, AD7, AD8 → shell D, shell A |
| **3 — Hoàn thiện** | AD2, AD5, AD9, AD10, AD11, AD12, AD13, AD14, AD15 → B9, B12 → D4, D7, D8, D10 → SH1 |

---

## 6. GHI CHÚ PHỐI HỢP & RÀNG BUỘC

- Tất cả màn mới **phải** tuân `DESIGN_RULES.MD`; nếu nhu cầu tính năng xung đột
  với design rules → **ưu tiên design rules**, dừng và hỏi trước khi xử lý.
- Toàn bộ UI **tiếng Việt**; tiền định dạng `180.000đ`; brand "Vi Vu Việt".
- Không dùng framework; giữ kiến trúc `screen.json` + partial + `build.js`.
- File `.md` trong `.agents/plans/` là **tài liệu**, được miễn giới hạn dòng/ký tự.
