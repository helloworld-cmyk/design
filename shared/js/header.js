(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header ---------- */
  const header = document.getElementById("siteHeader");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  const isNavOpen = () =>
    !!navToggle && navToggle.getAttribute("aria-expanded") === "true";

  const setNavOpen = (open) => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    navToggle.classList.toggle("is-open", open);
    mobileNav.hidden = !open;
    if (header) header.classList.toggle("nav-open", open);
  };

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => setNavOpen(!isNavOpen()));

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isNavOpen()) {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!isNavOpen()) return;
      if (header && !header.contains(event.target)) setNavOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && isNavOpen()) setNavOpen(false);
    });
  }
})();
