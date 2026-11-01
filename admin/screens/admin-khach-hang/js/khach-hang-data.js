"use strict";

/**
 * A8 — Dữ liệu demo lịch sử vé + tiện ích dùng chung cho màn
 * Quản lý khách hàng (không backend, dữ liệu minh hoạ).
 */

(function () {
  var HISTORY = {
    c01: [
      ["VE-2041", "Hà Nội → Hải Phòng", "31/10/2026 · đã thu tiền mặt",
        "A04", "Hoàn thành"],
      ["VE-1978", "Hải Phòng → Hà Nội", "24/10/2026 · đã thu tiền mặt",
        "B02", "Hoàn thành"],
      ["VE-1840", "Hà Nội → Nam Định", "12/10/2026", "A07", "Đã hủy"]
    ],
    c02: [
      ["VE-1988", "Hà Nội → Quảng Ninh", "28/10/2026 · đã thu tiền mặt",
        "A11", "Hoàn thành"],
      ["VE-1902", "Hà Nội → Hải Dương", "19/10/2026 · đã thu tiền mặt",
        "A03", "Hoàn thành"],
      ["VE-1801", "Hà Nội → Thái Bình", "05/10/2026", "B05", "Không lên xe"]
    ],
    c03: [
      ["VE-2010", "Hà Nội → Hải Phòng", "30/10/2026 · đã thu tiền mặt",
        "A09", "Hoàn thành"],
      ["VE-1934", "Hà Nội → Nam Định", "21/10/2026 · đã thu tiền mặt",
        "A02", "Hoàn thành"]
    ],
    c04: [
      ["VE-1992", "Hà Nội → Hải Phòng", "27/10/2026", "B07", "Không lên xe"],
      ["VE-1877", "Hà Nội → Hải Dương", "14/10/2026", "A05", "Không lên xe"],
      ["VE-1750", "Hà Nội → Quảng Ninh", "02/10/2026", "A12", "Đã hủy"]
    ],
    c05: [
      ["VE-1999", "Hà Nội → Thái Bình", "29/10/2026 · đã thu tiền mặt",
        "A06", "Hoàn thành"],
      ["VE-1863", "Hà Nội → Nam Định", "11/10/2026 · đã thu tiền mặt",
        "B03", "Hoàn thành"]
    ],
    c06: [
      ["VE-2021", "Hà Nội → Hải Phòng", "30/10/2026 · đã thu tiền mặt",
        "A01", "Hoàn thành"],
      ["VE-1965", "Hà Nội → Hải Dương", "23/10/2026", "A08", "Đã đặt"]
    ],
    c07: [
      ["VE-1888", "Hà Nội → Quảng Ninh", "16/10/2026 · đã thu tiền mặt",
        "B01", "Hoàn thành"],
      ["VE-1770", "Hà Nội → Nam Định", "04/10/2026", "A10", "Đã hủy"]
    ],
    c08: [
      ["VE-2038", "Hà Nội → Hải Phòng", "31/10/2026", "A03", "Đã đặt"]
    ]
  };

  var ORANGE_STATES = ["Đã hủy", "Không lên xe", "Đã đặt"];
  var SKY_STATES = ["Đã đón"];

  function stateBadge(text) {
    if (ORANGE_STATES.indexOf(text) > -1) return "status-badge sb--orange";
    if (SKY_STATES.indexOf(text) > -1) return "status-badge sb--sky";
    return "status-badge sb--green";
  }

  function lockBadge(text) {
    return '<span class="status-badge sb--orange">' +
      '<svg class="icon" aria-hidden="true"><use href="#i-lock"></use></svg>' +
      text + "</span>";
  }

  function activeBadge() {
    return '<span class="status-badge sb--green">Đang hoạt động</span>';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function initials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join("")
      .toUpperCase();
  }

  function modalOpen(id) {
    if (window.VvvModal && window.VvvModal.open) {
      window.VvvModal.open(id);
      return;
    }
    var node = document.getElementById(id);
    if (node) node.classList.add("is-open");
  }

  function modalClose(id) {
    if (window.VvvModal && window.VvvModal.close) {
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

  window.KH = {
    HISTORY: HISTORY,
    stateBadge: stateBadge,
    lockBadge: lockBadge,
    activeBadge: activeBadge,
    el: el,
    initials: initials,
    modalOpen: modalOpen,
    modalClose: modalClose,
    notify: notify
  };
})();
