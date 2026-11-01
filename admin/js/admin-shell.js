(function () {
  "use strict";

  var USER_KEY = "vvv.auth.admin";

  /* ---------- Sidebar drawer (adm, <=1024px) ---------- */
  var root = document.getElementById("admShell");
  var burger = document.getElementById("admBurger");
  var side = document.getElementById("admSide");
  var scrim = document.getElementById("admScrim");

  function isSideOpen() {
    return !!root && root.classList.contains("is-side-open");
  }

  function setSideOpen(open) {
    if (!root) return;
    root.classList.toggle("is-side-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute(
        "aria-label",
        open ? "Đóng menu quản trị" : "Mở menu quản trị"
      );
    }
    if (scrim) scrim.hidden = !open;
  }

  if (burger && side) {
    burger.addEventListener("click", function () {
      setSideOpen(!isSideOpen());
    });

    if (scrim) {
      scrim.addEventListener("click", function () {
        setSideOpen(false);
        if (burger) burger.focus();
      });
    }

    side.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setSideOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isSideOpen()) {
        setSideOpen(false);
        if (burger) burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && isSideOpen()) setSideOpen(false);
    });
  }

  /* ---------- Active nav item (theo pathname) ---------- */
  var current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".adm-nav-item").forEach(function (link) {
    var href = (link.getAttribute("href") || "").split("/").pop();
    if (href && href === current) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });

  /* ---------- User dropdown ---------- */
  var userMenu = document.getElementById("admUser");
  var userBtn = document.getElementById("admUserBtn");

  function isUserOpen() {
    return !!userMenu && userMenu.classList.contains("is-open");
  }

  function setUserOpen(open) {
    if (!userMenu || !userBtn) return;
    userMenu.classList.toggle("is-open", open);
    userBtn.setAttribute("aria-expanded", String(open));
  }

  if (userMenu && userBtn) {
    userBtn.addEventListener("click", function () {
      setUserOpen(!isUserOpen());
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isUserOpen()) {
        setUserOpen(false);
        userBtn.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (isUserOpen() && !userMenu.contains(event.target)) setUserOpen(false);
    });
  }

  /* ---------- Đăng xuất ---------- */
  document.querySelectorAll("[data-adm-logout]").forEach(function (button) {
    button.addEventListener("click", function () {
      try {
        window.localStorage.removeItem(USER_KEY);
      } catch (error) {
        /* chế độ riêng tư: bỏ qua */
      }
      window.location.href = "index.html";
    });
  });

  /* ---------- Cá nhân hoá theo phiên đăng nhập ---------- */
  function readUser() {
    try {
      return JSON.parse(window.localStorage.getItem(USER_KEY));
    } catch (error) {
      return null;
    }
  }

  var user = readUser();
  if (user) {
    var source = user.name || user.email || user.phone || "";
    var initial = source.trim().charAt(0).toUpperCase();
    document.querySelectorAll("[data-adm-initial]").forEach(function (el) {
      el.textContent = initial || "A";
    });
    document.querySelectorAll("[data-adm-name]").forEach(function (el) {
      el.textContent = user.name || "Quản trị viên";
    });
  }

  /* ---------- Toast dùng chung ---------- */
  var toast = document.getElementById("adminToast");
  var toastText = toast ? toast.querySelector(".toast-text") : null;
  var toastIcon = toast ? toast.querySelector(".toast-icon use") : null;
  var ICONS = { success: "#i-check-circle", info: "#i-clock", error: "#i-alert" };
  var toastTimer = null;

  window.adminToast = function (message, type) {
    if (!toast || !toastText) return;
    var kind = ICONS[type] ? type : "success";

    toastText.textContent = message;
    toast.classList.remove("toast--success", "toast--info", "toast--error");
    toast.classList.add("toast--" + kind);
    if (toastIcon) toastIcon.setAttribute("href", ICONS[kind]);

    toast.hidden = false;
    window.requestAnimationFrame(function () {
      toast.classList.add("is-show");
    });

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-show");
    }, 3400);
  };
})();
