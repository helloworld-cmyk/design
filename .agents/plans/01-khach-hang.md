# 01 — MÀN HÌNH KHÁCH HÀNG (NGƯỜI DÙNG THƯỜNG)

> Vai trò: **Khách hàng** — người đặt xe ghép liên tỉnh.
> Shell: **U (User app)** cho khu vực đã đăng nhập; **M (Marketing)** cho trang công khai.
> Mọi màn tuân thủ `DESIGN_RULES.MD`; form dùng `.booking-form` / `.field`;
> card dùng card chuẩn §6.3; CTA `.btn` + biến thể; trạng thái dùng badge chuẩn.

---

## A. TRANG CÔNG KHAI (khách chưa đăng nhập — shell M)

### A1. Danh sách tuyến đường — `screens/tuyen-duong/`
- **Tác dụng:** cổng SEO & khám phá; giúp khách thấy toàn bộ mạng lưới tuyến
  (hơn 120 tuyến) trước khi đặt, tăng độ tin cậy và thời gian ở site.
- **Nhiệm vụ chính:**
  - Lọc theo vùng miền (Bắc/Trung/Nam), sắp xếp theo giá / thời gian / phổ biến.
  - Xem mỗi tuyến: điểm đi–đến, thời lượng, số chuyến/ngày, giá từ.
  - Click tuyến → sang màn **Kết quả tìm kiếm** đã điền sẵn.
  - Hiển thị "Tuyến của tôi gần đây" nếu có dữ liệu cục bộ.
- **Thành phần:** `.section-head`, `.filter-bar` (mới), `.routes-grid` +
  `.route-card`, `.pagination` (mới), `.cta-final`.
- **Trạng thái:** loading skeleton, empty (không có tuyến theo lọc), error.
- **Ưu tiên:** P1.

### A2. Chi tiết tuyến — `screens/tuyen-duong-chi-tiet/`
- **Tác dụng:** trang chi tiết một tuyến (VD Hà Nội → Hải Phòng): mô tả hành
  trình, điểm đón/trả phổ biến, giá, đánh giá — giúp khách quyết định đặt.
- **Nhiệm vụ chính:**
  - Xem các khung giờ có chuyến trong 7 ngày tới.
  - Xem điểm đón, điểm trả, thời gian dự kiến, loại xe.
  - Đọc FAQ riêng tuyến + đánh giá của khách đã đi.
  - Nút "Đặt tuyến này" → **Kết quả tìm kiếm**.
- **Thành phần:** hero tuyến (`.hero` rút gọn), `.route-card`, `.fleet-card`,
  `.testimonial-card`, `.faq` (accordion có sẵn), `.step` (cách đặt).
- **Trạng thái:** loading, empty (tuyến tạm ngưng), error.
- **Ưu tiên:** P1.

### A3. Về chúng tôi — `screens/ve-chung-toi/`
- **Tác dụng:** kể câu chuyện thương hiệu, cam kết an toàn, số liệu vận hành —
  tăng niềm tin.
- **Nhiệm vụ chính:** đọc giới thiệu, xem đội ngũ/quy trình xác thực tài xế,
  chính sách an toàn, liên hệ.
- **Thành phần:** `.hero`, `.trust-strip`, `.feature-card`, `.driver-panel`
  (khối số liệu tối), `.support-card`.
- **Trạng thái:** tĩnh.
- **Ưu tiên:** P2.

### A4. Trung tâm hỗ trợ & FAQ — `screens/ho-tro/`
- **Tác dụng:** tự phục vụ (self-service) — giảm tải tổng đài.
- **Nhiệm vụ chính:** tìm kiếm câu hỏi, duyệt theo nhóm chủ đề (Đặt chỗ, Thanh
  toán, Hủy/đổi, An toàn, Tài xế), gửi yêu cầu hỗ trợ nếu không tìm thấy.
- **Thành phần:** ô tìm kiếm (`i-search`), `.faq` accordion theo nhóm,
  `.support-card`, form liên hệ (`.booking-form` rút gọn) + `.form-status`.
- **Trạng thái:** empty (không có kết quả tìm), success (đã gửi).
- **Ưu tiên:** P1.

### A5. Điều khoản & Chính sách bảo mật — `screens/chinh-sach/`
- **Tác dụng:** công bố pháp lý: điều khoản sử dụng, chính sách hủy/hoàn tiền,
  bảo mật dữ liệu.
- **Nhiệm vụ chính:** đọc nội dung; mục lục điều hướng nội trang (anchor).
- **Thành phần:** bố cục 2 cột (mục lục trái + nội dung phải,
  `.intro-note` cho điểm nhấn), `.section-head`.
