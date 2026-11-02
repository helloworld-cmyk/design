(function () {
  "use strict";

  var status = document.getElementById("tdhStatus");
  var finishStatus = document.getElementById("tdhFinishStatus");
  var progressFill = document.getElementById("tdhProgressFill");
  var progressLabel = document.getElementById("tdhProgressLabel");
  var cashEl = document.getElementById("tdhCashCollected");
  var confirm = window.tdhConfirm;

  var setStatus = function (el, kind, text) {
    if (!el) return;
    el.className = "form-status " + (kind || "");
    el.textContent = text || "";
  };

  var fmtCash = function (n) {
    return n.toLocaleString("vi-VN") + "đ";
  };

  var getName = function (card) {
    var el = card.querySelector(".tdh-passenger-id strong");
    return el ? el.textContent : "";
  };

  /* ---------- Bản đồ trạng thái & nội dung modal ---------- */

  var STAGE_BADGE = {
    "cho-don": ["badge--sky", "Chờ đón"],
    "da-don": ["badge--green", "Đã lên xe"],
    "da-tra": ["badge--green", "Hoàn thành"]
  };

  var PAID_BADGE = {
    true: ["badge--green", "Đã trả tiền"],
    false: ["badge--orange", "Chưa trả tiền"]
  };

  var MODAL_TEXT = {
    paid: function (n) {
      return "Bạn có chắc muốn xác nhận khách <strong>" + n +
        "</strong> ĐÃ TRẢ TIỀN không?";
    },
    unpaid: function (n) {
      return "Bạn có chắc muốn bỏ xác nhận trả tiền của khách <strong>" +
        n + "</strong> không?";
    },
    pickup: function (n) {
      return "Bạn có chắc muốn xác nhận khách <strong>" + n +
        "</strong> ĐÃ LÊN XE không?";
    },
    unpickup: function (n) {
      return "Bạn có chắc muốn bỏ xác nhận lên xe của khách <strong>" +
        n + "</strong> không?";
    },
    dropoff: function (n) {
      return "Bạn có chắc muốn xác nhận ĐÃ TRẢ KHÁCH <strong>" + n +
        "</strong> tại điểm đến không?";
    },
    undropoff: function (n) {
      return "Bạn có chắc muốn bỏ xác nhận trả khách của khách <strong>" +
        n + "</strong> không?";
    }
  };

  var APPLY = {
    paid: function (c) { c.dataset.paid = "true"; },
    unpaid: function (c) { c.dataset.paid = "false"; },
    pickup: function (c) { c.dataset.status = "da-don"; },
    unpickup: function (c) { c.dataset.status = "cho-don"; },
    dropoff: function (c) { c.dataset.status = "da-tra"; },
    undropoff: function (c) { c.dataset.status = "da-don"; }
  };

  var MESSAGE = {
    paid: "Đã xác nhận khách trả tiền.",
    unpaid: "Đã bỏ xác nhận trả tiền.",
    pickup: "Đã xác nhận khách lên xe.",
    unpickup: "Đã bỏ xác nhận lên xe.",
    dropoff: "Đã xác nhận trả khách.",
    undropoff: "Đã bỏ xác nhận trả khách."
  };

  var setBadge = function (el, pair) {
    if (!el) return;
    el.className = "badge " + pair[0];
    el.textContent = pair[1];
  };

  var applyState = function (card) {
    var s = card.dataset.status;
    var paid = card.dataset.paid === "true";

    setBadge(card.querySelector("[data-badge-paid]"), PAID_BADGE[paid]);
    setBadge(card.querySelector("[data-badge-stage]"), STAGE_BADGE[s]);

    var paidBtn = card.querySelector('[data-action="paid"]');
    var pickBtn = card.querySelector('[data-action="pickup"]');
    var dropBtn = card.querySelector('[data-action="dropoff"]');

    if (paidBtn) {
      paidBtn.classList.toggle("is-done", paid);
      paidBtn.setAttribute("aria-pressed", String(paid));
    }
    if (pickBtn) {
      pickBtn.hidden = s === "da-tra";
      pickBtn.classList.toggle("is-done", s === "da-don");
      pickBtn.setAttribute("aria-pressed", String(s === "da-don"));
    }
    if (dropBtn) {
      dropBtn.hidden = s === "cho-don";
      dropBtn.classList.toggle("is-done", s === "da-tra");
      dropBtn.setAttribute("aria-pressed", String(s === "da-tra"));
    }
  };

  var actionKey = function (btn, card) {
    var a = btn.dataset.action;
    if (a === "paid") {
      return card.dataset.paid === "true" ? "unpaid" : "paid";
    }
    if (a === "pickup") {
      return card.dataset.status === "da-don" ? "unpickup" : "pickup";
    }
    if (a === "dropoff") {
      return card.dataset.status === "da-tra" ? "undropoff" : "dropoff";
    }
    return null;
  };

  /* ---------- Tiến độ + tiền đã thu ---------- */

  var updateProgress = function () {
    var cards = document.querySelectorAll("[data-passenger]");
    if (!cards.length) return;

    var total = cards.length;
    var boarded = 0;
    var cash = 0;

    cards.forEach(function (card) {
      var s = card.dataset.status;
      if (s === "da-don" || s === "da-tra") boarded += 1;
      if (card.dataset.paid === "true") {
        cash += parseInt(card.dataset.amount, 10) || 0;
      }
    });

    var pct = Math.round((boarded / total) * 100);

    if (progressFill) progressFill.style.setProperty("--w", pct + "%");
    if (progressLabel) {
      progressLabel.textContent = boarded + "/" + total + " khách đã đón";
    }

    var progressBar = document.querySelector(".tdh-progress-bar");
    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", String(pct));
      progressBar.setAttribute("aria-label", "Tiến độ chuyến " + pct + "%");
    }

    if (cashEl) cashEl.textContent = fmtCash(cash);
  };

  /* ---------- Copy số điện thoại ---------- */

  var copyFallback = function (text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (err) {
      /* no-op */
    }
    document.body.removeChild(ta);
  };

  var copyPhone = function (card, btn) {
    var label = btn.querySelector("[data-copy-label]");
    var phone = card.dataset.phone || "";

    var done = function () {
      btn.classList.add("is-copied");
      if (label) label.textContent = "Đã copy ✓";
      setStatus(
        status,
        "is-success",
        "Đã copy số điện thoại của " + getName(card) + "."
      );
      window.setTimeout(function () {
        btn.classList.remove("is-copied");
        if (label) label.textContent = "Copy SĐT";
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phone).then(done, function () {
        copyFallback(phone, done);
      });
    } else {
      copyFallback(phone, done);
    }
  };

  /* ---------- Gắn sự kiện thẻ ---------- */

  document.querySelectorAll("[data-passenger]").forEach(function (card) {
    card.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.dataset.action === "copy") {
          copyPhone(card, btn);
          return;
        }

        var key = actionKey(btn, card);
        if (!key) return;

        confirm.open(
          MODAL_TEXT[key](getName(card)),
          function () {
            APPLY[key](card);
            applyState(card);
            setStatus(status, "is-success", MESSAGE[key]);
            updateProgress();
          },
          btn
        );
      });
    });

    applyState(card);
  });

  /* ---------- Kết thúc chuyến ---------- */

  var finishBtn = document.getElementById("tdhFinishBtn");

  if (finishBtn) {
    finishBtn.addEventListener("click", function () {
      finishBtn.classList.add("is-loading");
      finishBtn.disabled = true;
      setStatus(finishStatus, "is-info", "Đang kết thúc chuyến...");

      window.setTimeout(function () {
        finishBtn.classList.remove("is-loading");
        finishBtn.disabled = false;
        setStatus(
          finishStatus,
          "is-success",
          "Đã kết thúc chuyến — chuyển về tổng quan."
        );

        window.setTimeout(function () {
          window.location.href = "tong-quan.html";
        }, 700);
      }, 1000);
    });
  }

  updateProgress();
})();
