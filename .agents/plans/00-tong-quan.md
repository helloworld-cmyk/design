# 00 — TỔNG QUAN KẾ HOẠCH (PHẠM VI TINH GỌN)

> **Vi Vu Việt** — website đặt vé xe ghép liên tỉnh theo lịch trình, làm như
> **project cá nhân**. Phạm vi chốt: **21 màn nghiệp vụ** — 8 khách hàng,
> 5 tài xế, 8 quản trị viên — cộng **2 cổng đăng nhập riêng** cho tài xế/admin
> và **1 trang lỗi dùng chung**. Tổng cộng **24 `screen.json`**.
>
> **Trạng thái 2026-11-02:** đã dựng đủ 24 màn, `node build.js` pass. Các điểm
> UI còn lệch đặc tả (chuông, online, hỗ trợ/FAQ, output admin không đồng nhất)
> được liệt kê ở §8 để dọn tiếp; chúng không chặn build.
>
> Mục tiêu: thể hiện đủ **ba vai trò, phân quyền, CRUD, đặt vé, quản lý trạng
> thái và quy trình điều hành** — nhưng **không** xây các module hỗ trợ không
> phục vụ nghiệp vụ cốt lõi.

---

## 0. Cách dùng bộ tài liệu

| File | Nội dung |
|------|----------|
| `00-tong-quan.md` | Phạm vi, mô hình, shell, site map, component, lộ trình, bảng 21 màn, hiện trạng |
| `01-khach-hang.md` | 8 màn khách hàng (gồm trang chủ, đăng nhập, đăng ký) |
| `02-tai-xe.md` | 5 màn tài xế (D1, D3–D6) + ghi chú cổng đăng nhập |
| `03-admin.md` | 8 màn quản trị (A1–A8) + ghi chú cổng đăng nhập |
| `04-dung-chung-va-ky-thuat.md` | Cổng xác thực, trang lỗi, partial/component, quy trình build |
| `flow.md` | Luồng xuyên vai trò và hiện trạng nối luồng |
| `brainstorm.md` | Nhật ký chốt PA2–PA4: lịch điều phối, trạng thái lệnh, vòng đời sự cố |

**Quy ước mỗi màn:**

- **Mã màn** — thư mục `screens/<ten-khong-dau>/` (khớp `build.js`).
- **Tác dụng** — màn tồn tại để giải quyết việc gì.
- **Nhiệm vụ chính** — thao tác người dùng thực hiện được.
- **Thành phần** — khối UI, component tái dùng.
- **Trạng thái** — rỗng / tải / lỗi / thành công.
- **Ưu tiên** — P0 (MVP), P1 (chính), P2 (hoàn thiện).

Mọi màn khi triển khai **phải** tuân `DESIGN_RULES.MD` (§3–§9).

---

## 1. Mô hình hoạt động

Chuỗi nghiệp vụ duy nhất của sản phẩm:

```
Admin tạo chuyến + gán xe + phân công tài xế        (A2)
        │ công bố chuyến
        ▼
Khách tìm chuyến → xem chi tiết → chọn ghế → đặt vé  (B4 → B5)
        │ hệ thống tự xác nhận đơn
        ▼
Admin thấy đơn trong danh sách đơn đặt              (A6)
Tài xế thấy chuyến trong lịch chạy ở Tổng quan        (D1)
        │ tài xế xác nhận lệnh → có mặt tại bến (D3)
        ▼
Tài xế bắt đầu chuyến, đón/trả khách, thu tiền mặt   (D4)
        │ hệ thống cập nhật trạng thái vé + chuyến + thanh toán
        ▼
Admin xem doanh thu thực thu (theo vé đã thu tiền)  (A7)
```

**Phân vai rõ ràng:**

