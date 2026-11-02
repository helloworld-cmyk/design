# Brainstorm — Điều phối tài nguyên · Phối hợp Admin–Tài xế · Xử lý sự cố

> Nguồn: 3 nhận xét đánh giá hiện trạng (mục 2, 3, 4) — 02/11/2026.
> Ràng buộc: phạm vi chốt **22 màn + trang lỗi**; UI tĩnh (mock data, không
> backend/GPS/chat/push); mọi file nguồn ≤ 300 dòng, ≤ 100 ký tự/dòng; tái dùng
> design system hiện có (`.data-table`, `.filter-bar`, `.tabs`, `.modal`,
> `.timeline`, `.status-badge`, `.badge`, `.stat-card`, `.empty-state`).
> Quy ước trong file này:
> - **[GỮ PHẠM VI]** — giữ trong phạm vi hiện tại (không thêm màn);
> - **[CẦN DUYỆT]** — vượt phạm vi 22 màn, chỉ làm khi người dùng đồng ý.

---

## Vấn đề 2 — Admin chưa có công cụ điều phối tài nguyên trực quan (Ưu tiên cao)

### 2.1 Hiện trạng

- Admin tạo chuyến và gán xe/tài xế **chỉ qua form** trong A2; hệ thống chỉ
  **chặn trùng lịch sau khi nhập**, không cho **thấy trước** ai/xe nào rảnh.
- Không có nơi nào tổng hợp "ai đang chạy gì, lúc nào" — phải dò từng chuyến
  trong bảng để tự suy ra khoảng trống.
- Số tài nguyên nhỏ (vài tài xế, vài xe) nhưng vẫn dễ gán nhầm khi xếp nhiều
  chuyến cùng khung giờ.

### 2.2 Mục tiêu

Trước khi lưu form, admin phải **nhìn thấy** được: tài xế/xe nào rảnh trong
khoảng giờ dự kiến, đang bận chuyến nào, và chọn được tài nguyên mà không phải
thử–sai qua validate.

### 2.3 Phương án

#### PA2.1 — Chế độ xem "Lịch điều phối" trong A2 [GỮ PHẠM VI] ⭐ khuyến nghị

- Toolbar A2 thêm bộ chuyển chế độ: **Bảng | Lịch** (tái dùng `.tabs`/
  segmented).
- Chế độ Lịch = **bảng tài nguyên × khung giờ** của 1 ngày:
  - Chọn **ngày** (prev/next + input date) và **chế độ hàng**: "Theo tài xế"
    hoặc "Theo xe".
  - Mỗi hàng = 1 tài xế/xe (kèm `.badge` trạng thái: Rảnh · Đang chạy · Bảo
    trì · Bị khóa; hàng không khả dụng hiển thị mờ, không click).
  - Cột = khung giờ (05:00–23:00, mỗi cột 1–2 giờ).
  - **Block chuyến** đặt theo giờ khởi hành, độ rộng theo thời lượng tuyến;
    hiển thị mã + tuyến + `.status-badge`; click block → mở **drawer chi tiết
    chuyến có sẵn**.
  - Click ô trống → mở **modal tạo chuyến hiện có**, prefill: ngày + giờ (từ
    cột) + tài xế/xe (từ hàng) + tuyến đang lọc. → "điều phối trực quan" nối
    thẳng vào luồng tạo chuyến, không thêm bước nào.
  - Legend màu trạng thái + `.empty-state` khi ngày không có chuyến.
- Dữ liệu: render từ **cùng nguồn mock** với bảng (thêm 1 file js dữ liệu dùng
  chung trong `admin-chuyen/js/`); tách `lich-grid.css/js` riêng để giữ ≤ 300
  dòng/file. Không sửa `shared/`.

#### PA2.2 — Dải "tình trạng rảnh" trong modal tạo/sửa chuyến [GỮ PHẠM VI] ⭐ khuyến nghị

- Sau khi chọn **ngày + giờ khởi hành** trong form, phần chọn **xe** và
  **tài xế** hiển thị kèm **mini timeline 24h** cho từng lựa chọn:
  - Khối màu = khoảng bận (chuyến khác); ô còn lại = rảnh.
  - Lựa chọn trùng lịch → **disable + lý do** ("Trùng VC-1042 07:30–09:30").
  - Toggle "Chỉ hiện tài nguyên rảnh" để rút gọn danh sách.
