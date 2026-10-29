# DESIGN RULES — Vi Vu Việt (nền tảng đặt xe ghép liên tỉnh)

> **Hợp đồng bắt buộc.** Mọi file trong `design/` phải tuân thủ tài liệu này.
> Mọi màn/hình mới (screen, modal, trang phụ) **phải lắp từ token & component
> có sẵn** ở §3–§9, rồi tự kiểm CHECKLIST §10. Cấm tạo style rời.
> Nguồn chân lý: `css/tokens.css` (biến) + các `css/<component>.css`.

---

## 1. Quy tắc tổ chức file (BẮT BUỘC)

> **Mỗi file nguồn không quá 300 dòng và mỗi dòng không quá 100 ký tự.**

- Áp dụng cho file nguồn: `.html`, `.css`, `.js`, `build.js`, `.svg`.
- **Miễn trừ:** file tài liệu `.md` (kể cả chính `DESIGN_RULES.MD` này) **không**
  bị ràng buộc giới hạn 300 dòng / 100 ký tự — đây là tài liệu, không phải code.
  Thư mục `assets/` cũng **không** bị check (chứa logo/ảnh/`icon.html` xuất ra,
  có file 1 dòng rất dài); riêng `assets/favicon.svg` vẫn được check.
- Khi một file sắp vượt 300 dòng → **tách theo component/section**, không gộp.
- Cấu trúc thư mục chuẩn (dùng chung ở gốc, từng màn tách riêng trong `screens/`):

```
design/
├── index.html       # file BUILD TỰ ĐỘNG (node build.js) — không sửa tay
├── build.js         # đọc manifest screens/*/screen.json → build từng màn
├── components/      # partial DÙNG CHUNG: head (chứa {{title}}/{{description}}/
│                    #   {{css}}/{{js}}), sprite, art, header, footer
├── screens/         # MỖI MÀN MỘT THƯ MỤC
│   └── home/
│       ├── screen.json   # output, title, description, css[], js[], partials[]
│       └── partials/     # section riêng màn: hero, fleet, routes, steps,
│                         #   features, testimonials, driver, faq, cta
├── css/             # 1 file = 1 nhóm component (design system dùng chung)
├── js/              # 1 file = 1 feature, IIFE thuần (không framework)
└── assets/          # favicon.svg, logo.svg, image.png, icon.html
```

- `index.html` sinh từ `node build.js` → **luôn sửa `components/` +
  `screens/<màn>/partials/` (và `screen.json`) rồi build**, không edit trực tiếp.
- Thêm màn mới: tạo `screens/<màn>/screen.json` + `partials/`, thêm vào build
  là xong; chỉ tạo `.css`/`.js` mới khi thực sự có component chưa tồn tại.
- Thứ tự load CSS (bắt buộc giữ): `tokens` → `base` → các component →
  `motion` → `responsive-desktop` → `responsive-mobile`.
- Thứ tự load JS (`<script defer>`): `header` → `booking` → `routes` → `faq`
  → `reveal` (cuối cùng, phụ trách cả active-nav).
- Trước commit: chạy `node build.js` phải pass, không file nguồn nào vượt rule.

---

## 2. Thương hiệu & ngôn ngữ

- Tên thương hiệu: **Vi Vu Việt** (logo tách màu "Vi Vu" + "Việt" nhấn sky-700).
- Toàn bộ UI dùng **tiếng Việt**; email hỗ trợ `hotro@vivuviet.vn`.
- Giọng văn: thân thiện, thực tế, không phóng đại ("đi tỉnh nhẹ nhàng").
- Đơn vị tiền: `đ` sau số, phân cách hàng nghìn bằng `.` (180.000đ).

---

## 3. Design tokens — NGUỒN CHÂN LÝ

- **Cấm hardcode** màu / radius / shadow / kích thước ngoài token.
- Cần giá trị mới → **thêm biến vào `css/tokens.css`** rồi dùng `var(--…)`.
- Ngoại lệ duy nhất: sắc trung gian hover/viền mềm **đã có** trong component
  (ví dụ `#bae6fd`, `#e0f2fe`, `#e6eef6`, `#cfe6f6`) — không phát sinh hex mới.

### 3.1 Font

- `--font-heading`: Be Vietnam Pro (600/700/800) — mọi tiêu đề + số nhấn.
- `--font-body`: Noto Sans (400/500/600/700) — nội dung, nút, nhãn.

### 3.2 Bảng màu

- Navy (tối/thương hiệu): `--navy-950 #07111f`, `--navy-900 #081426`,
  `--navy-800 #0b1b33`, `--navy-700 #12294a`, `--ink #0f1e35`.
