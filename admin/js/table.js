(function () {
  "use strict";

  /* Bảng dữ liệu chung: tìm kiếm + lọc trạng thái + phân trang client */

  const panel = document.querySelector("[data-admin-panel]");
  if (!panel) return;

  const table = panel.querySelector("[data-admin-table]");
  const tbody = table ? table.querySelector("tbody") : null;
  const searchInput = panel.querySelector("[data-table-search]");
  const statusSelect = panel.querySelector("[data-table-status]");
  const emptyState = document.querySelector("[data-table-empty]");
  const rangeEl = panel.querySelector("[data-table-range]");
  const countEl = panel.querySelector("[data-table-count]");
  const prevBtn = panel.querySelector("[data-page-prev]");
  const nextBtn = panel.querySelector("[data-page-next]");
  const pageEl = panel.querySelector("[data-page-current]");

  const PAGE_SIZE = 8;
  let rows = [];
  let page = 1;

  function collect() {
    rows = tbody ? Array.from(tbody.querySelectorAll("tr")) : [];
  }

  function match(row) {
    const q = (searchInput && searchInput.value || "").trim().toLowerCase();
    const status = (statusSelect && statusSelect.value) || "all";
    const haystack = (row.getAttribute("data-search") || "").toLowerCase();
    const okQuery = !q || haystack.indexOf(q) !== -1;
    const okStatus =
      status === "all" || row.getAttribute("data-status") === status;
    return okQuery && okStatus;
  }

  function render() {
    const visible = rows.filter(match);
    const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    if (page > pages) page = pages;
    if (page < 1) page = 1;
    const start = (page - 1) * PAGE_SIZE;
    const showSet = visible.slice(start, start + PAGE_SIZE);

    rows.forEach((row) => {
      row.hidden = showSet.indexOf(row) === -1;
    });

    if (emptyState) emptyState.classList.toggle("is-shown", !visible.length);
    panel.classList.toggle("is-empty", !visible.length);

    if (countEl) countEl.textContent = visible.length + " tài xế";
    if (rangeEl) {
      rangeEl.textContent = visible.length
        ? "Hiển thị " +
          (start + 1) +
          "–" +
          Math.min(start + PAGE_SIZE, visible.length) +
          " của " +
          visible.length +
          " tài xế"
        : "Không có tài xế phù hợp bộ lọc";
    }
    if (pageEl) pageEl.textContent = "Trang " + page + "/" + pages;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= pages;
  }

  function bind(el, evt) {
    if (!el) return;
    el.addEventListener(evt, () => {
      page = 1;
      render();
    });
  }

  bind(searchInput, "input");
  bind(statusSelect, "change");

  document.addEventListener("click", (e) => {
    const reset = e.target.closest("[data-table-reset]");
    if (reset) {
      if (searchInput) searchInput.value = "";
      if (statusSelect) statusSelect.value = "all";
      page = 1;
      render();
      if (searchInput) searchInput.focus();
      return;
    }
    if (e.target === prevBtn || e.target.closest("[data-page-prev]")) {
      page -= 1;
      render();
    }
    if (e.target === nextBtn || e.target.closest("[data-page-next]")) {
      page += 1;
      render();
    }
  });

  window.VvvTable = {
    refresh() {
      collect();
      page = 1;
      render();
    },
  };

  collect();
  render();
})();
