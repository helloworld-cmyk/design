# 03 — MÀN HÌNH QUẢN TRỊ VIÊN (ADMIN / BACK-OFFICE)

> Vai trò: **Quản trị viên / nhân sự vận hành**. Shell: **A (Admin)** — sidebar
> trái cố định 2 cấp + topbar. Đây là khu vực **dày dữ liệu**: cần bổ sung
> `.data-table`, `.stat-card`, `.filter-bar`, `.modal`, `.tabs`, `.pagination`,
> `.empty-state` (xem `00-tong-quan.md` §4) — tất cả dựng từ token hiện có.

**Nhóm nghiệp vụ admin:**
1. Tổng quan & báo cáo
2. Người dùng & đối tác (tài xế, xe) + duyệt KYC
3. Vận hành (tuyến, chuyến, đơn đặt)
4. Tài chính (ví đối tác, đối soát)
5. Tăng trưởng (khuyến mãi, thông báo, CMS)
6. Chất lượng (đánh giá, khiếu nại)
7. Hệ thống (cấu hình, audit log)

---

## 1. TỔNG QUAN & BÁO CÁO

### AD1. Dashboard tổng quan — `screens/admin-tong-quan/`
- **Tác dụng:** màn "điều khiển" — nắm sức khoẻ nền tảng trong một màn hình.
- **Nhiệm vụ chính:** xem KPI (chuyến hôm nay, doanh thu, khách mới, tài xế
  online, tỉ lệ lấp ghế, tỉ lệ hủy); biểu đồ doanh thu/chuyến theo thời gian;
  bảng top tuyến, top tài xế; hàng chờ cần xử lý (hồ sơ chờ duyệt, khiếu nại
  mới, bồi thường chờ); cảnh báo bất thường.
- **Thành phần:** `.stat-card` ×N, biểu đồ (mở rộng `.chart`), `.data-table`,
  `.badge` mức ưu tiên, `.timeline` (hoạt động gần đây).
- **Trạng thái:** loading dashboard, "chưa có dữ liệu hôm nay", error.
- **Ưu tiên:** P1.

### AD2. Báo cáo & thống kê — `screens/admin-bao-cao/`
- **Tác dụng:** phân tích chuyên sâu để ra quyết định & xuất dữ liệu.
- **Nhiệm vụ chính:** chọn khoảng thời gian; xem báo cáo doanh thu, hành vi đặt
  chỗ, hiệu quả tuyến/tài xế, hủy & bồi thường; so sánh kỳ; xuất CSV/Excel; lưu
  báo cáo yêu thích.
- **Thành phần:** `.filter-bar` (ngày/chiều), biểu đồ đa dạng, `.data-table`
  có cột số, nút xuất, `.tabs` theo loại báo cáo.
- **Trạng thái:** không có dữ liệu kỳ, đang tổng hợp, lỗi xuất.
- **Ưu tiên:** P1.

---

## 2. NGƯỜI DÙNG & ĐỐI TÁC

### AD3. Quản lý người dùng — `screens/admin-nguoi-dung/`
- **Tác dụng:** tra cứu & quản trị tài khoản khách hàng.
- **Nhiệm vụ chính:** tìm/lọc (tên, SĐT, email, trạng thái, hạng); xem chi tiết
  hồ sơ, lịch sử chuyến, giao dịch, đánh giá; khoá/mở khoá, đặt lại mật khẩu,
  ghi chú nội bộ, gộp trùng, gửi thông báo; hành động hàng loạt.
- **Thành phần:** `.filter-bar`, `.data-table` (sort, chọn dòng), drawer/modal
  chi tiết (`.tabs` Hồ sơ/Chuyến/Giao dịch), `.badge` trạng thái, `.pagination`.
- **Trạng thái:** empty theo lọc, loading, không có quyền xoá.
- **Ưu tiên:** P1.

### AD4. Quản lý tài xế & duyệt hồ sơ (KYC) — `screens/admin-tai-xe/`
- **Tác dụng:** then chốt an toàn — thẩm định đối tác và quản lý chất lượng.
- **Nhiệm vụ chính:** hàng chờ duyệt hồ sơ; xem đầy đủ giấy tờ/ảnh/xe; đối chiếu
  thông tin; **Duyệt / Yêu cầu bổ sung / Từ chối (kèm lý do)**; xem lịch sử duyệt;
  quản lý trạng thái (đang hoạt động / tạm ngưng / khoá); xem xếp hạng & vi
  phạm; gán hạng đối tác.
- **Thành phần:** `.data-table` hồ sơ, màn thẩm định 2 cột (giấy tờ trái +
  form quyết định phải), `.badge` (chờ/duyệt/từ chối), `.timeline` lịch sử,
  `.intro-note` lý do, `.modal` xác nhận.
- **Trạng thái:** hết hồ sơ chờ (empty), giấy tờ mờ/không hợp lệ, chờ bổ sung.
- **Ưu tiên:** P1.

