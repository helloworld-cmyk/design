"use strict";

/**
 * A8 — Danh sách khách hàng: tìm kiếm, lọc trạng thái và phân trang
 * phía client trên các hàng tĩnh đã render sẵn.
 */

(function () {
  var KH = window.KH || {};
  var PAGE_SIZE = 5;

  var bodyEl = document.getElementById("khBody");
  if (!bodyEl) return;

  var rows = Array.prototype.slice.call(bodyEl.querySelectorAll("tr"));
  var searchEl = document.getElementById("khSearch");
  var statusEl = document.getElementById("khStatus");
  var resetBtn = document.getElementById("khReset");
  var emptyReset = document.getElementById("khEmptyReset");
  var countEl = document.getElementById("khCount");
  var emptyEl = document.getElementById("khEmpty");
  var tableScroll = document.getElementById("khTableScroll");
  var paginationEl = document.getElementById("khPagination");
  var pageNums = document.getElementById("khPageNums");
  var prevBtn = document.getElementById("khPrev");
  var nextBtn = document.getElementById("khNext");
  var state = { page: 1, matched: rows };

  function matches(row, keyword, status) {
    if (status && row.getAttribute("data-status") !== status) return false;
    if (!keyword) return true;
    var haystack = [
      row.getAttribute("data-name"),
      row.getAttribute("data-phone"),
      row.getAttribute("data-email"),
      row.getAttribute("data-code")
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
    if (!pageNums) return;
    pageNums.textContent = "";
    pageIndexes(pageCount).forEach(function (item) {
      if (item === "gap") {
        var gap = KH.el("span", "page-gap", "…");
        gap.setAttribute("aria-hidden", "true");
        pageNums.appendChild(gap);
        return;
      }
      var button = KH.el("button", "page-btn", String(item));
      button.type = "button";
      if (item === state.page) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", function () {
        state.page = item;
        render();
      });
      pageNums.appendChild(button);
    });
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= pageCount;
  }

  function render() {
    var total = state.matched.length;
    var pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page > pageCount) state.page = pageCount;

    rows.forEach(function (row) {
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
        ? "Không có tài khoản nào khớp bộ lọc"
        : "Tìm thấy " + total + " tài khoản · trang " +
          state.page + "/" + pageCount;
    }
    renderPager(pageCount);
  }

  function applyFilter() {
    var keyword = (searchEl ? searchEl.value : "").trim().toLowerCase();
    var status = statusEl ? statusEl.value : "";
    state.matched = rows.filter(function (row) {
      return matches(row, keyword, status);
    });
    state.page = 1;
    render();
  }

  function resetFilters() {
    if (searchEl) searchEl.value = "";
    if (statusEl) statusEl.value = "";
    applyFilter();
    if (searchEl) searchEl.focus();
  }

  if (searchEl) searchEl.addEventListener("input", applyFilter);
  if (statusEl) statusEl.addEventListener("change", applyFilter);
  if (resetBtn) resetBtn.addEventListener("click", resetFilters);
  if (emptyReset) emptyReset.addEventListener("click", resetFilters);

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (state.page > 1) {
        state.page -= 1;
        render();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var pageCount = Math.max(1, Math.ceil(state.matched.length / PAGE_SIZE));
      if (state.page < pageCount) {
        state.page += 1;
        render();
      }
    });
  }

  KH.applyFilter = applyFilter;
  KH.refresh = render;

  render();
})();
