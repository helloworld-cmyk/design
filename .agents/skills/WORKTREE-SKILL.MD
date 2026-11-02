---
name: worktree
description: >-
  Quy trình làm việc an toàn với git worktree của Agent Manager: kiểm tra trạng thái,
  commit phần chưa lưu, xem trước xung đột, hợp nhất (merge) nhánh worktree vào nhánh
  đích (main) và xử lý xung đột. Kích hoạt khi gặp các việc liên quan tới worktree,
  .kilo/worktrees, "merge worktree vào main", "chuyển sang nhánh main", apply/merge
  worktree, hoặc resolve conflict giữa worktree và nhánh chính.
argument-hint: "[merge|status|preview|resolve] [target-branch]"
---

# Skill: Làm việc với Worktree (Agent Manager)

Đóng gói quy trình đã dùng để hợp nhất một worktree của Agent Manager vào nhánh chính
một cách trơn tru, ít lỗi và không phá vỡ nhánh đích.

## Khi nào dùng

- Người dùng yêu cầu "chuyển sang nhánh main rồi merge worktree này vào main".
- Cần đưa thay đổi trong worktree Agent Manager (pool
  `~/.local/share/kilo/worktree-pool/...` hoặc `.kilo/worktrees/<name>/`) về
  nhánh đích.
- Cần kiểm tra/xem trước xung đột trước khi hợp nhất.
- Cần gỡ xung đột khi merge worktree.

## Mô hình cần nhớ

Mỗi worktree là **một checkout riêng trên branch riêng** (hoặc detached HEAD),
thường nằm trong pool của Agent Manager:
`~/.local/share/kilo/worktree-pool/<workspace-id>/<name>/` trên macOS/Linux.
Một số bản cũ dùng `.kilo/worktrees/<name>/` — luôn xác nhận bằng
`git worktree list` thay vì đoán đường dẫn. Nhánh đích (`main`) thường **đã được
checkout ở thư mục repo chính** (`REPO_PATH`).

Hệ quả quan trọng:

- **Không thể `git checkout <nhánh đích>` bên trong worktree** nếu nhánh đó đang được
  checkout ở worktree khác — Git sẽ từ chối. Vì vậy hãy chạy lệnh merge **từ thư mục
  repo chính** bằng `git -C "$REPO_PATH" ...`.
- Worktree trong pool có thể ở **detached HEAD** — `git branch --show-current`
  trả về rỗng. Khi đó commit xong thì merge bằng **SHA** (`git rev-parse HEAD`)
  hoặc tạo nhánh tạm trước khi merge.
- Thay đổi trong worktree thường **chưa commit** (untracked/modified). Muốn merge thì
  **phải commit trước**.
- Nhánh worktree có thể đã là **tổ tiên** của nhánh đích (đã merge một phần trước đó);
  khi đó chỉ phần chưa commit là việc mới cần mang sang.

Biến tham chiếu dùng trong skill:

```sh
WORKTREE_PATH="$(pwd)"                 # thư mục worktree hiện tại
BRANCH="$(git branch --show-current)"  # rỗng nếu detached HEAD
[ -z "$BRANCH" ] && BRANCH="$(git rev-parse HEAD)"

# Repo chính: lấy worktree đang checkout main từ danh sách
REPO_PATH="$(git worktree list --porcelain |
  awk 'BEGIN{RS=""} /branch refs\/heads\/main/{print $2; exit}')"
[ -z "$REPO_PATH" ] && REPO_PATH="/Users/phong/hust-bai-tap-or-code/design-cnpm/design"

TARGET="main"                          # nhánh đích
```

## Nguyên tắc vàng

1. **Không dùng `git stash`/autostash** — stash dùng chung giữa các worktree, dễ gây
   xung đột lạ. Commit thật vào nhánh worktree thay vì stash.
2. **Không sửa trực tiếp `.kilo/agent-manager.json`** — đây là state UI/phục hồi, không
   phải API. Dùng công cụ Agent Manager để move/answer/stop.
3. **Chạy merge từ repo chính**, không `checkout` nhánh đích trong worktree.
4. **Xem trước xung đột trước khi merge** bằng `git merge-tree` để tránh rối.
5. Chỉ **commit/merge/push khi người dùng yêu cầu**; push là bước riêng, không tự làm.

## Quy trình hợp nhất worktree vào nhánh đích

### Bước 1 — Khảo sát trạng thái (chỉ đọc)

```sh
git status                       # thay đổi chưa commit trong worktree
git branch -a                    # các nhánh
git worktree list                # worktree nào đang giữ nhánh đích (REPO_PATH)
git log --oneline -5 "$TARGET"
git log --oneline -5 HEAD
git merge-base "$TARGET" HEAD    # quan hệ tổ tiên giữa hai nhánh
git merge-base --is-ancestor HEAD "$TARGET" && echo "worktree đã nằm trong $TARGET" || echo "cần merge thật"
git branch --show-current        # rỗng = detached HEAD (phổ biến trong pool)
```

Nếu `git branch -a` cho thấy có nhánh như `+ main`, dấu `+` nghĩa là nhánh đó đang
được checkout ở một worktree khác → không thể checkout tại đây.

- Nếu worktree **chưa commit gì** và mọi thứ đã nằm trong `$TARGET` → không có gì để merge.
- Nếu có thay đổi chưa commit → sang bước 2.
- Nếu detached HEAD, ghi lại `git rev-parse HEAD` để dùng làm `$BRANCH` khi merge.