- **Trạng thái:** tĩnh.
- **Ưu tiên:** P2.

---

## B. KHU KHÁCH HÀNG ĐÃ ĐĂNG NHẬP (shell U)

### B1. Tìm chuyến (dashboard khách) — `screens/tim-chuyen/`
- **Tác dụng:** điểm vào chính sau khi đăng nhập — tìm và đặt chuyến nhanh.
- **Nhiệm vụ chính:**
  - Form tìm: điểm đi, điểm đến, ngày, số ghế (tái dùng `.booking-form`).
  - Lối tắt: tuyến gần đây, tuyến phổ biến, "đi ngay hôm nay".
  - Xem chuyến sắp tới của tôi (widget nhỏ) + nhắc nhở.
- **Thành phần:** `.booking-form`, `.route-card` (lối tắt), `.ride-card`
  (chuyến sắp tới), `.stat-card` (số chuyến, điểm thưởng).
- **Trạng thái:** empty (chưa từng đặt), loading.
- **Ưu tiên:** P0.

### B2. Kết quả tìm kiếm chuyến — `screens/ket-qua-tim-chuyen/`
- **Tác dụng:** liệt kê các chuyến khớp với tìm kiếm để khách chọn.
- **Nhiệm vụ chính:**
  - Xem danh sách chuyến: giờ đi/đến, tài xế + xếp hạng, loại xe, ghế còn,
    giá/ghế.
  - Sắp xếp (giờ/giá/xếp hạng) và lọc (giờ, loại xe, tiện ích, điểm đón).
  - Chọn chuyến → **Chi tiết chuyến & chọn ghế**.
- **Thành phần:** thanh tóm tắt tìm kiếm (sticky), `.filter-bar`, `.ride-card`
  (biến thể danh sách), `.badge` (còn ghế), `.pagination`, `.empty-state`.
- **Trạng thái:** empty ("không có chuyến phù hợp + gợi ý"), loading skeleton,
  error.
- **Ưu tiên:** P0.

### B3. Chi tiết chuyến & chọn ghế — `screens/chi-tiet-chuyen/`
- **Tác dụng:** xem đầy đủ một chuyến và chọn ghế/điểm đón trước khi trả tiền.
- **Nhiệm vụ chính:**
  - Xem hành trình, mốc thời gian, tài xế (ảnh, xếp hạng, số chuyến, xe).
  - Sơ đồ ghế (chọn ghế trống), chọn điểm đón/trả (gợi ý gần đây + bản đồ).
  - Chọn số ghế, thêm ghi chú, áp mã giảm giá.
  - Xem tổng tiền tạm tính (giá ghế × số ghế − giảm giá).
  - Nút "Tiếp tục thanh toán".
- **Thành phần:** panel trắng (`.booking-form` / panel chuẩn), sơ đồ ghế (mới,
  `css/seat-map.css`), bản đồ placeholder (`css/map.css`), `.ride-card`,
  `.badge`, `.float-chip`.
- **Trạng thái:** ghế đã bị đặt (disable), điểm đón không hợp lệ, loading giá.
- **Ưu tiên:** P0.

### B4. Thanh toán & xác nhận đặt chỗ — `screens/thanh-toan/`
- **Tác dụng:** chốt đơn — xác nhận thông tin, chọn phương thức trả tiền, trả.
- **Nhiệm vụ chính:**
  - Tóm tắt chuyến + giá (bảng breakdown: giá ghế, phí, giảm giá, tổng).
  - Điền thông tin hành khách/người đi cùng, SĐT nhận vé.
  - Chọn phương thức: thẻ, chuyển khoản, tiền mặt khi lên xe.
  - Áp mã giảm giá / dùng điểm thưởng.
  - Đồng ý điều khoản + xác nhận; xử lý thanh toán (loading → thành công/lỗi).
- **Thành phần:** `.stepper` (chọn ghế → thanh toán → xong), panel tóm tắt
  sticky, `.field` cho từng phương thức (radio card), `.btn.is-loading`,
  `.form-status`, `.modal` (xác nhận).
- **Trạng thái:** đang xử lý, thanh toán lỗi (retry), mã giảm giá không hợp lệ,
  hết ghế (race) → thông báo.
- **Ưu tiên:** P0.

