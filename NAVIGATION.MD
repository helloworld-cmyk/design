# NAVIGATION — Vi Vu Việt (luồng điều hướng)

> Ghi chú luồng navigation giữa **trang chủ khách hàng** (`index.html` ở gốc) và
> các **màn theo vai trò** trong `khach-hang/`, `tai-xe/`, `admin/` (dùng chung ở
> `shared/`). Mọi thay đổi phải đi qua `node build.js` (không sửa file build tay
> — xem `DESIGN_RULES.MD` §1).

## 1. Cấu trúc output theo nhóm vai trò

| Màn | Output (file build) | Manifest nguồn | `base` |
| --- | --- | --- | --- |
| Trang chủ khách hàng | `index.html` | `khach-hang/screens/home/screen.json` | `""` |
| Lỗi 404/500 (dùng chung) | `404.html` | `shared/screens/loi/screen.json` | `""` |
| Đăng nhập (khách) | `khach-hang/dang-nhap.html` | `khach-hang/screens/dang-nhap/screen.json` | `"../"` |
| Đăng ký (khách) | `khach-hang/dang-ky.html` | `khach-hang/screens/dang-ky/screen.json` | `"../"` |
| Hồ sơ cá nhân | `khach-hang/ho-so.html` | `khach-hang/screens/ho-so/screen.json` | `"../"` |

- Nhóm thư mục: `shared/` (dùng chung), `khach-hang/` (end user), `tai-xe/`
  (tài xế), `admin/` (quản trị). **Mỗi vai trò một bộ màn khác nhau.**
- `index.html` là màn **trang chủ của khách hàng** (nguồn `khach-hang/screens/home`)
  nhưng xuất ra gốc; trang lỗi dùng chung xuất `404.html` ở gốc.
- Màn ở **gốc** (`index.html`, `404.html`) dùng `base` = `""` → `shared/...`,
  `khach-hang/...`.
- Màn trong **nhóm** (vd `khach-hang/dang-nhap.html`, `khach-hang/ho-so.html`)
  dùng `{{base}}` = `../` để trỏ ra gốc (`../shared/...`, `../index.html`).
- Trang lỗi dùng chung 1 output: mặc định là 404; mở `404.html?code=500`
  để hiển thị trạng thái lỗi máy chủ (nút "Thử lại" reload trang).

### 1.1 Token header (`build.js` → `shared/components/header.html`)

`screen.json` khai báo 4 trường điều khiển header; giá trị có thể chứa `{{base}}`
(được build resolve trước, xem `.agents/plans` khi cần chi tiết):

| Token | Ý nghĩa | Home | Đăng nhập / Đăng ký | Lỗi 404/500 |
| --- | --- | --- | --- | --- |
| `home` | đích của brand | `#` | `../index.html` | `index.html` |
| `navPrefix` | tiền tố trước `#<id>` cho nav + CTA | `` (rỗng) | `../index.html` | `index.html` |
| `linkLoginHref` | đích `.link-login` | `khach-hang/dang-nhap.html` | `../index.html` | `khach-hang/dang-nhap.html` |
| `linkLoginLabel` | nhãn `.link-login` | `Đăng nhập` | `Trang chủ` | `Đăng nhập` |

- Trên màn auth khách, nav bar dùng lại **đúng** header trang chủ; các link
  section trỏ về `../index.html#<id>` để luôn quay lại được trang chủ.

## 2. Luồng điều hướng (sơ đồ)

```
                 index.html  (Trang chủ khách hàng)
                  header: "Đăng nhập"  ──────────┐
                                                  ▼
                          khach-hang/dang-nhap.html  (Đăng nhập)
                                                  │
                                   "Đăng ký ngay" │  ▲ "Đăng nhập"
                                                  ▼  │
                          khach-hang/dang-ky.html    (Đăng ký)
```

- Hai màn auth khách nằm cùng nhóm `khach-hang/` nên link qua lại là **tương đối
  cùng cấp** (`dang-nhap.html` ↔ `dang-ky.html`).
- Logo/brand trên màn auth trỏ về app: `../index.html`.

## 3. Bảng link (nguồn → đích)

| Nguồn | Vị trí | Đích |
| --- | --- | --- |
| `shared/components/header.html` | brand (logo + tên) | `{{home}}` |
| `shared/components/header.html` | `.main-nav` + `.mobile-nav` link | `{{navPrefix}}#<id>` |
| `shared/components/header.html` | `.header-cta` (desktop + mobile) | `{{navPrefix}}#dat-xe` |
| `shared/components/header.html` | `.link-login` (desktop + mobile) | `{{linkLoginHref}}` |
| `khach-hang/screens/dang-nhap/partials/form.html` | "Đăng ký ngay" | `dang-ky.html` |
| `khach-hang/screens/dang-ky/partials/form.html` | "Đăng nhập" | `dang-nhap.html` |

- **Header marketing dùng chung cho các màn khách** (home, đăng nhập, đăng ký,
  hồ sơ) và trang lỗi: `shared/components/header.html` được tham số hóa qua
  token build để mỗi màn trỏ đúng đích. Khu tài xế/admin sẽ có shell riêng
  (app-header/sidebar), không dùng header này.
- `khach-hang/components/auth-top.html` chỉ mở `<main class="auth">` +
  `.auth-wrap`; brand do header đảm nhiệm nên màn auth **không** lặp lại brand.

## 4. Link dự kiến (chưa tạo — placeholder trong form)

Các trang sau chưa tồn tại, khi thêm thì đặt **trong nhóm tương ứng**:

- `khach-hang/screens/dang-ky-tai-xe/` (Đăng ký làm tài xế) — hoặc trong
  `tai-xe/`; `khach-hang/screens/dat-lai-mat-khau/` (Quên mật khẩu, khách).
- `admin/screens/dang-nhap/` (Đăng nhập admin) — nhóm `admin/`.

## 5. Thêm màn mới vào một nhóm

1. Tạo `<nhóm>/screens/<ten>/screen.json`:
   ```json
   {
     "output": "<nhóm>/<ten>.html",
     "base": "../",
     "title": "...",
     "description": "...",
     "css": ["shared/css/tokens", "shared/css/base", "shared/css/header",
             "shared/css/cta-footer", "shared/css/motion",
             "shared/css/responsive-desktop", "shared/css/responsive-mobile"],
     "js": ["shared/js/header", "shared/js/reveal"],
     "partials": [
       "shared/components/head.html",
       "shared/components/sprite.html",
       "shared/components/header.html",
       "<nhóm>/screens/<ten>/partials/<...>.html",
       "shared/components/footer.html"
     ]
   }
   ```
2. Chạy `node build.js` → file sinh vào `<nhóm>/`.
3. Thêm link tới màn mới ở `shared/components/header.html` (hoặc partial liên
   quan) với tiền tố `{{base}}<nhóm>/` nếu nguồn ở nhóm khác.