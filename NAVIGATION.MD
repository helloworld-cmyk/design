# NAVIGATION — Vi Vu Việt (luồng điều hướng)

> Ghi chú luồng navigation giữa **app chính** (`index.html` ở gốc) và các
> **màn phụ** trong thư mục `html-screen/`. Mọi thay đổi phải đi qua
> `node build.js` (không sửa file build tay — xem `DESIGN_RULES.MD` §1).

## 1. Cấu trúc output

| Màn | Output (file build) | Manifest nguồn | `base` |
| --- | --- | --- | --- |
| Trang chủ (app) | `index.html` | `screens/home/screen.json` | `""` |
| Đăng nhập | `html-screen/dang-nhap.html` | `screens/dang-nhap/screen.json` | `"../"` |
| Đăng ký | `html-screen/dang-ky.html` | `screens/dang-ky/screen.json` | `"../"` |
| Lỗi 404/500 | `404.html` | `screens/error/screen.json` | `""` |

- File ở gốc (`index.html`, `404.html`, `assets/`, `css/`, `js/`) dùng path gốc.
- Trang lỗi dùng chung 1 output: mặc định là 404; mở `404.html?code=500`
  để hiển thị trạng thái lỗi máy chủ (nút "Thử lại" reload trang).
- Màn trong `html-screen/` dùng tiền tố `{{base}}` = `../` để trỏ ra gốc
  (`../css/...`, `../js/...`, `../assets/...`, `../index.html`).

### 1.1 Token header (`build.js` → `components/header.html`)

`screen.json` khai báo 4 trường điều khiển header; giá trị có thể chứa `{{base}}`
(được build resolve trước, xem `.agents/plans` khi cần chi tiết):

| Token | Ý nghĩa | Home | Đăng nhập / Đăng ký | Lỗi 404/500 |
| --- | --- | --- | --- | --- |
| `home` | đích của brand | `#` | `../index.html` | `index.html` |
| `navPrefix` | tiền tố trước `#<id>` cho nav + CTA | `` (rỗng) | `../index.html` | `index.html` |
| `linkLoginHref` | đích `.link-login` | `html-screen/dang-nhap.html` | `../index.html` | `html-screen/dang-nhap.html` |
| `linkLoginLabel` | nhãn `.link-login` | `Đăng nhập` | `Trang chủ` | `Đăng nhập` |

- Trên màn auth, nav bar dùng lại **đúng** header trang chủ; các link section trỏ
  về `../index.html#<id>` nên người dùng luôn quay lại được trang chủ.

## 2. Luồng điều hướng (sơ đồ)

```
                 index.html  (Trang chủ / app)
                  header: "Đăng nhập"  ──────────┐
                                                  ▼
                            html-screen/dang-nhap.html  (Đăng nhập)
                                                  │
                                   "Đăng ký ngay" │  ▲ "Đăng nhập"
                                                  ▼  │
                            html-screen/dang-ky.html    (Đăng ký)
```

- Hai màn auth nằm cùng thư mục `html-screen/` nên link qua lại là **tương đối
  cùng cấp** (`dang-nhap.html` ↔ `dang-ky.html`).
- Logo/brand trên màn auth trỏ về app: `../index.html`.

## 3. Bảng link (nguồn → đích)

| Nguồn | Vị trí | Đích |
| --- | --- | --- |
| `components/header.html` | brand (logo + tên) | `{{home}}` |
| `components/header.html` | `.main-nav` + `.mobile-nav` link | `{{navPrefix}}#<id>` |
| `components/header.html` | `.header-cta` (desktop + mobile) | `{{navPrefix}}#dat-xe` |
| `components/header.html` | `.link-login` (desktop + mobile) | `{{linkLoginHref}}` |
| `screens/dang-nhap/partials/form.html` | "Đăng ký ngay" | `dang-ky.html` (cùng `html-screen/`) |
| `screens/dang-ky/partials/form.html` | "Đăng nhập" | `dang-nhap.html` (cùng `html-screen/`) |

- **Header dùng chung cho cả 3 màn** (home, đăng nhập, đăng ký): `components/header.html`
  được tham số hóa qua token build để mỗi màn trỏ đúng đích.
- `components/auth-top.html` chỉ còn mở `<main class="auth">` + `.auth-wrap`; brand do
  header đảm nhiệm nên màn auth **không** lặp lại brand.

## 4. Link dự kiến (chưa tạo — placeholder trong form)

Các trang sau chưa tồn tại, khi thêm thì đặt **cùng `html-screen/`** để giữ
đường dẫn tương đối hiện tại:

- `dang-ky-tai-xe.html` (Đăng ký làm tài xế)
- `dat-lai-mat-khau.html` (Quên mật khẩu)

## 5. Thêm màn phụ mới vào `html-screen/`

1. Tạo `screens/<ten>/screen.json`:
   ```json
   {
     "output": "html-screen/<ten>.html",
     "base": "../",
     "title": "...",
     "description": "...",
     "css": ["tokens", "base", "header", "cta-footer", "motion",
             "responsive-desktop", "responsive-mobile"],
     "js": ["header", "reveal"],
     "partials": [
       "components/head.html",
       "components/sprite.html",
       "components/header.html",
       "screens/<ten>/partials/<...>.html",
       "components/footer.html"
     ]
   }
   ```
2. Chạy `node build.js` → file sinh vào `html-screen/`.
3. Thêm link tới màn mới ở `components/header.html` (hoặc partial liên quan)
   với tiền tố `{{base}}html-screen/` nếu nguồn ở gốc.
