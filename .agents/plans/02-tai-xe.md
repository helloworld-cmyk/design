# 02 — MÀN HÌNH TÀI XẾ (ĐỐI TÁC)

> Vai trò: **Tài xế** — đối tác cung cấp xe và vận hành các chuyến ghép.
> Shell: **D (Driver app)**.
> Trang chủ đã có khối "Dành cho tài xế" (`driver-cta`, `.income-card`) — khu
> tài xế là phiên bản đầy đủ, có thể tái dùng chính `.driver-panel` / `.income-card`.

---

### D1. Trạng thái chờ duyệt — `screens/tai-xe-cho-duyet/`
- **Tác dụng:** cho tài xế biết hồ sơ đang ở đâu và cần bổ sung gì.
- **Nhiệm vụ chính:** xem timeline duyệt (Đã nhận → Đang thẩm định → Duyệt/Từ
  chối); nếu từ chối → xem lý do và nút sửa/bổ sung; bấm "Liên hệ hỗ trợ".
- **Thành phần:** `.timeline`, `.intro-note` (lý do từ chối), tài liệu đã gửi
  (list), `.btn` (Cập nhật hồ sơ / Liên hệ), `.support-card`.
- **Trạng thái:** waiting, need-info (yêu cầu bổ sung), approved → chuyển sang
  dashboard, rejected.
- **Ưu tiên:** P1.

### D2. Tổng quan tài xế (dashboard) — `screens/tai-xe-tong-quan/`
- **Tác dụng:** "buồng lái" hằng ngày — tài xế nắm ngay tiền, chuyến, đánh giá.
- **Nhiệm vụ chính:**
  - Thẻ KPI: thu nhập hôm nay/tuần/tháng, số chuyến, số khách, xếp hạng sao.
  - Biểu đồ thu nhập 7 ngày (tái dùng `.chart`/`.bar` trong `.income-card`).
  - Chuyến kế tiếp với nút "Bắt đầu" / "Xem chi tiết".
  - Nút bật/tắt trạng thái **Online/Offline** (nhận chuyến hay không).
  - Nhắc nhở: hồ sơ sắp hết hạn.
- **Thành phần:** `.stat-card`, `.income-card` + `.chart`, `.ride-card`,
  toggle Online (mới), `.badge`.
- **Trạng thái:** offline, đang chờ chuyến, có chuyến mới.
- **Ưu tiên:** P1.

### D3. Chuyến được phân công — `screens/tai-xe-chuyen/`
- **Tác dụng:** nơi tài xế nhận/từ chối và quản lý các chuyến.
- **Nhiệm vụ chính:**
  - Tab: Chuyến mới (yêu cầu) · Sắp chạy · Đang chạy · Đã xong · Đã hủy.
  - Với chuyến mới: xem tuyến, giờ, số khách, thu nhập dự kiến → Nhận/Từ chối.
  - Xem danh sách khách trên chuyến (tên, SĐT, điểm đón).
  - Vào màn **Điều hành chuyến** khi bắt đầu.
- **Thành phần:** `.tabs`, `.ride-card` (biến thể tài xế), `.badge` (mới /
  đang chạy), `.empty-state`, nút Nhận/Từ chối, đếm ngược thời gian thực.
- **Trạng thái:** hết chuyến (empty), chuyến bị thu hồi, quá hạn nhận.
- **Ưu tiên:** P1.

### D4. Quản lý tuyến & lịch chạy — `screens/tai-xe-tuyen/`
- **Tác dụng:** tài xế chủ động đăng lịch chạy trên các tuyến để được ghép khách.
- **Nhiệm vụ chính:**
  - Tạo/sửa/hủy lịch chạy: tuyến, ngày giờ, loại xe, số ghế mở bán, giá/ghế.
  - Xem mức độ lấp ghế (bao nhiêu ghế đã bán / tổng).
  - Đặt mẫu lịch lặp lại (hằng ngày, theo tuần).
- **Thành phần:** `.data-table` (lịch đã đăng), form tạo lịch (`.booking-form`),
  `.progress` (tỉ lệ lấp ghế), `.modal` (sửa/hủy), `.badge`.
- **Trạng thái:** chưa có lịch (empty), trùng lịch, đã khóa (chuyến đã có khách).
- **Ưu tiên:** P1.

### D5. Điều hành chuyến đang chạy — `screens/tai-xe-dieu-hanh/`
- **Tác dụng:** công cụ "chạy chuyến" theo thời gian thực cho tài xế.
- **Nhiệm vụ chính:**
  - Danh sách khách + điểm đón theo thứ tự tối ưu; nút điều hướng (mở bản đồ).
  - Cập nhật trạng thái: Đã đến điểm đón → Đã đón → Đến điểm trả → Hoàn thành.
  - Điểm danh khách (check-in), gọi/nhắn khách.
  - Cập nhật chia sẻ vị trí; báo sự cố (kẹt xe, hỏng xe).
  - Xác nhận thu tiền mặt (nếu khách trả tiền mặt).