| Vai trò | Trách nhiệm | Không làm |
|---------|-------------|-----------|
| **Admin** | Lập lịch chuyến, xem lịch điều phối tài nguyên, gán xe, phân công tài xế, quản lý danh mục, hủy vé/chuyến, xử lý sự cố, theo dõi thu tiền, xem doanh thu | Không điều phối GPS thời gian thực, không duyệt KYC nhiều bước |
| **Tài xế** | Xác nhận lệnh được phân công, thực hiện chuyến, cập nhật đón/trả, ghi nhận tiền mặt, báo sự cố, xem xe được giao | Không tự tạo chuyến, không tự đăng ký tài khoản, không tự chọn/hủy chuyến |
| **Khách** | Tìm chuyến, chọn ghế, đặt vé, hủy vé trong chi tiết vé, quản lý hồ sơ | Không đổi vé, không đánh giá, không mở ticket hỗ trợ |

**Quyết định tinh giản quan trọng:**

- **Admin là người tạo chuyến** (không phải tài xế tự đăng chuyến).
- **Tài khoản tài xế do admin tạo** trong `A3`; tài xế **không có màn đăng ký**.
- **Thanh toán MVP: tiền mặt cho tài xế khi lên xe.** Trạng thái thanh toán chỉ
  là `Chưa thu / Đã thu`; tài xế đánh dấu `Đã thu` trên từng vé ở D4.
- **Không có hoàn tiền trong MVP.** Vì khách chỉ trả tiền mặt khi lên xe, vé hủy
  trước khi thu tiền **không phát sinh khoản hoàn**. Admin chỉ hủy vé/chuyến và
  theo dõi trạng thái thu tiền; không có cổng thanh toán, ví, hoa hồng, payout.
- **Hủy vé nằm trong chi tiết vé** (không có màn hủy/đổi riêng). Đổi vé bị bỏ
  khỏi MVP — khách hủy rồi đặt chuyến khác.
- **Ba trạng thái tách biệt:** `trạng thái chuyến`, `trạng thái vé`, `trạng thái
  thanh toán` là ba trường độc lập, xem ánh xạ ở `01`/`02`/`03`.
- **Lớp trạng thái lệnh phân công** tách khỏi trạng thái chuyến:
  `Chưa nhận → Đã nhận → (Đang chuẩn bị, suy ra) → Đã có mặt`; tài xế chỉ bấm
  2 nút, admin theo dõi ở A1/A2.
- **Lịch điều phối tài nguyên nằm trong A2** (chế độ Bảng | Lịch, chuyển nhóm
  Theo tài xế / Theo xe) — không có màn A9 riêng.
- **Sự cố chuyến có vòng đời** `Mở → Đang xử lý → Đã xử lý`, xử lý ở A2, hàng
  đợi kèm tuổi đời ở A1; không có ticket, chat, FAQ, tổng đài.
- **Doanh thu = tiền thực thu:** A7 chỉ tính các vé có thanh toán `Đã thu`, không
  tính mọi vé đã đặt.

---

## 2. Nguyên tắc tinh gọn

### Giữ lại

- Ba vai trò và phân quyền truy cập.
- CRUD chuyến, tuyến, xe, tài xế, khách hàng.
- Đặt vé theo ghế, chọn điểm đón/trả, trạng thái vé.
- Quy trình điều hành: tạo chuyến → phân công → khách đặt → tài xế chạy →
  cập nhật trạng thái → thu tiền → doanh thu.
- Tách bạch **trạng thái chuyến**, **trạng thái vé**, **trạng thái thanh toán**.
- Lịch điều phối tài nguyên và dải tình trạng rảnh trong A2.
- Trạng thái lệnh phân công + cờ trễ tự tính.
- Báo sự cố chuyến với vòng đời `Mở → Đang xử lý → Đã xử lý`.
- Hủy vé ở khách/admin; hủy chuyến ở admin; theo dõi trạng thái thu tiền mặt.

### Loại bỏ khỏi phạm vi

