(function () {
  "use strict";

  /* Shell admin cho màn A7: drawer sidebar mobile + đăng xuất mô phỏng
     (đồng bộ hành vi với admin/js/shell.js của nhóm admin). */

  var shell = document.querySelector("[data-admin-shell]");
  var sidebar = document.getElementById("adminSidebar");
  var backdrop = document.getElementById("adminBackdrop");
  var menuBtn = document.getElementById("adminMenuBtn");

  if (!shell || !sidebar) return;

  function setOpen(open) {
    shell.classList.toggle("nav-open", open);
    if (backdrop) backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute(
        "aria-label",
        open ? "Đóng menu điều hướng" : "Mở menu điều hướng"
      );
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setOpen(!shell.classList.contains("nav-open"));
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && shell.classList.contains("nav-open")) {
      setOpen(false);
      if (menuBtn) menuBtn.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) setOpen(false);
  });

  sidebar.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (link && window.innerWidth <= 1024) setOpen(false);
  });

  var logout = document.querySelector("[data-admin-logout]");
  if (logout) {
    logout.addEventListener("click", function () {
      try {
        window.localStorage.removeItem("vvv.auth.admin");
      } catch (err) {
        /* bỏ qua lỗi lưu trữ */
      }
      window.location.href = "index.html";
    });
  }
})();
