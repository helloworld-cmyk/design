# NAVIGATION — Vi Vu Việt (luồng điều hướng)

> Ghi chú luồng navigation theo phạm vi tinh gọn (xem `.agents/plans/flow.md`).
> **Mỗi đối tượng là một web riêng**: khách hàng (`khach-hang/`), tài xế
> (`tai-xe/`), admin (`admin/`), dùng chung design system + trang lỗi ở
> `shared/`. Không có file `.html` build nào ở gốc. Mọi thay đổi phải đi qua
> `node build.js` (không sửa file build tay — xem `DESIGN_RULES.MD` §1).

## 1. Cấu trúc output — web khách hàng (8 màn)

| # | Màn | Output (file build) | Manifest nguồn |
| --- | --- | --- | --- |
| B1 | Trang chủ | `khach-hang/index.html` | `khach-hang/screens/home/screen.json` |
| B2 | Đăng nhập | `khach-hang/dang-nhap.html` | `khach-hang/screens/dang-nhap/screen.json` |
| B3 | Đăng ký | `khach-hang/dang-ky.html` | `khach-hang/screens/dang-ky/screen.json` |
| B4 | Kết quả tìm chuyến | `khach-hang/ket-qua-tim-chuyen.html` | `khach-hang/screens/ket-qua-tim-chuyen/screen.json` |
| B5 | Chi tiết chuyến & chọn ghế | `khach-hang/chi-tiet-chuyen.html` | `khach-hang/screens/chi-tiet-chuyen/screen.json` |
| B6 | Đặt vé thành công (vé điện tử) | `khach-hang/dat-cho-thanh-cong.html` | `khach-hang/screens/dat-cho-thanh-cong/screen.json` |
| B7 | Chuyến của tôi (+ modal hủy vé) | `khach-hang/chuyen-cua-toi.html` | `khach-hang/screens/chuyen-cua-toi/screen.json` |
| B8 | Hồ sơ cá nhân | `khach-hang/ho-so.html` | `khach-hang/screens/ho-so/screen.json` |

- Lỗi 404/500 dùng chung: `shared/404.html` (nguồn `shared/screens/loi`).
- Mọi output nằm trong nhóm → `base` = `"../"`. Footer của web khách là
  `khach-hang/components/footer.html` (cột "Sản phẩm" dùng `{{navPrefix}}#…`
  nên hoạt động trên mọi màn); social/công ty/cookie là placeholder `#`.
- Ngoại phạm vi hiện tại (không có màn, không link tới): theo dõi chuyến,
  hủy/đổi trang riêng, đánh giá, ví/khuyến mãi, hỗ trợ/ticket, quên mật khẩu.

## 2. Token header (`build.js` → `shared/components/header.html`)

| Token | Home B1 | Màn khách còn lại (B2–B8) | Lỗi 404/500 |
| --- | --- | --- | --- |
| `home` (đích brand) | `#` | `index.html` | `{{base}}khach-hang/index.html` |
| `navPrefix` | `` (rỗng) | `index.html` | `{{base}}khach-hang/index.html` |
| `linkLoginHref` | `dang-nhap.html` | `index.html` | `{{base}}khach-hang/dang-nhap.html` |
| `linkLoginLabel` | `Đăng nhập` | `Trang chủ` | `Đăng nhập` |
| `profileHref` | `ho-so.html` | `ho-so.html` | `{{base}}khach-hang/ho-so.html` |

- Header có user-menu: khi có phiên (`vvv.auth.user` trong localStorage) hiển
  thị avatar + dropdown (Xem hồ sơ → `{{profileHref}}`, Đăng xuất —
  `shared/js/header.js` xử lý); chưa đăng nhập hiện `.link-login`.

## 3. Luồng điều hướng khách hàng

