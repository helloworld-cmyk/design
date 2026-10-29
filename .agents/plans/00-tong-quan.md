# KẾ HOẠCH MÀN HÌNH — HỆ THỐNG VI VU VIỆT

> Tài liệu quy hoạch toàn bộ màn hình cần **design** cho một hệ thống hoàn chỉnh:
> khách hàng (user thường), tài xế và quản trị viên (admin).
> Đây là tài liệu `.md` → **không** bị giới hạn 300 dòng / 100 ký tự theo
> `DESIGN_RULES.MD` §1. Mọi màn khi triển khai **vẫn phải** tuân thủ §3–§9.
>
> Trạng thái hiện tại: chỉ có màn **Trang chủ** (`screens/home`). Tài liệu này là
> bản đồ mở rộng cho phần còn lại của sản phẩm.

---

## 0. Cách dùng bộ tài liệu này

| File | Nội dung |
|------|----------|
| `00-tong-quan.md` | Bối cảnh, vai trò, sơ đồ màn hình, layout shell, component mới, lộ trình, bảng tổng hợp |
| `01-khach-hang.md` | Màn hình cho **khách hàng / người dùng thường** |
| `02-tai-xe.md` | Màn hình cho **tài xế** (đối tác cung cấp chuyến) |
| `03-admin.md` | Màn hình cho **quản trị viên / back-office** |
| `04-dung-chung-va-ky-thuat.md` | Màn dùng chung (đăng nhập, thông báo, lỗi…), kế hoạch component, quy trình build |

**Quy ước mỗi màn (áp dụng xuyên suốt bộ tài liệu):**

- **Mã màn** — thư mục sẽ tạo: `screens/<ten-khong-dau>/` (khớp `build.js`).
- **Tác dụng** — màn tồn tại để giải quyết việc gì cho người dùng / doanh nghiệp.
- **Nhiệm vụ chính** — các chức năng người dùng thực hiện được trên màn.
- **Thành phần** — khối UI, tái dùng component nào của design system.
- **Trạng thái** — empty / loading / error / success cần thiết kế.
- **Ưu tiên** — P0 (MVP), P1 (quan trọng), P2 (mở rộng).

---

## 1. Bối cảnh nền tảng

**Vi Vu Việt** là nền tảng **đặt xe ghép liên tỉnh** (shared ride / ride-hailing
ghép tuyến). Một chuyến gồm: nhiều khách ghép chung xe, tài xế chạy tuyến cố
định (ví dụ Hà Nội → Hải Phòng), giá trọn gói theo ghế, đón/trả tận nơi.

Ba nhóm người dùng cần **ba giao diện khác nhau**:

1. **Khách hàng** — đặt chuyến, theo dõi, đánh giá; trả tiền mặt trực tiếp
   cho tài xế trên xe (không thanh toán trước).
2. **Tài xế** — nhận chuyến, chạy tuyến, quản lý thu nhập và hồ sơ.
3. **Quản trị viên** — vận hành, duyệt hồ sơ, kiểm soát chất lượng và dòng tiền.

Hệ thống là **website đa màn (multi-page)** sinh từ `screens/*/screen.json` qua
`node build.js`, không dùng framework — JS thuần dạng IIFE.

---

## 2. Kiến trúc "layout shell" (khung giao diện theo vai trò)

Hiện tại `components/header.html` + `components/footer.html` chỉ là shell
**marketing** (dùng cho trang công khai). Các khu vực đã đăng nhập cần shell
riêng. Đề xuất **4 shell**:

| Shell | Dùng cho | Header | Điều hướng | Bổ sung |
|-------|----------|--------|------------|---------|
| **M — Marketing** | trang chủ | `site-header` (đang có) | neo cuộn | — |
| **U — User app** | khu khách hàng đã đăng nhập | topbar gọn + avatar | tab ngang / sidebar trái | `app-header.html`, `app-sidebar.html` |
| **D — Driver app** | khu tài xế | topbar + trạng thái online | tab ngang (Tổng quan / Chuyến / Thu nhập / Hồ sơ) | dùng chung `app-header` |
| **A — Admin** | back-office | sidebar trái cố định + topbar | sidebar 2 cấp + breadcrumb | `admin-shell.html`, `admin-sidebar.html` |

> Shell U/D/A là **partial dùng chung** đặt ở `components/` theo đúng §1; mỗi màn
> chỉ khai báo chuỗi partial của mình trong `screen.json`.

---

## 3. Sơ đồ màn hình (site map)

