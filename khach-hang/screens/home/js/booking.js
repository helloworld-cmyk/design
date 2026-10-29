(function () {
  "use strict";

  /* ---------- Booking form ---------- */
  const form = document.getElementById("bookingForm");
  const originInput = document.getElementById("origin");
  const destinationInput = document.getElementById("destination");
  const dateInput = document.getElementById("travelDate");
  const seatsSelect = document.getElementById("seats");
  const swapBtn = document.getElementById("swapBtn");
  const searchBtn = document.getElementById("searchBtn");
  const formStatus = document.getElementById("formStatus");

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  };

  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    dateInput.min = toISODate(today);
    if (!dateInput.value) dateInput.value = toISODate(tomorrow);
  }

  const setStatus = (message, type) => {
    if (!formStatus) return;
    formStatus.className = "form-status";
    if (!message) {
      formStatus.textContent = "";
      return;
    }
    formStatus.classList.add("is-" + type);
    formStatus.textContent = message;
  };

  const clearInvalid = (input) => {
    if (!input) return;
    input.removeAttribute("aria-invalid");
    const field = input.closest(".field");
    if (field) field.classList.remove("is-invalid");
  };

  const markInvalid = (input) => {
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    const field = input.closest(".field");
    if (field) field.classList.add("is-invalid");
  };

  const validate = () => {
    if (!originInput || !destinationInput || !dateInput) return null;

    const from = originInput.value.trim();
    const to = destinationInput.value.trim();

    [originInput, destinationInput, dateInput].forEach(clearInvalid);

    if (!from) return { input: originInput, message: "Vui lòng nhập điểm đi." };
    if (!to) {
      return { input: destinationInput, message: "Vui lòng nhập điểm đến." };
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      return {
        input: destinationInput,
        message: "Điểm đi và điểm đến cần khác nhau.",
      };
    }
    if (!dateInput.value) {
      return { input: dateInput, message: "Vui lòng chọn ngày đi." };
    }

    const selected = new Date(dateInput.value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selected.getTime()) || selected < today) {
      return {
        input: dateInput,
        message: "Ngày đi không hợp lệ. Vui lòng chọn từ hôm nay.",
      };
    }
    return null;
  };

  if (form && originInput && destinationInput && dateInput) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const error = validate();
      if (error) {
        markInvalid(error.input);
        setStatus(error.message, "error");
        error.input.focus();
        return;
      }

      const from = originInput.value.trim();
      const to = destinationInput.value.trim();
      const dateLabel = new Date(
        dateInput.value + "T00:00:00"
      ).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const seats = seatsSelect ? seatsSelect.value : "1";

      setStatus("", null);

      if (searchBtn) {
        searchBtn.classList.add("is-loading");
        searchBtn.setAttribute("aria-busy", "true");
        searchBtn.disabled = true;
        const label = searchBtn.querySelector(".btn-label");
        if (label) label.textContent = "Đang tìm chuyến...";
      }

      window.setTimeout(() => {
        if (searchBtn) {
          searchBtn.classList.remove("is-loading");
          searchBtn.removeAttribute("aria-busy");
          searchBtn.disabled = false;
          const label = searchBtn.querySelector(".btn-label");
          if (label) label.textContent = "Tìm chuyến xe";
        }
        setStatus(
          "Đã tìm thấy 12 chuyến " +
            from +
            " → " +
            to +
            " vào " +
            dateLabel +
            " cho " +
            seats +
            " ghế. Vi Vu Việt sẽ liên hệ xác nhận trong 5 phút.",
          "success"
        );
      }, 950);
    });

    [originInput, destinationInput, dateInput].forEach((input) => {
      input.addEventListener("input", () => {
        clearInvalid(input);
        if (formStatus && formStatus.classList.contains("is-error")) {
          setStatus("", null);
        }
      });
    });
  }

  /* ---------- Swap origin/destination ---------- */
  if (swapBtn && originInput && destinationInput) {
    swapBtn.addEventListener("click", () => {
      const originValue = originInput.value;
      originInput.value = destinationInput.value;
      destinationInput.value = originValue;

      clearInvalid(originInput);
      clearInvalid(destinationInput);

      swapBtn.classList.add("is-swapping");
      window.setTimeout(() => swapBtn.classList.remove("is-swapping"), 320);

      const from = originInput.value.trim() || "điểm đi";
      const to = destinationInput.value.trim() || "điểm đến";
      setStatus("Đã đổi chiều: " + from + " → " + to + ".", "info");
    });
  }
})();