- Slate (chữ/phụ): `--slate-700 #334155`, `--slate-600 #475569`,
  `--slate-500 #64748b`, `--slate-400 #94a3b8`, `--slate-300 #cbd5e1`,
  `--slate-200 #e2e8f0`.
- Sky (màu chính/CTA): `--sky-800 #075985`, `--sky-700 #0369a1`,
  `--sky-600 #0284c7`, `--sky-500 #0ea5e9`, `--sky-300 #7dd3fc`,
  `--sky-100 #e0f2fe`, `--sky-50 #f0f9ff`; `--navy-50 #eef3f9`.
- Accent cam: `--orange-700 #c2410c`, `--orange-600 #ea580c`,
  `--orange-500 #f97316`, `--orange-100 #ffedd5`, `--orange-50 #fff6ed`.
- Success: `--green-700 #047857`, `--green-600 #059669`,
  `--green-100 #d1fae5`, `--green-50 #ecfdf5`.
- Error: `--red-600 #dc2626`, `--red-50 #fef2f2`.
- Surface: `--bg #f7fafd`, `--surface #ffffff`, `--border #e2e8f0`,
  `--border-soft #eef3f8`.

**Quy ước vai trò màu:** brand/CTA = sky-700 (hover sky-800); accent nổi bật =
orange-500; nền tối = navy-800/900/950; chữ chính = ink/navy-800, chữ phụ =
slate-600/500, mờ = slate-400; viền = border/border-soft; nền tint = `*-50`
(tile/chip), `*-100` (khối thông tin/badge).

### 3.3 Radius, shadow, kích thước, motion

- Radius: `--radius-xs 8` · `--radius-sm 10` · `--radius-md 14` ·
  `--radius-lg 20` · `--radius-xl 26` (px). Pill dùng `999px`.
- Shadow: `--shadow-xs` · `--shadow-sm` · `--shadow-md` · `--shadow-lg`.
- Container: `--container 1200px`; `--header-h 78px` (mobile 70px).
- Motion: `--dur 0.24s`; `--ease cubic-bezier(0.22, 0.61, 0.36, 1)`.

---

## 4. Typography — thang chữ chuẩn

Font heading cho mọi tiêu đề; body cho nội dung. Body gốc: 16px / lh 1.65 /
slate-600. Tiêu đề màu ink (nền tối → `#fff`), `line-height` 1.12–1.15,
letter-spacing âm. Chỉ dùng các bậc dưới, không tự chọn size/weight khác.

- **H1 (hero, duy nhất 1/trang):** `clamp(2.35rem, 5.1vw, 4rem)`, 800, lh 1.05,
  ls −0.038em, màu navy-800.
- **H2 (tiêu đề section):** `clamp(1.85rem, 3.2vw, 2.65rem)`, 800, lh 1.12,
  ls −0.032em; dùng `text-wrap: balance`.
- **H2 khối tối (driver/cta):** `clamp(1.8rem, 3vw, 2.6rem)`, 800, ls −0.03em.
- **Lead (đoạn mở):** `clamp(15.5px, 1.15vw, 17.5px)`, 400, lh 1.7, slate-600.
- **Body:** 15–16px, 400, lh 1.65–1.72, slate-600/700.
- **H3 (card/bước):** 17–19px, 700, lh 1.2, ls −0.02em, ink.
- **Label form:** 11px, 700, `letter-spacing .09em`, uppercase, slate-500.
- **Eyebrow:** 11px, 700, `letter-spacing .14em`, uppercase, sky-700.
- **Meta/small:** 11.5–13.5px, 500–600, lh 1.4, slate-400/500.
- **Số nhấn (stat/price/amount):** 17–32px, 800, lh 1.2, ls −0.02em,
  font-heading, ink.

---

## 5. Spacing, layout & breakpoints

- Mọi section bọc trong `.container` (`width: min(100% - 40px, 1200px)`,
  mobile `-32px`).
- Nhịp section: `.section { padding: clamp(64px, 8vw, 108px) 0 }`.
  `.section--white` = nền trắng + viền block; luân phiên nền để phân tách.
- Section head: `.section-head` max-width 660, `margin-bottom clamp(32,4vw,52)`.
- Thang khoảng cách nội bộ: **8 / 12 / 14 / 16 / 18 / 22 / 24 / 30px**;
  gap giữa cột `clamp(32–56px)`, giữa khối lớn `clamp(40–88px)`.
- Radius dùng đúng bậc: card md(14) · panel lg/xl(20/26+) · input & btn 12 ·
  pill 999. Không trộn radius lạ.
