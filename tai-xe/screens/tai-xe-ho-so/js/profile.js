(function () {
  "use strict";

  /* ---------- Đăng xuất ---------- */
  var logoutBtn = document.getElementById("thsLogoutBtn");
  var logoutStatus = document.getElementById("thsLogoutStatus");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logoutBtn.classList.add("is-loading");
      logoutBtn.disabled = true;
      if (logoutStatus) {
        logoutStatus.className = "form-status is-info";
        logoutStatus.textContent = "Đang đăng xuất...";
      }

      try {
        window.localStorage.removeItem("vvv.auth.driver");
      } catch (error) {
        /* chế độ riêng tư: bỏ qua */
      }

      window.setTimeout(function () {
        window.location.href = "index.html";
      }, 600);
    });
  }
})();
