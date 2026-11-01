(function () {
  "use strict";

  var status = document.getElementById("txcStatus");
  var PANELS = ["panel-sap-toi", "panel-dang-chay", "panel-xong", "panel-huy"];
  var currentDay = "all";

  var setStatus = function (kind, text) {
    if (!status) return;
    status.className = "form-status " + kind;
    status.textContent = text;
  };

  var listFor = function (panelId) {
    return document.getElementById("list-" + panelId.slice(6));
  };

  var DAY_LABEL = {
    all: "tất cả các ngày",
    "hom-nay": "hôm nay",
    mai: "ngày mai",
    sau: "các ngày sau"
  };

  var refresh = function () {
    var counts = {};
    document.querySelectorAll("[data-count]").forEach(function (el) {
      counts[el.dataset.count] = el;
    });

    PANELS.forEach(function (id) {
      var list = listFor(id);
      if (!list) return;
      var n = 0;
      list.querySelectorAll(".txc-card").forEach(function (card) {
        var day = card.dataset.day || "all";
        var match = currentDay === "all" || day === currentDay;
        card.classList.toggle("is-hidden", !match);
        if (match) n += 1;
      });
      if (counts[id]) {
        counts[id].textContent = String(n);
        counts[id].hidden = n === 0;
      }
      var empty = document.getElementById("empty-" + id.slice(6));
      if (empty) empty.hidden = n > 0;
    });

    setStatus(
      "is-info",
      "Hiển thị " + DAY_LABEL[currentDay] + " — chọn chuyến để xem chi tiết."
    );
  };

  document.querySelectorAll(".txc-chip[data-day]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      currentDay = chip.dataset.day;
      document.querySelectorAll(".txc-chip[data-day]").forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      refresh();
    });
  });

  refresh();
})();
