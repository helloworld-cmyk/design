# AGENTS.MD

## 0. Dự án là gì

- **Vi Vu Việt** — website đặt vé xe ghép liên tỉnh, làm như **project cá nhân**.
- **UI tĩnh, không framework/backend**: HTML/CSS/JS thuần, sinh từ partial +
  `screen.json` qua `build.js`. Không dùng React/Vue/Tailwind.
- **Ba vai trò, mỗi vai trò một web riêng**: khách hàng (`khach-hang/`), tài xế
  (`tai-xe/`), quản trị (`admin/`); dùng chung design system + trang lỗi ở
  `shared/`.
- **Phạm vi chốt: 22 màn nghiệp vụ** (8 khách · 6 tài xế · 8 admin) + trang lỗi
  404/500. Không thêm màn/module ngoài phạm vi nếu chưa được người dùng duyệt.
- Toàn bộ UI **tiếng Việt**; brand "Vi Vu Việt"; tiền định dạng `180.000đ`.

## 1. Cấu trúc hiện tại

```
design/
├── build.js                 # quét <nhóm>/screens/*/screen.json → build từng màn
├── DESIGN_RULES.MD          # design system + quy tắc bắt buộc (đọc trước khi sửa UI)
├── NAVIGATION.MD            # luồng điều hướng web khách hàng
├── shared/                  # dùng chung: components/ css/ js/ assets/, 404.html
├── khach-hang/              # web khách: components/ css/ js/ screens/<màn>/
├── tai-xe/                  # web tài xế: tổ chức y hệt khach-hang/
├── admin/                   # web quản trị: tổ chức y hệt khach-hang/
├── .agents/plans/           # tài liệu kế hoạch 00–04, flow, queue
├── .agents/skills/          # WORKTREE-SKILL.MD
├── .kilo/worktrees/         # worktree của Agent Manager (session song song)
└── temp/                    # file tạm / ảnh chụp thử nghiệm
```

- Mỗi màn = `<nhóm>/screens/<tên>/`: `screen.json` + `partials/` (+ `css/`, `js/`
  riêng màn khi cần). Tài nguyên dùng ≥2 màn cùng nhóm → `<nhóm>/css|js/`;
  dùng ≥2 nhóm → `shared/`.
- File `.html` output (`<nhóm>/*.html`, `shared/404.html`) là **sinh tự động** từ
  `build.js` — **không sửa tay**; luôn sửa nguồn rồi build lại.
- Chi tiết cấu trúc thư mục, thứ tự load CSS/JS, mẫu `screen.json`: xem
  `DESIGN_RULES.MD` §1 và §11 (không lặp lại ở đây).

## 2. Build & kiểm tra (BẮT BUỘC)

- Sau mỗi thay đổi nguồn, chạy `node build.js` để sinh lại toàn bộ HTML.
- `build.js` kiểm tra mọi file nguồn (`.html/.css/.js/.svg`, kể cả `build.js`):
  **≤ 300 dòng/file và ≤ 100 ký tự/dòng**. Vi phạm → build fail, phải tách file
  trước khi tiếp tục. Miễn trừ: file `.md` và `shared/assets/` (riêng
  `shared/assets/favicon.svg` vẫn bị check).
- Thêm màn mới: tạo `<nhóm>/screens/<tên>/screen.json` + `partials/` → chạy
  `node build.js` → thêm link ở partial liên quan → cập nhật `NAVIGATION.MD`.
- Trước commit: `node build.js` phải pass và đối chiếu CHECKLIST `DESIGN_RULES.MD`
  §10.

## 3. Design Rules (BẮT BUỘC)

- Khi design phải tuân theo design rules bằng mọi cách, không ngoại lệ.
- Toàn bộ design rules nằm tại: `DESIGN_RULES.MD` (cùng thư mục với file này).
- Trước khi thiết kế, chỉnh sửa UI, hoặc tạo bất kỳ thành phần giao diện nào (HTML, CSS, component, screen), **phải đọc `DESIGN_RULES.MD` trước** và áp dụng nghiêm ngặt mọi quy định trong đó.
- Nếu có xung đột giữa yêu cầu tính năng và design rules, ưu tiên design rules; nếu thực sự không thể tuân theo, phải dừng lại và hỏi người dùng trước khi xử lý.

## 4. Tài liệu & Plans (Vị trí xuất)

- Luồng điều hướng web khách hàng: `NAVIGATION.MD`.
- Đặc tả/kế hoạch màn: `.agents/plans/` (`00-tong-quan`, `01-khach-hang`,
  `02-tai-xe`, `03-admin`, `04-dung-chung-va-ky-thuat`, `flow`, `queue`).
- Khi viết plans (kế hoạch triển khai), xuất file plan vào:
  `/Users/phong/hust-bai-tap-or-code/design-cnpm/design/.agents/plans`
- Không ghi plans vào nơi khác.
- Quy trình merge worktree: `.agents/skills/WORKTREE-SKILL.MD`.

## 5. Parallel Sessions & Tài nguyên chung (BẮT BUỘC)

- Session này chạy **song song** với các session khác, vì vậy phải **tối thiểu hóa việc động vào tài nguyên chung** (shared resources): file dùng chung giữa nhiều session, `DESIGN_RULES.MD`, `AGENTS.md`, config chung, thư mục dùng chung (`.agents/` trừ nơi xuất plans được phép), và bất kỳ tài sản nào session khác có thể đang dùng.
- Chỉ đọc tài nguyên chung khi thực sự cần thiết; **không chỉnh sửa** tài nguyên chung trừ khi được yêu cầu rõ ràng.
- **Bất cứ lúc nào phải đụng vào tài nguyên chung (kể cả chỉ đọc để chỉnh sửa, ghi đè, xóa, rename...), phải báo cáo lại cho người dùng trước** để người dùng kiểm tra và quyết định, rồi mới thực hiện.
- Ưu tiên làm việc trong phạm vi file/thư mục riêng của session; nếu cần tạo file mới, tránh đặt vào nơi session khác có thể ghi đè.

## 6. Temporary Files (BẮT BUỘC)

- Khi tạo và sử dụng các file/folder tạm (temporary files, temp folders, scratch files, file preview thử nghiệm...), **phải nhét hết vào**: `/Users/phong/hust-bai-tap-or-code/design-cnpm/design/temp` — không tạo file tạm ở nơi khác trong workspace.
- Phải ghi nhớ vị trí của các file/folder tạm đã tạo.
- Trước khi kết thúc session, **phải xóa hết toàn bộ các file/folder tạm đã tạo** trong workspace, không để lại rác.
- Ngoại lệ: các file/folder tạm nằm trong `/var/folders/...` (thư mục temp của hệ thống) hoặc `.agents/plans` (nơi xuất plans chính thức) không cần xóa.

## 7. Hiện trạng (snapshot 2026-10-31)

- `khach-hang/`: đủ 8 màn — trang chủ, đăng nhập, đăng ký, kết quả tìm chuyến,
  chi tiết chuyến, đặt vé thành công, chuyến của tôi, hồ sơ.
- `admin/`: đã có đăng nhập (`admin/index.html`) + tổng quan
  (`admin/tong-quan.html`); các màn quản trị còn lại đang dựng ở worktree riêng.
- `tai-xe/`: trên `main` chưa có màn (chỉ khung thư mục); đang dựng ở worktree.
- `shared/`: design system + trang lỗi 404/500 dùng chung.
- Worktree Agent Manager hiện có: `motley-flat`, `visual-relative` (nhánh riêng,
  không sửa chéo từ `main`).