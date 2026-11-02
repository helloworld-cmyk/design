(function () {
  "use strict";

  /* A2 Quản lý chuyến — dải tình trạng tài nguyên trong modal tạo/sửa
     chuyến (PA2.2). Khoá lựa chọn trùng lịch, vẽ lịch bận 05:00–23:00. */

  var FROM = 5 * 60;
  var TO = 23 * 60;
  var TODAY = "2026-10-31";
  var DUR = { "hn-hp": 90, "hn-nd": 90, "hn-qnam": 120, "hn-tb": 105, "hn-hd": 60 };
  var BUSY = {
    "30A-123.45": [[450, 540]],
    "29B-678.90": [[780, 870]],
    "tran-van-binh": [[450, 540]],
    "nguyen-duc-long": [[780, 870]]
  };

  function el(id) {
    return document.getElementById(id);
  }
  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }
  function toMin(text) {
    var parts = (text || "").split(":");
    if (parts.length !== 2) return null;
    return Number(parts[0]) * 60 + Number(parts[1]);
  }
  function fmtTime(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }
  function pct(min) {
    var value = ((min - FROM) / (TO - FROM)) * 100;
    return Math.max(0, Math.min(100, value)).toFixed(2);
  }
  function overlaps(interval, start, end) {
    return start != null && interval[0] < end && interval[1] > start;
  }
  function busyFor(key, today) {
    if (!today) return [];
    return BUSY[key] || [];
  }
  function selectedLabel(select) {
    if (!select || !select.value) return null;
    var opt = select.options[select.selectedIndex];
    return opt ? opt.textContent.replace(/\s*·.*$/, "").trim() : select.value;
  }

  function drawTrack(id, key, start, end, today) {
    var track = el(id);
    if (!track) return;
    var list = busyFor(key, today);
    var html = "";
    var clash = false;
    if (start != null) {
      html += '<span class="avail-busy is-plan" style="left:' + pct(start) +
        "%;width:" + (pct(end) - pct(start)).toFixed(2) + '%"></span>';
    }
    list.forEach(function (interval) {
      if (overlaps(interval, start, end)) clash = true;
      html += '<span class="avail-busy' + (overlaps(interval, start, end)
        ? " is-clash" : "") + '" style="left:' + pct(interval[0]) +
        "%;width:" + (pct(interval[1]) - pct(interval[0])).toFixed(2) +
        '%"></span>';
    });
    track.innerHTML = html;
    var label = list.length
      ? "Bận " + list.map(function (i) {
        return fmtTime(i[0]) + "–" + fmtTime(i[1]);
      }).join(", ")
      : "Rảnh cả ngày";
    track.setAttribute("aria-label", (key || "Tài nguyên") + ": " + label);
    return clash;
  }

  function syncOptions(select, start, end, today) {
    if (!select) return false;
    var clash = false;
    Array.prototype.forEach.call(select.options, function (opt) {
      if (!opt.value) return;
      var base = opt.getAttribute("data-base") || opt.textContent;
      opt.setAttribute("data-base", base);
      var clean = base.replace(/\s*·\s*trùng lịch$/, "");
      var maintenance = /Bảo trì/i.test(clean);
      var busyClash = busyFor(opt.value, today).some(function (i) {
        return overlaps(i, start, end);
      });
      var clashHit = busyClash && !maintenance;
      opt.disabled = (maintenance || clashHit) && !opt.selected;
      opt.textContent = clashHit ? clean + " · trùng lịch" : clean;
      if (clashHit) clash = clash || !opt.selected;
    });
    return clash;
  }

  function render() {
    var box = el("ctAvail");
    if (!box) return;
    var xe = el("fXeChon");
    var tx = el("fTaiXeChon");
    var gio = el("fGioDi");
    var ngay = el("fNgayDi");
    var tuyen = el("fTuyenChon");
    var start = gio && gio.value ? toMin(gio.value) : null;
    var dur = tuyen && DUR[tuyen.value] ? DUR[tuyen.value] : 90;
    var end = start != null ? start + dur : null;
    var today = !ngay || ngay.value === TODAY;

    setText("ctAvailXeName", selectedLabel(xe) || "Chưa chọn xe");
    setText("ctAvailTxName", selectedLabel(tx) || "Chưa chọn tài xế");
    setText("ctAvailWhen", start != null
      ? fmtTime(start) + "–" + fmtTime(end) + " · " + dur + " phút"
      : "Chọn ngày và giờ khởi hành");

    var clashXe = drawTrack("ctAvailXeTrack", xe ? xe.value : "",
      start, end, today);
    var clashTx = drawTrack("ctAvailTxTrack", tx ? tx.value : "",
      start, end, today);
    var hitXe = syncOptions(xe, start, end, today);
    var hitTx = syncOptions(tx, start, end, today);

    var note = el("ctAvailNote");
    if (!note) return;
    if (start == null) {
      note.className = "avail-note";
      note.textContent =
        "Chọn ngày và giờ khởi hành để xem tài nguyên còn rảnh hay không.";
    } else if (clashXe || clashTx || hitXe || hitTx) {
      note.className = "avail-note is-warn";
      note.textContent =
        "Trùng lịch: tài nguyên đang có chuyến trong khung giờ này — " +
        "chọn tài nguyên khác hoặc đổi giờ khởi hành.";
    } else {
      note.className = "avail-note";
      note.textContent =
        "Xe và tài xế đều rảnh trong khung giờ đã chọn.";
    }
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-modal-open='modalChuyen']") ||
      event.target.closest("[data-lich-add]")) {
      window.setTimeout(render, 0);
    }
  });

  ["fGioDi", "fNgayDi", "fTuyenChon", "fXeChon", "fTaiXeChon"].forEach(
    function (id) {
      var node = el(id);
      if (node) node.addEventListener("change", render);
    }
  );

  window.VvvChuyenAvail = { render: render };
  render();
})();
