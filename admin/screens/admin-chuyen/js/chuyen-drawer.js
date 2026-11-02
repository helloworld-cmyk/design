(function () {
  "use strict";

  /* A2 Quản lý chuyến — drawer chi tiết chuyến. */
  var toast = function (msg, type) {
    if (window.adminToast) window.adminToast(msg, type || "success");
  };
  var closeModal = function (id) {
    if (window.VvvModal) window.VvvModal.close(id);
  };
  var openModal = function (id) {
    if (window.VvvModal) window.VvvModal.open(id);
  };
  function setFormStatus(box, kind, message) {
    if (!box) return;
    box.className = "form-status" + (kind ? " is-" + kind : "");
    box.textContent = message || "";
  }
  var cancelCtx = window.VvvChuyenFlow
    ? window.VvvChuyenFlow.cancelCtx
    : { ma: "", ve: "0", row: null };
  var ctEditBtn = document.getElementById("ctEditBtn");
  var ctCancelBtn = document.getElementById("ctCancelBtn");
  var currentRow = null;
  function textOf(root, selector) {
    var el = root ? root.querySelector(selector) : null;
    return el ? el.textContent.trim() : "";
  }
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  function formatMoney(value) {
    var amount = Number(value);
    if (!amount) return "—";
    return amount.toLocaleString("vi-VN") + "đ";
  }
  function setupRowA11y() {
    document.querySelectorAll("[data-open-detail]").forEach(function (btn) {
      var row = btn.closest("tr");
      if (!row || !row.dataset.ma) return;
      btn.setAttribute("aria-haspopup", "dialog");
      btn.setAttribute("aria-label", "Xem chi tiết chuyến " + row.dataset.ma);
    });
  }
  setupRowA11y();

  function fillDrawer(row) {
    if (!row) return;
    currentRow = row;
    var d = row.dataset;
    var cells = row.querySelectorAll("td");
    var badge = row.querySelector(".badge-stack .status-badge");
    var seatBox = cells[5] ? cells[5].querySelector(".seat-num") : null;
    var seatMatch = (seatBox ? seatBox.textContent : "").match(
      /(\d+)\s*\/\s*(\d+)/
    );
    var booked = seatMatch ? seatMatch[1] : parseInt(d.ve, 10) || 0;
    var capacity = seatMatch ? seatMatch[2] : "—";
    var seatFill = cells[5] ? cells[5].querySelector(".seat-progress-fill") : null;
    var timeText = [
      textOf(cells[2], ".td-strong"),
      textOf(cells[2], ".td-sub")
    ]
      .filter(Boolean)
      .join(" · ");
    setText("ctMa", d.ma || "");
    setText("chitietTitle", textOf(cells[1], ".td-strong"));
    setText("ctTuyenPhu", textOf(cells[1], ".td-sub"));
    setText("ctThoiGian", timeText);
    setText("ctGhe", booked);
    setText("ctSucChua", capacity);
    setText("ctGia", textOf(cells[6], ".td-strong") || "—");
    setText("ctCong", formatMoney(d.cong));
    var bar = document.getElementById("ctGheBar");
    var fill = document.getElementById("ctGheFill");
    if (bar) {
      bar.setAttribute("aria-label",
        "Đã đặt " + booked + " trên " + capacity + " ghế");
    }
    if (fill) {
      fill.className = seatFill ? seatFill.className : "seat-progress-fill";
      fill.style.width =
        seatFill && seatFill.style.width ? seatFill.style.width : "0%";
    }
    var driverCell = cells[3];
    var driverName = textOf(driverCell, ".td-name");
    var driverAvatar = driverCell ? driverCell.querySelector(".avatar") : null;
    var driverCard = document.getElementById("ctDriverCard");
    if (driverName) {
      setText("ctTaiXe", driverName);
      setText("ctAvatar",
        driverAvatar ? driverAvatar.textContent.trim() : "TX");
      setText("ctTaiXeSub", "Tài xế phụ trách");
      if (driverCard) driverCard.classList.remove("is-missing");
    } else {
      setText("ctTaiXe", "Chưa phân công");
      setText("ctAvatar", "?");
      setText("ctTaiXeSub", "Cần phân công tài xế");
      if (driverCard) driverCard.classList.add("is-missing");
    }
    var vehicleCell = cells[4];
    var plate = textOf(vehicleCell, ".td-strong");
    var vehicleCard = document.getElementById("ctVehicleCard");
    if (plate) {
      setText("ctXe", plate);
      setText("ctXeLoai", textOf(vehicleCell, ".td-sub") || "Chưa rõ loại xe");
      if (vehicleCard) vehicleCard.classList.remove("is-missing");
    } else {
      setText("ctXe", "Chưa gán xe");
      setText("ctXeLoai", "Cần phân công xe");
      if (vehicleCard) vehicleCard.classList.add("is-missing");
    }
    var ctBadge = document.getElementById("ctBadge");
    if (badge && ctBadge) {
      ctBadge.textContent = badge.textContent.trim();
      ctBadge.className = badge.className;
    }
    var timelineItems = document.querySelectorAll("#modalChitiet .timeline-item");
    if (timelineItems.length > 1) {
      var assignItem = timelineItems[1];
      var assigned = Boolean(driverName && plate);
      var assignTitle = assignItem.querySelector("strong");
      var assignMeta = assignItem.querySelector(".timeline-meta");
      if (assignTitle) {
        assignTitle.textContent = assigned
          ? "Đã phân công xe + tài xế"
          : "Chưa phân công xe + tài xế";
      }
      if (assignMeta) {
        assignMeta.textContent = assigned
          ? plate + " · " + driverName
          : "Cần phân công trước khởi hành";
      }
      assignItem.className =
        "timeline-item " + (assigned ? "is-done" : "is-pending");
    }
    var lastItem = timelineItems[timelineItems.length - 1];
    if (lastItem) {
      var views = {
        "sap-toi": [
          "is-pending", "Chờ khởi hành", "Dự kiến " + timeText
        ],
        "dang-thuc-hien": [
          "is-current", "Đang thực hiện", "Bắt đầu " + timeText
        ],
        "hoan-thanh": [
          "is-complete", "Đã hoàn thành",
          "Kết thúc chuyến · đối soát tiền mặt ở A6"
        ],
        "da-huy": [
          "is-cancelled", "Đã hủy chuyến",
          "Vé liên quan đã hủy · không hoàn tiền"
        ]
      };
      var view = views[d.status] || views["sap-toi"];
      lastItem.className = "timeline-item " + view[0];
      var lastTitle = lastItem.querySelector("strong");
      var lastMeta = lastItem.querySelector(".timeline-meta");
      if (lastTitle) lastTitle.textContent = view[1];
      if (lastMeta) lastMeta.textContent = view[2];
    }
    var ve = parseInt(d.ve, 10);
    if (isNaN(ve)) ve = 0;
    setText("ctVeCount", ve + " vé");
    var list = document.getElementById("ctTicketList");
    var empty = document.getElementById("ctVeEmpty");
    var tickets = list ? list.querySelectorAll(".ticket-item") : [];
    Array.prototype.forEach.call(tickets, function (item, index) {
      item.hidden = index >= Math.min(ve, tickets.length);
    });
    if (list) list.hidden = ve === 0;
    if (empty) empty.hidden = ve > 0;
    setText(
      "ctVeNote",
      ve > tickets.length
        ? "Hiển thị " + tickets.length +
          " vé gần nhất · tiền mặt do tài xế ghi ở D4"
        : "Thanh toán tiền mặt do tài xế ghi ở D4"
    );
    var canEdit = d.status === "sap-toi";
    var notes = {
      "sap-toi": "Có thể sửa hoặc hủy trước giờ khởi hành.",
      "dang-thuc-hien": "Chuyến đang chạy — xử lý qua báo sự cố.",
      "hoan-thanh": "Chuyến đã hoàn thành — chỉ xem thông tin.",
      "da-huy": "Chuyến đã hủy — không thể thao tác."
    };
    setText("ctFootNote", notes[d.status] || "Chỉ xem thông tin chuyến.");
    if (ctEditBtn) {
      ctEditBtn.disabled = !canEdit;
      ctEditBtn.textContent =
        canEdit && !driverName ? "Phân công chuyến" : "Sửa chuyến";
      ctEditBtn.title = canEdit
        ? "Sửa chuyến này"
        : "Chỉ sửa được khi chuyến chưa khởi hành";
    }
    if (ctCancelBtn) {
      ctCancelBtn.disabled = !canEdit;
      ctCancelBtn.title = canEdit
        ? "Hủy chuyến này"
        : "Chỉ hủy được khi chuyến chưa khởi hành";
    }
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-open-detail]");
    if (!btn || btn.disabled) return;
    fillDrawer(btn.closest("tr"));
    openModal("modalChitiet");
  });
  function openEditModal(label, ma, suffix) {
    closeModal("modalChitiet");
    setFormStatus(document.getElementById("formChuyenStatus"), null, "");
    var title = document.getElementById("modalChuyenTitle");
    if (title) title.textContent = label + " " + ma + (suffix || "");
    openModal("modalChuyen");
  }
  if (ctEditBtn) {
    ctEditBtn.addEventListener("click", function () {
      if (ctEditBtn.disabled) return;
      var ma = document.getElementById("ctMa").textContent;
      openEditModal(ctEditBtn.textContent.trim(), ma, "");
    });
  }
  if (ctCancelBtn) {
    ctCancelBtn.addEventListener("click", function () {
      if (ctCancelBtn.disabled) return;
      var ma = document.getElementById("ctMa").textContent;
      cancelCtx.ma = ma;
      cancelCtx.row = currentRow;
      cancelCtx.ve = currentRow ? currentRow.dataset.ve || "0" : "0";
      var huyMa = document.getElementById("huyMa");
      var huyVe = document.getElementById("huyVe");
      if (huyMa) huyMa.textContent = ma;
      if (huyVe) huyVe.textContent = cancelCtx.ve;
      var formHuy = document.getElementById("formHuy");
      if (formHuy) formHuy.reset();
      closeModal("modalChitiet");
      openModal("modalHuy");
    });
  }

  /* ---------- Đổi xe / đổi tài xế từ cảnh báo sự cố ---------- */
  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-chuyen-edit]");
    if (!btn || btn.disabled) return;
    var ma = document.getElementById("ctMa").textContent;
    var suffix =
      btn.dataset.chuyenEdit === "xe" ? " — đổi xe" : " — đổi tài xế";
    openEditModal("Sửa chuyến", ma, suffix);
  });
})();
