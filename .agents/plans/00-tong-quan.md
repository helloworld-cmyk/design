# 00 — TỔNG QUAN KẾ HOẠCH (PHẠM VI TINH GỌN)

> **Vi Vu Việt** — website đặt vé xe ghép liên tỉnh theo lịch trình, làm như
> **project cá nhân**. Phạm vi chốt: **22 màn nghiệp vụ chính** — 8 khách hàng,
> 6 tài xế, 8 quản trị viên. Không tính cổng đăng nhập riêng của tài xế/admin
> (nếu tách) và trang lỗi dùng chung.
>
> Mục tiêu: thể hiện đủ **ba vai trò, phân quyền, CRUD, đặt vé, quản lý trạng
> thái và quy trình điều hành** — nhưng **không** xây các module hỗ trợ không
> phục vụ nghiệp vụ cốt lõi.

---

## 0. Cách dùng bộ tài liệu

| File | Nội dung |
|------|----------|
| `00-tong-quan.md` | Phạm vi, mô hình hoạt động, shell, site map, component, lộ trình, bảng 22 màn |
| `01-khach-hang.md` | 8 màn khách hàng (gồm trang chủ, đăng nhập, đăng ký) |
| `02-tai-xe.md` | 6 màn tài xế (D1–D6) |
| `03-admin.md` | 8 màn quản trị (A1–A8) |
| `04-dung-chung-va-ky-thuat.md` | Cổng xác thực, trang lỗi, partial, component, quy trình build |

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
Tài xế thấy chuyến trong danh sách được phân công    (D2)
        │ đến ngày chạy
        ▼
Tài xế bắt đầu chuyến, đón/trả khách, thu tiền mặt   (D4)
        │ hệ thống cập nhật trạng thái vé + chuyến + thanh toán
        ▼