- Toàn bộ màn **Trợ giúp / Hỗ trợ** ở cả ba vai trò.
- Ticket, chat hỗ trợ, FAQ, tổng đài/hotline.
- Trung tâm thông báo, chuông, broadcast, push/email/SMS.
- Màn đánh giá riêng (khách và tài xế); đánh giá bị bỏ khỏi MVP.
- Khuyến mãi, voucher, điểm thưởng, hạng thành viên.
- CMS, cấu hình hệ thống, audit log, nhật ký.
- Ví đối tác, lệnh rút, đối soát nhiều kỳ, hoa hồng phức tạp.
- Hoàn tiền/đối soát hoàn tiền (không phát sinh vì thu tiền mặt khi lên xe).
- Duyệt KYC nhiều bước, hồ sơ chờ duyệt, upload giấy tờ.
- Đổi vé và màn hủy/đổi riêng.
- Toggle Online/Offline và nút "Nhận chuyến".
- Đăng ký tài khoản tài xế.
- Màn điều phối riêng A9 và trang theo dõi sự cố riêng.

Các tham số như hạn chót đặt chỗ, thời gian giữ ghế, **hạn tự hủy vé** (mặc định
12 giờ trước giờ khởi hành) được ghi thành **hằng số nghiệp vụ trong code/tài
liệu**, không có màn cấu hình.

---

## 3. Kiến trúc shell (hiện trạng)

| Shell | Dùng cho | Header / điều hướng | Partial hiện có |
|-------|----------|---------------------|-----------------|
| **M — Marketing** | Trang chủ | `site-header`, neo cuộn, footer | `shared/components/header.html`, `khach-hang/components/footer.html` |
| **Auth khách** | B2, B3 | panel thương hiệu + form, không header site | `khach-hang/components/auth-top.html` + `screens/dang-*/partials/form.html` |
| **Auth tài xế** | `tai-xe/index.html` | panel riêng khu tài xế | `tai-xe/screens/dang-nhap/partials/auth-top.html`, `form.html` |
| **Auth admin** | `admin/index.html` | panel riêng khu quản trị | `admin/screens/dang-nhap/partials/auth-top.html`, `form.html` |
| **U — User app** | Khách đã đăng nhập | header + user menu + footer | `shared/components/header.html`, `khach-hang/components/footer.html` |
| **D — Driver app** | Tài xế | `driver-header` (3 mục) + `page-end` | `driver-header.html` theo từng màn, `tai-xe/components/page-end.html` |
| **A — Admin** | Back-office | sidebar trái + topbar + breadcrumb | `admin/components/admin-shell.html`, `admin-shell-end.html`; A1 dùng shell riêng `admin/screens/tong-quan/partials/shell.html` |

**Header/footer không chứa:** chuông thông báo, hotline, nút "Hỗ trợ", chat.
Chỉ có logo, điều hướng vai trò, avatar và đăng xuất. *(Hiện một số partial còn
vi phạm — xem §8.)*

**Sidebar admin (8 mục, khớp 8 màn):**

```
Tổng quan · Quản lý chuyến · Quản lý tài xế · Quản lý xe
Quản lý tuyến · Quản lý đơn đặt · Doanh thu · Quản lý khách hàng
```

**Điều hướng tài xế (3 mục):**

```
Tổng quan · Xe được giao · Hồ sơ
```

---

## 4. Sơ đồ màn hình (hiện trạng)

