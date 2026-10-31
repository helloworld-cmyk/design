# 04 — DÙNG CHUNG & KẾ HOẠCH KỸ THUẬT

> Các màn/khối dùng chung cho nhiều vai trò, cùng hướng dẫn triển khai theo
> `build.js` và `DESIGN_RULES.MD`. Đây là cầu nối giữa quy hoạch (00–03) và
> việc dựng thật trong `screens/`.
>
> Phạm vi kỹ thuật bám đúng **22 màn**; không thêm module ngoài danh sách.

---

## 1. XÁC THỰC

### 1.1 Khách hàng (đã tính trong 8 màn)

| Mã | Màn | Thư mục |
|----|-----|---------|
| B2 | Đăng nhập | `dang-nhap` |
| B3 | Đăng ký | `dang-ky` |

- Chỉ dành cho **khách hàng**; tài xế và admin không tự đăng ký.
- Bố cục 2 cột: trái là khối thương hiệu nền navy, phải là panel form trắng;
  mobile → 1 cột, ẩn minh hoạ.
- Sau đăng nhập: quay lại trang trước (ưu tiên), fallback B1.
- Không có đăng nhập mạng xã hội, quên mật khẩu, chọn vai trò.

### 1.2 Cổng tài xế / admin (không tính vào 22)

Hai phương án, chọn một khi triển khai:

| Phương án | Cách làm | Ưu điểm |
|-----------|----------|---------|
| **A. Cổng chung** | Dùng `dang-nhap`; sau xác thực đọc `role` để điều hướng | Ít màn, ít code |
| **B. Tách cổng** | Thêm `tai-xe-dang-nhap`, `admin-dang-nhap` | Tách phiên, rõ vai trò |

Khuyến nghị **A** cho project cá nhân: một form đăng nhập, điều hướng theo
`role` (`customer → B1`, `driver → D1`, `admin → A1`).

Phiên đăng nhập (mô phỏng `localStorage`):

| Vai trò | Khóa phiên |
|---------|------------|
| Khách | `vvv.auth.user` |
| Tài xế | `vvv.auth.driver` |
| Admin | `vvv.auth.admin` |

- Nếu dùng cổng chung, vẫn nên tách khóa phiên theo vai trò để không lẫn quyền.
- Đăng xuất xóa đúng khóa của vai trò hiện tại.

---

## 2. MÀN LỖI DÙNG CHUNG (không tính vào 22)

### SH1. Trang lỗi — `screens/loi/`

- **Tác dụng:** xử lý 404 / 500 / mất kết nối / bảo trì.
- **Nhiệm vụ:** hiển thị mã lỗi + thông điệp thân thiện; nút **Về trang chủ**
  và **Thử lại**; tự thử lại khi lỗi mạng.
- **Thành phần:** khối giữa trang, minh hoạ, `.btn`.
- **Không có:** hotline, form liên hệ, nút "Hỗ trợ", chat.
- Một `h1` mỗi trang theo §9.
- **Ưu tiên:** P1.

### SH2. Khối dùng chung (partial, không phải màn)

| Khối | Đặt ở | Dùng cho |
|------|-------|----------|
| Modal xác nhận | `components/modal.html` | hủy vé, hủy chuyến, báo sự cố, khóa tài khoản |
| Toast | `components/toast.html` | phản hồi thao tác toàn cục |
| Empty state | `css/states.css` | mọi danh sách trống |
| Skeleton loading | `css/states.css` | mọi danh sách/bảng |
| Status badge | `base.css` | chuyến, vé, xe, tài khoản |

---

## 3. KẾ HOẠCH COMPONENT & FILE

Khi chuyển từ quy hoạch sang code: thêm **tối thiểu** file mới, ưu tiên tái
dùng. Mỗi file nguồn **≤ 300 dòng, mỗi dòng ≤ 100 ký tự** (§1).

### 3.1 CSS mới đề xuất

Thứ tự load giữ đúng §1: sau component, trước motion.

```
table.css · filters.css · stats.css · tabs.css · modal.css · toast.css
states.css · timeline.css · admin.css · app-shell.css · seat-map.css
map.css (tuỳ chọn)
```

- Gộp nhóm khi có thể (`states.css` chứa empty + skeleton + loader).
- Không hardcode màu/kích thước — luôn `var(--...)`.
- Không tạo `toggle.css`, `upload.css` (đã bỏ cấu hình/upload).

### 3.2 JS mới đề xuất

IIFE thuần, `<script defer>`, đặt trước `reveal`:

```
app-shell.js  (menu/tab, active nav, đăng xuất)
table.js      (sort, chọn dòng, phân trang client)
modal.js      (mở/đóng, focus trap)
toast.js
tabs.js
filters.js
seat-map.js   (chọn ghế ở B5)
dashboard.js  (số liệu/biểu đồ đơn giản A1/A7/D1)
```

Cập nhật `sprite.html` với icon mới; **bỏ** `i-bell`, `i-headset`, `i-star`.

### 3.3 Shell / partial dùng chung

| File | Dùng cho | Lưu ý |
|------|----------|-------|
| `components/app-header.html` | shell U, D | logo, tab, avatar, đăng xuất; **không chuông, không hotline** |
| `components/app-nav.html` | shell U, D | tab ngang, mobile → drawer/bottom nav |
| `components/admin-shell.html` | shell A | topbar + breadcrumb |
| `components/admin-sidebar.html` | shell A | 8 mục |
| `components/auth-layout.html` | B2, B3 (+ cổng tách nếu có) | 2 cột |
| `components/modal.html` | toàn app | xác nhận |
| `components/toast.html` | toàn app | phản hồi |