### B5. Đặt chỗ thành công — `screens/dat-cho-thanh-cong/`
- **Tác dụng:** xác nhận thành công + cung cấp vé & hướng dẫn tiếp theo.
- **Nhiệm vụ chính:** xem mã đặt chỗ, thông tin chuyến, QR/điểm danh, tài xế,
  hướng dẫn điểm đón; tải/thêm vé vào lịch; chia sẻ chuyến; đi tới "Chuyến của tôi".
- **Thành phần:** khối thành công (icon `i-check-circle` lớn), vé số (card),
  `.btn` (Xem chuyến, Thêm vào lịch), `.support-card`.
- **Trạng thái:** success; biến thể "chờ thanh toán" nếu chưa trả xong.
- **Ưu tiên:** P0.

### B6. Chuyến của tôi — `screens/chuyen-cua-toi/`
- **Tác dụng:** trung tâm quản lý mọi đơn đặt chỗ của khách theo trạng thái.
- **Nhiệm vụ chính:**
  - Tab: Sắp tới · Đang đi · Đã hoàn thành · Đã hủy.
  - Mỗi đơn: tuyến, giờ, tài xế, trạng thái (`status-badge`), giá.
  - Thao tác nhanh: theo dõi, hủy/đổi, đánh giá, xem vé, đặt lại.
- **Thành phần:** `.tabs`, danh sách `.ride-card`, `.status-badge`,
  `.empty-state` (chưa có chuyến), `.filter-bar` (theo thời gian).
- **Trạng thái:** empty từng tab, loading, error.
- **Ưu tiên:** P0.

### B7. Chi tiết chuyến đã đặt — `screens/chuyen-da-dat/`
- **Tác dụng:** xem toàn bộ thông tin một đơn — trước, trong và sau chuyến.
- **Nhiệm vụ chính:**
  - Xem vé, mã, tài xế (gọi/nhắn), điểm đón, giờ.
  - Theo dõi trạng thái qua `.timeline`: Đã đặt → Đã xác nhận → Tài xế đang đến
    → Đang di chuyển → Hoàn thành.
  - Hủy/đổi, liên hệ hỗ trợ, xem hoá đơn, đánh giá (nếu đã xong).
  - Nút vào **Theo dõi realtime** khi chuyến đang chạy.
- **Thành phần:** `.timeline`, `.ride-card`, `.badge` trạng thái, khối hoá đơn,
  `.btn` hành động, `.modal` xác nhận hủy.
- **Trạng thái:** từng mốc trạng thái; chuyến bị hủy bởi tài xế (thông báo).
- **Ưu tiên:** P0.

### B8. Theo dõi chuyến realtime — `screens/theo-doi-chuyen/`
- **Tác dụng:** theo dõi vị trí xe & ETA khi chuyến đang chạy — giảm lo lắng.
- **Nhiệm vụ chính:**
  - Bản đồ vị trí xe hiện tại + điểm đón/đến, ETA cập nhật.
  - Thông tin tài xế & xe (biển số, màu), nút gọi/nhắn.
  - Trạng thái: tài xế đang đến / đã đón / sắp tới điểm trả.
  - Chia sẻ hành trình cho người thân; nút SOS/hỗ trợ khẩn.
- **Thành phần:** `.map` (placeholder), `.float-chip` (ETA), `.ride-card`
  (tài xế), `.timeline` (trạng thái), nút SOS (`.btn` + `i-shield`).
- **Trạng thái:** mất tín hiệu GPS, chuyến chưa bắt đầu, đã kết thúc.
- **Ưu tiên:** P1.

### B9. Hủy / đổi chuyến — `screens/huy-doi-chuyen/`
- **Tác dụng:** cho khách hủy hoặc đổi lịch với điều kiện & phí minh bạch.
- **Nhiệm vụ chính:**
  - Chọn hủy: xem phí hủy theo thời điểm (miễn phí trước 2h), chọn lý do,
    xác nhận; hiển thị số tiền hoàn.
  - Chọn đổi: chọn chuyến mới cùng tuyến, so sánh chênh lệch giá, xác nhận.
- **Thành phần:** 2 lựa chọn dạng tab/card, `.intro-note` (chính sách),
  bảng phí, `.modal` xác nhận, `.form-status`, `.btn`.
- **Trạng thái:** không thể hủy (quá muộn) → chỉ đổi/hỗ trợ; thành công/hoàn tiền.
- **Ưu tiên:** P0.

### B10. Đánh giá chuyến đi — `screens/danh-gia/`
- **Tác dụng:** thu phản hồi sau chuyến để cải thiện & xếp hạng tài xế.
- **Nhiệm vụ chính:**
  - Chấm sao tổng + các tiêu chí (tài xế, xe, đúng giờ, thái độ).
  - Chọn nhãn nhanh (tag) + viết nhận xét, đính kèm ảnh (tuỳ chọn).
  - Tip cho tài xế (tuỳ chọn); gửi đánh giá.