```
Vi Vu Việt
│
├── CÔNG KHAI (shell M)
│   └── Trang chủ (tìm chuyến) ................... B1
│
├── XÁC THỰC KHÁCH
│   ├── Đăng nhập ................................ B2
│   └── Đăng ký .................................. B3
│
├── KHÁCH HÀNG (shell U) — 8 màn gồm cả công khai/auth
│   ├── Trang chủ ................................ B1
│   ├── Đăng nhập ................................ B2
│   ├── Đăng ký .................................. B3
│   ├── Kết quả tìm chuyến ....................... B4
│   ├── Chi tiết chuyến .......................... B5
│   ├── Đặt chỗ thành công ....................... B6
│   ├── Chuyến của tôi (tab + hủy vé) ............ B7
│   └── Hồ sơ .................................... B8
│
├── TÀI XẾ (shell D) — 5 màn nghiệp vụ
│   ├── D1 Tổng quan (lịch chạy tuần, lệnh) ...... tai-xe/tong-quan.html
│   ├── D3 Chi tiết chuyến (báo sự cố) ........... tai-xe/tai-xe-chi-tiet-chuyen.html
│   ├── D4 Điều hành chuyến ...................... tai-xe/tai-xe-dieu-hanh.html
│   ├── D5 Xe được giao .......................... tai-xe/tai-xe-xe.html
│   ├── D6 Hồ sơ cá nhân ......................... tai-xe/tai-xe-ho-so.html
│   └── Cổng đăng nhập ........................... tai-xe/index.html
│
├── ADMIN (shell A) — 8 màn nghiệp vụ
│   ├── A1 Tổng quan ............................. admin/tong-quan.html
│   ├── A2 Quản lý chuyến ........................ admin/admin-chuyen.html
│   ├── A3 Quản lý tài xế ........................ admin/tai-xe.html
│   ├── A4 Quản lý xe ............................ admin/xe.html
│   ├── A5 Quản lý tuyến ......................... admin/tuyen-duong.html
│   ├── A6 Quản lý đơn đặt ....................... admin/don-dat.html
│   ├── A7 Doanh thu ............................. admin/admin-doanh-thu.html
│   ├── A8 Quản lý khách hàng .................... admin/khach-hang.html
│   └── Cổng đăng nhập ........................... admin/index.html
│
└── DÙNG CHUNG
    └── Trang lỗi ................................ shared/screens/loi → shared/404.html
```

**Không tính vào 21 màn nghiệp vụ:** `tai-xe/screens/dang-nhap`,
`admin/screens/dang-nhap` và `shared/screens/loi`.

---

## 5. Component & design system (hiện trạng)

Dựng từ token `shared/css/tokens.css` + `shared/css/base.css`; các màn bổ sung
CSS riêng theo `screen.json`. **Chưa gom** component dùng chung vào `shared/css/`
— đây là việc dọn tiếp, không phải đặc tả mới.

| Component | Hiện thực hiện tại | Dùng ở |
|-----------|--------------------|--------|
| Shell admin | `admin/css/admin-shell.css`, `admin/screens/tong-quan/css/shell*.css` | A1–A8 |
| Shell tài xế | `tai-xe/screens/tai-xe-tong-quan/css/dash-shell.css`, `shared/css/header.css` | D1, D3–D6 |
| Bảng dữ liệu `.data-table` | CSS theo màn (`chuyen-table.css`, `orders-table.css`, `khach-hang-table.css`, `xe-table.css`, `route-table.css`, `tai-xe.css`) | A2–A8 |
| Thẻ KPI `.stat-card` | `admin/screens/tong-quan/css/stats.css`, `admin/screens/admin-doanh-thu/css/stats.css`; D1 dùng CSS riêng trong `tai-xe-tong-quan/css/` | A1, A7, D1 |
| Bộ lọc `.filter-bar` | CSS theo màn (`filters.css`, `tai-xe.css`, `trips-page.css`, …) | B4, B7, A2, A3, A6, A8 |
| Tabs `.tabs` | `chuyen-page.css`, `orders-toolbar.css`, `trips-page.css` | B7, A2, A6 |
| Modal `.modal` | `admin/css/modal.css` + CSS modal theo màn | hủy vé, hủy chuyến, báo sự cố, xóa/khóa |
| Toast `.toast` | `admin/css/admin-shell.css` + toast theo màn | phản hồi thao tác |
| Trạng thái `.empty-state`, skeleton | `states.css` theo màn | mọi danh sách |
| Timeline `.timeline` | `timeline.css`, `orders-timeline.css`, `monitor.css` | B7, D3, A2, A6 |
| Badge trạng thái `.status-badge` | `chuyen-badges.css`, `tai-xe/css/badges.css`, CSS bảng theo màn | chuyến, vé, xe, tài khoản |
| Thanh tiến trình `.progress` | CSS theo màn | tỉ lệ lấp ghế, tiến độ chuyến |
| Sơ đồ ghế | `khach-hang/screens/chi-tiet-chuyen/css/seat-map.css` | B5 |
| Bản đồ placeholder | chưa triển khai | B5 (tuỳ chọn) |
| Lịch điều phối | `admin-chuyen/css/chuyen-lich.css`, `chuyen-avail.css`, `js/chuyen-lich*.js` | A2 |
| Trạng thái lệnh + cờ trễ | `chuyen-lenh.css`, `tai-xe/.../tq-lenh.css`, `js/lenh.js` | D1, D3, A1, A2 |
| Vòng đời sự cố | `chuyen-suco.css`, `js/chuyen-incident.js` | A1, A2 |