- Giải quyết đúng **điểm đau lúc xếp chuyến**, kể cả khi admin vào trực tiếp
  form mà không qua lịch.
- Tái dùng cùng dữ liệu mock với PA2.1 (một lần dựng, hai nơi dùng).

#### PA2.3 — Dải "tài nguyên hôm nay" ở A1 Tổng quan [GỮ PHẠM VI]

- Thêm 1 hàng `.stat-card`/dải nhỏ: "Tài xế rảnh · Xe rảnh · Trùng lịch tiềm
  ẩn hôm nay" + link sang A2 (chế độ Lịch).
- Giá trị bổ sung thấp hơn 2 phương án trên — làm **sau**, khi PA2.1 đã ổn.

#### PA2.4 — Màn mới "Điều phối" (A9) [CẦN DUYỆT]

- Màn riêng cho lịch tài nguyên: chuyển ngày/tuần, hai chế độ tài xế/xe,
  kéo–thả chuyến sang tài nguyên khác.
- **Không khuyến nghị ở bước này**: trùng chức năng PA2.1 (nếu PA2.1 nằm trong
  A2), vượt phạm vi 22 màn, và kéo–thả tốn công lớn với UI tĩnh. Chỉ cân nhắc
  nếu sau này A2 quá tải và người dùng duyệt thêm màn.

### 2.4 So sánh

| Tiêu chí | PA2.1 | PA2.2 | PA2.3 | PA2.4 |
|---|---|---|---|---|
| Nhìn tổng thể tài nguyên | ★★★ | ★ (theo lựa chọn) | ★★ | ★★★ |
| Đúng lúc đang xếp chuyến | ★★ | ★★★ | ★ | ★★ |
| Công sức (UI tĩnh) | Trung bình | Thấp–TB | Thấp | Cao |
| Rủi ro phạm vi | Không | Không | Không | Cần duyệt + thêm màn |

### 2.5 Khuyến nghị

**PA2.1 + PA2.2** (cùng nguồn dữ liệu, gọn code): lịch tổng thể nằm ngay A2,
dải rảnh nằm ngay trong form. PA2.3 tùy chọn; PA2.4 để dành.

---

## Vấn đề 3 — Trạng thái phối hợp Admin–Tài xế chưa đủ chi tiết (Ưu tiên cao)

### 3.1 Hiện trạng

- Chuyến chỉ có 4 trạng thái lớn: `Sắp tới → Đang thực hiện → Hoàn thành`
  (+`Đã hủy`); giữa "đã phân công" và "đang chạy" là **hộp đen**.
- Admin không biết tài xế **đã nhận được lệnh chưa**, **đã chuẩn bị chưa**,
  **đã đến điểm đón chưa**, và **chuyến có trễ không** — chỉ thấy Im lặng cho
  tới khi tài xế bấm "Bắt đầu chuyến".
- Model hiện tại (02-tai-xe) cố ý bỏ "nút Nhận chuyến" kiểu marketplace; thêm
  tín hiệu từ tài xế phải **khác** với cơ chế đó (xác nhận lệnh đã được phân
  công, không phải xin nhận chuyến).

### 3.2 Mục tiêu

- Tách lớp **trạng thái phân công (lệnh)** khỏi **trạng thái chuyến**: chuyến
  giữ nguyên 4 trạng thái lớn; lớp lệnh mô tả tài xế đã phản ứng tới đâu.
- Cờ **trễ** tính tự động từ thời gian + trạng thái, **không cần ai bấm**.

### 3.3 Phương án

#### PA3.1 — Chuỗi trạng thái lệnh đầy đủ (4 bước tài xế) [GỮ PHẠM VI]

```
Đã gửi lệnh → Đã nhận lệnh → Đã chuẩn bị → Đã có mặt
              (D3, bất kỳ lúc nào) (trong ngày chạy) (tại điểm xuất bến)
→ [Bắt đầu chuyến] → Đang thực hiện → Hoàn thành
```

