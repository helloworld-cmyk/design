(function () {
  "use strict";

  /* Cấu hình trạng thái chuyến — hiện tại đọc từ data-attr trên #main,
     admin build sau có thể đổi sang fetch. */
  var mainEl = document.getElementById("main");
  var state = {
    /* Trạng thái hợp lệ: "sap-toi" | "dang-chay" | "hoan-thanh" | "huy" */
    status: (mainEl && mainEl.dataset.tripStatus) || "sap-toi"
  };

  var status = document.getElementById("tcdStatus");
  var statusBadge = document.getElementById("tcdStatusBadge");
  var startBtn = document.getElementById("tcdStartBtn");
  var continueLink = document.getElementById("tcdContinueLink");
  var incidentBtn = document.getElementById("tcdIncidentBtn");
  var banner = document.getElementById("tcdBanner");
  var bannerTitle = document.getElementById("tcdBannerTitle");
  var bannerText = document.getElementById("tcdBannerText");

  var setStatus = function (kind, text) {
    if (!status) return;
    status.className = "form-status " + kind;
    status.textContent = text;
  };

  var renderForStatus = function () {
    if (!startBtn || !continueLink || !statusBadge) return;

    /* Reset */
    startBtn.hidden = false;
    continueLink.hidden = true;
    statusBadge.className = "badge tcd-status";

    if (state.status === "sap-toi") {
      statusBadge.classList.add("badge--sky");
      statusBadge.textContent = "Sắp tới";
      startBtn.hidden = false;
      if (incidentBtn) incidentBtn.hidden = false;
    } else if (state.status === "dang-chay") {
      statusBadge.classList.add("badge--green");
      statusBadge.textContent = "Đang thực hiện";
      startBtn.hidden = true;
      continueLink.hidden = false;
      if (incidentBtn) incidentBtn.hidden = false;
    } else if (state.status === "hoan-thanh") {
      statusBadge.classList.add("badge--green");
      statusBadge.textContent = "Hoàn thành";
      startBtn.hidden = true;
      if (incidentBtn) incidentBtn.hidden = true;
    } else if (state.status === "huy") {
      statusBadge.classList.add("badge--red");
      statusBadge.textContent = "Đã hủy";
      startBtn.hidden = true;
      if (incidentBtn) incidentBtn.hidden = true;
      showCancelledBanner();
    }
  };

  var showCancelledBanner = function () {
    if (!banner) return;
    banner.hidden = false;
    if (bannerTitle) bannerTitle.textContent = "Chuyến đã bị hủy";
    if (bannerText) {
      bannerText.textContent =
        "Admin hủy lúc 09:12 — lý do: trùng lịch xe 51A-123.45. " +
        "Chuyến không thực hiện, bạn không cần thao tác thêm.";
    }
  };

  var showIncidentBanner = function (note) {
    if (!banner) return;
    banner.hidden = false;
    banner.style.borderColor = "var(--orange-100)";
    banner.style.background = "var(--orange-50)";
    banner.style.color = "var(--orange-700)";
    if (bannerTitle) {
      bannerTitle.textContent = "Đã báo sự cố";
      bannerTitle.style.color = "var(--orange-700)";
    }
    if (bannerText) {
      bannerText.textContent =
        "Admin đã nhận báo cáo" + (note ? ": “" + note + "”" : "") +
        ". Chuyến vẫn giữ nguyên — chờ admin hướng dẫn tiếp.";
      bannerText.style.color = "var(--orange-700)";
    }
  };

  /* ---------- Điều hành chuyến ---------- */

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      /* Chỉ cho phép khi đang "sap-toi" */
      if (state.status !== "sap-toi") {
        setStatus("is-error", "Chuyến không ở trạng thái có thể điều hành.");
        return;
      }

      startBtn.classList.add("is-loading");
      startBtn.disabled = true;
      setStatus("is-info", "Đang mở điều hành chuyến...");

      window.setTimeout(function () {
        startBtn.classList.remove("is-loading");
        startBtn.disabled = false;
        setStatus("is-success", "Đã vào điều hành chuyến.");
        window.setTimeout(function () {
          window.location.href = "tai-xe-dieu-hanh.html";
        }, 700);
      }, 900);
    });
  }

  /* Trạng thái "huy" → hiện banner ngay khi tải */
  if (state.status === "huy" && banner) {
    banner.hidden = false;
  }

  renderForStatus();

  /* ---------- Cho phép module khác (incident.js) gọi lại ---------- */

  window.TCD = window.TCD || {};
  window.TCD.showIncidentBanner = showIncidentBanner;
})();
