(function () {
  "use strict";

  /* ---------- Sidebar off-canvas (≤1080px) ---------- */
  const sidebar = document.getElementById("adminSidebar");
  const burger = document.getElementById("adminBurger");
  const scrim = document.getElementById("adminScrim");

  const isSideOpen = () =>
    !!sidebar && sidebar.classList.contains("is-open");

  const setSideOpen = (open) => {
    if (!sidebar || !burger) return;
    sidebar.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Đóng menu quản trị" : "Mở menu quản trị");
    if (scrim) scrim.hidden = !open;
  };

  if (sidebar && burger) {
    burger.addEventListener("click", () => setSideOpen(!isSideOpen()));

    if (scrim) {
      scrim.addEventListener("click", () => setSideOpen(false));
    }

    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setSideOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isSideOpen()) {
        setSideOpen(false);
        burger.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1080 && isSideOpen()) setSideOpen(false);
    });
  }

  /* ---------- Đánh dấu mục sidebar đang mở (theo pathname) ---------- */
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".admin-nav a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop();
    if (href && href === current) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });

  /* ---------- Toast dùng chung cho mọi màn admin ---------- */
  const toast = document.getElementById("adminToast");
  const toastText = toast ? toast.querySelector(".toast-text") : null;
  const toastIcon = toast ? toast.querySelector(".toast-icon use") : null;
  const ICONS = { success: "#i-check-circle", info: "#i-clock", error: "#i-alert" };
  let toastTimer = null;

  window.adminToast = (message, type) => {
    if (!toast || !toastText) return;
    const kind = ICONS[type] ? type : "success";

    toastText.textContent = message;
    toast.classList.remove("toast--success", "toast--info", "toast--error");
    toast.classList.add("toast--" + kind);
    if (toastIcon) toastIcon.setAttribute("href", ICONS[kind]);

    toast.hidden = false;
    window.requestAnimationFrame(() => toast.classList.add("is-show"));

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-show");
    }, 3400);
  };

  /* ---------- Đăng xuất (mô phỏng) ---------- */
  document.querySelectorAll("[data-admin-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      window.adminToast("Đã đăng xuất khỏi trang quản trị (mô phỏng)", "info");
    });
  });
})();
