(function () {
  "use strict";

  /* A2 Quản lý chuyến — lọc danh sách: tabs trạng thái, tìm kiếm,
     ngày/tuyến/tài xế, empty state, ghi chú kết quả. */

  var rows = Array.prototype.slice.call(
    document.querySelectorAll("#chuyenTable tbody tr")
  );
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var searchInput = document.getElementById("fTim");
  var ngayLoc = document.getElementById("fNgayLoc");
  var tuyenLoc = document.getElementById("fTuyenLoc");
  var txLoc = document.getElementById("fTxLoc");
  var emptyState = document.getElementById("emptyState");
  var tableNote = document.getElementById("tableNote");

  var state = {
    status: "all",
    q: "",
    ngay: "all",
    tuyen: "all",
    taixe: "all",
  };

  function rowMatches(row) {
    var d = row.dataset;
    if (state.status !== "all" && d.status !== state.status) return false;
    if (state.ngay !== "all" && d.ngay !== state.ngay) return false;
    if (state.tuyen !== "all" && d.tuyen !== state.tuyen) return false;
    if (state.taixe !== "all" && d.taixe !== state.taixe) return false;
    if (state.q) {
      var hay = (d.ma + " " + row.textContent).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function applyFilters() {
    var visible = 0;
    rows.forEach(function (row) {
      var show = rowMatches(row);
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
    if (tableNote) {
      tableNote.textContent =
        "Đang hiển thị " + (visible ? "1–" + visible : "0") +
        " trong " + rows.length + " chuyến";
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      state.status = tab.dataset.status || "all";
      applyFilters();
    });
  });

  if (searchInput) {
    var debounce = null;
    searchInput.addEventListener("input", function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () {
        state.q = searchInput.value.trim().toLowerCase();
        applyFilters();
      }, 140);
    });
  }

  [
    [ngayLoc, "ngay"],
    [tuyenLoc, "tuyen"],
    [txLoc, "taixe"],
  ].forEach(function (pair) {
    var el = pair[0];
    if (!el) return;
    el.addEventListener("change", function () {
      state[pair[1]] = el.value;
      applyFilters();
    });
  });

  Array.prototype.slice
    .call(document.querySelectorAll("[data-action='reset-filters']"))
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        state = { status: "all", q: "", ngay: "all", tuyen: "all", taixe: "all" };
        if (searchInput) searchInput.value = "";
        [ngayLoc, tuyenLoc, txLoc].forEach(function (el) {
          if (el) el.value = "all";
        });
        tabs.forEach(function (t) {
          var isAll = t.dataset.status === "all";
          t.classList.toggle("is-active", isAll);
          t.setAttribute("aria-selected", isAll ? "true" : "false");
        });
        applyFilters();
        if (window.adminToast) window.adminToast("Đã xóa bộ lọc", "info");
      });
    });

  window.VvvChuyenList = { applyFilters: applyFilters, rows: rows };
  applyFilters();
})();