### Bước 2 — Commit phần chưa lưu trong worktree

```sh
git add -A
git commit -m "<mô tả ngắn gọn phần việc>"
[ -z "$(git branch --show-current)" ] && BRANCH="$(git rev-parse HEAD)"
git log --oneline -3
```

### Bước 3 — Xem trước xung đột (không thay đổi gì)

```sh
git merge-tree --write-tree --name-only "$TARGET" HEAD
echo "EXIT=$?"
```

- `EXIT=0` và chỉ in một hash → **sạch, không xung đột**.
- Exit khác 0 / có danh sách file xung đột → nên gỡ trong worktree trước (xem mục dưới).

### Bước 4 — Merge vào nhánh đích từ repo chính

```sh
git -C "$REPO_PATH" merge --no-ff "$BRANCH" -m "Merge '$BRANCH': <mô tả>"
```

> Nếu `$BRANCH` là SHA (detached HEAD), câu lệnh vẫn hợp lệ; Git sẽ tạo merge
> commit trỏ tới SHA đó. Muốn lịch sử đẹp hơn, tạo nhánh tạm trong worktree
> (`git switch -c merge/<ten>`) rồi merge nhánh đó.

Sau merge nên kiểm tra lại trạng thái repo chính:

```sh
git -C "$REPO_PATH" status --short
git -C "$REPO_PATH" log --oneline -3
git -C "$REPO_PATH" rev-parse --abbrev-ref HEAD   # phải là $TARGET
```

### Bước 5 — Xác minh kết quả

Kiểm tra file/kết quả thực sự có mặt trên nhánh đích và các thay đổi đã gỡ/chuyển đúng:

```sh
ls "$REPO_PATH"/<đường-dẫn-mong-đợi>
grep -rn "<chuỗi cần kiểm>" "$REPO_PATH"/<file> || echo "OK (không còn)"
```

Nếu `$REPO_PATH` đang **ahead** so với `origin/$TARGET`, nhắc người dùng rằng chưa push
(chỉ push khi được yêu cầu).

## Gỡ xung đột (resolve conflict) đúng cách

Với thay đổi phức tạp, **gỡ ngay trong worktree** rồi mới hợp nhất:

```sh
# trong worktree: đưa nhánh đích mới nhất vào worktree để gỡ xung đột tại đây
git fetch origin
git merge "$TARGET"            # hoặc: git rebase "$TARGET"
# ... sửa file xung đột, chạy test/lint ...
git add -A && git commit       # (nếu đang merge) hoặc: git rebase --continue
```

Sau khi worktree sạch xung đột, quay lại Bước 3 → Bước 4 để merge vào `$TARGET`.
Ưu tiên gỡ xung đột ở worktree hơn là ở repo chính để nhánh đích không bị kẹt trạng thái
merge dở dang.

## Cheat sheet

| Mục đích | Lệnh |
|---|---|
| Xem mọi worktree + nhánh | `git worktree list` |
| Worktree đang giữ nhánh nào | `git -C "$REPO_PATH" rev-parse --abbrev-ref HEAD` |
| Kiểm tra tổ tiên | `git merge-base --is-ancestor HEAD "$TARGET" && echo ancestor` |
| Xem trước conflict | `git merge-tree --write-tree --name-only "$TARGET" HEAD` |
| Merge từ repo chính | `git -C "$REPO_PATH" merge --no-ff "$BRANCH"` |
| Bỏ merge dở (cẩn thận) | `git -C "$REPO_PATH" merge --abort` |

## Troubleshooting

- **`fatal: '<branch>' is already checked out at ...`** → nhánh đích đang ở worktree
  khác. Không checkout; chuyển sang merge từ `$REPO_PATH` (Bước 4).
- **`git branch --show-current` rỗng** → worktree detached HEAD (thường gặp trong
  pool Agent Manager). Commit rồi merge bằng SHA, hoặc tạo nhánh tạm.
- **Worktree không nằm trong `.kilo/worktrees/`** → kiểm tra `git worktree list`;
  pool mặc định là `~/.local/share/kilo/worktree-pool/...`.
- **Merge xong nhưng file mới "biến mất"** → file đó có thể vẫn **untracked** và chưa
  được commit ở Bước 2. Kiểm tra `git status` trong worktree trước khi merge.
- **Xung đột lặp lại do một file ở worktree có nền cũ hơn `$TARGET`** → merge/rebase
  `$TARGET` vào worktree trước (mục Gỡ xung đột).
- **`git diff <target>` hiện nhiều "deleted"** → bình thường khi nền worktree cũ hơn
  `$TARGET`; không phải mất dữ liệu, chỉ là so sánh khác nền.
- **Nghi stash gây lỗi lạ** → bỏ thói quen stash; commit vào nhánh worktree.

## Checklist trước khi báo hoàn tất

- [ ] `git status` worktree sạch (đã commit hết phần cần mang sang).
- [ ] Đã xem trước xung đột, hoặc xác nhận merge `EXIT=0`.
- [ ] Merge thực hiện từ `$REPO_PATH`, `rev-parse` trả về đúng `$TARGET`.
- [ ] Repo chính `status --short` sạch.
- [ ] Đã xác minh file/nội dung mong đợi có trên nhánh đích.
- [ ] Đã thông báo trạng thái ahead/behind so với `origin` (có push hay chưa).