Admin xem doanh thu thực thu (theo vé đã thu tiền)  (A7)
```

**Phân vai rõ ràng:**

| Vai trò | Trách nhiệm | Không làm |
|---------|-------------|-----------|
| **Admin** | Lập lịch chuyến, gán xe, phân công tài xế, quản lý danh mục, hủy vé/chuyến, theo dõi thu tiền, xem doanh thu | Không điều phối thời gian thực, không duyệt KYC nhiều bước |
| **Tài xế** | Thực hiện chuyến được phân công, cập nhật đón/trả, ghi nhận tiền mặt, báo sự cố, xem xe được giao | Không tự tạo chuyến, không tự đăng ký tài khoản |
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
- **Doanh thu = tiền thực thu:** A7 chỉ tính các vé có thanh toán `Đã thu`, không
  tính mọi vé đã đặt.
- **Báo sự cố chuyến** là thao tác trong màn chi tiết chuyến của tài xế; không
  có ticket, chat, FAQ, tổng đài.

---

## 2. Nguyên tắc tinh gọn

### Giữ lại

- Ba vai trò và phân quyền truy cập.
- CRUD chuyến, tuyến, xe, tài xế, khách hàng.
- Đặt vé theo ghế, chọn điểm đón/trả, trạng thái vé.
- Quy trình điều hành: tạo chuyến → phân công → khách đặt → tài xế chạy →
  cập nhật trạng thái → thu tiền → doanh thu.
- Tách bạch **trạng thái chuyến**, **trạng thái vé**, **trạng thái thanh toán**.
- Báo sự cố chuyến dạng thao tác đơn giản (modal + cờ sự cố).
- Hủy vé ở khách/admin; hủy chuyến ở admin; theo dõi trạng thái thu tiền mặt.

### Loại bỏ khỏi phạm vi

- Toàn bộ màn **Trợ giúp / Hỗ trợ** ở cả ba vai trò.
- Ticket, chat hỗ trợ, FAQ, tổng đài/hotline.
- Trung tâm thông báo, broadcast, push/email/SMS.
- Màn đánh giá riêng (khách và tài xế); đánh giá bị bỏ khỏi MVP.
- Khuyến mãi, voucher, điểm thưởng, hạng thành viên.
- CMS, cấu hình hệ thống, audit log, nhật ký.
- Ví đối tác, lệnh rút, đối soát nhiều kỳ, hoa hồng phức tạp.
- Hoàn tiền/đối soát hoàn tiền (không phát sinh vì thu tiền mặt khi lên xe).
- Duyệt KYC nhiều bước, hồ sơ chờ duyệt, upload giấy tờ.
- Đổi vé và màn hủy/đổi riêng.
- Toggle Online/Offline và nút "Nhận chuyến".
- Đăng ký tài khoản tài xế.

Các tham số như hạn chót đặt chỗ, thời gian giữ ghế, **hạn tự hủy vé** (mặc định
12 giờ trước giờ khởi hành) được ghi thành **hằng số nghiệp vụ trong code/tài
liệu**, không có màn cấu hình.

---

## 3. Kiến trúc shell

| Shell | Dùng cho | Header | Điều hướng | Partial |
|-------|----------|--------|------------|---------|
| **M — Marketing** | Trang chủ | `site-header` hiện có | neo cuộn | `header.html`, `footer.html` |
| **Auth** | Đăng nhập, đăng ký | tối giản | quay lại / đổi form | `auth-layout.html` |
| **U — User app** | Khách đã đăng nhập | topbar + avatar | tab ngang (responsive) | `app-header.html` |
| **D — Driver app** | Tài xế | topbar + avatar | tab: Tổng quan · Chuyến được phân công · Xe · Hồ sơ | `app-header.html` |
| **A — Admin** | Back-office | sidebar trái + topbar | sidebar 8 mục + breadcrumb | `admin-shell.html`, `admin-sidebar.html` |

**Header/footer không chứa:** chuông thông báo, hotline, nút "Hỗ trợ", chat.
Chỉ có logo, điều hướng vai trò, avatar và đăng xuất.

**Sidebar admin (8 mục, khớp 8 màn):**

```
Tổng quan · Quản lý chuyến · Quản lý tài xế · Quản lý xe
Quản lý tuyến · Quản lý đơn đặt · Doanh thu · Quản lý khách hàng
```

---

## 4. Sơ đồ màn hình

```
Vi Vu Việt
│
├── CÔNG KHAI (shell M)
│   └── Trang chủ (tìm chuyến) ................... B1
│
├── XÁC THỰC
│   ├── Đăng nhập ................................ B2
│   └── Đăng ký .................................. B3
│
├── KHÁCH HÀNG (shell U) — 8 màn gồm cả công khai/auth
│   ├── Trang chủ ................................ B1
│   ├── Đăng nhập ................................ B2
│   ├── Đăng ký .................................. B3
│   ├── Kết quả tìm chuyến ....................... B4
│   ├── Chi tiết chuyến .......................... B5
│   ├── Đặt vé thành công ........................ B6
│   ├── Chuyến của tôi (gồm chi tiết vé + hủy) ... B7
│   └── Hồ sơ .................................... B8
│
├── TÀI XẾ (shell D) — 6 màn
│   ├── D1 Tổng quan
│   ├── D2 Chuyến được phân công
│   ├── D3 Chi tiết chuyến (báo sự cố tại đây)
│   ├── D4 Thực hiện chuyến
│   ├── D5 Xe được giao
│   └── D6 Hồ sơ cá nhân
│
└── ADMIN (shell A) — 8 màn
    ├── A1 Tổng quan
    ├── A2 Quản lý chuyến (tạo/sửa/hủy + phân công)
    ├── A3 Quản lý tài xế (tạo tài khoản)
    ├── A4 Quản lý xe
    ├── A5 Quản lý tuyến
    ├── A6 Quản lý đơn đặt (hủy vé + theo dõi thu tiền)
    ├── A7 Doanh thu
    └── A8 Quản lý khách hàng
