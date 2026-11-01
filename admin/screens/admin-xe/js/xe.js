(function () {
  "use strict";

  /* Bộ lọc danh sách xe (client-side). Shell/toast dùng chung:
     admin/js/admin-shell.js (menu, adminToast), admin/js/modal.js. */

  const searchInput = document.getElementById("xeSearch");
  const typeSelect = document.getElementById("xeType");
  const statusSelect = document.getElementById("xeStatus");
  const resetBtn = document.getElementById("xeReset");
  const countEl = document.getElementById("xeCount");
  const emptyState = document.getElementById("xeEmpty");
  const tableWrap = document.getElementById("xeTableWrap");

  function applyFilter() {
    const rows = Array.from(document.querySelectorAll(".xe-table tbody tr"));
    const total = rows.length;
    const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const type = typeSelect ? typeSelect.value : "";
    const status = statusSelect ? statusSelect.value : "";
    let shown = 0;

    rows.forEach(function (row) {
      const hay = (row.dataset.plate + " " + row.dataset.driver).toLowerCase();
      const ok =
        (!q || hay.indexOf(q) !== -1) &&
        (!type || row.dataset.type === type) &&
        (!status || row.dataset.status === status);
      row.hidden = !ok;
      if (ok) shown += 1;
    });

    if (countEl) countEl.textContent = "Hiển thị " + shown + "/" + total + " xe";
    if (emptyState) emptyState.hidden = shown !== 0;
    if (tableWrap) tableWrap.hidden = shown === 0;
  }

  window.xeApplyFilter = applyFilter;

  if (searchInput) searchInput.addEventListener("input", applyFilter);
  if (typeSelect) typeSelect.addEventListener("change", applyFilter);
  if (statusSelect) statusSelect.addEventListener("change", applyFilter);

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (typeSelect) typeSelect.value = "";
      if (statusSelect) statusSelect.value = "";
      applyFilter();
      if (searchInput) searchInput.focus();
    });
  }

  applyFilter();
})();