- **Thành phần:** `.timeline` dọc, bản đồ (`.map`), checklist khách, `.btn`
  (trạng thái lớn), `.modal` (báo sự cố).
- **Trạng thái:** chưa tới điểm, khách không có mặt (no-show), sự cố.
- **Ưu tiên:** P1.

### D6. Thu nhập — `screens/tai-xe-thu-nhap/`
- **Tác dụng:** minh bạch thu nhập tài xế kiếm được theo thời gian.
- **Nhiệm vụ chính:**
  - Xem tổng thu nhập, thu nhập hôm nay/tuần/tháng.
  - Biểu đồ thu nhập theo thời gian (tái dùng `.income-card` + `.chart`).
  - Lịch sử thu nhập theo chuyến: giá chuyến, hoa hồng trừ lại, thưởng, phụ phí.
- **Thành phần:** `.stat-card`, `.data-table` (thu nhập theo chuyến),
  `.income-card` (tóm tắt), `.badge`.
- **Trạng thái:** empty (chưa có chuyến hoàn thành), loading.
- **Ưu tiên:** P1.

### D7. Quản lý xe — `screens/tai-xe-xe/`
- **Tác dụng:** quản lý (các) xe tài xế đưa vào khai thác.
- **Nhiệm vụ chính:** thêm/sửa xe (loại, số chỗ, biển số, ảnh, đăng kiểm/bảo
  hiểm hạn dùng); đặt xe mặc định; xem cảnh báo giấy tờ sắp hết hạn.
- **Thành phần:** `.fleet-card` (đang có), form `.field`, `.badge` (sắp hết hạn /
  đã duyệt), `.modal`, upload ảnh giấy tờ.
- **Trạng thái:** chưa có xe, xe chờ duyệt, giấy tờ hết hạn.
- **Ưu tiên:** P2.

### D8. Đánh giá & xếp hạng (tài xế) — `screens/tai-xe-danh-gia/`
- **Tác dụng:** giúp tài xế thấy phản hồi khách để giữ chất lượng & hạng.
- **Nhiệm vụ chính:**
  - Xem điểm sao trung bình, phân bố theo tiêu chí, xu hướng theo thời gian.
  - Đọc nhận xét khách (đã ẩn thông tin cá nhân), phản hồi (tuỳ chính sách).
  - Xem hạng thành viên tài xế & quyền lợi đi kèm.
- **Thành phần:** `.stat-card` (sao, hạng), `.testimonial-card` (nhận xét),
  biểu đồ xu hướng, `.badge` (hạng ưu tú).
- **Trạng thái:** chưa có đánh giá (empty), loading.
- **Ưu tiên:** P2.

### D9. Hồ sơ & giấy tờ tài xế — `screens/tai-xe-ho-so/`
- **Tác dụng:** quản lý hồ sơ đối tác và tình trạng giấy tờ pháp lý.
- **Nhiệm vụ chính:**
  - Xem/cập nhật thông tin cá nhân, ngân hàng, thông tin xe.
  - Xem trạng thái từng giấy tờ (hợp lệ / sắp hết hạn / cần gia hạn) + tải lại.
  - Cài đặt thông báo, đổi mật khẩu.
- **Thành phần:** `.tabs`, `.field`, danh sách giấy tờ + `.badge` hạn dùng,
  upload.
- **Trạng thái:** lưu thành công, giấy tờ hết hạn (cảnh báo đỏ), chờ duyệt lại.
- **Ưu tiên:** P1.

### D10. Hỗ trợ tài xế — `screens/tai-xe-ho-tro/`
- **Tác dụng:** kênh hỗ trợ riêng cho đối tác (sự cố chuyến, thanh toán, pháp lý).
- **Nhiệm vụ chính:** xem FAQ tài xế, gửi ticket gắn chuyến, chat với hỗ trợ,
  tra cứu chính sách hoa hồng/phạt.
- **Thành phần:** `.faq`, form ticket, `.timeline` trạng thái, khung chat,
  `.support-card`.
- **Trạng thái:** empty, đang xử lý, đã giải quyết.
- **Ưu tiên:** P2.

---

## Luồng chính của tài xế

```
Chờ duyệt hồ sơ → (được duyệt) Tổng quan → Bật Online
→ Nhận chuyến / Đăng lịch tuyến → Điều hành chuyến → Hoàn thành
→ Thu nhập → Đánh giá
```

> Khu tài xế nên **tái dùng tối đa** khối nền tối `.driver-panel` và
> `.income-card` (đã thiết kế ở trang chủ) để giữ nhận diện "không lạc loài".
