(function () {
  "use strict";

  /* A2 Quản lý chuyến — chế độ xem "Lịch điều phối" (PA2.1).
     Lịch suy ra từ chính bảng #chuyenTable nên bảng, lịch, drawer và
     thao tác hủy luôn khớp nhau; trạng thái chuyến quyết định màu khối. */

  var D = window.VvvChuyenLichData;
  var panel = document.querySelector('[data-view-panel="lich"]');
  if (!D || !panel) return;

  var SPAN = D.DAY_TO - D.DAY_FROM;
  var HOURS = ["05:00", "07:00", "09:00", "11:00", "13:00", "15:00",
    "17:00", "19:00", "21:00"];

  var toolbar = document.querySelector(".chuyen-toolbar");
  var grid = document.getElementById("lichGrid");
  var empty = document.getElementById("lichEmpty");
  var dateLabel = document.getElementById("lichDate");
  var scroll = panel.querySelector(".lich-scroll");

  var state = { view: "bang", mode: "taixe", offset: 0 };

  function qsa(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector)
    );
  }
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function fmt(min) {
    return pad(Math.floor(min / 60)) + ":" + pad(min % 60);
  }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function text(node) {
    return node ? node.textContent.trim() : "";
  }
  function setVal(id, value) {
    var node = document.getElementById(id);
    if (node) node.value = value;
  }
  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }
  function toast(msg) {
    if (window.adminToast) window.adminToast(msg, "info");
  }

  /* ---------- Trạng thái ngày ---------- */

  function dateAt(offset) {
    var d = new Date(D.TODAY.getTime());
    d.setDate(d.getDate() + offset);
    return d;
  }
  function dayKey(offset) {
    if (offset === -1) return "hom-qua";
    if (offset === 0) return "hom-nay";
    if (offset === 1) return "ngay-mai";
    return "";
  }
  function dateISO(offset) {
    var d = dateAt(offset);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" +
      pad(d.getDate());
  }
  function paintDate() {
    if (!dateLabel) return;
    var d = dateAt(state.offset);
    var label = pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" +
      d.getFullYear();
    dateLabel.textContent =
      (state.offset === 0 ? "Hôm nay · " : "") + label;
  }

  /* ---------- Đọc chuyến từ bảng ---------- */

  function initials(value) {
    return value.trim().split(/\s+/).map(function (word) {
      return word.charAt(0).toUpperCase();
    }).join("");
  }
  function routeShort(cell) {
    var full = text(cell && cell.querySelector(".td-strong"));
    var parts = full.split("→");
    if (parts.length !== 2) return full;
    return initials(parts[0]) + " → " + initials(parts[1]);
  }
  function readTrips() {
    return qsa("#chuyenTable tbody tr").map(function (row) {
      var cells = row.querySelectorAll("td");
      var clock = text(cells[2] && cells[2].querySelector(".td-strong"));
      var match = clock.match(/(\d{1,2}):(\d{2})/);
      return {
        ma: row.dataset.ma || "",
        status: row.dataset.status || "sap-toi",
        ngay: row.dataset.ngay || "hom-nay",
        taixe: row.dataset.taixe || "",
        xe: text(cells[4] && cells[4].querySelector(".td-strong")),
        dur: D.DUR[row.dataset.tuyen] || 90,
        route: routeShort(cells[1]),
        routeFull: text(cells[1] && cells[1].querySelector(".td-strong")),
        start: match ? Number(match[1]) * 60 + Number(match[2]) : null
      };
    }).filter(function (trip) {
      return trip.ma;
    });
  }

  /* ---------- Dựng lưới ---------- */

  function hoursHtml() {
    return '<div class="lich-hours"><span>Tài nguyên</span>' +
      HOURS.map(function (hour) {
        return "<span>" + hour + "</span>";
      }).join("") + "</div>";
  }
  function blockHtml(trip) {
    if (trip.start == null) return "";
    var status = D.STATUS[trip.status] || D.STATUS["sap-toi"];
    var left = ((trip.start - D.DAY_FROM) / SPAN) * 100;
    var width = Math.min((trip.dur / SPAN) * 100, 100 - left);
    var title = trip.ma + " · " + trip.routeFull + " · " + fmt(trip.start) +
      " (" + status.label + ")";
    return '<button class="lich-block ' + status.cls + '" type="button" ' +
      'style="left:' + left.toFixed(2) + "%;width:" + width.toFixed(2) +
      '%" data-ma="' + esc(trip.ma) + '" title="' + esc(title) + '">' +
      '<span class="lich-code">' + esc(trip.ma) + "</span>" +
      '<span class="lich-route">' + esc(trip.route) + "</span></button>";
  }
  function tripsFor(kind, res, trips) {
    return trips.filter(function (trip) {
      if (kind === "xe") return res.none ? !trip.xe : trip.xe === res.id;
      return trip.taixe === res.id;
    });
  }
  function laneMeta(res, list) {
    if (res.none || res.off) return res.meta;
    if (!list.length) return res.meta + " · Rảnh cả ngày";
    var starts = list.map(function (trip) { return trip.start; });
    var ends = list.map(function (trip) { return trip.start + trip.dur; });
    return res.meta + " · Chạy " + fmt(Math.min.apply(null, starts)) + "–" +
      fmt(Math.max.apply(null, ends));
  }
  function addButton(kind, res) {
    if (res.off) return "";
    var none = res.none;
    var icon = none ? (kind === "xe" ? "i-car" : "i-users") : "i-plus";
    var label = none
      ? "Phân công chuyến chưa gán tài nguyên"
      : "Xếp chuyến cho " + res.name;
    return '<button class="btn btn-sm ' + (none ? "btn-primary" : "btn-ghost") +
      ' row-icon-btn" type="button" data-lich-add data-lane-kind="' +
      (none ? "none" : kind) + '" data-lane-id="' + esc(none ? "" : res.id) +
      '" aria-label="' + esc(label) + '">' +
      '<svg class="icon" aria-hidden="true"><use href="#' + icon +
      '"></use></svg></button>';
  }
  function laneHtml(kind, res, trips) {
    var list = tripsFor(kind, res, trips);
    return '<div class="lich-lane' + (res.off ? " lich-lane--off" : "") +
      '" data-lane-id="' + esc(res.id) + '" data-lane-kind="' + kind + '">' +
      '<div class="lich-lane-label"><div class="lich-lane-head">' +
      '<span class="lich-lane-name">' + esc(res.name) + "</span>" +
      addButton(kind, res) + '</div><span class="lich-lane-meta">' +
      esc(laneMeta(res, list)) + "</span></div>" +
      '<div class="lich-track">' + list.map(blockHtml).join("") +
      "</div></div>";
  }
  function renderLich() {
    if (!grid) return;
    var key = dayKey(state.offset);
    var trips = key
      ? readTrips().filter(function (trip) { return trip.ngay === key; })
      : [];
    var roster = state.mode === "xe" ? D.VEHICLES : D.DRIVERS;
    var none = state.mode === "xe" ? D.NONE_VEHICLE : D.NONE_DRIVER;
    var lanes = roster.map(function (res) {
      return laneHtml(state.mode, res, trips);
    }).join("");
    grid.innerHTML = hoursHtml() + lanes +
      laneHtml(state.mode, none, trips);
    paintDate();
    if (scroll) scroll.hidden = trips.length === 0;
    if (empty) empty.hidden = trips.length > 0;
  }

  /* ---------- Chuyển chế độ ---------- */

  function setView(view) {
    state.view = view;
    qsa("[data-view-panel]").forEach(function (node) {
      node.hidden = node.getAttribute("data-view-panel") !== view;
    });
    qsa("[data-view]").forEach(function (btn) {
      var on = btn.dataset.view === view;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (toolbar) toolbar.classList.toggle("is-lich", view === "lich");
  }
  function setMode(mode) {
    state.mode = mode;
    qsa("[data-lane-mode]").forEach(function (btn) {
      var on = btn.dataset.laneMode === mode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderLich();
  }

  /* ---------- Mở chi tiết / xếp chuyến ---------- */

  function openDetail(ma) {
    var row = document.querySelector('#chuyenTable tr[data-ma="' + ma + '"]');
    var btn = row ? row.querySelector("[data-open-detail]") : null;
    if (btn) btn.click();
  }
  function prefillCreate(kind, id, gio) {
    if (!window.VvvModal) return;
    var form = document.getElementById("formChuyen");
    if (!form) return;
    form.reset();
    var box = document.getElementById("formChuyenStatus");
    if (box) {
      box.className = "form-status";
      box.textContent = "";
    }
    setText("modalChuyenTitle", "Tạo chuyến");
    setVal("fNgayDi", dateISO(state.offset));
    if (gio) setVal("fGioDi", gio);
    if (kind === "xe") setVal("fXeChon", id);
    if (kind === "taixe") setVal("fTaiXeChon", id);
    window.VvvModal.open("modalChuyen");
    if (window.VvvChuyenAvail) window.VvvChuyenAvail.render();
    toast("Mở form xếp chuyến" + (id ? " cho " + id : "") + ".");
  }
  function trackTime(track, clientX) {
    var rect = track.getBoundingClientRect();
    if (!rect.width) return "";
    var ratio = (clientX - rect.left) / rect.width;
    var minutes = D.DAY_FROM + Math.round((ratio * SPAN) / 30) * 30;
    minutes = Math.max(D.DAY_FROM, Math.min(minutes, D.DAY_TO - 30));
    return fmt(minutes);
  }
  panel.addEventListener("click", function (event) {
    var block = event.target.closest(".lich-block");
    if (block) {
      openDetail(block.dataset.ma);
      return;
    }
    var add = event.target.closest("[data-lich-add]");
    if (add) {
      prefillCreate(add.dataset.laneKind, add.dataset.laneId, "");
      return;
    }
    var track = event.target.closest(".lich-track");
    var lane = track ? track.closest(".lich-lane") : null;
    if (!track || !lane) return;
    prefillCreate(lane.dataset.laneKind, lane.dataset.laneId,
      trackTime(track, event.clientX));
  });

  qsa("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () { setView(btn.dataset.view); });
  });
  qsa("[data-lane-mode]").forEach(function (btn) {
    btn.addEventListener("click", function () { setMode(btn.dataset.laneMode); });
  });
  var prev = panel.querySelector("[data-lich-prev]");
  var next = panel.querySelector("[data-lich-next]");
  if (prev) {
    prev.addEventListener("click", function () {
      state.offset -= 1;
      renderLich();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      state.offset += 1;
      renderLich();
    });
  }

  window.VvvChuyenLich = { refresh: renderLich };
  setView("bang");
  setMode("taixe");
})();
