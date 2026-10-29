(function () {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const scrollBehavior = prefersReduced ? "auto" : "smooth";

  /* ---------- Route cards prefill form ---------- */
  const form = document.getElementById("bookingForm");
  const originInput = document.getElementById("origin");
  const destinationInput = document.getElementById("destination");
  const formStatus = document.getElementById("formStatus");

  const setStatus = (message, type) => {
    if (!formStatus) return;
    formStatus.className = "form-status";
    formStatus.classList.add("is-" + type);
    formStatus.textContent = message;
  };

  document.querySelectorAll(".route-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!form || !originInput || !destinationInput) return;

      originInput.value = card.dataset.from || "";
      destinationInput.value = card.dataset.to || "";

      [originInput, destinationInput].forEach((input) => {
        input.removeAttribute("aria-invalid");
        const field = input.closest(".field");
        if (field) field.classList.remove("is-invalid");
      });

      setStatus(
        "Đã chọn tuyến " +
          originInput.value +
          " → " +
          destinationInput.value +
          ". Chọn ngày đi và bấm Tìm chuyến xe.",
        "info"
      );

      form.classList.remove("is-flashing");
      void form.offsetWidth;
      form.classList.add("is-flashing");
      form.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    });
  });
})();
