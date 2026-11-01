"use strict";

/* Chi tiết chuyến & chọn ghế — chọn ghế, thông tin người đi, tạm tính. */

(function () {
  var SEAT_PRICE = 180000;
  var MAX_SEATS = 4;

  var form = document.getElementById("bookingForm");
  var seatMap = document.querySelector(".seat-map");
  var seatNoteSeats = document.getElementById("seatNoteSeats");
  var priceSeatCount = document.getElementById("priceSeatCount");
  var priceTotal = document.getElementById("priceTotal");
  var priceTotalValue = document.getElementById("priceTotalValue");
  var formStatus = document.getElementById("formStatus");
  var submitBtn = document.getElementById("detailSubmit");
  var agreeWrap = document.getElementById("agreeWrap");

  var selected = [];
  var loadingTimer = null;

  function money(n) {
    return n.toLocaleString("vi-VN") + "đ";
  }

  function setStatus(kind, html) {
    formStatus.className = "form-status " + (kind ? "is-" + kind : "");
    formStatus.innerHTML = html;
  }

  function flashLoading() {
    priceTotal.classList.add("is-loading");
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(function () {
      priceTotal.classList.remove("is-loading");
    }, 480);
  }

  /* ---------- Ghế ---------- */

  function updateSeats() {
    var names = selected.join(", ");
    seatNoteSeats.textContent = names || "chưa có ghế nào";
    priceSeatCount.textContent = selected.length
      ? selected.length + " · " + names
      : "0";
    recalc();
  }

  function toggleSeat(btn) {
    var id = btn.dataset.seat;
    var index = selected.indexOf(id);
    if (index > -1) {
      selected.splice(index, 1);
      btn.classList.remove("is-selected");
      btn.setAttribute("aria-pressed", "false");
    } else {
      if (selected.length >= MAX_SEATS) {
        setStatus(
          "info",
          "Bạn chỉ có thể chọn tối đa " + MAX_SEATS +
            " ghế cho mỗi đặt chỗ. Bỏ một ghế đang chọn để chọn ghế khác."
        );
        return;
      }
      selected.push(id);
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
      setStatus("", "");
    }
    updateSeats();
    flashLoading();
  }

  if (seatMap) {
    seatMap.addEventListener("click", function (event) {
      var seat = event.target.closest(".seat");
      if (seat && !seat.disabled) toggleSeat(seat);
    });
    seatMap.querySelectorAll(".seat.is-selected").forEach(function (seat) {
      selected.push(seat.dataset.seat);
    });
  }

  /* ---------- Tạm tính ---------- */

  function recalc() {
    priceTotalValue.textContent = money(selected.length * SEAT_PRICE);
  }

  /* ---------- Xác nhận đặt chỗ ---------- */

  function invalidField(fieldId, wrapId, message) {
    var field = document.getElementById(fieldId);
    if (field) field.classList.add("is-invalid");
    var wrap = wrapId ? document.getElementById(wrapId) : null;
    if (wrap) wrap.classList.add("is-invalid");
    return '<li><a href="#' + fieldId + '">' + message + "</a></li>";
  }

  function validate() {
    var errors = [];

    if (!selected.length) {
      errors.push(
        '<li><a href="#chon-ghe">Chọn ít nhất một ghế trống</a></li>'
      );
    }

    ["fieldName", "fieldPhone", "fieldPickup", "fieldDropoff"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove("is-invalid");
      }
    );
    agreeWrap.classList.remove("is-invalid");

    var name = document.getElementById("passengerName");
    var phone = document.getElementById("passengerPhone");
    var pickup = document.getElementById("pickupAddress");
    var dropoff = document.getElementById("dropoffAddress");
    var agree = document.getElementById("agreeTerms");

    if (name.value.trim().length < 2) {
      errors.push(
        invalidField("passengerName", "fieldName",
          "Nhập họ và tên")
      );
    }
    var digits = phone.value.replace(/[\s.\-()]/g, "");
    if (!/^(\+84|0)\d{9}$/.test(digits)) {
      errors.push(
        invalidField("passengerPhone", "fieldPhone",
          "Nhập số điện thoại nhận vé hợp lệ (VD: 0912 345 678)")
      );
    }
    if (pickup.value.trim().length < 5) {
      errors.push(
        invalidField("pickupAddress", "fieldPickup",
          "Nhập địa chỉ đón cụ thể (số nhà, đường, quận/huyện)")
      );
    }
    if (dropoff.value.trim().length < 5) {
      errors.push(
        invalidField("dropoffAddress", "fieldDropoff",
          "Nhập địa chỉ điểm trả cụ thể để tài xế thả bạn đúng nơi")
      );
    }
    if (!agree.checked) {
      agreeWrap.classList.add("is-invalid");
      errors.push(
        '<li><a href="#agreeTerms">Đồng ý điều khoản đặt chỗ</a></li>'
      );
    }
    return errors;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var errors = validate();

      if (errors.length) {
        setStatus(
          "error",
          "<strong>Đặt chỗ chưa hoàn tất — bạn cần:</strong><ul>" +
            errors.join("") + "</ul>"
        );
        formStatus.focus();
        return;
      }

      /* Chưa đăng nhập → sang màn đăng nhập, quay lại đây khi xong */
      var authed = false;
      try {
        authed = Boolean(
          JSON.parse(window.localStorage.getItem("vvv.auth.user"))
        );
      } catch (error) {
        authed = false;
      }
      if (!authed) {
        window.location.href = "dang-nhap.html?next=chi-tiet-chuyen.html";
        return;
      }

      setStatus("", "");
      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.classList.remove("is-loading");
        setStatus(
          "success",
          "<strong>Đặt vé thành công!</strong> Đang chuyển tới vé điện tử..."
        );
        window.setTimeout(function () {
          window.location.href = "dat-cho-thanh-cong.html";
        }, 900);
      }, 1400);
    });

    form.addEventListener("input", function (event) {
      var field = event.target.closest(".field");
      if (field) field.classList.remove("is-invalid");
      if (event.target.id === "agreeTerms") {
        agreeWrap.classList.remove("is-invalid");
      }
    });
  }

  updateSeats();
})();
