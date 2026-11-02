(function () {
  "use strict";

  /* Trạng thái lệnh phân công (PA3.2) trên thẻ chuyến sắp tới (D1).
     Dữ liệu mẫu tĩnh đặt ở data-lenh / data-tre trên .tqw-trip-card;
     mức "Đang chuẩn bị" là suy ra (đã nhận lệnh + trong ngày chạy). */

  var LEVELS = {
    "chua-nhan": { label: "Chưa nhận lệnh", variant: "sb--gray" },
    "da-nhan": { label: "Đã nhận lệnh", variant: "sb--sky" },
    "chuan-bi": { label: "Đang chuẩn bị", variant: "sb--orange" },
    "co-mat": { label: "Đã có mặt", variant: "sb--green" }
  };

  var cards = document.querySelectorAll(".tqw-trip-card[data-lenh]");
  var toast = document.getElementById("tqwLenhToast");
  var toastText = document.getElementById("tqwLenhToastText");
  var toastTimer = null;

  var showToast = function (text) {
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2400);
  };

  var buildChip = function (text, variant) {
    var chip = document.createElement("span");
    chip.className = "status-badge " + variant;
    chip.setAttribute("data-lenh-chip", "");
    chip.textContent = text;
    return chip;
  };

  cards.forEach(function (card) {
    var info = card.querySelector(".tqw-trip-info");
    if (!info) return;

    var tags = document.createElement("div");
    tags.className = "tqw-trip-tags";

    var level = card.dataset.lenh;
    var current = LEVELS[level] || LEVELS["chua-nhan"];
    var chip = buildChip(current.label, current.variant);
    tags.append(chip);

    /* Cờ trễ chỉ hiển thị khi có data-tre */
    var mins = parseInt(card.dataset.tre, 10);
    if (mins > 0) {
      var isTripLate = card.dataset.treType === "hanh-trinh";
      var lateText = isTripLate
        ? "Quá hành trình +" + mins + "'"
        : "Trễ " + mins + "'";
      tags.append(buildChip(lateText, "sb--red"));
    }

    info.append(tags);

    /* Nút xác nhận chỉ có khi chưa nhận lệnh */
    if (level !== "chua-nhan") return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-primary tqw-lenh-btn";
    btn.setAttribute("data-lenh-confirm", "");
    btn.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>' +
      "Xác nhận nhận chuyến";

    btn.addEventListener("click", function () {
      card.dataset.lenh = "da-nhan";
      chip.className = "status-badge " + LEVELS["da-nhan"].variant;
      chip.textContent = LEVELS["da-nhan"].label;
      btn.remove();
      showToast("Đã xác nhận nhận chuyến");
    });

    card.insertAdjacentElement("afterend", btn);
  });
})();
