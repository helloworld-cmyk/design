(function () {
  "use strict";

  /* Màn A3 — dữ liệu mô phỏng + helper dùng chung cho Quản lý tài xế */

  const TRIPS = {
    "tx-01": [
      ["HH1225", "Hà Nội → Hạ Long", "01/11/2026", "upcoming"],
      ["HH1201", "Hà Nội → Ninh Bình", "28/10/2026", "done"],
      ["HH1198", "Hà Nội → Sa Pa", "24/10/2026", "done"],
    ],
    "tx-02": [
      ["HH1210", "Hà Nội → Hải Phòng", "30/10/2026", "running"],
      ["HH1231", "Hà Nội → Ninh Bình", "03/11/2026", "upcoming"],
    ],
    "tx-03": [["HH1156", "Hà Nội → Hạ Long", "22/10/2026", "canceled"]],
    "tx-04": [
      ["HH1240", "Hà Nội → Sa Pa", "05/11/2026", "upcoming"],
      ["HH1202", "Hà Nội → Thái Nguyên", "27/10/2026", "done"],
    ],
    "tx-05": [["HH1188", "Hà Nội → Ninh Bình", "25/10/2026", "done"]],
    "tx-07": [
      ["HH1218", "Hà Nội → Hạ Long", "31/10/2026", "running"],
      ["HH1244", "Hà Nội → Hải Phòng", "06/11/2026", "upcoming"],
    ],
    "tx-08": [["HH1236", "Hà Nội → Sa Pa", "04/11/2026", "upcoming"]],
    "tx-10": [["HH1195", "Hà Nội → Ninh Bình", "26/10/2026", "done"]],
  };

  const TRIP_BADGE = {
    upcoming: ["Sắp tới", "status-badge--sky"],
    running: ["Đang chạy", "status-badge--orange"],
    done: ["Hoàn thành", "status-badge--green"],
    canceled: ["Đã hủy", "status-badge--neutral"],
  };

  const TINTS = ["sky", "orange", "green"];

  const PHONES = [
    "0912345001", "0356789002", "0987654003", "0903221004", "0345889005",
    "0968442006", "0915776007", "0399118008", "0355909011", "0934553012",
  ];

  const state = { currentRow: null };

  const toast = (message, type) => {
    if (typeof window.adminToast === "function") {
      window.adminToast(message, type);
    }
  };

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const digits = (v) => (v || "").replace(/\D/g, "");
  const fmtPhone = (s) => s.replace(/(\d{4})(\d{3})(\d{3,4})/, "$1 $2 $3");
  const group4 = (s) => s.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");

  const toDmy = (iso) => {
    const [y, m, d] = iso.split("-");
    return d + "/" + m + "/" + y;
  };

  const toIso = (dmy) => {
    const [d, m, y] = dmy.split("/");
    return y + "-" + m + "-" + d;
  };

  const genPassword = () =>
    "Vv-" + Math.floor(100000 + Math.random() * 900000);

  const initials = (name) => {
    const w = name.trim().split(/\s+/).filter(Boolean);
    return w.length ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : "TX";
  };

  const daysLeft = (dmy) => {
    const [d, m, y] = dmy.split("/").map(Number);
    return Math.ceil((new Date(y, m - 1, d) - new Date()) / 86400000);
  };

  /* Dựng lại nội dung một dòng từ dataset (dùng sau khi tạo/sửa/khóa) */
  function renderRow(row) {
    const d = row.dataset;
    const tint = "tx-avatar--" + (d.tint || "sky");
    const locked = d.status === "locked";
    const badgeCls = locked ? "status-badge--red" : "status-badge--green";
    const badgeTxt = locked ? "Bị khóa" : "Đang hoạt động";
    const lockTxt = locked ? "Mở khóa" : "Khóa";
    const left = daysLeft(d.han);
    const warn =
      left >= 0 && left <= 45
        ? '<span class="status-badge status-badge--orange">Sắp hết hạn</span>'
        : "";
    row.innerHTML =
      '<td><div class="tx-cell">' +
      '<span class="tx-avatar ' + tint + '" aria-hidden="true">' +
      esc(initials(d.name)) + "</span>" +
      '<span class="tx-id"><strong>' + esc(d.name) + "</strong>" +
      "<span>" + esc(d.email || "—") + "</span></span></div></td>" +
      '<td class="tx-phone">' + esc(d.phone) + "</td>" +
      '<td><span class="tx-gplx"><strong>' +
      esc(d.hang + " · " + d.gplx) + "</strong>" +
      "<span>Giấy phép lái xe</span></span></td>" +
      '<td><span class="tx-han">' + esc(d.han) + warn + "</span></td>" +
      '<td class="col-num"><strong class="tx-num">' +
      esc(d.trips) + "</strong></td>" +
      '<td><span class="status-badge ' + badgeCls + '">' +
      '<span class="status-dot" aria-hidden="true"></span>' +
      badgeTxt + "</span></td>" +
      '<td><div class="tx-actions">' +
      '<button class="btn btn-ghost btn-sm" type="button" ' +
      'data-tx-action="edit">Sửa</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" ' +
      'data-tx-action="lock">' + lockTxt + "</button>" +
      '<button class="btn btn-ghost btn-sm" type="button" ' +
      'data-tx-action="detail">Chi tiết</button>' +
      "</div></td>";
    d.search = (d.name + " " + digits(d.phone) + " " + (d.email || ""))
      .toLowerCase();
  }

  window.VvvTx = {
    TRIPS, TRIP_BADGE, TINTS, PHONES, state, toast,
    esc, digits, fmtPhone, group4, toDmy, toIso, genPassword, initials,
    daysLeft, renderRow,
  };
})();
