(() => {
  "use strict";

  const api = window.VvvOrders;
  if (!api) return;

  const { setText, setBadge, toast } = api;
  const drawer = document.getElementById("orderDrawer");
  const modal = document.getElementById("cancelModal");
  const scrim = document.getElementById("panelScrim");
  const dCancel = document.getElementById("dCancel");
  const dPaid = document.getElementById("dPaid");
  const reasonField = document.getElementById("mReasonField");
  const reasonSelect = document.getElementById("mReason");
  const mStatus = document.getElementById("mStatus");

  const BADGE_VE = {
    "Đã đặt": "sb--sky",
    "Đã đón": "sb--orange",
    "Hoàn thành": "sb--green",
    "Không lên xe": "sb--slate",
    "Đã hủy": "sb--red",
  };
  const BADGE_PAY = { "Chưa thu": "sb--orange", "Đã thu": "sb--green" };

  let currentRow = null;
  let lastFocus = null;

  const addMinutes = (time, minutes) => {
    const parts = String(time).split(":").map(Number);
    const total = (parts[0] * 60 + parts[1] + minutes) % (24 * 60);
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return hh + ":" + mm;
  };

  /* ---------- Mở / đóng panel ---------- */
  const panels = () => [drawer, modal].filter(Boolean);
  const anyPanelOpen = () => panels().some((el) => el.classList.contains("is-open"));

  const openPanel = (panelEl) => {
    if (!panelEl) return;
    lastFocus = document.activeElement;
    if (scrim) scrim.hidden = false;
    panelEl.hidden = false;
    window.requestAnimationFrame(() => panelEl.classList.add("is-open"));
    const focusTarget = panelEl.querySelector(".panel-close");
    if (focusTarget) focusTarget.focus();
  };

  const closePanel = (panelEl) => {
    if (!panelEl) return;
    panelEl.classList.remove("is-open");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      panelEl.hidden = true;
    }, reduced ? 0 : 280);
    if (scrim && !anyPanelOpen()) scrim.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };

  /* ---------- Timeline lịch sử trạng thái ---------- */
  const buildTimeline = (row) => {
    const list = document.getElementById("dTimeline");
    if (!list) return;
    const status = row.dataset.ttve;
    const dat = row.dataset.dat;
    const donTime = row.dataset.ngay + " " + addMinutes(row.dataset.gio, 4);
    const doneTime = row.dataset.ngay + " " + addMinutes(row.dataset.gio, 100);
    const steps = [
      { label: "Đặt vé online", time: dat, state: "done" },
      { label: "Xác nhận đơn", time: dat, state: "done" },
    ];

    if (status === "Đã đặt") {
      steps.push({ label: "Đã đón", time: "", state: "wait" });
      steps.push({ label: "Hoàn thành", time: "", state: "wait" });
    } else if (status === "Đã đón") {
      steps.push({ label: "Đã đón", time: donTime, state: "done" });
      steps.push({ label: "Hoàn thành", time: "", state: "wait" });
    } else if (status === "Hoàn thành") {
      steps.push({ label: "Đã đón", time: donTime, state: "done" });
      steps.push({ label: "Hoàn thành", time: doneTime, state: "done" });
    } else if (status === "Không lên xe") {
      steps.push({
        label: "Không lên xe",
        time: row.dataset.ngay + " " + addMinutes(row.dataset.gio, 25),
        state: "miss",
      });
    } else {
      steps.push({ label: "Hủy vé (quá hạn tự hủy)", time: dat, state: "cancel" });
    }

    list.innerHTML = steps
      .map((step) => {
        const time = step.time ? '<span class="tl-time">' + step.time + "</span>" : "";
        return (
          '<li class="tl-item is-' + step.state + '">' +
          '<span class="tl-dot" aria-hidden="true"></span>' +
          '<div><span class="tl-label">' + step.label + "</span>" + time + "</div></li>"
        );
      })
      .join("");
  };

  /* ---------- Drawer chi tiết ---------- */
  const openDrawer = (row) => {
    if (!drawer) return;
    currentRow = row;
    setText("dTitle", row.dataset.ve);
    setBadge("dVeBadge", row.dataset.ttve, BADGE_VE);
    setBadge("dPayBadge", row.dataset.tttt, BADGE_PAY);
    setText("dKhach", row.dataset.khach);
    setText("dSdt", row.dataset.sdt);
    setText("dChuyen", row.dataset.chuyen);
    setText("dTuyen", row.dataset.tuyen);
    setText("dNgay", row.dataset.ngay + " · " + row.dataset.gio);
    setText("dTaixe", row.dataset.taixe);
    setText("dXe", row.dataset.xe);
    setText("dGhe", row.dataset.ghe);
    setText("dDon", row.dataset.don);
    setText("dTra", row.dataset.tra);
    setText("dTien", row.dataset.tien);
    buildTimeline(row);

    const canCancel = row.dataset.ttve === "Đã đặt";
    const canPay =
      row.dataset.tttt === "Chưa thu" &&
      (row.dataset.ttve === "Đã đón" || row.dataset.ttve === "Hoàn thành");
    if (dCancel) dCancel.hidden = !canCancel;
    if (dPaid) dPaid.hidden = !canPay;
    setText(
      "dPayNote",
      row.dataset.ttve === "Đã hủy"
        ? "Vé đã hủy nên không phát sinh khoản thu hay hoàn tiền."
        : "Tiền mặt do tài xế ghi nhận khi khách lên xe (D4). Admin theo dõi và " +
          "chỉnh khi cần đối soát — không có hoàn tiền."
    );

    openPanel(drawer);
  };

  /* ---------- Modal hủy vé ---------- */
  const openModal = () => {
    if (!modal || !currentRow) return;
    setText("mTitle", "Hủy vé " + currentRow.dataset.ve);
    if (reasonSelect) reasonSelect.value = "";
    const note = document.getElementById("mNote");
    if (note) note.value = "";
    if (reasonField) reasonField.classList.remove("is-invalid");
    if (mStatus) {
      mStatus.className = "form-status";
      mStatus.textContent = "";
    }
    openPanel(modal);
  };

  const confirmCancel = () => {
    if (!currentRow || !reasonSelect) return;
    if (!reasonSelect.value) {
      if (reasonField) reasonField.classList.add("is-invalid");
      if (mStatus) {
        mStatus.className = "form-status is-error";
        mStatus.textContent = "Vui lòng chọn lý do hủy vé trước khi xác nhận.";
      }
      reasonSelect.focus();
      return;
    }

    const row = currentRow;
    row.dataset.ttve = "Đã hủy";
    const badge = row.querySelector('td[data-label="Vé"] .status-badge');
    if (badge) {
      badge.textContent = "Đã hủy";
      badge.className = "status-badge sb--red";
    }
    api.updateCounts();
    api.updateStats();
    closePanel(modal);
    closePanel(drawer);
    api.render();
    toast("Đã hủy vé " + row.dataset.ve + " · ghế trả về chuyến", "success");
  };

  const markPaid = () => {
    if (!currentRow) return;
    const row = currentRow;
    row.dataset.tttt = "Đã thu";
    const badge = row.querySelector('td[data-label="Thanh toán"] .status-badge');
    if (badge) {
      badge.textContent = "Đã thu";
      badge.className = "status-badge sb--green";
    }
    setBadge("dPayBadge", "Đã thu", BADGE_PAY);
    if (dPaid) dPaid.hidden = true;
    api.updateStats();
    api.render();
    toast("Đã ghi nhận thu tiền vé " + row.dataset.ve, "success");
  };

  /* ---------- Sự kiện ---------- */
  document.querySelectorAll(".js-drawer-close").forEach((el) => {
    el.addEventListener("click", () => closePanel(drawer));
  });

  document.querySelectorAll(".js-modal-close").forEach((el) => {
    el.addEventListener("click", () => closePanel(modal));
  });

  if (scrim) {
    scrim.addEventListener("click", () => {
      if (modal && modal.classList.contains("is-open")) closePanel(modal);
      if (drawer && drawer.classList.contains("is-open")) closePanel(drawer);
    });
  }

  if (dCancel) dCancel.addEventListener("click", openModal);
  if (dPaid) dPaid.addEventListener("click", markPaid);

  const mConfirm = document.getElementById("mConfirm");
  if (mConfirm) mConfirm.addEventListener("click", confirmCancel);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modal && modal.classList.contains("is-open")) closePanel(modal);
    else if (drawer && drawer.classList.contains("is-open")) closePanel(drawer);
  });

  /* ---------- API cho orders.js ---------- */
  window.VvvOrdersPanels = { open: openDrawer };
})();