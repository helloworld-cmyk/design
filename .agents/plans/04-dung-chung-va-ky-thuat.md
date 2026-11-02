# 04 — DÙNG CHUNG & KẾ HOẠCH KỸ THUẬT

> Các màn/khối dùng chung cho nhiều vai trò, cùng hướng dẫn triển khai theo
> `build.js` và `DESIGN_RULES.MD`. Đây là cầu nối giữa quy hoạch (00–03) và
> việc dựng thật trong `screens/`.
>
> **Trạng thái 2026-11-02:** đã build đủ **24 `screen.json`** — 21 màn nghiệp vụ
> (8 khách · 5 tài xế · 8 admin), 2 cổng đăng nhập riêng (tài xế/admin) và
> 1 trang lỗi. `node build.js` pass. Các điểm lệch đặc tả xem `00-tong-quan.md` §8.

---

## 1. XÁC THỰC

### 1.1 Khách hàng (đã tính trong 8 màn)

| Mã | Màn | Thư mục | Output |
|----|-----|---------|--------|
| B2 | Đăng nhập | `khach-hang/screens/dang-nhap` | `khach-hang/dang-nhap.html` |
| B3 | Đăng ký | `khach-hang/screens/dang-ky` | `khach-hang/dang-ky.html` |

- Chỉ dành cho **khách hàng**; tài xế và admin không tự đăng ký.
- Bố cục 2 cột: trái là khối thương hiệu nền navy, phải là panel form trắng;
  mobile → 1 cột, ẩn minh hoạ.
- Sau đăng nhập: quay lại `?next=` (ưu tiên), fallback B1.
- Không có đăng nhập mạng xã hội, quên mật khẩu, chọn vai trò.

### 1.2 Cổng tài xế / admin (không tính vào 21 màn)

**Hiện trạng: đã tách cổng riêng cho từng vai trò** (không dùng cổng chung):

| Vai trò | Thư mục | Output | Khóa phiên |
|---------|---------|--------|------------|
| Khách | `khach-hang/screens/dang-nhap` | `khach-hang/dang-nhap.html` | `vvv.auth.user` |
| Tài xế | `tai-xe/screens/dang-nhap` | `tai-xe/index.html` | `vvv.auth.driver` |
| Admin | `admin/screens/dang-nhap` | `admin/index.html` | `vvv.auth.admin` |

- Mỗi cổng có `partials/auth-top.html` + `form.html` và `js/auth.js` riêng.
- Phiên mô phỏng bằng `localStorage`, tách khóa theo vai trò để không lẫn quyền.
- Đăng xuất xóa đúng khóa của vai trò hiện tại.
- Ba cổng dùng chung token/form style nhưng **không** chia sẻ file auth giữa các
  nhóm vai trò (tránh sửa chéo khi làm song song).

---

## 2. MÀN LỖI DÙNG CHUNG (không tính vào 21 màn)

### SH1. Trang lỗi — `shared/screens/loi/`

- **Tác dụng:** xử lý 404 / mất kết nối / bảo trì.
- **Nhiệm vụ:** hiển thị mã lỗi + thông điệp thân thiện; nút **Về trang chủ**
  và **Thử lại**; tự thử lại khi lỗi mạng.
- **Thành phần:** khối giữa trang, minh hoạ, `.btn`.
- **Không có:** hotline, form liên hệ, nút "Hỗ trợ", chat.
- Một `h1` mỗi trang theo §9.
- **Hiện trạng:** chỉ build `shared/404.html`; **chưa có trang 500/bảo trì**.
- **Ưu tiên:** P1.

### SH2. Khối dùng chung (partial/component)

| Khối | Hiện thực hiện tại | Dùng cho |
|------|--------------------|----------|
| Header/footer khách | `shared/components/header.html`, `khach-hang/components/footer.html` | B1–B8 |
| Shell admin | `admin/components/admin-shell.html`, `admin-shell-end.html` | A2–A8 |
| Shell admin A1 | `admin/screens/tong-quan/partials/shell.html` | A1 (chưa gom) |
| Header tài xế | `driver-header.html` theo từng màn | D1, D3–D6 |
| Modal xác nhận | partial modal theo màn + `admin/css/modal.css` | hủy vé, hủy chuyến, báo sự cố, khóa tài khoản |
| Toast | JS + CSS theo màn/`admin-shell.css` | phản hồi thao tác |
| Empty state / skeleton | `states.css` theo màn | mọi danh sách trống |
| Status badge | CSS theo màn + `tai-xe/css/badges.css` | chuyến, vé, xe, tài khoản |
| Lịch điều phối | `admin-chuyen/css/chuyen-lich.css`, `chuyen-avail.css` | A2 |
| Vòng đời sự cố | `admin-chuyen/css/chuyen-suco.css`, `js/chuyen-incident.js` | A1, A2 |

> Chưa có `shared/components/modal.html`, `toast.html`, `app-header.html`,
> `app-nav.html`, `admin-sidebar.html`, `auth-layout.html` như bản kế hoạch cũ.
> Việc gom component về `shared/` là hạng mục dọn tiếp, không phải điều kiện
> build.

