(function () {
  "use strict";

  /* A2 Quản lý chuyến — vòng đời sự cố: Mở → Đang xử lý → Đã xử lý.
     Hai bước có ghi nhận người/biện pháp/kết quả + nhật ký. PA4.1 · PA4.2. */

  var STATE = {
    "mo": { chip: "suco-state--mo", text: "Mở", title: "Sự cố đang mở" },
    "dang-xu-ly": {
      chip: "suco-state--dang", text: "Đang xử lý",
      title: "Sự cố đang xử lý"
    },
    "da-xu-ly": {
      chip: "suco-state--xong", text: "Đã xử lý", title: "Sự cố đã xử lý"
    }
  };
  var BIENPHAP = {
    "Tiep tuc": "Tiếp tục chạy",
    "Thay xe": "Thay xe",
    "Doi tai xe": "Đổi tài xế",
    "Ket thuc som": "Kết thúc sớm",
    "Khac": "Khác"
  };
  var row = null;

  function el(id) {
    return document.getElementById(id);
  }
  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }
  function toast(msg, type) {
    if (window.adminToast) window.adminToast(msg, type || "success");
  }
  function setStatus(id, kind, msg) {
    var box = el(id);
    if (!box) return;
    box.className = "form-status" + (kind ? " is-" + kind : "");
    box.textContent = msg || "";
  }
  function close(id) {
    if (window.VvvModal) window.VvvModal.close(id);
  }
  function open(id) {
    if (window.VvvModal) window.VvvModal.open(id);
  }
  function nowHM() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }
  function entry(cls, title, meta, body) {
    var html = '<div class="suco-entry ' + cls + '">' +
      '<span class="suco-dot" aria-hidden="true"></span><div>' +
      "<strong>" + title + "</strong>" +
      '<span class="suco-meta">' + meta + "</span>";
    if (body) html += "<p>" + body + "</p>";
    return html + "</div></div>";
  }

  function render(r) {
    if (r) row = r;
    if (!row) return;
    var d = row.dataset;
    var desc = d.suco || "";
    var block = el("ctSuCo");
    var headerBadge = el("ctSuCoBadge");
    var rowBadge = row.querySelector("[data-suco-badge]");

    if (!desc) {
      if (block) block.hidden = true;
      if (headerBadge) headerBadge.hidden = true;
      if (rowBadge) rowBadge.remove();
      return;
    }

    var state = STATE[d.sucoTrangThai] ? d.sucoTrangThai : "mo";
    var info = STATE[state];
    if (block) block.hidden = false;
    setText("ctSuCoTitle", info.title);
    setText("ctSuCoText", desc);
    setText("suCoXuLyMoTa", desc);

    var chip = el("ctSuCoState");
    if (chip) {
      chip.className = "suco-state " + info.chip;
      chip.textContent = info.text;
    }
    if (headerBadge) headerBadge.hidden = state === "da-xu-ly";

    var log = el("ctSuCoLog");
    if (log) {
      var html = entry("is-start", "Tài xế báo sự cố",
        (d.sucoLoai ? d.sucoLoai + " · " : "") +
        "Báo lúc " + (d.sucoLuc || "--"));
      if (state !== "mo") {
        html += entry("is-work", "Admin nhận xử lý",
          (d.sucoNguoiXuLy || "Quản trị viên") + " · " +
          (BIENPHAP[d.sucoBienPhap] || "Đang xử lý"));
      }
      if (state === "da-xu-ly") {
        html += entry("is-done", "Đã xử lý xong",
          (BIENPHAP[d.sucoBienPhapThuc] || "Hoàn tất") + " · " +
          (d.sucoDongLuc || "--"), d.sucoKetQua || "");
      }
      log.innerHTML = html;
    }

    var btnNhan = document.querySelector("[data-suco-action='nhan']");
    var btnKq = document.querySelector("[data-suco-action='ket-qua']");
    if (btnNhan) btnNhan.hidden = state !== "mo";
    if (btnKq) btnKq.hidden = state !== "dang-xu-ly";
    Array.prototype.forEach.call(
      document.querySelectorAll("#ctSuCoActions [data-chuyen-edit]"),
      function (btn) { btn.hidden = state === "da-xu-ly"; }
    );

    if (state === "da-xu-ly") {
      if (rowBadge) rowBadge.remove();
    } else {
      if (!rowBadge) {
        var stack = row.querySelector(".badge-stack");
        if (stack) {
          rowBadge = document.createElement("span");
          rowBadge.setAttribute("data-suco-badge", "");
          stack.appendChild(rowBadge);
        }
      }
      if (rowBadge) {
        rowBadge.className = "status-badge " +
          (state === "mo" ? "sb--orange" : "sb--sky");
        rowBadge.innerHTML =
          '<svg class="icon" aria-hidden="true"><use href="#i-alert">' +
          "</use></svg>" + (state === "mo" ? "Sự cố" : "Đang xử lý");
      }
    }
    setText("suCoMa", d.ma || "");
    setText("suCoKetQuaMa", d.ma || "");
  }

  document.addEventListener("click", function (event) {
    var detail = event.target.closest("[data-open-detail]");
    if (detail && !detail.disabled) {
      window.setTimeout(function () { render(detail.closest("tr")); }, 0);
      return;
    }
    var action = event.target.closest("[data-suco-action]");
    if (!action || action.disabled || !row) return;
    setStatus("formSuCoXuLyStatus", null, "");
    setStatus("formSuCoKetQuaStatus", null, "");
    var f1 = el("formSuCoXuLy");
    if (f1) f1.reset();
    var f2 = el("formSuCoKetQua");
    if (f2) f2.reset();
    setText("suCoXuLyMoTa", row.dataset.suco || "");
    setText("suCoMa", row.dataset.ma || "");
    setText("suCoKetQuaMa", row.dataset.ma || "");
    open(action.dataset.sucoAction === "nhan"
      ? "modalSuCoXuLy" : "modalSuCoKetQua");
  });

  var formXuLy = el("formSuCoXuLy");
  if (formXuLy) {
    formXuLy.addEventListener("submit", function (event) {
      event.preventDefault();
      var nguoi = el("fsNguoiXuLy").value;
      var bp = el("fsBienPhap").value;
      if (!nguoi || !bp) {
        setStatus("formSuCoXuLyStatus", "error",
          "Chọn người xử lý và biện pháp dự kiến.");
        return;
      }
      if (!row) return;
      row.dataset.sucoTrangThai = "dang-xu-ly";
      row.dataset.sucoNguoiXuLy = nguoi;
      row.dataset.sucoBienPhap = bp;
      var gc = el("fsGhiChu").value.trim();
      if (gc) row.dataset.sucoGhiChu = gc;
      close("modalSuCoXuLy");
      render();
      toast("Đã nhận xử lý sự cố " + (row.dataset.ma || "") +
        " · biện pháp: " + (BIENPHAP[bp] || bp) + ".");
    });
  }

  var formKetQua = el("formSuCoKetQua");
  if (formKetQua) {
    formKetQua.addEventListener("submit", function (event) {
      event.preventDefault();
      var bp = el("fkBienPhap").value;
      var kq = el("fkKetQua").value.trim();
      if (!bp || !kq) {
        setStatus("formSuCoKetQuaStatus", "error",
          "Chọn biện pháp thực tế và ghi kết quả xử lý.");
        return;
      }
      if (!row) return;
      row.dataset.sucoTrangThai = "da-xu-ly";
      row.dataset.sucoBienPhapThuc = bp;
      row.dataset.sucoKetQua = kq;
      row.dataset.sucoDongLuc = nowHM();
      var ma = row.dataset.ma || "";
      close("modalSuCoKetQua");
      render();
      toast("Đã ghi nhận kết quả và đóng sự cố " + ma + ".");
      if (bp === "Ket thuc som") {
        toast("Chuyến kết thúc sớm — đối soát vé tại Quản lý đơn đặt.", "info");
      }
    });
  }

  window.VvvChuyenIncident = { render: render };
})();
