"use strict";

/**
 * A5 — Form tuyến: thêm mới, sửa thông tin, kiểm tra dữ liệu
 * (trùng tuyến, giá không hợp lệ). Điểm dừng và bật/tắt tuyến
 * nằm ở route-stops.js.
 */

(function () {
  var RT = window.RT;
  var form = document.getElementById("routeForm");
  if (!RT || !form) return;

  var $ = function (id) {
    return document.getElementById(id);
  };

  var fromSel = $("rfFrom");
  var toSel = $("rfTo");
  var kmInput = $("rfKm");
  var minInput = $("rfMin");
  var priceInput = $("rfPrice");
  var formStatus = $("routeFormStatus");
  var fields = [fromSel, toSel, kmInput, minInput, priceInput];
  var editingId = null;

  function openRouteModal(id) {
    var route = id ? RT.routes[id] : null;
    editingId = route ? id : null;
    $("routeModalTitle").textContent = route
      ? "Sửa tuyến " + route.code
      : "Thêm tuyến mới";
    $("routeModalSub").textContent = route
      ? "Cập nhật điểm đi – điểm đến, quãng đường và giá vé của tuyến."
      : "Tuyến mới mặc định ở trạng thái Đang chạy sau khi lưu.";
    $("routeFormSubmit").textContent = route ? "Lưu thay đổi" : "Lưu tuyến";

    fromSel.value = route ? route.from : "";
    toSel.value = route ? route.to : "";
    kmInput.value = route ? route.km : "";
    minInput.value = route ? route.min : "";
    priceInput.value = route ? route.price : "";

    fields.forEach(function (input) {
      RT.markInvalid(input, false);
    });
    RT.setStatus(formStatus, "");
    RT.modalOpen("routeModal");
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-route-action]");
    if (!trigger) return;
    var kind = trigger.getAttribute("data-route-action");
    if (kind !== "create" && kind !== "edit") return;
    openRouteModal(kind === "edit" ? trigger.getAttribute("data-id") : null);
  });

  function validate() {
    var errors = [];
    var from = fromSel.value;
    var to = toSel.value;
    var km = Number(kmInput.value);
    var min = Number(minInput.value);
    var price = Number(priceInput.value);

    if (!from) errors.push([fromSel, "Chọn điểm đi cho tuyến."]);
    if (!to) errors.push([toSel, "Chọn điểm đến cho tuyến."]);
    if (from && to && from === to) {
      errors.push([toSel, "Điểm đến phải khác điểm đi."]);
    }
    if (!kmInput.value || km < 1 || km > 1000) {
      errors.push([kmInput, "Khoảng cách phải từ 1 đến 1.000 km."]);
    }
    if (!minInput.value || min < 15 || min > 900) {
      errors.push([minInput, "Thời lượng dự kiến phải từ 15 đến 900 phút."]);
    }
    if (!priceInput.value || price < 1000 || price > 2000000) {
      errors.push([priceInput, "Giá vé phải từ 1.000đ đến 2.000.000đ."]);
    }
    if (!errors.length) {
      var duplicate = Object.keys(RT.routes).some(function (key) {
        if (key === editingId) return false;
        var route = RT.routes[key];
        return route.from === from && route.to === to;
      });
      if (duplicate) {
        errors.push([
          toSel,
          "Tuyến " + from + " → " + to + " đã tồn tại trong danh mục."
        ]);
      }
    }
    return errors;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    fields.forEach(function (input) {
      RT.markInvalid(input, false);
    });

    var errors = validate();
    if (errors.length) {
      errors.forEach(function (pair) {
        RT.markInvalid(pair[0], true);
      });
      RT.setStatus(formStatus, errors[0][1], "error");
      errors[0][0].focus();
      return;
    }

    var from = fromSel.value;
    var to = toSel.value;
    var km = Number(kmInput.value);
    var min = Number(minInput.value);
    var price = Number(priceInput.value);

    if (editingId) {
      var route = RT.routes[editingId];
      route.from = from;
      route.to = to;
      route.km = km;
      route.min = min;
      route.price = price;
      route.updated = RT.today();
      RT.swapRow(editingId);
      RT.notify("Đã cập nhật tuyến " + route.code + ".", "success");
    } else {
      var code = RT.nextCode();
      var id = "r" + code.slice(4);
      RT.routes[id] = {
        code: code, from: from, to: to, km: km, min: min, price: price,
        active: true, trips: 0, updated: RT.today(),
        stops: ["Bến xe " + from, "Bến xe " + to]
      };
      RT.swapRow(id);
      RT.notify(
        "Đã thêm tuyến " + code + " — mặc định ở trạng thái Đang chạy.",
        "success"
      );
    }
    RT.modalClose("routeModal");
  });
})();