---

## 3. KẾ HOẠCH COMPONENT & FILE

Khi thêm/sửa màn: thêm **tối thiểu** file mới, ưu tiên tái dùng. Mỗi file nguồn
**≤ 300 dòng, mỗi dòng ≤ 100 ký tự** (`AGENTS.MD` §2).

### 3.1 CSS hiện có

`shared/css/`:

```
tokens.css · base.css · header.css · user-menu.css · booking.css
hero.css · ride-card.css · sections.css · cta-footer.css · error.css
motion.css · responsive-desktop.css · responsive-mobile.css · responsive-touch.css
```

CSS theo nhóm/màn (ví dụ):

```
khach-hang/css/auth.css · auth-form.css · float-chip.css
admin/css/admin-shell.css · modal.css
tai-xe/css/badges.css
<nhóm>/screens/<màn>/css/*.css
```

- **Không** hardcode màu/kích thước — luôn `var(--...)`.
- **Không** tạo `toggle.css`, `upload.css` (đã bỏ cấu hình/upload).
- Chưa có `table.css`, `filters.css`, `stats.css`, `tabs.css`, `toast.css`,
  `states.css`, `timeline.css`, `admin.css`, `app-shell.css`, `seat-map.css`,
  `map.css` dùng chung; các component này đang nằm trong CSS từng màn.

### 3.2 JS hiện có

```
shared/js/header.js · reveal.js · error.js
admin/js/admin-shell.js · modal.js · table.js
khach-hang/js/auth.js
admin/screens/dang-nhap/js/auth.js
tai-xe/screens/dang-nhap/js/auth.js
<nhóm>/screens/<màn>/js/*.js
```

- IIFE thuần, `<script defer>`, đặt trước `reveal`.
- Chưa có `toast.js`, `tabs.js`, `filters.js`, `seat-map.js`, `dashboard.js`
  dùng chung; logic đang nằm trong JS từng màn.
- `sprite.html` dùng chung + sprite theo màn. Hiện còn `i-bell`, `i-star` cần
  dọn theo phạm vi.

### 3.3 Shell / partial hiện có

| File | Dùng cho | Lưu ý |
|------|----------|-------|
| `shared/components/header.html` | shell M, U | logo, nav, avatar, đăng xuất; **còn link `#danh-gia`/`#faq` cần bỏ** |
| `khach-hang/components/footer.html` | shell M, U | footer khách |
| `admin/components/admin-shell.html` | shell A (A2–A8) | sidebar 8 mục + topbar; còn chuông `i-bell` |
| `admin/components/admin-shell-end.html` | shell A | đóng shell + script |
| `admin/screens/tong-quan/partials/shell.html` | A1 | shell riêng, nên gom về component chung |
| `tai-xe/screens/<màn>/partials/driver-header.html` | shell D | 3 mục: Tổng quan · Xe được giao · Hồ sơ |
| `tai-xe/components/page-end.html` | shell D | đóng trang + script |
| `*/screens/dang-nhap/partials/auth-top.html` | 3 cổng auth | panel thương hiệu |

---

## 4. MAPPING MÀN → FILE (hiện trạng)

| Mã | Thư mục | Output | Trạng thái |
|----|---------|--------|------------|
| B1 | `khach-hang/screens/home` | `khach-hang/index.html` | ✅ Đã build |
| B2 | `khach-hang/screens/dang-nhap` | `khach-hang/dang-nhap.html` | ✅ Đã build |
| B3 | `khach-hang/screens/dang-ky` | `khach-hang/dang-ky.html` | ✅ Đã build |
| B4 | `khach-hang/screens/ket-qua-tim-chuyen` | `khach-hang/ket-qua-tim-chuyen.html` | ✅ Đã build |
| B5 | `khach-hang/screens/chi-tiet-chuyen` | `khach-hang/chi-tiet-chuyen.html` | ✅ Đã build |
| B6 | `khach-hang/screens/dat-cho-thanh-cong` | `khach-hang/dat-cho-thanh-cong.html` | ✅ Đã build |
| B7 | `khach-hang/screens/chuyen-cua-toi` | `khach-hang/chuyen-cua-toi.html` | ✅ Đã build |
| B8 | `khach-hang/screens/ho-so` | `khach-hang/ho-so.html` | ✅ Đã build |
| D1 | `tai-xe/screens/tai-xe-tong-quan` | `tai-xe/tong-quan.html` | ✅ Đã build |
| D3 | `tai-xe/screens/tai-xe-chi-tiet-chuyen` | `tai-xe/tai-xe-chi-tiet-chuyen.html` | ✅ Đã build |
| D4 | `tai-xe/screens/tai-xe-dieu-hanh` | `tai-xe/tai-xe-dieu-hanh.html` | ✅ Đã build |
| D5 | `tai-xe/screens/tai-xe-xe` | `tai-xe/tai-xe-xe.html` | ✅ Đã build |
| D6 | `tai-xe/screens/tai-xe-ho-so` | `tai-xe/tai-xe-ho-so.html` | ✅ Đã build |
| A1 | `admin/screens/tong-quan` | `admin/tong-quan.html` | ✅ Đã build |
| A2 | `admin/screens/admin-chuyen` | `admin/admin-chuyen.html` | ✅ Đã build |
| A3 | `admin/screens/admin-tai-xe` | `admin/tai-xe.html` | ✅ Đã build |
| A4 | `admin/screens/admin-xe` | `admin/xe.html` | ✅ Đã build |
| A5 | `admin/screens/admin-tuyen-duong` | `admin/tuyen-duong.html` | ✅ Đã build |
| A6 | `admin/screens/admin-don-dat` | `admin/don-dat.html` | ✅ Đã build |
| A7 | `admin/screens/admin-doanh-thu` | `admin/admin-doanh-thu.html` | ✅ Đã build |
| A8 | `admin/screens/admin-khach-hang` | `admin/khach-hang.html` | ✅ Đã build |
| — | `tai-xe/screens/dang-nhap` | `tai-xe/index.html` | ✅ Cổng tài xế |
| — | `admin/screens/dang-nhap` | `admin/index.html` | ✅ Cổng admin |
| SH1 | `shared/screens/loi` | `shared/404.html` | ✅ 404; chưa có 500 |