```
B1 Trang chủ ── Tìm ──────────────► B4 Kết quả tìm chuyến
   │  └─ Đăng nhập (header) ──► B2 Đăng nhập ⇄ B3 Đăng ký
   │                                │ (submit → về B8 Hồ sơ;
   │                                │  ?next=quay lại màn đặt vé)
   ▼
B4 ── Chọn chuyến ──► B5 Chi tiết chuyến (chọn ghế + điểm đón)
                         │  ├─ chưa đăng nhập → B2 (?next=chi-tiet-chuyen.html)
                         │  └─ Xác nhận đặt vé → tự chuyển ▼
                         ▼
                       B6 Đặt vé thành công ── Xem vé ──► B7 Chuyến của tôi
                                                              │  ├─ Xem vé → B6
                                                              │  ├─ Hủy vé (modal) → ở lại B7, thẻ chuyển Đã hủy
                                                              │  └─ Đặt lại → B1#dat-xe
                                                              ▼
                                                            B8 Hồ sơ ── Chuyến của tôi → B7
                                                                       └─ Đăng xuất → xóa phiên → B1
```

- Back-link chuẩn: B5 → B4 ("Kết quả tìm chuyến"), B6/B7 không có back
  (thay bằng CTA chính), mọi màn khác về B1 qua brand.
- B4 có "Sửa tìm kiếm" → `index.html#dat-xe`.

## 4. Bảng link (nguồn → đích)

| Nguồn | Vị trí | Đích |
| --- | --- | --- |
| `shared/components/header.html` | brand / nav / CTA / login | bảng token §2 |
| `khach-hang/screens/home/js/booking.js` | submit form tìm chuyến | `ket-qua-tim-chuyen.html` |
| `khach-hang/screens/home/partials/routes.html` | click thẻ tuyến | prefill form B1 (ở lại trang) |
| `khach-hang/screens/dang-nhap/partials/form.html` | submit + "Đăng ký ngay" | `ho-so.html` · `dang-ky.html` |
| `khach-hang/screens/dang-ky/partials/form.html` | submit + "Đăng nhập" | `ho-so.html` · `dang-nhap.html` |
| `khach-hang/js/auth.js` | hỗ trợ `?next=<màn>.html` | quay lại màn đặt vé sau đăng nhập |
| `khach-hang/screens/ket-qua-tim-chuyen/partials/*` | "Chọn chuyến" / "Sửa tìm kiếm" | `chi-tiet-chuyen.html` · `index.html#dat-xe` |
| `khach-hang/screens/chi-tiet-chuyen/js/booking-detail.js` | chưa đăng nhập / đặt vé xong | `dang-nhap.html?next=…` · `dat-cho-thanh-cong.html` |
| `khach-hang/screens/chi-tiet-chuyen/partials/passenger.html` | "điều khoản đặt chỗ" | `index.html#faq` |
| `khach-hang/screens/dat-cho-thanh-cong/partials/guide.html` | "Xem Chuyến của tôi" / "Quản lý vé đã đặt" | `chuyen-cua-toi.html` |
| `khach-hang/screens/chuyen-cua-toi/partials/trips-*.html` | Xem vé / Hủy vé / Đặt lại | `dat-cho-thanh-cong.html` · modal B7 · `index.html#dat-xe` |
| `khach-hang/screens/chuyen-cua-toi/{partials/cancel-modal.html, js/cancel.js}` | modal hủy vé | xác nhận → thẻ chuyển "Đã hủy" (ở lại B7) |
| `khach-hang/screens/ho-so/partials/settings.html` | "Chuyến của tôi" / "Đăng xuất" | `chuyen-cua-toi.html` · `index.html` + `data-user-logout` |
| `khach-hang/components/footer.html` | cột Sản phẩm | `{{navPrefix}}#dat-xe · #doi-xe · #tuyen-duong · #vi-sao` |

- Logout (header + B8): `data-user-logout` — `shared/js/header.js` xóa
  `vvv.auth.user` rồi chuyển về đích của `.brand` (B1).

## 5. Thêm màn mới vào web khách hàng

1. Tạo `khach-hang/screens/<ten>/screen.json` (mẫu đầy đủ trong
   `DESIGN_RULES.MD` §11): khai báo `output` (không `.html` ở gốc),
   `base: "../"`, title/description, `css[]`, `js[]`, `partials[]`
   (head + sprite + header + partial màn + `khach-hang/components/footer.html`).
2. Chạy `node build.js` → file sinh vào `khach-hang/`.
3. Thêm link tới màn mới ở partial liên quan (header dùng token, footer nhóm
   dùng `{{navPrefix}}`), cập nhật bảng §4 và sơ đồ §3 của file này.