- **Thành phần:** `.testimonial-card` biến thể nhập liệu, sao tương tác
  (`i-star`), `.field` cho nhận xét, `.btn`, `.form-status`.
- **Trạng thái:** bắt buộc chấm sao mới gửi; gửi thành công; đã đánh giá (đọc lại).
- **Ưu tiên:** P0.

### B11. Ưu đãi & mã giảm giá — `screens/uu-dai/`
- **Tác dụng:** khu khuyến mãi — tăng tần suất đặt & giữ chân khách.
- **Nhiệm vụ chính:**
  - Xem voucher khả dụng (điều kiện, hạn dùng), điểm thưởng, hạng thành viên.
  - Sao chép/áp mã; xem ưu đãi sắp hết hạn; xem lịch sử đã dùng.
- **Thành phần:** `.feature-card` (voucher), `.badge` (sắp hết hạn / hạng),
  `.tabs` (khả dụng / đã dùng), `.stat-card` (điểm, hạng).
- **Trạng thái:** empty (không có ưu đãi), hết hạn.
- **Ưu tiên:** P1.

### B12. Hồ sơ cá nhân — `screens/ho-so/`
- **Tác dụng:** quản lý thông tin tài khoản & cài đặt cá nhân.
- **Nhiệm vụ chính:**
  - Sửa tên, ảnh đại diện, SĐT, email, ngày sinh, giới tính.
  - Danh bạ người đi cùng thường xuyên; điểm đón/trả yêu thích.
  - Đổi mật khẩu, quản lý thiết bị đăng nhập.
  - Tuỳ chọn thông báo (push/email/SMS); xoá tài khoản.
- **Thành phần:** `.tabs` (Thông tin / Bảo mật / Thông báo), `.field`,
  avatar (`.avatar--photo`), nút switch (mới `css/toggle.css`), `.modal`.
- **Trạng thái:** lưu thành công, xác thực SĐT/email, lỗi validate.
- **Ưu tiên:** P0.

### B13. Thông báo — `screens/thong-bao/`
- **Tác dụng:** hộp thư hệ thống: trạng thái chuyến, thanh toán, khuyến mãi.
- **Nhiệm vụ chính:**
  - Danh sách thông báo (đọc/chưa đọc), lọc theo loại, đánh dấu đã đọc.
  - Click → điều hướng tới chuyến/ưu đãi liên quan.
  - Cài đặt nhận thông báo.
- **Thành phần:** danh sách item + chấm chưa đọc, `.tabs`, `.empty-state`,
  `.filter-bar`; badge số trên topbar (`i-bell`).
- **Trạng thái:** empty, đã đọc hết, loading.
- **Ưu tiên:** P1.

### B14. Trung tâm hỗ trợ / khiếu nại (khách) — `screens/ho-tro-khach/`
- **Tác dụng:** gửi & theo dõi yêu cầu hỗ trợ/khiếu nại gắn với chuyến.
- **Nhiệm vụ chính:**
  - Tạo yêu cầu: chọn chuyến liên quan, loại vấn đề, mô tả, đính kèm ảnh.
  - Theo dõi trạng thái ticket (mới → đang xử lý → đã giải quyết) qua timeline.
  - Trò chuyện với hỗ trợ; xem kết quả xử lý (hoàn tiền/bồi thường).
- **Thành phần:** form tạo ticket, `.tabs` (đang mở / đã xong), `.timeline`,
  khung chat đơn giản (mới), `.badge` trạng thái.
- **Trạng thái:** empty (chưa có ticket), đang xử lý, đã đóng.
- **Ưu tiên:** P1.

---

## C. Luồng chính của khách hàng (happy path) — để kiểm tra tính liền mạch

```
Đăng nhập → Tìm chuyến → Kết quả tìm kiếm → Chi tiết & chọn ghế
→ Thanh toán → Đặt chỗ thành công → Chuyến của tôi
→ (trong ngày đi) Theo dõi realtime → Hoàn thành → Đánh giá
```

Luồng phụ: Hủy/đổi chuyến, Ưu đãi, Hỗ trợ/khiếu nại,
Thông báo, Hồ sơ.

> Mọi màn danh sách cần thiết kế đủ **4 trạng thái**: rỗng, đang tải, lỗi,
> có dữ liệu — dùng `.empty-state` và skeleton thống nhất.
