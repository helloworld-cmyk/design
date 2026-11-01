(function () {
  "use strict";

  /* Màn A3 — modal chi tiết tài xế, xác nhận khóa/đặt lại MK, cấp thông tin đăng nhập */

  if (!window.VvvTx) return;
  const T = window.VvvTx;
  const $ = (id) => document.getElementById(id);

  let pendingConfirm = null;
  let credText = "";

  /* ---------- Modal chi tiết ---------- */

  function openDetail(row) {
    T.state.currentRow = row;
    const d = row.dataset;
    const av = $("txDetailAvatar");
    av.className = "tx-avatar tx-avatar--" + (d.tint || "sky");
    av.textContent = T.initials(d.name);
    $("txDetailTitle").textContent = d.name;
    const badge = $("txDetailStatus");
    const locked = d.status === "locked";
    badge.className =
      "status-badge " + (locked ? "status-badge--red" : "status-badge--green");
    badge.innerHTML =
      '<span class="status-dot" aria-hidden="true"></span>' +
      (locked ? "Bị khóa" : "Đang hoạt động");
    $("txDetailPhone").textContent = d.phone;
    $("txDetailEmail").textContent = d.email || "—";
    $("txDetailGplx").textContent = d.hang + " · " + d.gplx;
    $("txDetailHan").textContent = d.han;
    const left = T.daysLeft(d.han);
    const warn = $("txDetailHanWarn");
    warn.hidden = !(left >= 0 && left <= 45);
    warn.textContent = "Còn " + Math.max(left, 0) + " ngày";
    $("txDetailTrips").textContent = d.trips;
    $("txDetailCreated").textContent = d.created;
    $("txDetailLockBtn").textContent = locked ? "Mở khóa" : "Khóa tài khoản";

    const trips = T.TRIPS[d.id] || [];
    $("txTripList").innerHTML = trips
      .map(([code, route, date, st]) => {
        const [label, cls] = T.TRIP_BADGE[st] || T.TRIP_BADGE.upcoming;
        return (
          '<li class="trip-item"><div>' +
          '<strong class="trip-code">' + T.esc(code) + "</strong>" +
          '<span class="trip-route">' + T.esc(route) + "</span></div>" +
          '<div class="trip-meta"><span>' + T.esc(date) + "</span>" +
          '<span class="status-badge ' + cls + '">' + label +
          "</span></div></li>"
        );
      })
      .join("");
    $("txTripEmpty").hidden = trips.length > 0;
    window.VvvModal.open("modalDetail");
  }

  /* ---------- Thông tin đăng nhập cấp một lần ---------- */

  function showCredential(name, login, password, sub) {
    $("txCredName").textContent = name;
    $("txCredLogin").textContent = login;
    $("txCredPassword").textContent = password;
    $("txCredSub").textContent = sub;
    credText =
      "Tài xế: " + name + "\nTên đăng nhập: " + login +
      "\nMật khẩu tạm: " + password;
    window.VvvModal.open("modalCredential");
  }

  /* ---------- Xác nhận khóa / mở khóa / đặt lại MK ---------- */

  function openConfirm(type, row) {
    T.state.currentRow = row;
    pendingConfirm = type;
    const d = row.dataset;
    const submit = $("txConfirmSubmit");
    $("txConfirmNote").value = "";
    submit.className = "btn " + (type === "lock" ? "btn-accent" : "btn-primary");
    if (type === "lock") {
      $("txConfirmTitle").textContent = "Khóa tài khoản tài xế?";
      $("txConfirmDesc").textContent =
        d.name + " sẽ không thể được phân công chuyến mới. " +
        "Các chuyến đã phân công gần đây không thay đổi.";
      submit.textContent = "Khóa tài khoản";
    } else if (type === "unlock") {
      $("txConfirmTitle").textContent = "Mở khóa tài khoản?";
      $("txConfirmDesc").textContent =
        d.name + " sẽ hoạt động trở lại và có thể được phân công chuyến.";
      submit.textContent = "Mở khóa";
    } else {
      $("txConfirmTitle").textContent = "Đặt lại mật khẩu?";
      $("txConfirmDesc").textContent =
        "Mật khẩu tạm mới của " + d.name +
        " sẽ hiển thị một lần để bàn giao lại.";
      submit.textContent = "Đặt lại mật khẩu";
    }
    window.VvvModal.open("modalConfirm");
  }

  $("txConfirmSubmit").addEventListener("click", () => {
    const row = T.state.currentRow;
    if (!pendingConfirm || !row) return;
    const d = row.dataset;
    if (pendingConfirm === "lock" || pendingConfirm === "unlock") {
      const locked = pendingConfirm === "lock";
      d.status = locked ? "locked" : "active";
      T.renderRow(row);
      window.VvvModal.close("modalConfirm");
      T.toast(
        (locked ? "Đã khóa tài khoản của " : "Đã mở khóa tài khoản của ") +
          d.name,
        "info"
      );
    } else {
      const pw = T.genPassword();
      window.VvvModal.close("modalConfirm");
      showCredential(
        d.name,
        d.phone,
        pw,
        "Bàn giao mật khẩu tạm mới cho tài xế — chỉ hiển thị một lần."
      );
      T.toast("Đã đặt lại mật khẩu cho " + d.name, "success");
    }
    pendingConfirm = null;
  });

  /* ---------- Sao chép thông tin đăng nhập ---------- */

  const copyBtn = document.querySelector("[data-tx-copy]");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const done = () => T.toast("Đã sao chép thông tin đăng nhập", "success");
      const fail = () =>
        T.toast("Không sao chép tự động được — hãy copy thủ công.", "error");
      const fallback = () => {
        try {
          const ta = document.createElement("textarea");
          ta.value = credText;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand("copy");
          ta.remove();
          if (ok) done();
          else fail();
        } catch (err) {
          fail();
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(credText).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  window.VvvTxDetail = { openDetail, openConfirm, showCredential };
})();
