(function () {
  "use strict";

  /* Màn A3 — form tạo/sửa + điều phối thao tác dòng */

  const form = document.getElementById("txForm");
  if (!form || !window.VvvTx) return;

  const T = window.VvvTx;
  const $ = (id) => document.getElementById(id);
  const tbody = document.querySelector("[data-admin-table] tbody");

  function markInvalid(input, on) {
    const wrap = input.closest(".field");
    if (wrap) wrap.classList.toggle("is-invalid", on);
  }

  function setStatus(kind, msg) {
    const el = $("txFormStatus");
    el.className = msg ? "form-status is-" + kind : "form-status";
    el.textContent = msg;
  }

  /* ---------- Mở modal tạo / sửa ---------- */

  function openForm(row) {
    form.reset();
    setStatus("info", "");
    document
      .querySelectorAll("#modalForm .field")
      .forEach((f) => f.classList.remove("is-invalid"));
    const isEdit = !!row;
    $("txFormTitle").textContent = isEdit
      ? "Sửa thông tin tài xế"
      : "Tạo tài khoản tài xế";
    $("txFormSub").textContent = isEdit
      ? "Cập nhật thông tin cá nhân và giấy phép lái xe của tài xế."
      : "Thông tin đăng nhập sẽ hiển thị một lần sau khi tạo để bàn giao.";
    $("txFormSubmit").textContent = isEdit ? "Lưu thay đổi" : "Tạo tài khoản";
    form.querySelector("[data-tx-password-field]").hidden = isEdit;
    form.dataset.mode = isEdit ? "edit" : "create";
    form.dataset.rowId = isEdit ? row.dataset.id : "";
    if (isEdit) {
      const d = row.dataset;
      $("txName").value = d.name;
      $("txPhone").value = d.phone;
      $("txEmail").value = d.email;
      $("txGplx").value = T.digits(d.gplx);
      $("txHang").value = d.hang;
      $("txHan").value = T.toIso(d.han);
    } else {
      $("txPassword").value = T.genPassword();
    }
    window.VvvModal.open("modalForm");
  }

  /* ---------- Điều phối thao tác (Sửa / Khóa / Chi tiết / Đặt lại MK) ---------- */

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tx-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-tx-action");
    if (action === "create") {
      openForm(null);
      return;
    }
    const inDetail = !!btn.closest("#modalDetail");
    const row = inDetail && T.state.currentRow ? T.state.currentRow : btn.closest("tr");
    if (!row) return;
    T.state.currentRow = row;
    if (action === "edit") {
      if (inDetail) window.VvvModal.close("modalDetail");
      openForm(row);
    } else if (action === "detail") {
      window.VvvTxDetail.openDetail(row);
    } else if (action === "lock") {
      const type = row.dataset.status === "locked" ? "unlock" : "lock";
      window.VvvTxDetail.openConfirm(type, row);
    } else if (action === "reset") {
      window.VvvTxDetail.openConfirm("reset", row);
    }
  });

  /* ---------- Lưu form ---------- */

  form.addEventListener("input", (e) => {
    if (e.target.closest(".field")) markInvalid(e.target, false);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const isEdit = form.dataset.mode === "edit";
    const name = $("txName").value.trim();
    const phoneDigits = T.digits($("txPhone").value);
    const email = $("txEmail").value.trim();
    const gplx = T.digits($("txGplx").value);
    const hang = $("txHang").value;
    const hanIso = $("txHan").value;
    const errors = [];

    const nameBad = name.length < 3;
    markInvalid($("txName"), nameBad);
    if (nameBad) errors.push("Họ tên tối thiểu 3 ký tự.");

    const phoneBad = !/^0\d{9,10}$/.test(phoneDigits);
    const phoneDup =
      !isEdit && !phoneBad && T.PHONES.indexOf(phoneDigits) !== -1;
    markInvalid($("txPhone"), phoneBad || phoneDup);
    if (phoneBad) errors.push("SĐT chưa hợp lệ (bắt đầu bằng 0, 10–11 số).");
    if (phoneDup) errors.push("SĐT đã tồn tại trong hệ thống.");

    const emailBad = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    markInvalid($("txEmail"), emailBad);
    if (emailBad) errors.push("Email chưa đúng định dạng.");

    const gplxBad = gplx.length !== 12;
    markInvalid($("txGplx"), gplxBad);
    if (gplxBad) errors.push("Số GPLX phải gồm đúng 12 chữ số.");

    markInvalid($("txHang"), !hang);
    if (!hang) errors.push("Chọn hạng GPLX.");

    const hanBad = !hanIso || new Date(hanIso) <= new Date();
    markInvalid($("txHan"), hanBad);
    if (hanBad) errors.push("Hạn GPLX phải là ngày trong tương lai.");

    if (errors.length) {
      setStatus("error", "Chưa lưu được — " + errors.join(" "));
      return;
    }

    if (isEdit) {
      const row = Array.from(tbody.querySelectorAll("tr")).find(
        (r) => r.dataset.id === form.dataset.rowId
      );
      if (row) {
        const d = row.dataset;
        d.name = name;
        d.phone = T.fmtPhone(phoneDigits);
        d.email = email;
        d.gplx = T.group4(gplx);
        d.hang = hang;
        d.han = T.toDmy(hanIso);
        T.renderRow(row);
      }
      window.VvvModal.close("modalForm");
      T.toast("Đã cập nhật thông tin của " + name, "success");
      return;
    }

    const now = new Date();
    const today =
      String(now.getDate()).padStart(2, "0") + "/" +
      String(now.getMonth() + 1).padStart(2, "0") + "/" + now.getFullYear();
    const tr = document.createElement("tr");
    tr.dataset.id = "tx-" + Date.now();
    tr.dataset.status = "active";
    tr.dataset.tint = T.TINTS[Math.floor(Math.random() * T.TINTS.length)];
    tr.dataset.trips = "0";
    tr.dataset.name = name;
    tr.dataset.phone = T.fmtPhone(phoneDigits);
    tr.dataset.email = email;
    tr.dataset.gplx = T.group4(gplx);
    tr.dataset.hang = hang;
    tr.dataset.han = T.toDmy(hanIso);
    tr.dataset.created = today;
    T.renderRow(tr);
    tbody.appendChild(tr);
    T.PHONES.push(phoneDigits);
    if (window.VvvTable) window.VvvTable.refresh();
    window.VvvModal.close("modalForm");
    window.VvvTxDetail.showCredential(
      name,
      T.fmtPhone(phoneDigits),
      $("txPassword").value,
      "Tài khoản đã sẵn sàng — sao chép và bàn giao cho tài xế."
    );
    T.toast("Đã tạo tài khoản cho " + name, "success");
  });
})();