```
Vi Vu Việt
│
├── CÔNG KHAI (shell M)
│   └── Trang chủ ............................... [ĐÃ CÓ]
│
├── XÁC THỰC (shell auth — dùng chung)
│   ├── Đăng nhập
│   ├── Đăng ký
│   └── Đăng nhập admin
│
├── KHÁCH HÀNG (shell U)
│   ├── Tìm chuyến ....................... dashboard khách
│   ├── Kết quả tìm kiếm chuyến
│   ├── Chi tiết chuyến & chọn ghế
│   ├── Đặt chỗ thành công
│   ├── Chuyến của tôi (danh sách + lọc)
│   ├── Chi tiết chuyến đã đặt
│   ├── Hủy / đổi chuyến
│   ├── Đánh giá chuyến đi
│   ├── Ưu đãi & mã giảm giá
│   ├── Hồ sơ cá nhân
│   ├── Thông báo
│   └── Trung tâm hỗ trợ / khiếu nại
│
├── TÀI XẾ (shell D)
│   ├── Trạng thái chờ duyệt
│   ├── Tổng quan tài xế (dashboard)
│   ├── Chuyến được phân công
│   ├── Quản lý tuyến & lịch chạy
│   ├── Điều hành chuyến đang chạy
│   ├── Thu nhập
│   ├── Quản lý xe
│   ├── Đánh giá & xếp hạng
│   ├── Hồ sơ & giấy tờ tài xế
│   └── Hỗ trợ tài xế
│
└── ADMIN (shell A)
    ├── Đăng nhập admin
    ├── Dashboard tổng quan
    ├── Quản lý người dùng
    ├── Quản lý tài xế & duyệt hồ sơ KYC
    ├── Quản lý xe
    ├── Quản lý tuyến đường & giá
    ├── Quản lý chuyến / lịch trình
    ├── Quản lý đơn đặt chỗ
    ├── Ví đối tác & đối soát
    ├── Quản lý khuyến mãi
    ├── Quản lý đánh giá & khiếu nại
    ├── Quản lý thông báo (broadcast)
    ├── Nội dung / CMS
    ├── Cấu hình hệ thống
    ├── Nhật ký hoạt động (audit log)
    └── Báo cáo & thống kê
```

---

## 4. Thành phần design system cần BỔ SUNG

Các màn mới (đặc biệt admin/dashboard) cần một số component chưa tồn tại.
Tất cả **phải** dựng từ token `css/tokens.css` + card/button/form chuẩn (§3–§6),
thêm file CSS mới theo §1 khi không còn chỗ tái dùng.

| Component | File đề xuất | Dùng ở |
|-----------|--------------|--------|
| Sidebar admin | `css/admin.css` | toàn bộ shell A |
| Topbar app (user/driver) | `css/app-shell.css` | shell U, D |
| Bảng dữ liệu `.data-table` | `css/table.css` | mọi màn danh sách admin |
| Thẻ KPI `.stat-card` | `css/stats.css` | dashboard admin/tài xế |
| Bộ lọc `.filter-bar` | `css/filters.css` | danh sách có lọc |
| Tabs `.tabs` | `css/tabs.css` | chi tiết nhiều tab |
| Modal/drawer `.modal` | `css/modal.css` | xác nhận, chi tiết nhanh |
| Toast `.toast` | `css/toast.css` | phản hồi thao tác |
| Phân trang `.pagination` | `css/table.css` | danh sách dài |
| Trạng thái rỗng `.empty-state` | `css/states.css` | danh sách trống |
| Timeline trạng thái `.timeline` | `css/timeline.css` | theo dõi chuyến, audit |
| Badge trạng thái chuyến `.status-badge` | `base.css` (mở rộng) | mọi nơi có trạng thái |
| Thanh tiến trình `.progress` | `base.css` (mở rộng) | hồ sơ, giải ngân |
| Bản đồ (placeholder SVG/tile) | `css/map.css` | chọn điểm đón, giám sát & điều hành chuyến |
| Icon mới (sprite) | `components/sprite.html` | +`i-dashboard, i-ticket, i-list, i-chart, i-bell, i-logout, i-filter, i-search, i-edit, i-trash, i-report, i-settings, i-shield-check, i-wallet-out, i-refresh` |

**Icon hiện có** (§7): `i-pin, i-calendar, i-users, i-arrow-right,
i-arrow-up-right, i-swap, i-shield, i-headset, i-wallet, i-clock, i-check,
i-check-circle, i-chevron-down, i-menu, i-close, i-car, i-route, i-star,
i-phone, i-mail, i-map, i-facebook, i-instagram, i-youtube`.

---

## 5. Lộ trình triển khai (đề xuất theo phase)

**Phase 1 — MVP (P0):** luồng đặt chuyến khép kín của khách hàng
(không thanh toán trước — trả tiền mặt trực tiếp cho tài xế trên xe).
Đăng nhập/Đăng ký → Tìm chuyến → Kết quả → Chi tiết & chọn ghế →
Thành công → Chuyến của tôi → Chi tiết chuyến → Hủy → Đánh giá;
kèm Hồ sơ, Thông báo, shell U.

**Phase 2 — Tài xế + vận hành (P1):** trạng thái chờ duyệt, dashboard tài xế,
chuyến được phân công, điều hành chuyến, thu nhập; phía admin: dashboard,
quản lý người dùng, quản lý tài xế & duyệt KYC, quản lý chuyến, quản lý đơn đặt.

