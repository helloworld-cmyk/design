"use strict";

/**
 * A8 — Drawer chi tiết khách hàng + khóa/mở khóa tài khoản và đặt lại
 * mật khẩu. Dùng VvvModal (admin/js/modal.js) và adminToast (shell).
 */

(function () {
  var KH = window.KH || {};
  var bodyEl = document.getElementById("khBody");
  if (!bodyEl || !KH.el) return;

  var drawer = document.getElementById("khDrawer");
  var dCode = document.getElementById("dCode");
  var dName = document.getElementById("khDrawerTitle");
  var dAvatar = document.getElementById("dAvatar");
  var dSub = document.getElementById("dSub");
  var dBadge = document.getElementById("dBadge");
  var dPhone = document.getElementById("dPhone");
  var dEmail = document.getElementById("dEmail");
  var dCreated = document.getElementById("dCreated");
  var dTickets = document.getElementById("dTickets");
  var dLockAlert = document.getElementById("dLockAlert");
  var dLockReason = document.getElementById("dLockReason");
  var dTicketList = document.getElementById("dTicketList");
  var dToggleLock = document.getElementById("dToggleLock");
  var dToggleLockLabel = document.getElementById("dToggleLockLabel");
  var current = null;

  function ticketNode(item) {
    var li = KH.el("li", "ticket-item");
    li.appendChild(KH.el("span", "ticket-code", item[0]));

    var person = KH.el("span", "ticket-person");
    person.appendChild(KH.el("strong", null, item[1]));
    person.appendChild(KH.el("span", null, item[2]));
    li.appendChild(person);

    var tags = KH.el("span", "ticket-tags");
    tags.appendChild(KH.el("span", "seat-chip", "Ghế " + item[3]));
    tags.appendChild(KH.el("span", KH.stateBadge(item[4]), item[4]));
    li.appendChild(tags);
    return li;
  }

  function fillDrawer(row) {
    var locked = row.getAttribute("data-status") === "locked";
    var name = row.getAttribute("data-name") || "";
    current = {
      row: row,
      id: row.getAttribute("data-id"),
      locked: locked,
      reason: row.getAttribute("data-reason") || ""
    };

    dCode.textContent = row.getAttribute("data-code");
    dName.textContent = name;
    dAvatar.textContent = KH.initials(name);
    dSub.textContent = "Tham gia " + row.getAttribute("data-created") +
      " · " + row.getAttribute("data-tickets") + " vé đã đặt";
    dBadge.className = locked
      ? "status-badge sb--orange"
      : "status-badge sb--green";
    dBadge.textContent = locked ? "Bị khóa" : "Đang hoạt động";
    dPhone.textContent = row.getAttribute("data-phone");
    dEmail.textContent = row.getAttribute("data-email");
    dCreated.textContent = row.getAttribute("data-created");
    dTickets.textContent = row.getAttribute("data-tickets");
    dToggleLockLabel.textContent = locked ? "Mở khóa" : "Khóa tài khoản";

    dLockAlert.hidden = !locked;
    if (locked) {
      dLockReason.textContent = current.reason ||
        "Khách không thể đăng nhập và đặt vé mới cho tới khi được mở khóa.";
    }

    dTicketList.textContent = "";
    (KH.HISTORY[current.id] || []).forEach(function (item) {
      dTicketList.appendChild(ticketNode(item));
    });
  }

  function openDrawer(row) {
    fillDrawer(row);
    KH.modalOpen("khDrawer");
  }

  bodyEl.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-open-customer]");
    if (trigger) {
      var row = trigger.closest("tr");
      if (row) {
        event.stopPropagation();
        openDrawer(row);
      }
      return;
    }
    var plainRow = event.target.closest("tr[data-id]");
    if (plainRow) openDrawer(plainRow);
  });

  /* ---------- Khóa / mở khóa ---------- */

  var lockForm = document.getElementById("khLockForm");
  var lockReason = document.getElementById("khLockReason");
  var lockReasonField = document.getElementById("khLockReasonField");
  var lockStatus = document.getElementById("khLockStatus");
  var lockSub = document.getElementById("khLockSub");
  var unlockSub = document.getElementById("khUnlockSub");

  function applyLockState(locked, reason) {
    if (!current) return;
    var row = current.row;
    row.setAttribute("data-status", locked ? "locked" : "active");
    if (reason) {
      row.setAttribute("data-reason", reason);
    } else {
      row.removeAttribute("data-reason");
    }
    var cell = row.querySelector('[data-label="Trạng thái"]');
    if (cell) {
      cell.innerHTML = locked
        ? KH.lockBadge("Bị khóa")
        : KH.activeBadge();
    }
    current.locked = locked;
    current.reason = reason || "";
    fillDrawer(row);
    if (KH.applyFilter) KH.applyFilter();
  }

  if (dToggleLock) {
    dToggleLock.addEventListener("click", function () {
      if (!current) return;
      var name = current.row.getAttribute("data-name");
      if (current.locked) {
        if (unlockSub) {
          unlockSub.textContent = "Mở khóa cho " + name +
            "? Khách có thể đăng nhập và đặt vé trở lại ngay sau đó.";
        }
        KH.modalOpen("khModalUnlock");
      } else {
        if (lockSub) {
          lockSub.textContent = "Khóa tài khoản " + name +
            "? Khách sẽ không thể đăng nhập và đặt vé mới; các vé đã đặt " +
            "trước đó được giữ nguyên.";
        }
        lockStatus.textContent = "";
        lockStatus.className = "form-status";
        lockReason.value = "";
        lockReasonField.classList.remove("is-invalid");
        KH.modalOpen("khModalLock");
      }
    });
  }

  if (lockReason) {
    lockReason.addEventListener("change", function () {
      lockReasonField.classList.remove("is-invalid");
    });
  }

  if (lockForm) {
    lockForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!lockReason.value) {
        lockReasonField.classList.add("is-invalid");
        lockStatus.textContent = "Chọn lý do khóa tài khoản trước khi lưu.";
        lockStatus.className = "form-status is-error";
        lockReason.focus();
        return;
      }
      var name = current ? current.row.getAttribute("data-name") : "";
      applyLockState(true, lockReason.value);
      KH.modalClose("khModalLock");
      KH.notify("Đã khóa tài khoản " + name, "success");
    });
  }

  var unlockConfirm = document.getElementById("khUnlockConfirm");
  if (unlockConfirm) {
    unlockConfirm.addEventListener("click", function () {
      var name = current ? current.row.getAttribute("data-name") : "";
      applyLockState(false, "");
      KH.modalClose("khModalUnlock");
      KH.notify("Đã mở khóa tài khoản " + name, "success");
    });
  }

  /* ---------- Đặt lại mật khẩu ---------- */

  var resetPassBtn = document.getElementById("dResetPass");
  var passConfirm = document.getElementById("khPassConfirm");
  var passStatus = document.getElementById("khPassStatus");

  if (resetPassBtn) {
    resetPassBtn.addEventListener("click", function () {
      passStatus.className = "form-status is-info";
      passStatus.textContent =
        "Nhấn “Tạo mật khẩu tạm” để sinh mật khẩu mới cho khách.";
      KH.modalOpen("khModalPass");
    });
  }

  if (passConfirm) {
    passConfirm.addEventListener("click", function () {
      var temp = "Vv" + Math.floor(100000 + Math.random() * 899999);
      var name = current ? current.row.getAttribute("data-name") : "";
      passStatus.className = "form-status is-success";
      passStatus.textContent = "Mật khẩu tạm cho " + name + ": " + temp +
        " — chỉ hiển thị một lần, hãy bàn giao ngay cho khách.";
      KH.notify("Đã đặt lại mật khẩu cho " + name, "success");
    });
  }
})();