- Tài xế bấm 3 nút: **"Tôi đã nhận lệnh"** (D3, hiện ngay sau khi admin phân
  công), **"Đã chuẩn bị"** (D3/D5, chỉ trong ngày chạy), **"Đã có mặt tại
  bến"** (D3, sau đó mới hiện nút Bắt đầu → vào D4).
- Ưu điểm: đủ 4 tín hiệu mà đánh giá yêu cầu, timeline drawer A2 đẹp.
- Nhược điểm: tài xế bấm nhiều lần → dễ lược bỏ bước giữa.

#### PA3.2 — Chuỗi rút gọn 2 bước + suy ra "chuẩn bị" [GỮ PHẠM VI] ⭐ khuyến nghị

- Tài xế chỉ bấm **2 nút**: **"Xác nhận nhận lệnh"** (D3) và **"Đã có mặt tại
  bến"** (D3, trong ngày chạy, là điều kiện hiện nút Bắt đầu).
- **"Đã chuẩn bị"** = trạng thái trung gian **tự suy**: đã nhận lệnh + trong
  ngày chạy + chưa có mặt → hiển thị "Đang chuẩn bị (trong ngày)". Admin vẫn
  phân biệt được 4 mức mà tài xế chỉ bấm 2 lần.
- Ít ma sát nhất cho tài xế, vẫn đủ thông tin cho admin.

#### PA3.3 — Cờ trễ tự tính (bắt buộc, đi kèm 3.1/3.2) [GỮ PHẠM VI]

- **Trễ khởi hành**: `now > giờ khởi hành` mà chuyến chưa `Đang thực hiện` →
  badge đỏ `Trễ 15'` cạnh trạng thái (UI tĩnh: tính từ mock "giờ hiện tại").
- **Trễ hành trình**: `Đang thực hiện` vượt `giờ khởi hành + thời lượng tuyến`
  mà chưa `Hoàn thành` → badge `Quá hành trình +20'`.
- **Cảnh báo im lặng**: `Sắp tới` + chưa nhận lệnh + còn ≤ 12h → chip vàng
  `Chưa xác nhận` (ngưỡng là hằng số code, đúng tinh thần quy tắc §4.11).

#### PA3.4 — Nới lỏng: chỉ thêm cờ trễ, không thêm thao tác tài xế [GỮ PHẠM VI]

- Không có "đã nhận lệnh/có mặt"; trễ vẫn hiển thị.
- Bị loại nếu muốn trả lời đủ nhận xét 3 — chỉ giữ làm phương án tối thiểu
  nếu người dùng không muốn đổi phía tài xế.

### 3.4 Mặt hiển thị & đồng bộ (áp dụng cho PA3.1/3.2)

- **A2 bảng**: cột Tài xế thêm chip phụ `Chưa nhận · Đã nhận · Có mặt`;
  cột trạng thái thêm badge `Trễ 15'`. **A2 drawer**: `.timeline` bổ sung các
  mốc lệnh (nhận lúc 08:12, có mặt lúc 07:05…) + khối cảnh báo trễ.
- **A1**: KPI "chuyến chưa xác nhận lệnh"; dòng chuyến hôm nay kèm chip + cờ
  trễ; link nhanh sang A2.
- **D1 (tài xế)**: ride-card thêm nút "Xác nhận nhận chuyến"; **D3**: nút xác
  nhận/có mặt, hiển thị trạng thái lệnh hiện tại; **D4**: header cho thấy các
  bước đã qua. Điều hướng và quyền không đổi — tài xế vẫn không sửa/hủy chuyến.
- **Model/DB (cho báo cáo CNPM)**: tách bảng/đối tượng `phan_cong` (chuyến,
  tài xế, xe, trạng thái lệnh, thời điểm nhận, thời điểm có mặt) hoặc thêm
  cột trên `chuyen`; cờ trễ là **trường suy ra**, không lưu.

### 3.5 So sánh

| Tiêu chí | PA3.1 | PA3.2 | PA3.3 (kèm) | PA3.4 |
|---|---|---|---|---|
| Đủ 4 tín hiệu đánh giá | ★★★ | ★★★ (1 mức suy ra) | — | ★ |
| Số thao tác tài xế | 3 | 2 | 0 | 0 |
| Công sức | Trung bình | Trung bình | Thấp | Thấp |
| Rủi ro tài xế lười bấm | Cao hơn | Thấp | — | Không có dữ liệu |