**Phase 3 — Hoàn thiện (P1/P2):** ví đối tác & đối soát,
khuyến mãi, đánh giá & khiếu nại, thông báo broadcast, CMS, cấu hình hệ thống,
audit log, báo cáo.

---

## 6. Bảng tổng hợp toàn bộ màn hình

| # | Màn | Shell | Mã thư mục | Ưu tiên | Nhóm |
|---|-----|-------|-----------|---------|------|
| 1 | Trang chủ | M | `home` ✅ | P0 | Công khai |
| 2 | Đăng nhập | auth | `dang-nhap` | P0 | Xác thực |
| 3 | Đăng ký | auth | `dang-ky` | P0 | Xác thực |
| 4 | Đăng nhập admin | auth | `admin-dang-nhap` | P1 | Xác thực |
| 5 | Tìm chuyến (dashboard khách) | U | `tim-chuyen` | P0 | Khách hàng |
| 6 | Kết quả tìm kiếm chuyến | U | `ket-qua-tim-chuyen` | P0 | Khách hàng |
| 7 | Chi tiết chuyến & chọn ghế | U | `chi-tiet-chuyen` | P0 | Khách hàng |
| 8 | Đặt chỗ thành công | U | `dat-cho-thanh-cong` | P0 | Khách hàng |
| 9 | Chuyến của tôi | U | `chuyen-cua-toi` | P0 | Khách hàng |
| 10 | Chi tiết chuyến đã đặt | U | `chuyen-da-dat` | P0 | Khách hàng |
| 11 | Hủy / đổi chuyến | U | `huy-doi-chuyen` | P0 | Khách hàng |
| 12 | Đánh giá chuyến đi | U | `danh-gia` | P0 | Khách hàng |
| 13 | Ưu đãi & mã giảm giá | U | `uu-dai` | P1 | Khách hàng |
| 14 | Hồ sơ cá nhân | U | `ho-so` | P0 | Khách hàng |
| 15 | Thông báo | U | `thong-bao` | P1 | Khách hàng |
| 16 | Trung tâm hỗ trợ / khiếu nại | U | `ho-tro-khach` | P1 | Khách hàng |
| 17 | Trạng thái chờ duyệt | D | `tai-xe-cho-duyet` | P1 | Tài xế |
| 18 | Tổng quan tài xế | D | `tai-xe-tong-quan` | P1 | Tài xế |
| 19 | Chuyến được phân công | D | `tai-xe-chuyen` | P1 | Tài xế |
| 20 | Quản lý tuyến & lịch chạy | D | `tai-xe-tuyen` | P1 | Tài xế |
| 21 | Điều hành chuyến đang chạy | D | `tai-xe-dieu-hanh` | P1 | Tài xế |
| 22 | Thu nhập | D | `tai-xe-thu-nhap` | P1 | Tài xế |
| 23 | Quản lý xe | D | `tai-xe-xe` | P2 | Tài xế |
| 24 | Đánh giá & xếp hạng (tài xế) | D | `tai-xe-danh-gia` | P2 | Tài xế |
| 25 | Hồ sơ & giấy tờ tài xế | D | `tai-xe-ho-so` | P1 | Tài xế |
| 26 | Hỗ trợ tài xế | D | `tai-xe-ho-tro` | P2 | Tài xế |
| 27 | Dashboard tổng quan | A | `admin-tong-quan` | P1 | Admin |
| 28 | Quản lý người dùng | A | `admin-nguoi-dung` | P1 | Admin |
| 29 | Quản lý tài xế & duyệt KYC | A | `admin-tai-xe` | P1 | Admin |
| 30 | Quản lý xe | A | `admin-xe` | P2 | Admin |
| 31 | Quản lý tuyến đường & giá | A | `admin-tuyen-duong` | P1 | Admin |
| 32 | Quản lý chuyến / lịch trình | A | `admin-chuyen` | P1 | Admin |
| 33 | Quản lý đơn đặt chỗ | A | `admin-don-dat` | P1 | Admin |
| 34 | Ví đối tác & đối soát | A | `admin-doi-soat` | P2 | Admin |
| 35 | Quản lý khuyến mãi | A | `admin-khuyen-mai` | P2 | Admin |
| 36 | Đánh giá & khiếu nại | A | `admin-khieu-nai` | P1 | Admin |
| 37 | Thông báo broadcast | A | `admin-thong-bao` | P2 | Admin |
| 38 | Nội dung / CMS | A | `admin-noi-dung` | P2 | Admin |
| 39 | Cấu hình hệ thống | A | `admin-cau-hinh` | P2 | Admin |
| 40 | Nhật ký hoạt động | A | `admin-nhat-ky` | P2 | Admin |
| 41 | Báo cáo & thống kê | A | `admin-bao-cao` | P1 | Admin |
| — | Trang lỗi 404/500 | shared | `loi` | P1 | Dùng chung |

**Tổng: 41 màn** (1 đã có, 40 cần design). Chi tiết từng màn ở các file 01–04.
