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

## Temporary Files (BẮT BUỘC)

- Khi tạo và sử dụng các file/folder tạm (temporary files, temp folders, scratch files, file preview thử nghiệm...), phải ghi nhớ vị trí của chúng.
- Trước khi kết thúc session, **phải xóa hết toàn bộ các file/folder tạm đã tạo** trong workspace, không để lại rác.
- Ngoại lệ: các file/folder tạm nằm trong `/var/folders/...` (thư mục temp của hệ thống) hoặc `.agents/plans` (nơi xuất plans chính thức) không cần xóa.