- Breakpoints (desktop-first): **1080 / 1024 / 900 / 768 / 640 / 520 / 400**.
  - ≤1080: giảm gap hero/trust/footer.
  - ≤1024: lưới 3 cột → 2 cột (routes, trust-strip…); features bỏ sticky.
  - ≤900: ẩn `.main-nav` + `.header-cta` + `.link-login` → `.nav-toggle`
    + `.mobile-nav`; hero/CTA/FAQ/support về 1 cột.
  - ≤768: container `-32px`, `--header-h:70px`, nút search full-width.
  - ≤640 / ≤520 / ≤400: về 1 cột, giảm padding/gap, ẩn phần trang trí phụ.

---

## 6. Components — hợp đồng class

### 6.1 Buttons (`base.css`)

- `.btn` base: inline-flex, gap 9, cao 48, padding `0 22`, radius 12, 700,
  14.5px; transition đủ (bg, color, border, shadow, transform).
- `.btn-primary` CTA chính (sky-700 → sky-800 hover, nhấc −1px).
- `.btn-accent` CTA cam (orange-500, chữ navy sẫm) — dùng trên nền tối/cam.
- `.btn-ghost` viền border, hover nền sky-50.
- `.btn-sm` 42/11/13.5px · `.btn-lg` 52/13/15px.
- `.btn.is-loading` (spinner) cho trạng thái đang xử lý; icon trong `.btn` = 18px.
- **Cấm** tạo class button mới; luôn `.btn` + biến thể.

### 6.2 Form & Fields (`booking.css`)

- Cấu trúc: `.field > label` + `.field-control` (bọc `.field-icon` + input).
- Input/select: cao 48, radius 12, nền `#fafcfe`, focus ring sky 4px.
- `.field-icon` (trái, 18px) · `.select-wrap` (mũi chevron) · `.swap-btn`.
- Lỗi: thêm `.is-invalid` lên `.field`; gom thông báo vào `.form-status`
  (`role="status"`, `aria-live="polite"`, biến thể `.is-success/--error/--info`).
- Mọi input có `label` tường minh + `name/id`; `required` khi bắt buộc.

### 6.3 Surfaces & Cards

Card mới **phải** theo công thức hiện hữu: nền surface + border 1px +
radius md + `--shadow-xs`, hover nhấc `translateY(-3..4px)`. Các dạng có sẵn:

- `.feature-card` (+`.feature-card--dark`) · `.testimonial-card` (nền `--bg`) ·
  `.route-card` · `.fleet-card`.
- Khối tint sky: `.support-card`, `.intro-note` (viền trái sky-500 3px).
- Panel trắng: `.booking-form`, `.ride-card`, `.income-card`.
- Dải/bảng nền tối lớn: `.driver-panel` (radius xl, navy gradient) — dùng lại
  cho mọi khối CTA nền đậm; `.cta-final` (dải sáng xanh) cho CTA cuối.

### 6.4 Badges, chips, tiles, stat, avatar

- `.badge` + `.badge--green/--orange` (pill 999, 11px/700).
- `.float-chip` (chip nổi glass) · `.chip-icon--green/--orange`.
- Tile icon nền tint + viền ring 1px inset (KHÔNG gradient/đổ bóng nặng, tránh
  cảm giác "icon AI"): `.trust-icon--sky/navy/orange/green`, `.note-icon`,
  `.support-icon`.
- Avatar: `.avatar--driver`, `.avatar--photo`, `.avatar-verified` (dấu xác thực
  xanh). Stat: `.trust-item` (icon tile + strong 21px/800 + span 12px).

### 6.5 Section header & link (`sections.css`)

- `.section-head` chứa `.section-eyebrow` (gạch 22px) + `h2` + `p`.
- `.head-row` khi cần tiêu đề trái + link phải; `.text-link` cho "xem tất cả".
- Mỗi section có `h2` + `id` tiếng Việt không dấu (`#doi-xe`, `#tuyen-duong`…).

### 6.6 Header & Footer (`header.css`, `cta-footer.css`)

- `.site-header` sticky + blur, thêm `.is-scrolled` (nền trắng + viền) khi cuộn.
- `.brand` + `.brand-mark` (logo 42px) + `.brand-name span` tô sky-700.
- `.main-nav a` gạch chân sky khi hover/`.is-active` (+`aria-current`).
- Footer: `.site-footer` (navy-900) + `.footer-grid` + `.footer-col` +
  `.socials` + `.footer-bottom` (`.footer-legal`).

---

## 7. Icon & minh hoạ

- Icon chức năng: sprite `<use href="#i-...">` trong `components/sprite.html`,
  class `.icon`, luôn `aria-hidden="true"`. Thuộc tính stroke gom ở `.icon-sym`.