---

## 4. MAPPING MÀN → FILE

| Mã | Thư mục | Trạng thái |
|----|---------|------------|
| B1 | `screens/home` | Đã có — chỉnh theo B1 |
| B2 | `screens/dang-nhap` | Đã có — bỏ social/forgot nếu thừa |
| B3 | `screens/dang-ky` | Đã có |
| B4 | `screens/ket-qua-tim-chuyen` | Đã có |
| B5 | `screens/chi-tiet-chuyen` | Đã có |
| B6 | `screens/dat-cho-thanh-cong` | Đã có — bỏ support card |
| B7 | `screens/chuyen-cua-toi` | Đã có — thêm panel chi tiết vé + modal hủy |
| B8 | `screens/ho-so` | Đã có — bỏ cài đặt thông báo/đánh giá |
| D1 | `screens/tai-xe-tong-quan` | Dựng mới |
| D2 | `screens/tai-xe-chuyen` | Dựng mới |
| D3 | `screens/tai-xe-chi-tiet-chuyen` | Dựng mới |
| D4 | `screens/tai-xe-dieu-hanh` | Dựng mới |
| D5 | `screens/tai-xe-xe` | Dựng mới |
| D6 | `screens/tai-xe-ho-so` | Dựng mới |
| A1 | `screens/admin-tong-quan` | Dựng mới |
| A2 | `screens/admin-chuyen` | Dựng mới |
| A3 | `screens/admin-tai-xe` | Dựng mới |
| A4 | `screens/admin-xe` | Dựng mới |
| A5 | `screens/admin-tuyen-duong` | Dựng mới |
| A6 | `screens/admin-don-dat` | Dựng mới |
| A7 | `screens/admin-doanh-thu` | Dựng mới |
| A8 | `screens/admin-khach-hang` | Dựng mới |
| SH1 | `screens/loi` | Đã có `shared/404` — chuẩn hóa |

**Loại bỏ/không dựng:** `chuyen-da-dat` (gộp vào B7), `huy-doi-chuyen` (modal
trong B7), `tai-xe-tuyen`, `tai-xe-danh-gia`, `danh-gia`, `uu-dai`, `thong-bao`,
`admin-khieu-nai`, `admin-doi-soat`, `admin-khuyen-mai`, `admin-thong-bao`,
`admin-noi-dung`, `admin-cau-hinh`, `admin-nhat-ky`, `admin-bao-cao`.

---

## 5. QUY TRÌNH TẠO MỘT MÀN MỚI

1. Tạo `screens/<ten>/screen.json`: `output`, `title`, `description`, `css[]`
   (đúng thứ tự §1), `js[]`, `partials[]`.
2. Tạo `screens/<ten>/partials/*.html` từ component/token có sẵn; chỉ tạo CSS/JS
   mới khi component chưa tồn tại.
3. Chèn partial giữa shell tương ứng; **không** lặp block CSS/JS trong màn.
4. Chạy `node build.js` → pass (không file > 300 dòng / > 100 ký tự).
5. Kiểm desktop + mobile (≤ 400px), console sạch, đối chiếu **CHECKLIST §10**.
6. Đủ 4 trạng thái (rỗng/tải/lỗi/có dữ liệu) cho màn danh sách; đủ
   hover/focus/active/loading cho control; a11y §9 (1 `h1`, label, focus ring).
7. Rà lại: không có nút/khối hỗ trợ, hotline, chuông, đánh giá, khuyến mãi.

---

## 6. THỨ TỰ LÀM GỢI Ý

| Phase | Màn ưu tiên |
|-------|-------------|
| **1 — Khách** | B2, B3 → B1, B4, B5, B6 → B7, B8 → shell U |
| **2 — Vận hành** | A3, A4, A5 → **A2 (tạo chuyến + phân công)** → A1, A6 → D1, D2, D3, D4, D6 → shell D, shell A |
| **3 — Hoàn thiện** | D5 → A7, A8 → SH1, rà trạng thái |

Phụ thuộc chính:

```
A3 (tài khoản tài xế) ─┐
A4 (xe) ───────────────┼→ A2 (chuyến) → D2 → D3 → D4
A5 (tuyến + giá) ──────┘        │
                                 └→ khách B4/B5 → A6 → A7
```

---

## 7. GHI CHÚ PHỐI HỢP & RÀNG BUỘC

- Tất cả màn mới **phải** tuân `DESIGN_RULES.MD`; nếu tính năng xung đột với
  design rules → **ưu tiên design rules**, dừng và hỏi trước khi xử lý.
- Toàn bộ UI **tiếng Việt**; tiền định dạng `180.000đ`; brand "Vi Vu Việt".
- Không dùng framework; giữ kiến trúc `screen.json` + partial + `build.js`.
- File `.md` trong `.agents/plans/` là tài liệu, được miễn giới hạn dòng/ký tự.
- Không thêm màn ngoài 22 + cổng phụ/trang lỗi nếu chưa được người dùng duyệt.
- **Trạng thái chuyến / vé / thanh toán là ba trường độc lập**; ánh xạ theo
  `01 §4`, `02 §5`, `03 §4`.
- **Không có hoàn tiền**: thu tiền mặt khi lên xe, tài xế ghi `Đã thu` ở D4;
  A7 tính doanh thu theo vé `Đã thu`.
- Cổng đăng nhập tài xế/admin **dùng chung** `dang-nhap`, điều hướng theo `role`
  (không tính vào 22 màn; xem §1.2).
- Trước khi kết thúc session: xóa file tạm đã tạo trong `temp/`.