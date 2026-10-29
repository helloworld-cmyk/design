(function () {
  "use strict";

  /* ---------- Hồ sơ cá nhân: lưu / hoàn tác / ảnh đại diện ---------- */
  const form = document.getElementById("profileForm");
  const statusBox = document.getElementById("profileStatus");
  const saveBtn = document.getElementById("saveProfileBtn");
  const resetBtn = document.getElementById("resetProfileBtn");
  const avatarBtn = document.getElementById("avatarBtn");
  const avatarInput = document.getElementById("avatarInput");
  const avatarImg = document.getElementById("avatarImg");

  if (!form || !saveBtn) return;

  const editable = Array.from(
    form.querySelectorAll("input:not([readonly]), select, textarea")
  );
  const snapshot = () =>
    JSON.stringify(
      editable.map((el) => el.value)
    );

  let saved = snapshot();

  const setStatus = (message, type) => {
    if (!statusBox) return;
    statusBox.className = "form-status";
    if (!message) {
      statusBox.textContent = "";
      return;
    }
    statusBox.classList.add("is-" + type);
    statusBox.textContent = message;
  };

  const setDirty = (dirty) => {
    saveBtn.disabled = !dirty;
  };

  const clearInvalid = (input) => {
    input.removeAttribute("aria-invalid");
    const field = input.closest(".field");
    if (field) field.classList.remove("is-invalid");
  };

  const markInvalid = (input) => {
    input.setAttribute("aria-invalid", "true");
    const field = input.closest(".field");
    if (field) field.classList.add("is-invalid");
  };

  const VALIDATORS = {
    fullName: (value) => {
      if (!value.trim()) return "Vui lòng nhập họ và tên.";
      if (value.trim().length < 2) return "Họ và tên tối thiểu 2 ký tự.";
      return null;
    },
    email: (value) => {
      if (!value.trim()) return "Vui lòng nhập email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
        return "Email chưa đúng định dạng, ví dụ ten@gmail.com.";
      }
      return null;
    },
  };

  const validateField = (input) => {
    const check = VALIDATORS[input.name];
    if (!check) return true;
    const message = check(input.value);
    if (message) {
      markInvalid(input);
      setStatus(message, "error");
      return false;
    }
    clearInvalid(input);
    return true;
  };

  editable.forEach((input) => {
    input.addEventListener("input", () => {
      clearInvalid(input);
      setDirty(snapshot() !== saved);
      if (statusBox && statusBox.classList.contains("is-error")) {
        setStatus("", null);
      }
    });
    input.addEventListener("blur", () => validateField(input));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstInvalid = editable.find((input) => !validateField(input));
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setStatus("", null);
    saveBtn.classList.add("is-loading");
    saveBtn.setAttribute("aria-busy", "true");
    const label = saveBtn.querySelector(".btn-label");
    if (label) label.textContent = "Đang lưu...";

    window.setTimeout(() => {
      saveBtn.classList.remove("is-loading");
      saveBtn.removeAttribute("aria-busy");
      if (label) label.textContent = "Lưu thay đổi";

      saved = snapshot();
      setDirty(false);
      setStatus(
        "Đã lưu hồ sơ của bạn. Thông tin mới sẽ áp dụng cho các chuyến đi sau.",
        "success"
      );
      const panel = form.querySelector(".profile-panel");
      if (panel) {
        panel.classList.add("is-flashing");
        window.setTimeout(
          () => panel.classList.remove("is-flashing"),
          1200
        );
      }
    }, 900);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const values = JSON.parse(saved);
      editable.forEach((input, index) => {
        input.value = values[index];
        clearInvalid(input);
      });
      setDirty(false);
      setStatus("Đã hoàn tác về thông tin đã lưu gần nhất.", "info");
    });
  }

  /* ---------- Ảnh đại diện ---------- */
  if (avatarBtn && avatarInput && avatarImg) {
    avatarBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        setStatus("Vui lòng chọn tệp ảnh (JPG, PNG...).", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        avatarImg.src = String(reader.result);
        setDirty(true);
        setStatus(
          "Ảnh đại diện đã cập nhật. Nhấn “Lưu thay đổi” để hoàn tất.",
          "info"
        );
      };
      reader.readAsDataURL(file);
    });
  }
})();
