(function () {
  "use strict";

  /* ---------- FAQ accordion (mở một mục mỗi lần) ---------- */
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));

  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const wasOpen = trigger.getAttribute("aria-expanded") === "true";

      faqItems.forEach((other) => {
        const otherTrigger = other.querySelector(".faq-trigger");
        const otherPanel = other.querySelector(".faq-panel");
        if (!otherTrigger || !otherPanel) return;
        otherTrigger.setAttribute("aria-expanded", "false");
        otherPanel.hidden = true;
      });

      if (!wasOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });
})();