### 3.6 Khuyến nghị

**PA3.2 + PA3.3**: 2 nút phía tài xế + các mốc/cờ tự tính phía hệ thống; giữ
nguyên 4 trạng thái chuyến để không phá model chung (quy tắc §4 của 03-admin,
§5 của 02-tai-xe chỉ cần bổ sung, không thay đổi).

---

## Vấn đề 4 — Xử lý sự cố chưa có quy trình hoàn chỉnh (Cần cải thiện)

### 4.1 Hiện trạng

- Tài xế báo: loại + ghi chú + thời điểm → **cờ sự cố** trên chuyến.
- Drawer A2 có 4 nút rời: Tiếp tục chạy / Thay xe / Đổi tài xế / Kết thúc
  sớm — bấm là xong, **không ghi nhận**: ai xử lý, biện pháp gì, kết quả ra
  sao, lúc nào đóng.
- Không có trạng thái trung gian → admin không biết sự cố **đang được xử lý**
  hay **bị bỏ quên**; A1 chỉ liệt kê "sự cố đang mở" mà không có tuổi đời
  (đã treo bao lâu).

### 4.2 Mục tiêu

Sự cố có **vòng đời đầy đủ** `Mở → Đang xử lý → Đã xử lý` với bằng chứng ở
mỗi bước, admin kiểm soát được: đang ai xử, xử đến đâu, kết quả gì.

### 4.3 Phương án

#### PA4.1 — Modal "Xử lý sự cố" 2 bước + nhật ký [GỮ PHẠM VI] ⭐ khuyến nghị

- Thay 4 nút rời bằng khối sự cố có **2 hành động**:
  1. **"Bắt đầu xử lý"** → modal: chọn **người xử lý** (mặc định admin hiện
     tại), **biện pháp dự kiến** (Tiếp tục · Thay xe · Đổi tài xế · Kết thúc
     sớm · Khác), ghi chú; trạng thái chuyển `Đang xử lý`.
  2. **"Ghi nhận kết quả"** → modal: xác nhận biện pháp thực tế (chọn lại được),
     **ghi chú kết quả bắt buộc**, thời điểm đóng; nếu biện pháp là Thay xe /
     Đổi tài xế → **mở luôn flow đổi tài nguyên có sẵn** ở A2 rồi mới cho đóng;
     nếu Kết thúc sớm → modal xác nhận riêng (vé chưa trả xử lý ngoại lệ kèm
     ghi chú, đúng quy tắc §4.6).
- Nút "Tiếp tục chạy" chỉ là 1 kết quả của bước 2 (biện pháp = Tiếp tục),
  không còn là lối tắt không dấu vết.

#### PA4.2 — Nhật ký sự cố dạng timeline trong drawer [GỮ PHẠM VI] ⭐ khuyến nghị

- Khối cảnh báo mở rộng thành **mini-log** (dùng `.timeline`):
  `Báo lúc 07:58 (Trần Văn Bình, Hỏng xe) → Nhận xử lý 08:05 (Admin) →
  Thay xe 30A-456.78 — kết quả: khách lên xe thay lúc 08:40 → Đóng 08:41`.
- Mỗi sự cố một entry; sự cố đã đóng thu thành dòng tóm tắt, bấm để mở log.
- Dữ liệu mẫu: mảng sự cố per chuyến (nhiều sự cố/chuyến được phép).

#### PA4.3 — Hàng đợi sự cố ở A1 có "tuổi đời" [GỮ PHẠM VI]

- Mục "Sự cố đang mở" ở A1 nâng thành bảng nhỏ: mã chuyến, loại, tài xế,
  **thời gian trôi** (`12 phút trước` — từ mock now), trạng thái
  (Mở/Đang xử lý), nút "Xử lý tại A2".
- Định hướng: sự cố `Mở` quá ngưỡng (vd 15 phút) → chip đỏ "Chưa nhận xử lý".
- Giúp admin **phát hiện sự cố bị bỏ quên** — mảnh ghép còn thiếu của 4.1.

#### PA4.4 — Mức độ + phân loại nghiêm trọng [GỮ PHẠM VI, tùy chọn]

