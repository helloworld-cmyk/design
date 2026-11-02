(function () {
  "use strict";

  /* ---------- Sao chép SĐT hành khách + toast ---------- */

  var TOAST_MS = 2200;

  var toast = document.getElementById("tcdCopyToast");
  var toastText = document.getElementById("tcdCopyToastText");
  var toastTimer = null;

  var showToast = function (text) {
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, TOAST_MS);
  };

  var copyText = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand("copy")) resolve();
        else reject(new Error("copy failed"));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  };

  document.querySelectorAll(".tcd-copy").forEach(function (btn) {
    var phone = btn.dataset.phone;
    var phoneEl = btn.parentElement.querySelector(".tcd-passenger-phone");
    var label = phoneEl ? phoneEl.textContent : phone;
    var resetTimer = null;

    btn.addEventListener("click", function () {
      copyText(phone).then(
        function () {
          btn.classList.add("is-copied");
          showToast("Đã sao chép SĐT " + label);
          if (resetTimer) window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(function () {
            btn.classList.remove("is-copied");
          }, TOAST_MS);
        },
        function () {
          /* Không chép được → toast kèm số để đọc trực tiếp */
          showToast("Không sao chép được — SĐT: " + label);
        }
      );
    });
  });
})();
