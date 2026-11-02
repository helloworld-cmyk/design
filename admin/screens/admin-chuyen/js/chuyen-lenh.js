(function () {
  "use strict";

  /* A2 Quản lý chuyến — trạng thái lệnh phân công trong drawer:
     Chưa nhận lệnh → Đã nhận lệnh → (Đang chuẩn bị) → Đã có mặt. PA3.2. */

  var LENH = {
    "chua-nhan": {
      cls: "sb--orange", icon: "#i-alert", text: "Chưa nhận lệnh",
      sub: "Admin đã phân công, tài xế chưa xác nhận nhận lệnh."
    },
    "da-nhan": {
      cls: "sb--sky", icon: "#i-check", text: "Đã nhận lệnh",
      sub: "Tài xế đã xác nhận lệnh, đang chuẩn bị cho chuyến."
    },
    "co-mat": {
      cls: "sb--green", icon: "#i-pin", text: "Đã có mặt tại bến",
      sub: "Tài xế đã có mặt tại điểm xuất bến, sẵn sàng khởi hành."
    }
  };
  var MISSING = {
    cls: "sb--gray", icon: "#i-alert", text: "Chưa phân công",
    sub: "Cần phân công tài xế trước khi gửi lệnh."
  };

  function el(id) {
    return document.getElementById(id);
  }
  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }

  function stepsFor(lenh, status) {
    var out = { nhan: "", "chuan-bi": "", "co-mat": "", chay: "" };
    if (!lenh) return out;
    if (lenh === "chua-nhan") {
      out.nhan = "is-current";
      return out;
    }
    out.nhan = "is-done";
    if (lenh === "da-nhan") {
      out["chuan-bi"] = "is-current";
      return out;
    }
    out["chuan-bi"] = "is-done";
    if (status === "dang-thuc-hien") {
      out["co-mat"] = "is-done";
      out.chay = "is-current";
    } else if (status === "hoan-thanh") {
      out["co-mat"] = "is-done";
      out.chay = "is-done";
    } else {
      out["co-mat"] = "is-current";
    }
    return out;
  }

  function paint(row) {
    if (!row) return;
    var lenh = row.dataset.lenh || "";
    var status = row.dataset.status || "";
    var hasDriver = Boolean(row.querySelector("td[data-label='Tài xế'] .td-name"));
    var cfg = LENH[lenh] || MISSING;
    if (!hasDriver) cfg = MISSING;

    var chip = el("ctLenhChip");
    if (chip) {
      chip.className = "status-badge " + cfg.cls;
      chip.innerHTML = '<svg class="icon" aria-hidden="true"><use href="' +
        cfg.icon + '"></use></svg>' + cfg.text;
    }
    setText("ctLenhSub", cfg.sub);

    var steps = stepsFor(hasDriver ? lenh : "", status);
    var box = el("ctLenhSteps");
    if (box) {
      Array.prototype.forEach.call(
        box.querySelectorAll(".lenh-step"),
        function (step) {
          var state = steps[step.dataset.step] || "";
          step.className = "lenh-step" + (state ? " " + state : "");
        }
      );
    }

    var tre = parseInt(row.dataset.tre, 10);
    var wrap = el("ctTreWrap");
    if (wrap) {
      var late = !isNaN(tre) && tre > 0;
      wrap.hidden = !late;
      if (late) {
        setText("ctTreText", status === "dang-thuc-hien"
          ? "Chuyến đang trễ " + tre + " phút so với kế hoạch hành trình."
          : "Chuyến trễ " + tre + " phút so với giờ khởi hành dự kiến.");
      }
    }
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-open-detail]");
    if (!btn || btn.disabled) return;
    window.setTimeout(function () {
      paint(btn.closest("tr"));
    }, 0);
  });

  window.VvvChuyenLenh = { paint: paint };
})();
