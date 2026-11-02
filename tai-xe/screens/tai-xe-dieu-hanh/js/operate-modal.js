(function () {
  "use strict";

  var modal = document.getElementById("tdhConfirmModal");
  var modalText = document.getElementById("tdhConfirmText");
  var modalOk = document.getElementById("tdhConfirmOk");

  var pendingApply = null;
  var lastFocus = null;

  var close = function () {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tdh-modal-open");
    pendingApply = null;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  };

  var open = function (html, onConfirm, trigger) {
    if (!modal) {
      onConfirm();
      return;
    }
    pendingApply = onConfirm;
    lastFocus = trigger || document.activeElement;
    modalText.innerHTML = html;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tdh-modal-open");
    modalOk.focus();
  };

  if (modal) {
    modalOk.addEventListener("click", function () {
      var fn = pendingApply;
      close();
      if (fn) fn();
    });

    modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }

  window.tdhConfirm = { open: open, close: close };
})();
