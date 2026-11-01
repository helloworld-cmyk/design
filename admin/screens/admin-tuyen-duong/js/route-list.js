"use strict";

/**
 * A5 — Danh sách tuyến: tìm kiếm, lọc trạng thái và phân trang phía client
 * trên các hàng đã render sẵn (progressive enhancement, chỉ chạy khi có JS).
 */

(function () {
  var RT = window.RT || {};
  var PAGE_SIZE = 5;

  var bodyEl = document.getElementById("rtBody");
  if (!bodyEl) return;

  var searchEl = document.getElementById("rtSearch");
  var statusEl = document.getElementById("rtStatus");
  var resetBtn = document.getElementById("rtReset");
  var emptyResetBtn = document.getElementById("rtEmptyReset");
  var countEl = document.getElementById("rtCount");
  var emptyEl = document.getElementById("rtEmpty");
  var tableScroll = document.getElementById("rtTableScroll");
  var paginationEl = document.getElementById("rtPagination");
  var numsEl = document.getElementById("rtNums");
  var prevBtn = document.getElementById("rtPrev");
  var nextBtn = document.getElementById("rtNext");
  var state = { page: 1, matched: [] };

  function rows() {
    return Array.prototype.slice.call(bodyEl.querySelectorAll("tr"));
  }

  function matches(row, keyword, status) {
    if (status && row.getAttribute("data-status") !== status) return false;
    if (!keyword) return true;
    var haystack = [
      row.getAttribute("data-name"),
      row.getAttribute("data-code"),
      row.getAttribute("data-from"),
      row.getAttribute("data-to")
    ].join(" ").toLowerCase();
    return haystack.indexOf(keyword) > -1;
  }

  function pageIndexes(pageCount) {
    if (pageCount <= 6) {
      var list = [];
      for (var i = 1; i <= pageCount; i += 1) list.push(i);
      return list;
    }
    return [1, 2, 3, "gap", pageCount];
  }

  function renderPager(pageCount) {
    if (!numsEl) return;
    numsEl.textContent = "";
    pageIndexes(pageCount).forEach(function (item) {
      if (item === "gap") {
        var gap = RT.el("span", "page-gap", "…");
        gap.setAttribute("aria-hidden", "true");
        numsEl.appendChild(gap);
        return;
      }
      var button = RT.el("button", "page-btn", String(item));
      button.type = "button";
      button.setAttribute("aria-label", "Trang " + item);
      if (item === state.page) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", function () {
        state.page = item;
        render();
      });
      numsEl.appendChild(button);
    });
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= pageCount;
  }

  function render() {
    var keyword = (searchEl && searchEl.value || "").trim().toLowerCase();
    var status = (statusEl && statusEl.value) || "";

    state.matched = rows().filter(function (row) {
      return matches(row, keyword, status);
    });

    var total = state.matched.length;
    var pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page > pageCount) state.page = pageCount;
    if (state.page < 1) state.page = 1;

    rows().forEach(function (row) {
      row.hidden = true;
    });
    var start = (state.page - 1) * PAGE_SIZE;
    state.matched.slice(start, start + PAGE_SIZE).forEach(function (row) {
      row.hidden = false;
    });

    var isEmpty = total === 0;
    if (tableScroll) tableScroll.hidden = isEmpty;
    if (paginationEl) paginationEl.hidden = isEmpty;
    if (emptyEl) emptyEl.hidden = !isEmpty;

    if (countEl) {
      countEl.textContent = isEmpty
        ? "Không có tuyến nào khớp bộ lọc"
        : "Tìm thấy " + total + " tuyến · trang " + state.page + "/" + pageCount;
    }
    renderPager(pageCount);
  }

  function resetFilters() {
    if (searchEl) searchEl.value = "";
    if (statusEl) statusEl.value = "";
    state.page = 1;
    render();
    if (searchEl) searchEl.focus();
  }

  if (searchEl) {
    searchEl.addEventListener("input", function () {
      state.page = 1;
      render();
    });
  }

  if (statusEl) {
    statusEl.addEventListener("change", function () {
      state.page = 1;
      render();
    });
  }

  if (resetBtn) resetBtn.addEventListener("click", resetFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetFilters);

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      state.page -= 1;
      render();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      state.page += 1;
      render();
    });
  }

  RT.list = {
    refresh: function () {
      state.page = 1;
      render();
    },
    render: render
  };

  render();
})();