### AD5. Quản lý xe — `screens/admin-xe/`
- **Tác dụng:** quản lý danh mục phương tiện gắn với tài xế.
- **Nhiệm vụ chính:** xem/lọc xe theo tài xế, loại, số chỗ, trạng thái; duyệt
  xe mới; cảnh báo đăng kiểm/bảo hiểm hết hạn; tạm ngưng xe vi phạm.
- **Thành phần:** `.filter-bar`, `.data-table`, `.badge` hạn dùng, `.modal`.
- **Trạng thái:** empty, xe chờ duyệt, giấy tờ hết hạn.
- **Ưu tiên:** P2.

---

## 3. VẬN HÀNH

### AD6. Quản lý tuyến đường & giá — `screens/admin-tuyen-duong/`
- **Tác dụng:** quản lý "sản phẩm" cốt lõi: tuyến và khung giá.
- **Nhiệm vụ chính:** CRUD tuyến (điểm đi/đến, vùng miền, khoảng cách, thời
  lượng); cấu hình giá cơ bản, giá theo khung giờ/ngày lễ; bật/tắt tuyến;
  gán tuyến nổi bật; xem thống kê hiệu quả tuyến.
- **Thành phần:** `.data-table` tuyến, form thêm/sửa (`.field`), `.modal`,
  bảng giá động, `.badge` (đang chạy/tạm dừng), `.pagination`.
- **Trạng thái:** trùng tuyến, giá không hợp lệ, xác nhận xoá.
- **Ưu tiên:** P1.

### AD7. Quản lý chuyến / lịch trình — `screens/admin-chuyen/`
- **Tác dụng:** giám sát mọi chuyến chạy trong hệ thống theo thời gian thực.
- **Nhiệm vụ chính:** xem/lọc chuyến (theo ngày, tuyến, tài xế, trạng thái);
  theo dõi chuyến đang chạy trên bản đồ; can thiệp: gán/đổi tài xế, huỷ chuyến,
  xử lý sự cố; xem khách trên chuyến & tỉ lệ lấp ghế.
- **Thành phần:** bảng chuyến `.data-table`, bản đồ giám sát (`.map`), `.badge`
  trạng thái chuyến, `.modal` can thiệp, `.timeline`.
- **Trạng thái:** không có chuyến, chuyến trễ, tài xế mất kết nối.
- **Ưu tiên:** P1.

### AD8. Quản lý đơn đặt chỗ — `screens/admin-don-dat/`
- **Tác dụng:** tra soát mọi đơn đặt của khách, xử lý ngoại lệ.
- **Nhiệm vụ chính:** xem/lọc đơn (mã, khách, tuyến, trạng thái, thu tiền);
  chi tiết đơn (khách, ghế, lịch sử trạng thái); hỗ trợ huỷ/đổi thay khách;
  xác nhận thu tiền mặt trên xe; gắn ghi chú.
- **Thành phần:** `.filter-bar`, `.data-table` đơn, drawer chi tiết (`.tabs`),
  `.timeline`, `.badge`, `.modal` xử lý.
- **Trạng thái:** empty, đơn chưa thu tiền, tranh chấp.
- **Ưu tiên:** P1.

---

## 4. TÀI CHÍNH

### AD9. Ví đối tác & đối soát — `screens/admin-doi-soat/`
- **Tác dụng:** đảm bảo tài xế được trả đúng & sổ sách khớp.
- **Nhiệm vụ chính:** xem công nợ ví từng tài xế (khả dụng/chờ đối soát); duyệt
  lệnh rút tiền; chạy đối soát kỳ (doanh thu − hoa hồng − thưởng = phải trả);
  xử lý chênh lệch; xem lịch sử payout.
- **Thành phần:** `.stat-card`, `.data-table` (tài xế × số dư), `.modal` duyệt
  chi, `.timeline` lệnh rút, báo cáo đối soát, `.badge`.
- **Trạng thái:** lệnh rút chờ duyệt, chênh lệch đối soát (cảnh báo đỏ).
- **Ưu tiên:** P2.

---

## 5. TĂNG TRƯỞNG

### AD10. Quản lý khuyến mãi — `screens/admin-khuyen-mai/`
- **Tác dụng:** tạo và điều khiển các chiến dịch giảm giá/thưởng.
- **Nhiệm vụ chính:** CRUD mã giảm giá (loại: %, số tiền, tặng điểm; điều kiện
  tuyến/giá/khách mới; thời gian; giới hạn lượt); chiến dịch; banner ưu đãi;
  theo dõi hiệu quả (lượt dùng, doanh thu mang lại, ROI); bật/tắt.
- **Thành phần:** `.data-table` mã/chiến dịch, form cấu hình (`.field`),
  `.modal`, `.stat-card` hiệu quả, `.badge` (đang chạy/sắp hết/hết hạn).