```

**Dùng chung, không tính vào 22 màn:** `tai-xe-dang-nhap`, `admin-dang-nhap`
(nếu tách cổng), `loi` (404/500/bảo trì).

---

## 5. Thành phần design system cần bổ sung

Dựng từ token `css/tokens.css` + card/button/form chuẩn; không hardcode màu/kích
thước.

| Component | File đề xuất | Dùng ở |
|-----------|--------------|--------|
| Sidebar + layout admin | `css/admin.css` | shell A |
| Topbar/tab app | `css/app-shell.css` | shell U, D |
| Bảng dữ liệu `.data-table` | `css/table.css` | A2–A8 |
| Thẻ KPI `.stat-card` | `css/stats.css` | A1, A7, D1 |
| Bộ lọc `.filter-bar` | `css/filters.css` | B4, A2, A6, A8 |
| Tabs `.tabs` | `css/tabs.css` | B7, D2, A2 |
| Modal `.modal` | `css/modal.css` | hủy vé, báo sự cố, xác nhận xóa |
| Toast `.toast` | `css/toast.css` | phản hồi thao tác |
| Trạng thái `.empty-state`, skeleton | `css/states.css` | mọi danh sách |
| Timeline trạng thái `.timeline` | `css/timeline.css` | B7, D3, A2 |
| Badge trạng thái `.status-badge` | `base.css` (mở rộng) | chuyến, vé, xe, tài khoản |
| Thanh tiến trình `.progress` | `base.css` (mở rộng) | tỉ lệ lấp ghế, tiến độ chuyến |
| Sơ đồ ghế | `css/seat-map.css` | B5 |
| Bản đồ placeholder | `css/map.css` | B5 (điểm đón), D3/A2 (tuỳ chọn) |

**Icon bổ sung:** `i-dashboard, i-ticket, i-list, i-chart, i-car, i-route,
i-users, i-search, i-filter, i-edit, i-trash, i-alert, i-check,
i-arrow-right, i-chevron-down, i-menu, i-close`.
**Bỏ:** `i-bell`, `i-headset`, `i-star` (không còn thông báo/đánh giá/hỗ trợ).

---

## 6. Lộ trình triển khai

| Phase | Nội dung | Màn |
|-------|----------|-----|
| **1 — Khách hàng** | Hoàn thiện luồng đặt vé khép kín, shell U | B1–B8 |
| **2 — Vận hành** | Tài khoản tài xế, tạo chuyến + phân công, đặt vé, thực hiện chuyến | A1–A6, D1–D4, D6 |
| **3 — Hoàn thiện** | Xe được giao, doanh thu, khách hàng | D5, A7, A8 |

Thứ tự triển khai chi tiết ở `04-dung-chung-va-ky-thuat.md` §5.

---

## 7. Bảng tổng hợp 22 màn

| # | Vai trò | Mã | Màn hình | Shell | Thư mục | Ưu tiên |
|---|---------|----|----------|-------|---------|---------|
| 1 | Khách | B1 | Trang chủ | M | `home` ✅ | P0 |
| 2 | Khách | B2 | Đăng nhập | Auth | `dang-nhap` ✅ | P0 |
| 3 | Khách | B3 | Đăng ký | Auth | `dang-ky` ✅ | P0 |
| 4 | Khách | B4 | Kết quả tìm chuyến | U | `ket-qua-tim-chuyen` ✅ | P0 |
| 5 | Khách | B5 | Chi tiết chuyến | U | `chi-tiet-chuyen` ✅ | P0 |
| 6 | Khách | B6 | Đặt vé thành công | U | `dat-cho-thanh-cong` ✅ | P0 |
| 7 | Khách | B7 | Chuyến của tôi | U | `chuyen-cua-toi` ✅ | P0 |
| 8 | Khách | B8 | Hồ sơ | U | `ho-so` ✅ | P0 |
| 9 | Tài xế | D1 | Tổng quan | D | `tai-xe-tong-quan` | P1 |
| 10 | Tài xế | D2 | Chuyến được phân công | D | `tai-xe-chuyen` | P1 |
| 11 | Tài xế | D3 | Chi tiết chuyến | D | `tai-xe-chi-tiet-chuyen` | P1 |
| 12 | Tài xế | D4 | Thực hiện chuyến | D | `tai-xe-dieu-hanh` | P1 |
| 13 | Tài xế | D5 | Xe được giao | D | `tai-xe-xe` | P2 |
| 14 | Tài xế | D6 | Hồ sơ cá nhân | D | `tai-xe-ho-so` | P1 |
| 15 | Admin | A1 | Tổng quan | A | `admin-tong-quan` | P1 |
| 16 | Admin | A2 | Quản lý chuyến | A | `admin-chuyen` | P0 |
| 17 | Admin | A3 | Quản lý tài xế | A | `admin-tai-xe` | P1 |
| 18 | Admin | A4 | Quản lý xe | A | `admin-xe` | P1 |
| 19 | Admin | A5 | Quản lý tuyến | A | `admin-tuyen-duong` | P1 |
| 20 | Admin | A6 | Quản lý đơn đặt | A | `admin-don-dat` | P1 |
| 21 | Admin | A7 | Doanh thu | A | `admin-doanh-thu` | P2 |
| 22 | Admin | A8 | Quản lý khách hàng | A | `admin-khach-hang` | P2 |

**Tổng: 22 màn** — 8 màn khách đã có file (cần tinh chỉnh theo §8), 14 màn
tài xế/admin cần dựng mới.

---

## 8. Hiện trạng & chuyển đổi

**Đã build (10 file khách):** `index`, `dang-nhap`, `dang-ky`, `ho-so`,
`ket-qua-tim-chuyen`, `chi-tiet-chuyen`, `dat-cho-thanh-cong`, `chuyen-cua-toi`,
`chuyen-da-dat`, `huy-doi-chuyen`.

**Chuyển đổi về đúng 8 màn:**

| Hiện có | Xử lý |
|---------|-------|
| `index` | Giữ — B1 Trang chủ; bỏ khối FAQ/hotline/đánh giá và khối đăng ký tài xế |
| `dang-nhap`, `dang-ky` | Giữ — B2, B3; chỉ dành cho khách |
| `ket-qua-tim-chuyen` | Giữ — B4 |
| `chi-tiet-chuyen` | Giữ — B5 |
| `dat-cho-thanh-cong` | Giữ — B6 (đổi nhãn hiển thị "Đặt vé thành công") |
| `chuyen-cua-toi` | Giữ — B7; thêm **panel chi tiết vé** ngay trong màn |
| `chuyen-da-dat` | **Gộp** vào panel chi tiết vé của `chuyen-cua-toi`; bỏ trang riêng |
| `huy-doi-chuyen` | **Bỏ**; thay bằng nút **Hủy vé** + modal trong chi tiết vé |
| `uu-dai`, `danh-gia`, `thong-bao` (chưa build) | **Không dựng** |
| `tai-xe/`, `admin/` | Chưa có màn — dựng mới theo 02, 03 |

**Không còn trong kế hoạch:** `tai-xe-tuyen` (tài xế đăng chuyến), `tai-xe-danh-gia`,
`admin-khieu-nai`, `admin-doi-soat`, `admin-khuyen-mai`, `admin-thong-bao`,
`admin-noi-dung`, `admin-cau-hinh`, `admin-nhat-ky`, `admin-bao-cao` (thay bằng
`admin-doanh-thu`).

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

Ngoại lệ duy nhất được giữ: **báo sự cố chuyến** — một modal trong màn chi tiết
chuyến của tài xế. Cờ sự cố **hiển thị cảnh báo ở A1** và được admin **xử lý tại
A2**; báo sự cố **không** tự hủy chuyến hay đổi trạng thái vé.