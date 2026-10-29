(function () {
  "use strict";

  /* ---------- Hiện / ẩn mật khẩu ---------- */
  document.querySelectorAll(".field-toggle").forEach(function (toggle) {
    var input = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!input) return;
    toggle.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.classList.toggle("is-on", show);
      toggle.setAttribute("aria-pressed", String(show));
      toggle.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
    });
  });

  /* ---------- Kiểm tra & trạng thái form ---------- */
  var form = document.getElementById("authForm");
  if (!form) return;
  var status = document.getElementById("formStatus");

  var setStatus = function (message, type) {
    if (!status) return;
    status.className = "form-status" + (type ? " " + type : "");
    status.textContent = message;
  };

  var validField = function (input) {
    var value = input.value.trim();
    if (!value) return false;
    if (input.type === "email") return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    if (input.type === "tel") return value.replace(/\D/g, "").length >= 9;
    return true;
  };

  var markField = function (input, ok) {
    var wrap = input.closest(".field");
    if (wrap) wrap.classList.toggle("is-invalid", !ok);
  };

  /* Validate khi rời khỏi ô (không chờ tới lúc submit) */
  form.querySelectorAll("input[required]").forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.value.trim() || input.closest(".field.is-invalid")) {
        markField(input, validField(input));
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;
    form.querySelectorAll("input[required]").forEach(function (input) {
      var ok = validField(input);
      markField(input, ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      setStatus("Vui lòng kiểm tra lại thông tin đã nhập.", "is-error");
      firstInvalid.focus();
      return;
    }

    var submit = form.querySelector(".auth-submit");
    if (submit) submit.classList.add("is-loading");
    setStatus("Đang xử lý, vui lòng chờ...", "is-info");

    var identifier = document.getElementById("identifier");
    var user = {
      name: identifier && identifier.value ? identifier.value.trim() : "Quản trị viên"
    };
    var redirect = form.getAttribute("data-redirect") || "index.html";

    window.setTimeout(function () {
      if (submit) submit.classList.remove("is-loading");
      setStatus("Thành công! Đang chuyển hướng...", "is-success");
      try {
        window.localStorage.setItem("vvv.auth.admin", JSON.stringify(user));
      } catch (error) {
        /* chế độ riêng tư: bỏ qua, vẫn chuyển hướng */
      }
      window.setTimeout(function () {
        window.location.href = redirect;
      }, 700);
    }, 1200);
  });
})();