- **Trạng thái:** trùng mã, hết hạn, xác nhận tắt chiến dịch.
- **Ưu tiên:** P2.

### AD11. Quản lý thông báo (broadcast) — `screens/admin-thong-bao/`
- **Tác dụng:** gửi thông báo hàng loạt tới nhóm người dùng.
- **Nhiệm vụ chính:** soạn thông báo (tiêu đề, nội dung, deep-link); chọn đối
  tượng (tất cả, khách, tài xế, theo tuyến/segment); chọn kênh (push/email/SMS);
  lên lịch hoặc gửi ngay; xem preview; theo dõi tỉ lệ gửi/đọc.
- **Thành phần:** form soạn (`.field`), bộ chọn segment (`.filter-bar`),
  `.modal` xác nhận gửi, `.data-table` lịch sử & thống kê, `.badge` trạng thái.
- **Trạng thái:** nháp, đã lên lịch, đang gửi, gửi lỗi một phần.
- **Ưu tiên:** P2.

### AD12. Nội dung / CMS — `screens/admin-noi-dung/`
- **Tác dụng:** quản lý nội dung hiển thị trên web/app (không cần code).
- **Nhiệm vụ chính:** CRUD banner/trang tĩnh/bài viết/hỏi đáp; quản lý tuyến
  nổi bật & testimonial; sắp xếp thứ tự hiển thị; lên lịch đăng; preview.
- **Thành phần:** `.data-table` nội dung, editor (`.field` + vùng soạn),
  `.tabs` theo loại, `.modal`, trạng thái `.badge` (nháp/xuất bản).
- **Trạng thái:** nháp, đã xuất bản, lên lịch, xác nhận xoá.
- **Ưu tiên:** P2.

---

## 6. CHẤT LƯỢNG

### AD13. Quản lý đánh giá & khiếu nại — `screens/admin-khieu-nai/`
- **Tác dụng:** bảo vệ chất lượng dịch vụ & xử lý tranh chấp khách–tài xế.
- **Nhiệm vụ chính:** xem/lọc đánh giá, khiếu nại, ticket; mở hồ sơ vụ việc
  (chuyến, khách, tài xế, bằng chứng/ảnh); chat/hồi đáp; ra quyết định (nhắc
  nhở, cảnh cáo, phạt, bồi thường, tạm ngưng tài xế); đóng vụ & lưu kết quả.
- **Thành phần:** `.data-table` vụ việc, màn xử lý (2–3 cột: ngữ cảnh / hội
  thoại / quyết định), `.timeline`, `.badge` mức độ, `.modal` xác nhận hình phạt.
- **Trạng thái:** mới, đang xử lý, chờ khách, đã giải quyết, khiếu nại leo thang.
- **Ưu tiên:** P1.

---

## 7. HỆ THỐNG

### AD14. Cấu hình hệ thống — `screens/admin-cau-hinh/`
- **Tác dụng:** điều chỉnh tham số vận hành toàn nền tảng.
- **Nhiệm vụ chính:** cấu hình hoa hồng, phí hủy, thời gian miễn phí hủy;
  cấu hình giá/khuyến mãi mặc định; mẫu thông báo; tham số ghép chuyến;
  bảo trì & phiên bản.
- **Thành phần:** `.tabs` theo nhóm cấu hình, form `.field` có validate,
  toggle bật/tắt, `.form-status`, `.modal` xác nhận thay đổi quan trọng.
- **Trạng thái:** lưu thành công, cảnh báo thay đổi ảnh hưởng lớn, lỗi validate.
- **Ưu tiên:** P2.

### AD15. Nhật ký hoạt động (audit log) — `screens/admin-nhat-ky/`
- **Tác dụng:** truy vết ai đã làm gì, khi nào — phục vụ an ninh & tuân thủ.
- **Nhiệm vụ chính:** xem/lọc log (actor, hành động, đối tượng, thời gian, IP);
  xem chi tiết trước/sau thay đổi; xuất log; lọc theo module/mức độ.
- **Thành phần:** `.filter-bar`, `.data-table` log, drawer chi tiết diff,
  `.timeline`, nút xuất, `.pagination`.
- **Trạng thái:** empty theo lọc, log rất dài (phân trang server-side).
- **Ưu tiên:** P2.

---

## Luồng vận hành điển hình của admin

```
Đăng nhập → Dashboard (xem hàng chờ)
→ Duyệt hồ sơ tài xế (AD4) → Giám sát chuyến (AD7)
→ Xử lý khiếu nại (AD13) → Duyệt rút ví đối tác (AD9)
→ Báo cáo cuối kỳ (AD2)
```

> **Nguyên tắc an toàn dữ liệu cho admin:** mọi hành động phá huỷ (xoá, khoá,
> phạt, bồi thường) đều qua `.modal` xác nhận + ghi audit log.
