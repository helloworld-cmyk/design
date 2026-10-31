"use strict";

/* Chuyến của tôi — hủy vé: mở modal theo thẻ chuyến đang chọn, xác nhận
   rồi cập nhật thẻ sang trạng thái Đã hủy (mô phỏng, không gọi API). */

(function () {
  var modal = document.getElementById("cancelModal");
  if (!modal) return;

  var confirmBtn = document.getElementById("confirmCancelBtn");
  var confirmLabel = confirmBtn
    ? confirmBtn.querySelector(".btn-label")
    : null;
  var codeEl = document.getElementById("cancelCode");
  var routeEl = document.getElementById("cancelRoute");
  var lastFocus = null;
  var activeCard = null;

  function isOpen() {
    return !modal.hidden;
  }

  function openModal(card) {
    activeCard = card || null;
    fillFromTrip(card);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-card").focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    resetConfirm();
    if (lastFocus) lastFocus.focus();
    activeCard = null;
  }

  function fillFromTrip(card) {
    if (!card) return;
    var code = card.querySelector(".ride-code") ||
      card.querySelector(".ride-eyebrow");
    var label = card.getAttribute("aria-label") || "";
    if (codeEl && code) {
      codeEl.textContent = code.textContent.replace("Mã đặt chỗ", "").trim();
    }
    if (routeEl && label) {
      routeEl.textContent = label.replace(/^Chuyến\s*/, "");
    }
  }

  function resetConfirm() {
    if (!confirmBtn) return;
    confirmBtn.classList.remove("is-loading");
    confirmBtn.removeAttribute("aria-busy");
    confirmBtn.disabled = false;
    if (confirmLabel) confirmLabel.textContent = "Xác nhận hủy";
  }

  /* Nút "Hủy vé" trên mỗi thẻ chuyến sắp tới */
  document.querySelectorAll("[data-cancel-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.closest(".ride-card"));
    });
  });

  modal.addEventListener("click", function (event) {
    if (event.target.closest("[data-modal-close]")) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) closeModal();
  });

  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", function () {
    var card = activeCard;
    confirmBtn.classList.add("is-loading");
    confirmBtn.setAttribute("aria-busy", "true");
    if (confirmLabel) confirmLabel.textContent = "Đang xử lý...";

    window.setTimeout(function () {
      resetConfirm();
      closeModal();
      markCanceled(card);
    }, 900);
  });

  /* Chuyển thẻ vừa hủy sang trạng thái Đã hủy */
  function markCanceled(card) {
    if (!card) return;
    var badge = card.querySelector(".status-badge");
    if (badge) {
      badge.className = "status-badge status-badge--canceled";
      badge.innerHTML =
        '<svg class="icon" aria-hidden="true">' +
        '<use href="#i-close"></use></svg> Đã hủy';
    }

    var cancelBtn = card.querySelector("[data-cancel-open]");
    if (cancelBtn) cancelBtn.hidden = true;

    var foot = card.querySelector(".ride-foot");
    var alert = card.querySelector(".ride-alert");
    if (!alert) {
      alert = document.createElement("p");
      alert.className = "ride-alert";
      if (foot) foot.parentNode.insertBefore(alert, foot);
    }
    alert.classList.remove("ride-alert--orange");
    alert.innerHTML =
      '<svg class="icon" aria-hidden="true">' +
      '<use href="#i-close"></use></svg> ' +
      "Bạn đã hủy vé — ghế được giải phóng cho hành khách khác.";

    var priceNote = card.querySelector(".ride-price span");
    if (priceNote) priceNote.textContent = "Đã hủy · chưa thanh toán";

    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
