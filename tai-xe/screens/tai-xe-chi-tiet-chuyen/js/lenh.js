(function () {
  "use strict";

  /* Trạng thái lệnh phân công (PA3.2) — tách khỏi trạng thái chuyến.
     Mức "Đang chuẩn bị" là suy ra: đã nhận lệnh + trong ngày chạy +
     chưa có mặt; ở UI tĩnh hiển thị như một bậc trong chuỗi 4 mức. */

  var mainEl = document.getElementById("main");
  var chip = document.getElementById("tcdLenhChip");
  var late = document.getElementById("tcdLenhLate");
  var steps = document.getElementById("tcdLenhSteps");
  var acceptBtn = document.getElementById("tcdLenhAccept");
  var arriveBtn = document.getElementById("tcdLenhArrive");
  var hint = document.getElementById("tcdLenhHint");
  var statusEl = document.getElementById("tcdLenhStatus");
  var startBtn = document.getElementById("tcdStartBtn");
  var toast = document.getElementById("tcdLenhToast");
  var toastText = document.getElementById("tcdLenhToastText");

  if (!mainEl || !chip) return;

  var ORDER = ["chua-nhan", "da-nhan", "chuan-bi", "co-mat"];

  var LEVELS = {
    "chua-nhan": { label: "Chưa nhận lệnh", variant: "sb--gray", index: 0 },
    "da-nhan": { label: "Đã nhận lệnh", variant: "sb--sky", index: 1 },
    "chuan-bi": { label: "Đang chuẩn bị", variant: "sb--orange", index: 2 },
    "co-mat": { label: "Đã có mặt", variant: "sb--green", index: 3 }
  };

  /* Cho phép đổi mức mẫu bằng data-lenh trên #main */
  var state = { level: mainEl.dataset.lenh || "chua-nhan" };
  var toastTimer = null;

  var setStatus = function (kind, text) {
    if (!statusEl) return;
    statusEl.className = "form-status " + (kind || "");
    statusEl.textContent = text || "";
  };

  var showToast = function (text) {
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2400);
  };

  var renderLate = function () {
    if (!late) return;
    var mins = parseInt(mainEl.dataset.tre, 10);
    if (!(mins > 0)) {
      late.hidden = true;
      return;
    }
    late.textContent = mainEl.dataset.treType === "hanh-trinh"
      ? "Quá hành trình +" + mins + "'"
      : "Trễ " + mins + "'";
    late.hidden = false;
  };

  var renderSteps = function (index) {
    if (!steps) return;
    ORDER.forEach(function (key, i) {
      var step = steps.querySelector('[data-step="' + key + '"]');
      if (!step) return;
      step.classList.toggle("is-done", i < index);
      step.classList.toggle("is-current", i === index);
      if (i === index) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  };

  /* Chặn nút "Bắt đầu chuyến": chỉ bật khi đã xác nhận có mặt tại bến */
  var renderGate = function () {
    var canStart = state.level === "co-mat";
    if (startBtn) startBtn.disabled = !canStart;
    if (hint) hint.hidden = canStart;
  };

  var render = function () {
    var info = LEVELS[state.level] || LEVELS["chua-nhan"];

    chip.className = "status-badge " + info.variant;
    chip.textContent = info.label;
    mainEl.dataset.lenh = state.level;

    renderSteps(info.index);

    if (acceptBtn) acceptBtn.hidden = state.level !== "chua-nhan";
    if (arriveBtn) {
      var waiting = state.level === "da-nhan" || state.level === "chuan-bi";
      arriveBtn.hidden = !waiting;
    }

    renderGate();
  };

  var setLevel = function (level) {
    state.level = level;
    render();
  };

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      setLevel("da-nhan");
      setStatus("is-success", "Đã xác nhận nhận lệnh phân công.");
      showToast("Đã xác nhận nhận lệnh");
    });
  }

  if (arriveBtn) {
    arriveBtn.addEventListener("click", function () {
      setLevel("co-mat");
      setStatus("is-success", "Đã xác nhận có mặt tại bến.");
      showToast("Đã có mặt tại bến — có thể bắt đầu chuyến");
    });
  }

  renderLate();
  render();
})();
