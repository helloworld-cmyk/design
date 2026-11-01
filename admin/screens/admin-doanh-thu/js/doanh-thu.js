(function () {
  "use strict";

  var exportBtn = document.getElementById("dtExport");
  var statusEl = document.getElementById("dtExportStatus");
  var table = document.getElementById("reconTable");
  if (!exportBtn || !table) return;

  function cellValue(cell) {
    var raw = cell.getAttribute("data-value");
    return raw === null ? cell.textContent.trim() : raw;
  }

  function csvCell(text) {
    return /[",;\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function buildCsv() {
    var rows = [];
    table.querySelectorAll("tr").forEach(function (tr) {
      var cells = Array.from(tr.querySelectorAll("th,td"));
      if (!cells.length) return;
      var line = cells
        .filter(function (cell) {
          return !cell.classList.contains("sr-only");
        })
        .map(function (cell) {
          var value = cell.getAttribute("data-value");
          return csvCell(value === null ? cell.textContent.trim() : value);
        });
      rows.push(line.join(";"));
    });
    return "\uFEFF" + rows.join("\r\n");
  }

  exportBtn.addEventListener("click", function () {
    var blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "doanh-thu-2026-10.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);

    if (statusEl) {
      statusEl.textContent = "Đã xuất CSV: doanh-thu-2026-10.csv";
      window.setTimeout(function () {
        statusEl.textContent = "";
      }, 4000);
    }
  });
})();
