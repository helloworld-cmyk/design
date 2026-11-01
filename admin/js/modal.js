(function () {
  "use strict";

  /* Modal chung: mở/đóng qua data-attribute, focus trap, Esc, scrim */

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"])';

  let lastTrigger = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastTrigger = document.activeElement;
    modal.classList.add("is-open");
    document.body.classList.add("admin-modal-open");
    const first = modal.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    if (!document.querySelector(".modal.is-open")) {
      document.body.classList.remove("admin-modal-open");
    }
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    document.dispatchEvent(
      new CustomEvent("vvv:modal-close", { detail: { id: modal.id } })
    );
  }

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-modal-open]");
    if (opener) {
      openModal(opener.getAttribute("data-modal-open"));
      return;
    }
    const closer = e.target.closest("[data-modal-close]");
    if (closer) {
      closeModal(closer.closest(".modal"));
      return;
    }
    if (e.target.classList.contains("modal-scrim")) {
      closeModal(e.target.closest(".modal"));
    }
  });

  document.addEventListener("keydown", (e) => {
    const opens = document.querySelectorAll(".modal.is-open");
    const modal = opens[opens.length - 1];
    if (!modal) return;
    if (e.key === "Escape") {
      closeModal(modal);
      return;
    }
    if (e.key !== "Tab") return;
    const items = Array.from(modal.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.VvvModal = {
    open: openModal,
    close: (id) => closeModal(document.getElementById(id)),
  };
})();