**Icon:** dùng `shared/components/sprite.html` + sprite theo màn. Hiện còn
`i-bell`, `i-star` trong sprite/shared header — cần dọn theo §8.

---

## 6. Lộ trình triển khai

| Phase | Nội dung | Màn | Trạng thái |
|-------|----------|-----|------------|
| **1 — Khách hàng** | Luồng đặt vé khép kín, shell U | B1–B8 | ✅ Đã xong |
| **2 — Vận hành** | Tài khoản tài xế, tạo chuyến + phân công, đặt vé, thực hiện chuyến, lịch điều phối, trạng thái lệnh | A1–A6, D1–D4, D6 | ✅ Đã xong |
| **3 — Hoàn thiện** | Xe được giao, doanh thu, khách hàng, vòng đời sự cố | D5, A7, A8 | ✅ Đã xong |
| **4 — Dọn lệch đặc tả** | Bỏ chuông/online/FAQ/hỗ trợ, thống nhất output admin, gom component | Toàn bộ | ⏳ Đang mở (§8) |

Thứ tự triển khai chi tiết ở `04-dung-chung-va-ky-thuat.md` §6.

---

## 7. Bảng tổng hợp 21 màn nghiệp vụ

| # | Vai trò | Mã | Màn hình | Shell | Thư mục | Output | Ưu tiên | Trạng thái |
|---|---------|----|----------|-------|---------|--------|---------|------------|
| 1 | Khách | B1 | Trang chủ | M | `khach-hang/screens/home` | `khach-hang/index.html` | P0 | ✅ |
| 2 | Khách | B2 | Đăng nhập | Auth | `khach-hang/screens/dang-nhap` | `khach-hang/dang-nhap.html` | P0 | ✅ |
| 3 | Khách | B3 | Đăng ký | Auth | `khach-hang/screens/dang-ky` | `khach-hang/dang-ky.html` | P0 | ✅ |
| 4 | Khách | B4 | Kết quả tìm chuyến | U | `khach-hang/screens/ket-qua-tim-chuyen` | `khach-hang/ket-qua-tim-chuyen.html` | P0 | ✅ |
| 5 | Khách | B5 | Chi tiết chuyến | U | `khach-hang/screens/chi-tiet-chuyen` | `khach-hang/chi-tiet-chuyen.html` | P0 | ✅ |
| 6 | Khách | B6 | Đặt chỗ thành công | U | `khach-hang/screens/dat-cho-thanh-cong` | `khach-hang/dat-cho-thanh-cong.html` | P0 | ✅ |
| 7 | Khách | B7 | Chuyến của tôi | U | `khach-hang/screens/chuyen-cua-toi` | `khach-hang/chuyen-cua-toi.html` | P0 | ✅ |
| 8 | Khách | B8 | Hồ sơ | U | `khach-hang/screens/ho-so` | `khach-hang/ho-so.html` | P0 | ✅ |
| 9 | Tài xế | D1 | Tổng quan | D | `tai-xe/screens/tai-xe-tong-quan` | `tai-xe/tong-quan.html` | P1 | ✅ |
| 10 | Tài xế | D3 | Chi tiết chuyến | D | `tai-xe/screens/tai-xe-chi-tiet-chuyen` | `tai-xe/tai-xe-chi-tiet-chuyen.html` | P1 | ✅ |
| 11 | Tài xế | D4 | Điều hành chuyến | D | `tai-xe/screens/tai-xe-dieu-hanh` | `tai-xe/tai-xe-dieu-hanh.html` | P1 | ✅ |
| 12 | Tài xế | D5 | Xe được giao | D | `tai-xe/screens/tai-xe-xe` | `tai-xe/tai-xe-xe.html` | P2 | ✅ |
| 13 | Tài xế | D6 | Hồ sơ cá nhân | D | `tai-xe/screens/tai-xe-ho-so` | `tai-xe/tai-xe-ho-so.html` | P1 | ✅ |
| 14 | Admin | A1 | Tổng quan | A | `admin/screens/tong-quan` | `admin/tong-quan.html` | P1 | ✅ |
| 15 | Admin | A2 | Quản lý chuyến | A | `admin/screens/admin-chuyen` | `admin/admin-chuyen.html` | P0 | ✅ |
| 16 | Admin | A3 | Quản lý tài xế | A | `admin/screens/admin-tai-xe` | `admin/tai-xe.html` | P1 | ✅ |
| 17 | Admin | A4 | Quản lý xe | A | `admin/screens/admin-xe` | `admin/xe.html` | P1 | ✅ |
| 18 | Admin | A5 | Quản lý tuyến | A | `admin/screens/admin-tuyen-duong` | `admin/tuyen-duong.html` | P1 | ✅ |
| 19 | Admin | A6 | Quản lý đơn đặt | A | `admin/screens/admin-don-dat` | `admin/don-dat.html` | P1 | ✅ |
| 20 | Admin | A7 | Doanh thu | A | `admin/screens/admin-doanh-thu` | `admin/admin-doanh-thu.html` | P2 | ✅ |
| 21 | Admin | A8 | Quản lý khách hàng | A | `admin/screens/admin-khach-hang` | `admin/khach-hang.html` | P2 | ✅ |