- Tài xế chọn thêm **mức độ** (Nhẹ / Nghiêm trọng) khi báo; sắp thứ tự hàng
  đợi A1 theo mức độ + tuổi đời.
- Chi phí thấp nhưng tăng nhiễu cho tài xế — chỉ làm nếu người dùng muốn.

#### PA4.5 — Trang theo dõi sự cố riêng [CẦN DUYỆT]

- Màn riêng danh sách + chi tiết toàn bộ sự cố (kể cả đã đóng), lọc theo
  trạng thái/kỳ. Vượt phạm vi 22 màn — không khuyến nghị; A1 + A2 đã phủ đủ
  với quy mô dự án.

### 4.4 So sánh

| Tiêu chí | PA4.1 | PA4.2 | PA4.3 | PA4.4 | PA4.5 |
|---|---|---|---|---|---|
| Ghi nhận kết quả đầy đủ | ★★★ | ★★ (hiển thị) | ★ | ★ | ★★★ |
| Chống bỏ quên sự cố | ★★ | ★★ | ★★★ | ★★ | ★★★ |
| Công sức | TB | Thấp | Thấp | Rất thấp | Cao |
| Rủi ro phạm vi | Không | Không | Không | Không | Cần duyệt |

### 4.5 Khuyến nghị

**PA4.1 + PA4.2 + PA4.3**: quy trình 2 bước có bằng chứng, log timeline trong
drawer, hàng đợi A1 có tuổi đời. PA4.4 tùy chọn; PA4.5 để dành.

---

## Ảnh hưởng kỹ thuật chung (UI tĩnh)

- **Vị trí code**: tất cả nằm trong `admin/screens/admin-chuyen/` (css/js/
  partials riêng màn) và `tai-xe/screens/tai-xe-tong-quan|chi-tiet-chuyen/`;
  không đụng `shared/`, không đụng màn nhóm khác → an toàn với session song
  song. File mới đều ≤ 300 dòng (tách nhỏ: `lich-grid.css`, `lich-grid.js`,
  `su-co.css`…).
- **Nguồn dữ liệu mock**: gom về 1 file js dùng chung trong `admin-chuyen/js/`
  cho bảng + lịch + drawer + sự cố để các chế độ luôn khớp nhau.
- **Tài liệu phải cập nhật sau khi chốt**: `03-admin.md` (A2, A1, §4 trạng
  thái), `02-tai-xe.md` (D1/D3, nguyên tắc "không nút nhận chuyến" → đổi thành
  "chỉ xác nhận lệnh đã phân công"), `NAVIGATION.MD` nếu thêm bước mới.
- **Không có**: GPS/chỉ đường, chat, push notification, auto-hủy khi trễ
  (trễ chỉ là cờ hiển thị; quyết định vẫn thuộc admin — đúng triết lý hiện
  tại "admin quyết định, tài xế thực hiện").

## Bảng tóm tắt khuyến nghị

| Vấn đề | Chọn | Vì sao |
|---|---|---|
| 2 — Điều phối tài nguyên | PA2.1 + PA2.2 (trong A2) | Nhìn tổng thể + đúng lúc xếp chuyến, không thêm màn |
| 3 — Trạng thái phối hợp | PA3.2 + PA3.3 | Đủ 4 tín hiệu, tài xế chỉ bấm 2 lần, giữ model chuyến |
| 4 — Quy trình sự cố | PA4.1 + PA4.2 + PA4.3 | Vòng đời Mở→Đang xử lý→Đã xử lý + chống bỏ quên |

## Câu hỏi mở cần người dùng chốt trước khi lên kế hoạch chi tiết

1. Chấp nhận **thêm chế độ xem "Lịch" trong A2** (không phải màn mới)?
2. Chấp nhận cho tài xế **2 nút xác nhận** (Nhận lệnh ở D3, Có mặt tại bến
   trước khi Bắt đầu) — tức sửa nguyên tắc hiện tại của 02-tai-xe?
3. "Đã chuẩn bị" để **tự suy** (khuyến nghị) hay cần tài xế bấm riêng?
4. Sự cố: có cần **mức độ** (PA4.4) và cho phép **nhiều sự cố/chuyến** không?
5. Có giữ phương án **A9 Điều phối riêng / trang sự cố riêng** cho tương lai
   hay loại hẳn khỏi phạm vi?
