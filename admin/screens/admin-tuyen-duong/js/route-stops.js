"use strict";

/**
 * A5 — Điểm dừng theo thứ tự (thêm, đổi chỗ, xóa) và bật/tắt tuyến
 * kèm hộp xác nhận ngừng tuyến. Dùng RT (route-data.js) + VvvModal.
 */

(function () {
  var RT = window.RT;
  var bodyEl = document.getElementById("rtBody");
  if (!RT || !bodyEl) return;

  var $ = function (id) {
    return document.getElementById(id);
  };

  var stopListEl = $("stopList");
  var stopNameEl = $("stopName");
  var stopsStatus = $("stopsStatus");
  var stopsId = null;
  var working = [];
  var pendingId = null;

  /* ---------- Modal điểm dừng ---------- */

  function makeToolButton(className, attrs, label) {
    var button = RT.el("button", "stop-tool " + className);
    button.type = "button";
    Object.keys(attrs).forEach(function (key) {
      button.setAttribute(key, attrs[key]);
    });
    button.setAttribute("aria-label", label);
    button.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-chevron-down">' +
      "</use></svg>";
    return button;
  }

  function makeRemoveButton(index, label) {
    var button = RT.el("button", "stop-tool stop-tool--remove");
    button.type = "button";
    button.setAttribute("data-stop-remove", "true");
    button.setAttribute("data-index", String(index));
    button.setAttribute("aria-label", label);
    button.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-close">' +
      "</use></svg>";
    return button;
  }

  function renderStops() {
    stopListEl.textContent = "";
    working.forEach(function (name, index) {
      var first = index === 0;
      var last = index === working.length - 1;

      var item = RT.el("li", "stop-item");
      item.appendChild(RT.el("span", "stop-order", String(index + 1)));

      var nameEl = RT.el("span", "stop-name", name);
      if (first) nameEl.appendChild(RT.el("span", "stop-tag", "Điểm đi"));
      if (last) nameEl.appendChild(RT.el("span", "stop-tag", "Điểm đến"));
      item.appendChild(nameEl);

      var tools = RT.el("span", "stop-tools");
      var up = makeToolButton(
        "stop-tool--up",
        { "data-stop-move": "up", "data-index": String(index) },
        "Di chuyển lên: " + name
      );
      up.disabled = index < 2 || index > working.length - 2;
      var down = makeToolButton(
        "stop-tool--down",
        { "data-stop-move": "down", "data-index": String(index) },
        "Di chuyển xuống: " + name
      );
      down.disabled = index < 1 || index > working.length - 3;
      tools.appendChild(up);
      tools.appendChild(down);
      var remove = makeRemoveButton(index, "Xóa điểm dừng: " + name);
      remove.disabled = first || last;
      tools.appendChild(remove);
      item.appendChild(tools);
      stopListEl.appendChild(item);
    });
  }

  function openStopsModal(id) {
    var route = RT.routes[id];
    if (!route) return;
    stopsId = id;
    working = route.stops.slice();
    $("stopsSub").textContent =
      "Tuyến " + route.code + " · " + route.from + " → " + route.to +
      " · " + route.km + " km";
    stopNameEl.value = "";
    RT.markInvalid(stopNameEl, false);
    RT.setStatus(stopsStatus, "");
    renderStops();
    RT.modalOpen("stopsModal");
  }

  stopListEl.addEventListener("click", function (e) {
    var move = e.target.closest("[data-stop-move]");
    if (move && !move.disabled) {
      var i = Number(move.getAttribute("data-index"));
      var j = move.getAttribute("data-stop-move") === "up" ? i - 1 : i + 1;
      var temp = working[i];
      working[i] = working[j];
      working[j] = temp;
      renderStops();
      return;
    }
    var remove = e.target.closest("[data-stop-remove]");
    if (remove && !remove.disabled) {
      var removed = working.splice(
        Number(remove.getAttribute("data-index")),
        1
      )[0];
      renderStops();
      RT.setStatus(
        stopsStatus,
        "Đã bỏ “" + removed + "” — bấm “Lưu điểm dừng” để áp dụng.",
        "info"
      );
    }
  });

  $("stopAddForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var value = (stopNameEl.value || "").trim();
    if (!value) {
      RT.markInvalid(stopNameEl, true);
      RT.setStatus(stopsStatus, "Nhập tên điểm dừng trước khi thêm.", "error");
      stopNameEl.focus();
      return;
    }
    RT.markInvalid(stopNameEl, false);
    var duplicate = working.some(function (name) {
      return name.toLowerCase() === value.toLowerCase();
    });
    if (duplicate) {
      RT.markInvalid(stopNameEl, true);
      RT.setStatus(
        stopsStatus,
        "Điểm dừng “" + value + "” đã có trên tuyến.",
        "error"
      );
      return;
    }
    if (working.length >= 8) {
      RT.setStatus(stopsStatus, "Tối đa 8 điểm dừng mỗi tuyến.", "error");
      return;
    }
    working.splice(working.length - 1, 0, value);
    stopNameEl.value = "";
    renderStops();
    RT.setStatus(
      stopsStatus,
      "Đã thêm “" + value + "” — bấm “Lưu điểm dừng” để áp dụng.",
      "info"
    );
  });

  $("stopsSave").addEventListener("click", function () {
    var route = RT.routes[stopsId];
    if (!route) return;
    route.stops = working.slice();
    RT.swapRow(stopsId);
    RT.notify(
      "Đã lưu " + route.stops.length + " điểm dừng cho tuyến " +
      route.code + ".",
      "success"
    );
    RT.modalClose("stopsModal");
  });

  /* ---------- Bật/tắt tuyến + xác nhận ngừng ---------- */

  function setActive(id, active) {
    var route = RT.routes[id];
    if (!route) return;
    route.active = active;
    RT.swapRow(id);
  }

  function fillFacts(route) {
    var facts = $("confirmFacts");
    facts.textContent = "";
    [
      ["Quãng đường", route.km + " km · " + RT.dur(route.min)],
      ["Giá vé cơ bản", RT.money(route.price)],
      ["Chuyến đã tạo", route.trips + " chuyến"],
      ["Điểm dừng", route.stops.length + " điểm"]
    ].forEach(function (pair) {
      var li = RT.el("li");
      li.appendChild(RT.el("span", null, pair[0]));
      li.appendChild(RT.el("strong", null, pair[1]));
      facts.appendChild(li);
    });
  }

  document.addEventListener("click", function (e) {
    var action = e.target.closest("[data-route-action]");
    if (action && action.getAttribute("data-route-action") === "stops") {
      openStopsModal(action.getAttribute("data-id"));
      return;
    }

    var switchEl = e.target.closest("[data-toggle-route]");
    if (!switchEl) return;
    var id = switchEl.getAttribute("data-toggle-route");
    var route = RT.routes[id];
    if (!route) return;

    if (!route.active) {
      setActive(id, true);
      RT.notify("Đã kích hoạt lại tuyến " + route.code + ".", "success");
      return;
    }

    pendingId = id;
    $("confirmSub").textContent =
      "Tuyến " + route.code + " · " + route.from + " → " + route.to;
    fillFacts(route);
    RT.modalOpen("confirmModal");
  });

  $("confirmSubmit").addEventListener("click", function () {
    if (!pendingId) return;
    var route = RT.routes[pendingId];
    setActive(pendingId, false);
    RT.notify(
      "Đã ngừng tuyến " + route.code +
      " — tuyến không còn dùng để tạo chuyến mới.",
      "info"
    );
    pendingId = null;
    RT.modalClose("confirmModal");
  });

  document.addEventListener("vvv:modal-close", function (e) {
    if (e.detail && e.detail.id === "confirmModal") pendingId = null;
  });
})();
