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

  /* ---------- Độ mạnh mật khẩu (đăng ký) ---------- */
  var password = document.getElementById("password");
  var strength = document.querySelector(".auth-strength");
  if (password && strength) {
    var strengthLabel = strength.querySelector(".auth-strength-label");
    var defaultLabel = strengthLabel ? strengthLabel.textContent : "";
    password.addEventListener("input", function () {
      var value = password.value;
      var score = 0;
      if (value.length >= 8) score += 1;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
      if (/\d/.test(value)) score += 1;
      if (/[^A-Za-z0-9]/.test(value)) score += 1;

      strength.classList.remove("is-weak", "is-medium", "is-strong");
      if (!value) {
        if (strengthLabel) strengthLabel.textContent = defaultLabel;
        return;
      }
      var level = score <= 1 ? "is-weak" : score === 2 ? "is-medium" : "is-strong";
      strength.classList.add(level);
      if (strengthLabel) {
        strengthLabel.textContent =
          score <= 1 ? "Yếu" : score === 2 ? "Trung bình" : "Mạnh";
      }
    });
  }

  /* ---------- Kiểm tra & trạng thái form ---------- */
  var form = document.getElementById("authForm");
  if (!form) return;
  var status = document.getElementById("formStatus");

  var setStatus = function (message, type) {
    if (!status) return;
    status.className = "form-status" + (type ? " " + type : "");
    status.textContent = message;
  };

  /* Quay lại màn đặt vé sau khi đăng nhập (?next=<màn>.html) */
  var nextParam = null;
  try {
    var nextValue = new URLSearchParams(window.location.search).get("next");
    if (nextValue && /^[a-z0-9-]+\.html$/.test(nextValue)) nextParam = nextValue;
  } catch (error) {
    nextParam = null;
  }
  if (nextParam) {
    setStatus("Đăng nhập để tiếp tục đặt vé của bạn.", "is-info");
  }

  var validField = function (input) {
    if (input.type === "checkbox") return input.checked;
    var value = input.value.trim();
    if (!value) return false;
    if (input.type === "email") return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    if (input.type === "tel") return value.replace(/\D/g, "").length >= 9;
    return true;
  };

  var markField = function (input, ok) {
    var wrap = input.closest(input.type === "checkbox" ? ".auth-check" : ".field");
    if (wrap) wrap.classList.toggle("is-invalid", !ok);
  };

  /* Validate khi rời khỏi ô (không chờ tới lúc submit) */
  form.querySelectorAll("input[required]").forEach(function (input) {
    if (input.type === "checkbox") return;
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

    var confirm = document.getElementById("confirm");
    if (confirm && password && confirm.value && confirm.value !== password.value) {
      markField(confirm, false);
      setStatus("Mật khẩu xác nhận không khớp.", "is-error");
      confirm.focus();
      return;
    }

    if (firstInvalid) {
      setStatus("Vui lòng kiểm tra lại thông tin đã nhập.", "is-error");
      firstInvalid.focus();
      return;
    }

    var submit = form.querySelector(".auth-submit");
    if (submit) submit.classList.add("is-loading");
    setStatus("Đang xử lý, vui lòng chờ...", "is-info");

    var fieldValue = function (id) {
      var el = document.getElementById(id);
      return el && el.value ? el.value.trim() : "";
    };
    var fullname = fieldValue("fullname");
    var identifier = fieldValue("identifier");
    var email = fieldValue("email");
    var phone = fieldValue("phone");
    var isEmail = identifier.indexOf("@") > -1;
    var user = {
      name: fullname || identifier || "Khách hàng",
      email: email || (isEmail ? identifier : ""),
      phone: phone || (!isEmail ? identifier : "")
    };
    var redirect = nextParam || form.getAttribute("data-redirect") || "index.html";

    window.setTimeout(function () {
      if (submit) submit.classList.remove("is-loading");
      setStatus("Thành công! Đang chuyển hướng...", "is-success");
      try {
        window.localStorage.setItem("vvv.auth.user", JSON.stringify(user));
      } catch (error) {
        /* chế độ riêng tư: bỏ qua, vẫn chuyển hướng */
      }
      window.setTimeout(function () {
        window.location.href = redirect;
      }, 700);
    }, 1200);
  });
})();
