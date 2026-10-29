# DESIGN RULES — Vi Vu Việt (landing đặt xe ghép liên tỉnh)

Tài liệu này là chuẩn bắt buộc cho mọi file trong thư mục `design/`.
Mọi thay đổi UI/UX mới phải đọc và tuân thủ rules bên dưới trước khi code.

---

## 1. Quy tắc tổ chức file (BẮT BUỘC — mới)

> **Mỗi file không quá 300 dòng và mỗi dòng không quá 100 ký tự.**

- Áp dụng cho **mọi file nguồn**: `.html` (partials), `.css`, `.js`, build script.
- Khi một file sắp vượt 300 dòng → **tách theo component/section**, không gộp thêm.
- Mỗi dòng code (kể cả dòng có indent) tối đa **100 ký tự**; attribute HTML dài thì
  xuống dòng theo từng attribute; giá trị CSS dài thì tách property thành nhiều dòng.
- Cấu trúc thư mục chuẩn:

```
design/
├── index.html            # file BUILD TỰ ĐỘNG — không sửa tay
├── build.js              # node build.js → ghép partials/ thành index.html
├── partials/             # HTML nguồn, mỗi partial 1 section (<head>, sprite,
│                         #   art, header, hero, fleet, routes, steps, features,
│                         #   testimonials, driver, faq, cta, footer)
├── css/                  # mỗi file CSS 1 nhóm component
├── js/                   # mỗi file JS 1 feature, script thuần (không framework)
└── favicon.svg           # icon thẻ browser (không dùng data URI trong HTML)
```

- `index.html` được sinh từ `node build.js` → **luôn sửa partials/ rồi build**,
  không edit trực tiếp index.html.
- CSS: 1 file = 1 phạm vi rõ ràng (`tokens`, `base`, `header`, `hero`, `booking`,
  `ride-card`, `fleet`, `routes`, `steps`, `features`, `testimonials`,
  `driver-cta`, `faq`, `cta-footer`, `motion`, `responsive-*`).
- JS: 1 file = 1 feature (`header`, `booking`, `routes`, `faq`, `reveal`),
  mỗi file là IIFE độc lập, load bằng `<script defer>` theo thứ tự.
- Trước khi commit: chạy `node build.js` và kiểm tra không file nguồn > 300 dòng.

---

## 2. Thương hiệu & ngôn ngữ

- Tên thương hiệu: **Vi Vu Việt** (viết hoa đúng: "Vi Vu Việt", logo tách màu
  "Vi Vu" + "Việt" nhấn `--sky-700`).
- Toàn bộ UI dùng **tiếng Việt**; email hỗ trợ `hotro@vivuviet.vn`.
- Giọng văn: thân thiện, thực tế, không phóng đại ("đi tỉnh nhẹ nhàng").
- Đơn vị tiền: `đ` sau số, phân cách hàng nghìn bằng `.` (180.000đ).

## 3. Design tokens (không hardcode giá trị ngoài tokens)

- Fonts: heading = **Be Vietnam Pro**, body = **Noto Sans**.
- Màu nền chính: `--bg #F7FAFD`, surface trắng, border `--border #E2E8F0`.
- Màu thương hiệu: navy `#0B1B33` + sky `#0EA5E9/#0369A1`; accent cam `#F97316`;
  success `#059669`. Chỉ dùng màu từ `css/tokens.css`.
- Radius: 8/10/14/20/26px. Shadow: 4 mức `--shadow-xs…lg`. Không tự sáng tạo.
- Khoảng cách section: `clamp(64px, 8vw, 108px)`; container `--container: 1200px`.

## 4. Layout & component

- Grid desktop-first, breakpoint chuẩn: 1080 / 1024 / 900 / 768 / 640 / 520 / 400.
- Mobile nav mở ở `≤ 900px`; form booking full-width button ở `≤ 768px`.
- Card: border 1px + radius + shadow nhẹ, hover nâng `translateY(-3..4px)`.
- Icon: luôn qua SVG sprite `<use href="#i-...">`, `aria-hidden="true"`;
  thuộc tính chung của symbol đặt bằng class `.icon-sym` trong `css/base.css`,
  không lặp attribute dài trên thẻ `<symbol>`.
- Đồ họa minh hoạ (thay icon trang trí ở card/tile) đặt trong `partials/art.html`
  với id `#a-...`, tham chiếu qua `<use>` và `<figure class="feature-art">`;
  tile nhỏ dùng nền tint nhạt (`--*-50`) + glyph màu thương hiệu, viền ring 1px
  inset, không gradient bóng — tránh cảm giác "icon AI"
  (`.trust-icon--*`, `.chip-icon--*`, `.note-icon`, `.support-icon`).
  Không thay icon chức năng (mũi tên, chevron, check, phone, mail, social).
- Ảnh thật: dùng link CDN ổn định (Unsplash) dạng
  `https://images.unsplash.com/<id>?q=80&w=1200`; `<img>` có `alt` mô tả,
  `loading="lazy"`, `width/height` tường minh, đặt trong `figure.fleet-media`
  có badge số chỗ. URL ảnh phải nằm trên 1 dòng ≤ 100 ký tự.

## 5. Accessibility

- Mọi section có heading `h2` + anchor id tiếng Việt không dấu.
- Form: label tường minh, `required`, lỗi hiển thị qua `#formStatus`
  (`role="status"`, `aria-live="polite"`) + class `is-invalid`.
- Interactive tối thiểu 44px; focus-visible outline 3px; kiểm tra bàn phím.
- Độ tương phản tối thiểu WCAG AA; ưu tiên `prefers-reduced-motion`.

## 6. Motion

- Thời lượng chuẩn `--dur: 0.24s`, easing `--ease`; reveal on scroll bằng
  IntersectionObserver (class `.reveal` + `--reveal-delay`).
- Tôn trọng `prefers-reduced-motion: reduce` cho mọi animation.

## 7. Quy trình sửa UI

1. Sửa partial/CSS/JS nguồn tương ứng (mỗi file ≤ 300 dòng, dòng ≤ 100 ký tự).
2. Chạy `node build.js`.
3. Mở `index.html` kiểm tra desktop + mobile (≤ 400px) + console không lỗi.
