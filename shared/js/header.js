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

  /* ---------- User menu (phiên đăng nhập mô phỏng) ---------- */

  const USER_KEY = "vvv.auth.user";

  const readUser = () => {
    try {
      return JSON.parse(window.localStorage.getItem(USER_KEY));
    } catch (error) {
      return null;
    }
  };

  const userMenu = document.getElementById("userMenu");
  const userMenuBtn = document.getElementById("userMenuBtn");
  const user = readUser();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  if (header && userMenu && user) {
    const source = user.name || user.email || user.phone || "";
    const first = source.trim().charAt(0);
    const isLetter = /[A-Za-zÀ-ỹ]/.test(first);
    const initial = isLetter ? first.toUpperCase() : "";
    const displayName = user.name || "Khách hàng";
    document.querySelectorAll(".user-avatar").forEach((avatar) => {
      avatar.classList.toggle("is-initial-icon", !isLetter);
    });
    setText("userInitial", initial);
    setText("userInitialLg", initial);
    setText("userName", displayName);
    setText("userMenuLabel", displayName);
    setText("userContact", user.email || user.phone || "Thành viên Vi Vu Việt");
    header.classList.add("is-authed");
  }

  if (userMenu && userMenuBtn) {
    const hoverCapable =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const isOpen = () => userMenu.classList.contains("is-open");

    const toggleMenu = (open) => {
      userMenu.classList.toggle("is-open", open);
      userMenuBtn.setAttribute("aria-expanded", String(open));
    };

    const closeMenu = () => toggleMenu(false);

    if (hoverCapable) {
      userMenu.addEventListener("mouseenter", () => toggleMenu(true));
      userMenu.addEventListener("mouseleave", closeMenu);
    }

    userMenuBtn.addEventListener("click", () => {
      if (hoverCapable) toggleMenu(true);
      else toggleMenu(!isOpen());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        closeMenu();
        userMenuBtn.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (isOpen() && !userMenu.contains(event.target)) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth <= 900) closeMenu();
    });
  }

  document.querySelectorAll("[data-user-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        window.localStorage.removeItem(USER_KEY);
      } catch (error) {
        /* chế độ riêng tư: bỏ qua */
      }
      const brand = document.querySelector(".brand");
      const home = brand ? brand.getAttribute("href") : "";
      if (!home || home === "#") window.location.reload();
      else window.location.href = home;
    });
  });
})();
