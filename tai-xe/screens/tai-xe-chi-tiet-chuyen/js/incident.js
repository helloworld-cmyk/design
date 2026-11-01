(function () {
  "use strict";

  var modal = document.getElementById("tcdIncidentModal");
  var openBtn = document.getElementById("tcdIncidentBtn");
  var form = document.getElementById("tcdIncidentForm");
  var status = document.getElementById("tcdIncidentStatus");
  var typeSelect = document.getElementById("incidentType");
  var noteField = document.getElementById("incidentNote");

  if (!modal || !openBtn) return;

  var lastFocused = null;

  var setStatus = function (kind, text) {
    if (!status) return;
    status.className = "form-status " + (kind || "");
    status.textContent = text || "";
  };

  var open = function () {
    lastFocused = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tcd-modal-open");
    /* Focus vào control đầu tiên */
    window.setTimeout(function () {
      if (typeSelect) typeSelect.focus();
    }, 40);
  };

  var close = function () {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tcd-modal-open");
    setStatus("", "");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  /* Mở / đóng */
  openBtn.addEventListener("click", open);
  modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", close);
  });

  /* Phím tắt: Esc đóng, Tab bẫy focus trong dialog */
  document.addEventListener("keydown", function (event) {
    if (modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    var focusables = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Validate + submit */
  var markInvalid = function (el, ok) {
    if (!el) return;
    var wrap = el.closest(".field");
    if (wrap) wrap.classList.toggle("is-invalid", !ok);
    el.classList.toggle("is-invalid", !ok);
  };

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var typeOk = typeSelect && typeSelect.value !== "";
      var noteOk =
        noteField && noteField.value.trim().length >= 4;

      markInvalid(typeSelect, typeOk);
      markInvalid(noteField, noteOk);

      if (!typeOk || !noteOk) {
        setStatus("is-error", "Vui lòng chọn loại sự cố và mô tả ngắn.");
        if (!typeOk && typeSelect) typeSelect.focus();
        else if (noteField) noteField.focus();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.disabled = true;
      }
      setStatus("is-info", "Đang gửi báo cáo...");

      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove("is-loading");
          submitBtn.disabled = false;
        }
        setStatus("is-success", "Đã gửi báo cáo — admin sẽ liên hệ.");

        /* Đẩy thông tin ra ngoài banner trang */
        if (
          window.TCD &&
          typeof window.TCD.showIncidentBanner === "function"
        ) {
          window.TCD.showIncidentBanner(noteField.value.trim());
        }

        window.setTimeout(function () {
          close();
          form.reset();
          modal
            .querySelectorAll(".is-invalid")
            .forEach(function (el) { el.classList.remove("is-invalid"); });
        }, 800);
      }, 1000);
    });
  }

  /* Blur validate nhẹ cho textarea */
  if (noteField) {
    noteField.addEventListener("blur", function () {
      var ok = noteField.value.trim().length >= 4;
      if (noteField.value.trim().length > 0) {
        markInvalid(noteField, ok);
      }
    });
  }
})();
