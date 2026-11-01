"use strict";

/**
 * A5 — Quản lý tuyến: dữ liệu minh hoạ + tiện ích dùng chung cho màn
 * (không backend; dữ liệu mô phỏng theo .agents/plans/03-admin.md §A5).
 * Các hàng bảng tĩnh trong partials phải khớp dữ liệu ở đây.
 */

(function () {
  /* ---------- Dữ liệu 8 tuyến (khớp route-rows*.html) ---------- */

  var ROUTES = {
    r01: {
      code: "TUY-01", from: "Hà Nội", to: "Hải Phòng",
      km: 120, min: 135, price: 180000, active: true, trips: 14,
      updated: "28/10/2026",
      stops: [
        "Bến xe Giáp Bát", "Nút giao Gia Lâm", "Văn Giang – Hưng Yên",
        "An Lão – Hải Phòng", "Bến xe Vĩnh Niệm"
      ]
    },
    r02: {
      code: "TUY-02", from: "Hà Nội", to: "Ninh Bình",
      km: 95, min: 115, price: 150000, active: true, trips: 11,
      updated: "26/10/2026",
      stops: ["Bến xe Giáp Bát", "Phủ Lý – Hà Nam", "Tam Điệp", "Bến xe Ninh Bình"]
    },
    r03: {
      code: "TUY-03", from: "Hà Nội", to: "Hạ Long",
      km: 165, min: 180, price: 220000, active: true, trips: 9,
      updated: "24/10/2026",
      stops: [
        "Bến xe Mỹ Đình", "Phả Lại – Hải Dương", "Đông Triều – Quảng Ninh",
        "Ngã tư Bãi Cháy", "Bến xe Bãi Cháy"
      ]
    },
    r04: {
      code: "TUY-04", from: "Hải Phòng", to: "Ninh Bình",
      km: 150, min: 165, price: 190000, active: false, trips: 3,
      updated: "18/10/2026",
      stops: ["Bến xe Vĩnh Niệm", "Thái Bình", "Nam Định", "Bến xe Ninh Bình"]
    },
    r05: {
      code: "TUY-05", from: "Hà Nội", to: "Thái Bình",
      km: 105, min: 125, price: 140000, active: true, trips: 7,
      updated: "21/10/2026",
      stops: ["Bến xe Giáp Bát", "Hưng Yên", "Phủ Lý – Hà Nam", "Bến xe Thái Bình"]
    },
    r06: {
      code: "TUY-06", from: "Ninh Bình", to: "Hạ Long",
      km: 210, min: 225, price: 260000, active: false, trips: 2,
      updated: "12/10/2026",
      stops: [
        "Bến xe Ninh Bình", "Nam Định", "Thái Bình", "Hải Phòng",
        "Bến xe Bãi Cháy"
      ]
    },
    r07: {
      code: "TUY-07", from: "Hà Nội", to: "Nam Định",
      km: 90, min: 100, price: 130000, active: true, trips: 8,
      updated: "27/10/2026",
      stops: ["Bến xe Giáp Bát", "Phủ Lý – Hà Nam", "Bến xe Nam Định"]
    },
    r08: {
      code: "TUY-08", from: "Hạ Long", to: "Hải Phòng",
      km: 75, min: 85, price: 110000, active: true, trips: 5,
      updated: "29/10/2026",
      stops: ["Bến xe Bãi Cháy", "Cầu Bính – Hải Phòng", "Bến xe Vĩnh Niệm"]
    }
  };

  /* ---------- Tiện ích ---------- */

  function money(n) {
    return Number(n).toLocaleString("vi-VN") + "đ";
  }

  function dur(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return m ? h + "h" + (m < 10 ? "0" + m : m) : h + "h";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function today() {
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    return dd + "/" + mm + "/" + d.getFullYear();
  }

  function nextCode() {
    var max = 0;
    Object.keys(ROUTES).forEach(function (key) {
      var number = Number(ROUTES[key].code.replace("TUY-", ""));
      if (number > max) max = number;
    });
    return "TUY-" + String(max + 1).padStart(2, "0");
  }

  function modalOpen(id) {
    if (window.VvvModal) {
      window.VvvModal.open(id);
      return;
    }
    var node = document.getElementById(id);
    if (node) node.classList.add("is-open");
  }

  function modalClose(id) {
    if (window.VvvModal) {
      window.VvvModal.close(id);
      return;
    }
    var node = document.getElementById(id);
    if (node) node.classList.remove("is-open");
  }

  function notify(message, type) {
    if (window.adminToast) {
      window.adminToast(message, type || "success");
      return;
    }
    window.alert(message);
  }

  function setStatus(node, message, kind) {
    if (!node) return;
    if (!message) {
      node.textContent = "";
      node.className = "form-status";
      return;
    }
    node.textContent = message;
    node.className = "form-status is-" + (kind || "info");
  }

  function markInvalid(input, invalid) {
    var field = input && input.closest(".field");
    if (field) field.classList.toggle("is-invalid", !!invalid);
  }

  /* ---------- Dựng hàng bảng từ dữ liệu (đồng bộ với partials) ---------- */

  function stopsCell(r) {
    return (
      '<span class="stop-count">' +
      '<svg class="icon" aria-hidden="true"><use href="#i-pin"></use></svg>' +
      r.stops.length + " điểm</span>"
    );
  }

  function statusCell(id, r) {
    var checked = r.active ? "true" : "false";
    var label = (r.active ? "Ngừng" : "Kích hoạt") + " tuyến " + r.code;
    var badge = r.active
      ? '<span class="status-badge sb--green">Đang chạy</span>'
      : '<span class="status-badge sb--orange">Tạm dừng</span>';
    return (
      '<span class="status-cell">' +
      '<button type="button" class="switch" role="switch" aria-checked="' +
      checked + '" data-toggle-route="' + id + '" aria-label="' +
      esc(label) + '"></button>' + badge + "</span>"
    );
  }

  function actionsCell(id) {
    return (
      '<button type="button" class="btn btn-ghost btn-sm"' +
      ' data-route-action="stops" data-id="' + id + '">' +
      '<svg class="icon" aria-hidden="true"><use href="#i-pin"></use></svg>' +
      "Điểm dừng</button>" +
      '<button type="button" class="btn btn-ghost btn-sm"' +
      ' data-route-action="edit" data-id="' + id + '">' +
      '<svg class="icon" aria-hidden="true"><use href="#i-edit"></use></svg>' +
      "Sửa</button>"
    );
  }

  function buildRow(id, r) {
    var tr = document.createElement("tr");
    tr.setAttribute("data-id", id);
    tr.setAttribute("data-status", r.active ? "active" : "paused");
    tr.setAttribute("data-code", r.code);
    tr.setAttribute("data-from", r.from);
    tr.setAttribute("data-to", r.to);
    tr.setAttribute("data-km", String(r.km));
    tr.setAttribute("data-min", String(r.min));
    tr.setAttribute("data-price", String(r.price));
    tr.setAttribute("data-trips", String(r.trips));
    tr.setAttribute("data-updated", r.updated);
    tr.setAttribute("data-name", [r.code, r.from, r.to].concat(r.stops).join(" "));
    tr.innerHTML =
      '<td data-label="Tuyến"><div class="route-cell">' +
      '<span class="route-mark" aria-hidden="true">' +
      '<svg class="icon" aria-hidden="true"><use href="#i-route"></use></svg>' +
      "</span>" +
      '<span class="route-cell-text">' +
      '<strong class="cell-strong">' + esc(r.from + " → " + r.to) + "</strong>" +
      '<span class="cell-sub">' + esc(r.code) + " · cập nhật " + esc(r.updated) +
      "</span></span></div></td>" +
      '<td data-label="Điểm dừng">' + stopsCell(r) + "</td>" +
      '<td data-label="Quãng đường">' +
      '<span class="cell-strong">' + r.km + " km</span>" +
      '<span class="cell-sub">≈ ' + dur(r.min) + "</span></td>" +
      '<td class="num" data-label="Giá vé">' + money(r.price) + "</td>" +
      '<td class="num" data-label="Chuyến">' + r.trips + "</td>" +
      '<td data-label="Trạng thái">' + statusCell(id, r) + "</td>" +
      '<td class="cell-actions" data-label="Thao tác">' + actionsCell(id) + "</td>";
    return tr;
  }

  function swapRow(id) {
    var r = ROUTES[id];
    var body = document.getElementById("rtBody");
    if (!r || !body) return;
    var old = body.querySelector('tr[data-id="' + id + '"]');
    var next = buildRow(id, r);
    if (old) {
      old.parentNode.replaceChild(next, old);
    } else {
      body.insertBefore(next, body.firstChild);
    }
    if (window.RT && window.RT.list) window.RT.list.refresh();
  }

  window.RT = {
    routes: ROUTES,
    money: money,
    dur: dur,
    el: el,
    esc: esc,
    today: today,
    nextCode: nextCode,
    modalOpen: modalOpen,
    modalClose: modalClose,
    notify: notify,
    setStatus: setStatus,
    markInvalid: markInvalid,
    buildRow: buildRow,
    swapRow: swapRow
  };
})();