**Tổng: 21 màn nghiệp vụ.** Ngoài ra có **2 cổng đăng nhập riêng**
(`tai-xe/screens/dang-nhap` → `tai-xe/index.html`;
`admin/screens/dang-nhap` → `admin/index.html`) và **1 trang lỗi**
(`shared/screens/loi` → `shared/404.html`). Tổng cộng **24 `screen.json`**.

> Cách đếm: 21 màn nghiệp vụ + 2 cổng + 1 trang lỗi. `AGENTS.MD` đang ghi
> "22 màn (8 khách · 6 tài xế · 8 admin)" do tính cổng tài xế vào nghiệp vụ
> nhưng không tính cổng admin; cần thống nhất khi sửa `AGENTS.MD`.

---

## 8. Hiện trạng triển khai (2026-11-02)

**Đã build đủ 24 `screen.json`, `node build.js` pass:**

- `khach-hang/`: 8 màn — `index`, `dang-nhap`, `dang-ky`,
  `ket-qua-tim-chuyen`, `chi-tiet-chuyen`, `dat-cho-thanh-cong`,
  `chuyen-cua-toi`, `ho-so`.
- `tai-xe/`: 6 màn — cổng `index` + D1, D3–D6.
- `admin/`: 9 màn — cổng `index` + A1–A8.
- `shared/`: 1 màn lỗi `404.html`.

**Luồng đã nối:**

- Form trang chủ chuyển sang `ket-qua-tim-chuyen.html`.
- Xác nhận đặt vé chuyển sang `dat-cho-thanh-cong.html`; nếu chưa đăng nhập
  thì sang `dang-nhap.html?next=...`.
- B7 có tab trạng thái, hủy vé bằng modal, nút "Xem vé".
- Đăng nhập khách/tài xế/admin ghi phiên `vvv.auth.user|driver|admin` và tôn
  trọng `?next=`.
- `chuyen-da-dat` và `huy-doi-chuyen` **không còn** trong source.

**Điểm lệch đặc tả cần dọn (không chặn build):**

