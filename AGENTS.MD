# AGENTS.MD

## Design Rules (BẮT BUỘC)

- Khi design phải tuân theo design rules bằng mọi cách, không ngoại lệ.
- Toàn bộ design rules nằm tại: `DESIGN_RULES.MD` (cùng thư mục với file này).
- Trước khi thiết kế, chỉnh sửa UI, hoặc tạo bất kỳ thành phần giao diện nào (HTML, CSS, component, screen), **phải đọc `DESIGN_RULES.MD` trước** và áp dụng nghiêm ngặt mọi quy định trong đó.
- Nếu có xung đột giữa yêu cầu tính năng và design rules, ưu tiên design rules; nếu thực sự không thể tuân theo, phải dừng lại và hỏi người dùng trước khi xử lý.

## Plans (Vị trí xuất)

- Khi viết plans (kế hoạch triển khai), xuất file plan vào:
  `/Users/phong/hust-bai-tap-or-code/design-cnpm/design/.agents/plans`
- Không ghi plans vào nơi khác.

## Parallel Sessions & Tài nguyên chung (BẮT BUỘC)

- Session này chạy **song song** với các session khác, vì vậy phải **tối thiểu hóa việc động vào tài nguyên chung** (shared resources): file dùng chung giữa nhiều session, `DESIGN_RULES.MD`, `AGENTS.md`, config chung, thư mục dùng chung (`.agents/` trừ nơi xuất plans được phép), và bất kỳ tài sản nào session khác có thể đang dùng.
- Chỉ đọc tài nguyên chung khi thực sự cần thiết; **không chỉnh sửa** tài nguyên chung trừ khi được yêu cầu rõ ràng.
- **Bất cứ lúc nào phải đụng vào tài nguyên chung (kể cả chỉ đọc để chỉnh sửa, ghi đè, xóa, rename...), phải báo cáo lại cho người dùng trước** để người dùng kiểm tra và quyết định, rồi mới thực hiện.
- Ưu tiên làm việc trong phạm vi file/thư mục riêng của session; nếu cần tạo file mới, tránh đặt vào nơi session khác có thể ghi đè.

## Temporary Files (BẮT BUỘC)

- Khi tạo và sử dụng các file/folder tạm (temporary files, temp folders, scratch files, file preview thử nghiệm...), phải ghi nhớ vị trí của chúng.
- Trước khi kết thúc session, **phải xóa hết toàn bộ các file/folder tạm đã tạo** trong workspace, không để lại rác.
- Ngoại lệ: các file/folder tạm nằm trong `/var/folders/...` (thư mục temp của hệ thống) hoặc `.agents/plans` (nơi xuất plans chính thức) không cần xóa.