**Loại bỏ/không dựng:** `chuyen-da-dat` (đã gộp vào B7), `huy-doi-chuyen`
(modal trong B7), `tai-xe-tuyen`, `tai-xe-danh-gia`, `danh-gia`, `uu-dai`,
`thong-bao`, `admin-khieu-nai`, `admin-doi-soat`, `admin-khuyen-mai`,
`admin-thong-bao`, `admin-noi-dung`, `admin-cau-hinh`, `admin-nhat-ky`,
`admin-bao-cao` (thay bằng `admin-doanh-thu`), `admin-dieu-phoi` (A9),
`admin-su-co` (trang sự cố riêng).

---

## 5. QUY TRÌNH TẠO MỘT MÀN MỚI

1. Tạo `screens/<ten>/screen.json`: `output`, `title`, `description`, `css[]`
   (đúng thứ tự cấu trúc), `js[]`, `partials[]`.
2. Tạo `screens/<ten>/partials/*.html` từ component/token có sẵn; chỉ tạo CSS/JS
   mới khi component chưa tồn tại.
3. Chèn partial giữa shell tương ứng; **không** lặp block CSS/JS trong màn.
4. Chạy `node build.js` → pass (không file > 300 dòng / > 100 ký tự).
5. Kiểm desktop + mobile (≤ 400px), console sạch, đối chiếu **CHECKLIST §10**.
6. Đủ 4 trạng thái (rỗng/tải/lỗi/có dữ liệu) cho màn danh sách; đủ
   hover/focus/active/loading cho control; a11y §9 (1 `h1`, label, focus ring).
7. Rà lại: không có nút/khối hỗ trợ, hotline, chuông, đánh giá, khuyến mãi,
   online/offline, "nhận chuyến".
8. Đặt `output` theo quy ước `<nhóm>/<ten>.html`; nếu cần tiền tố (như
   `admin-chuyen.html`) phải ghi rõ trong `00` §7 để tránh lệch.

---

## 6. THỨ TỰ LÀM GỢI Ý

| Phase | Màn ưu tiên | Trạng thái |
|-------|-------------|------------|
| **1 — Khách** | B2, B3 → B1, B4, B5, B6 → B7, B8 → shell U | ✅ |
| **2 — Vận hành** | A3, A4, A5 → **A2 (tạo chuyến + phân công + lịch)** → A1, A6 → D1, D3, D4, D6 → shell D, shell A | ✅ |
| **3 — Hoàn thiện** | D5 → A7, A8 → SH1, rà trạng thái | ✅ |
| **4 — Dọn lệch đặc tả** | Bỏ chuông/online/FAQ/hỗ trợ, thống nhất output admin, gom component | ⏳ |

Phụ thuộc chính:

```
A3 (tài khoản tài xế) ─┐
A4 (xe) ───────────────┼→ A2 (chuyến) → D1 → D3 → D4
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
- Không thêm màn ngoài **21 màn nghiệp vụ + 2 cổng + 1 trang lỗi** nếu chưa
  được người dùng duyệt.
- **Trạng thái chuyến / vé / thanh toán là ba trường độc lập**; ánh xạ theo
  `01 §4`, `02 §5`, `03 §4`.
- **Lớp trạng thái lệnh** (`Chưa nhận → Đã nhận → Đang chuẩn bị → Đã có mặt`)
  tách khỏi trạng thái chuyến; tài xế chỉ bấm 2 nút.
- **Không có hoàn tiền**: thu tiền mặt khi lên xe, tài xế ghi `Đã thu` ở D4;
  A7 tính doanh thu theo vé `Đã thu`.
- Cổng đăng nhập **đã tách riêng** cho khách/tài xế/admin (xem §1.2).
- `NAVIGATION.MD` không còn trong repo; điều hướng nằm trong partial header,
  `admin-shell.html` và `driver-header.html`.
- Trước khi kết thúc session: xóa file tạm đã tạo trong `temp/`.
