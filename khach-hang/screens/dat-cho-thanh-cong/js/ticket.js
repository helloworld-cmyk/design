(function () {
  "use strict";

  var statusEl = document.getElementById("ticketStatus");
  var copyBtn = document.getElementById("copyCode");
  var calBtn = document.getElementById("addToCalendar");
  var printBtn = document.getElementById("downloadTicket");
  var shareBtn = document.getElementById("shareRide");
var codeEl = document.getElementById("ticketCode");
var code = codeEl ? codeEl.textContent.trim() : "";

var phoneBtn = document.getElementById("copyPhone");
var phoneLink = document.getElementById("driverPhone");

var phone = phoneLink
  ? phoneLink.getAttribute("href").replace(/^tel:/i, "").trim()
  : "";

  function say(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function flash(button, label) {
    var slot = button.querySelector(".btn-label");
    var original = slot ? slot.textContent : null;
    if (!slot || !original) return;
    slot.textContent = label;
    window.setTimeout(function () {
      slot.textContent = original;
    }, 2200);
  }

  function copyText(text, doneLabel, button) {
    function done() {
      flash(button, doneLabel);
      say("Đã sao chép: " + text);
    }
    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.classList.add("sr-only");
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        say("Không thể sao chép tự động — hãy chép thủ công.");
      }
      document.body.removeChild(area);
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- Sao chép mã đặt chỗ ---------- */

if (copyBtn && code) {
  copyBtn.addEventListener("click", function () {
    copyText(code, "Đã sao chép!", copyBtn);
  });
}

/* ---------- Sao chép số điện thoại tài xế ---------- */

if (phoneBtn && phone) {
  phoneBtn.addEventListener("click", function () {
    copyText(phone, "Đã sao chép!", phoneBtn);
  });
}

  /* ---------- Thêm vào lịch (.ics) ---------- */

  var ICS = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vi Vu Viet//Ve dien tu//VI",
    "BEGIN:VEVENT",
    "UID:" + code + "@vivuviet.vn",
    "DTSTART:20261107T073000",
    "DTEND:20261107T094000",
    "SUMMARY:Vi Vu Việt — Hà Nội → Ninh Bình (" + code + ")",
    "LOCATION:Số 12 Nguyễn Chánh, Cầu Giấy, Hà Nội",
    "DESCRIPTION:Xuất trình mã " + code +
      ". Trả 360.000đ tiền mặt cho tài xế khi lên xe.",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  function downloadIcs() {
    var blob = new Blob([ICS], { type: "text/calendar;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vivuviet-" + code.toLowerCase() + ".ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    say("Đã tải tệp lịch .ics cho chuyến " + code);
  }

  if (calBtn && code) {
    calBtn.addEventListener("click", downloadIcs);
  }

  /* ---------- Tải vé (in / lưu PDF) ---------- */

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      say("Đang mở hộp thoại in vé");
      window.print();
    });
  }

  /* ---------- Chia sẻ chuyến ---------- */

  function shareRide() {
    var text =
      "Vé Vi Vu Việt " + code + " — Hà Nội → Ninh Bình, 07:30 ngày 07/11/2026.";
    if (navigator.share) {
      navigator
        .share({ title: "Vé Vi Vu Việt — " + code, text: text })
        .catch(function () {});
      return;
    }
    copyText(text, "Đã sao chép!", shareBtn);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", shareRide);
  }
})();