- Danh mục id hiện có: `i-pin, i-calendar, i-users, i-arrow-right,
  i-arrow-up-right, i-swap, i-shield, i-headset, i-wallet, i-clock, i-check,
  i-check-circle, i-chevron-down, i-menu, i-close, i-car, i-route, i-star,
  i-phone, i-mail, i-map, i-facebook, i-instagram, i-youtube`.
- Minh hoạ (thay icon trang trí ở card/tile) đặt trong `components/art.html`,
  id `#a-...`, gọi qua `<figure class="feature-art">` + `<use>`. **Không** dùng
  icon chức năng cho mục trang trí và ngược lại.
- Ảnh thật: CDN ổn định `https://images.unsplash.com/<id>?q=80&w=1200`;
  `<img alt loading="lazy" width height>` bọc `.fleet-media` + badge số chỗ.
  URL ảnh nằm trên 1 dòng ≤ 100 ký tự.

---

## 8. Motion

- Chuẩn `--dur 0.24s` + `--ease`; chỉ transition thuộc tính thực sự đổi.
- Reveal on scroll: class `.reveal` (+`--reveal-delay`), JS thêm `.is-in`;
  chỉ chạy khi `.js` (không JS = hiển thị luôn, không giấu nội dung).
- Keyframe có sẵn: `pulse, float, artBob, artRing, dash, spin, formFlash, panelIn`.
- **Bắt buộc** tôn trọng `prefers-reduced-motion: reduce` (tắt animation/reveal).

---

## 9. Accessibility

- Mỗi section có `h2` + anchor id; chỉ **1 `h1`/trang** (hero).
- Form: label tường minh, `required`, lỗi qua `#formStatus` + `.is-invalid`.
- Interactive ≥ 44px; `:focus-visible` outline 3px (nền tối đổi outline sky-300).
- Tương phản ≥ WCAG AA; ảnh trang trí `alt=""`, icon `aria-hidden="true"`.
- `body { overflow-x: clip }`; hỗ trợ zoom 200% (ưu tiên `rem`/`clamp`).

---

## 10. Quy tắc "không lạc loài" — CHECKLIST (chạy trước mỗi commit)

Xác nhận **tất cả** điểm sau đều ĐÚNG:

1. Màu/radius/shadow/font/spacing **đều `var(--…)`**; không hex/kích thước rời.
2. Button dùng `.btn` + biến thể; badge dùng `.badge--*`; card dùng card chuẩn.
3. Tiêu đề/eyebrow/label đúng bậc §4; không tự đổi weight/size.
4. Section bọc `.container` + `.section` + `.section-head`; nhịp section §5.
5. Icon qua sprite; tile icon nền tint đúng biến thể; ảnh đúng chuẩn §7.
6. Có đủ state hover/focus/active/loading theo pattern; motion §8.
7. Đủ a11y §9; `node build.js` pass; kiểm desktop + ≤400px, console sạch.

> Một màn "trông khác" chỉ 1 trong 7 mục trên → **sai rule**, sửa cho khớp.

---

## 11. Mẫu màn/hình mới

- Trang phụ (vd `ve-chung-toi.html`, `dang-nhap.html`) **dùng lại** header,
  footer, `tokens.css`, `base.css` và các component — hạn chế tối đa CSS/JS
  mới; chỉ thêm file khi thực sự có component chưa tồn tại (kèm rule §1).
- Mỗi màn = 1 thư mục `screens/<ten>/` gồm `screen.json` + `partials/`:
  `screen.json` khai báo `output`, `title`, `description`, `css[]`, `js[]`,
  `partials[]` (đường dẫn gốc, có thể trộn `components/*`).
- Partial màn chèn giữa `components/header.html` và `components/footer.html`;
  `components/head.html` tự bơm `{{title}}`/`{{description}}`/`{{css}}`, footer
  bơm `{{js}}` — nên **không lặp block CSS/JS** trong từng màn.
- Nội dung = chuỗi `.section` lặp lại; CTA cuối dùng `.cta-final`, dải tối
  dùng `.driver-panel`, form dùng lại `.booking-form`/`.field`.
- Đặt màn mới trong `screens/`, thêm `screen.json` theo giới hạn §1, rồi build.

---

## 12. Quy trình sửa UI

1. Sửa partial/CSS/JS nguồn tương ứng (file ≤ 300 dòng, dòng ≤ 100 ký tự).
2. Chạy `node build.js`.
3. Mở `index.html` kiểm desktop + mobile (≤ 400px) + console không lỗi.
4. Đối chiếu CHECKLIST §10 trước khi commit.