1. `shared/components/header.html` còn link `#danh-gia`, `#faq`; trang chủ còn
   `testimonials.html`, `faq.html`, khối "Hỗ trợ 24/7" trong `features.html`,
   và mô tả trang đăng nhập tài xế còn "nhận chuyến / thu nhập".
2. A1 còn KPI **"Tài xế đang online"**; `monitor.html` còn câu "tự động tạm
   khoá nhận chuyến"; `admin/components/admin-shell.html` còn chuông `i-bell`;
   sprite còn `i-bell`, `i-star`.
3. B7 hiện có 4 tab (`Sắp tới`, `Đang đi`, `Đã hoàn thành`, `Đã hủy`), chưa có
   tab `Không lên xe` và chưa có drawer/panel chi tiết vé riêng; "Xem vé" mở
   lại B6.
4. B5 chưa hiển thị khối nhắc "thanh toán tiền mặt cho tài xế khi lên xe".
5. B8 và D6 chưa có form đổi mật khẩu; B8 có thêm khối "Địa chỉ & đi chung".
6. Output admin không đồng nhất: A2 `admin-chuyen.html`, A7
   `admin-doanh-thu.html` có tiền tố `admin-`; A3–A6, A8 không có; thư mục A1
   là `tong-quan` (không phải `admin-tong-quan`).
7. Chỉ có `shared/404.html`; chưa có trang 500/bảo trì.
8. A1 dùng shell partial riêng; các màn admin khác dùng
   `admin/components/admin-shell.html` nhưng vẫn load CSS shell từ
   `admin/screens/tong-quan/css/`. Nên gom shell + CSS về `admin/components` và
   `admin/css`.
9. Component CSS đang nằm theo màn; chưa gom `table.css`, `filters.css`,
   `stats.css`, `tabs.css`, `toast.css`, `states.css`, `timeline.css` về
   `shared/css/`.

**Không còn trong kế hoạch:** `tai-xe-tuyen` (tài xế đăng chuyến),
`tai-xe-danh-gia`, `admin-khieu-nai`, `admin-doi-soat`, `admin-khuyen-mai`,
`admin-thong-bao`, `admin-noi-dung`, `admin-cau-hinh`, `admin-nhat-ky`,
`admin-bao-cao` (thay bằng `admin-doanh-thu`), `admin-dieu-phoi` (A9),
`admin-su-co` (trang sự cố riêng), `chuyen-da-dat`, `huy-doi-chuyen`.

`NAVIGATION.MD` đã bị xóa khỏi repo; điều hướng hiện nằm trong
`shared/components/header.html`, `admin/components/admin-shell.html` và
`driver-header.html` của từng màn tài xế. `AGENTS.MD` (snapshot 2026-10-31) còn
nhắc file này và mô tả thiếu màn — cần cập nhật khi người dùng duyệt vì là file
chung.

---

## 9. Ngoài phạm vi (chốt)

1. Không có màn Trợ giúp/Hỗ trợ ở bất kỳ vai trò nào.
2. Không có ticket, chat, FAQ, tổng đài, hotline.
3. Không có thông báo (chuông, broadcast, push/email/SMS).
4. Không có đánh giá, khiếu nại, phản hồi.
5. Không có khuyến mãi, voucher, điểm thưởng.
6. Không có CMS, cấu hình hệ thống, audit log.
7. Không có ví đối tác, lệnh rút, payout, **hoàn tiền** (thu tiền mặt khi lên xe).
8. Không có đổi vé, màn hủy riêng.
9. Không có Online/Offline, không có "Nhận chuyến".
10. Không có đăng ký tài khoản tài xế; tài khoản do admin tạo.
11. Không có màn điều phối A9, không có trang sự cố riêng.

Ngoại lệ duy nhất được giữ: **báo sự cố chuyến** — tài xế báo trong D3/D4;
admin xử lý theo vòng đời `Mở → Đang xử lý → Đã xử lý` tại A2; hàng đợi kèm
tuổi đời ở A1. Báo sự cố **không** tự hủy chuyến hay đổi trạng thái vé.
