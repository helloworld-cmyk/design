(function () {
  "use strict";

  /* A2 Quản lý chuyến — luồng tạo/sửa/hủy chuyến và drawer chi tiết.
     Dùng VvvModal (admin/js/modal.js) và adminToast (admin/js/admin-shell.js). */

  var toast = function (msg, type) {
    if (window.adminToast) window.adminToast(msg, type || "success");
  };
  var closeModal = function (id) {
    if (window.VvvModal) window.VvvModal.close(id);
  };
  var openModal = function (id) {
    if (window.VvvModal) window.VvvModal.open(id);
  };

  function setFormStatus(box, kind, message) {
    if (!box) return;
    box.className = "form-status" + (kind ? " is-" + kind : "");
    box.textContent = message || "";
  }

  function fakeSubmit(btn, done) {
    btn.classList.add("is-loading");
    btn.disabled = true;
    window.setTimeout(function () {
      btn.classList.remove("is-loading");
      btn.disabled = false;
      done();
    }, 850);
  }

  /* ---------- Chuẩn bị nội dung TRƯỚC khi modal.js mở ---------- */
  var cancelCtx = { ma: "", ve: "0", row: null };

  document.addEventListener(
    "click",
    function (event) {
      var btn = event.target.closest("[data-modal-open]");
      if (btn && !btn.disabled) {
        if (btn.getAttribute("data-modal-open") === "modalChuyen") {
          setFormStatus(document.getElementById("formChuyenStatus"), null, "");
          var isEdit = btn.dataset.mode === "edit";
          var title = document.getElementById("modalChuyenTitle");
          if (title) {
            title.textContent = isEdit
              ? "Sửa chuyến " + (btn.dataset.ma || "")
              : "Tạo chuyến";
          }
        }
      }

      var cancelBtn = event.target.closest("[data-action='cancel']");
      if (cancelBtn && !cancelBtn.disabled) {
        cancelCtx.ma = cancelBtn.dataset.ma || "";
        cancelCtx.ve = cancelBtn.dataset.ve || "0";
        cancelCtx.row = cancelBtn.closest("tr");
        var huyMa = document.getElementById("huyMa");
        var huyVe = document.getElementById("huyVe");
        if (huyMa) huyMa.textContent = cancelCtx.ma;
        if (huyVe) huyVe.textContent = cancelCtx.ve;
        setFormStatus(document.getElementById("formHuyStatus"), null, "");
        var formHuy = document.getElementById("formHuy");
        if (formHuy) formHuy.reset();
      }
    },
    true
  );

  /* ---------- Tạo / sửa chuyến ---------- */
  var formChuyen = document.getElementById("formChuyen");
  if (formChuyen) {
    formChuyen.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = document.getElementById("formChuyenStatus");
      var missing = Array.prototype.slice
        .call(formChuyen.querySelectorAll("[required]"))
        .filter(function (el) {
          return !el.value;
        });
      if (missing.length) {
        setFormStatus(
          status,
          "error",
          "Vui lòng điền đủ dữ liệu bắt buộc: " +
            missing
              .map(function (el) {
                var label = formChuyen.querySelector(
                  "label[for='" + el.id + "']"
                );
                return label ? label.textContent.replace(" *", "") : el.name;
              })
              .join(", ") +
            "."
        );
        return;
      }
      var tx = document.getElementById("fTaiXeChon").value;
      var ngay = document.getElementById("fNgayDi").value;
      if (tx === "nguyen-duc-long" && ngay === "2026-10-31") {
        setFormStatus(
          status,
          "error",
          "Trùng lịch: Nguyễn Đức Long đã có chuyến VC-1043 (13:00 – 14:30) " +
            "trong cùng khung giờ vận hành. Chọn tài xế hoặc khung giờ khác."
        );
        return;
      }
      if (Number(document.getElementById("fGheMo").value) > 16) {
        setFormStatus(
          status,
          "error",
          "Số ghế mở bán vượt sức chứa xe (tối đa 16 ghế)."
        );
        return;
      }
      var submitBtn = document.querySelector("button[form='formChuyen']");
      fakeSubmit(submitBtn, function () {
        closeModal("modalChuyen");
        var isEdit =
          (document.getElementById("modalChuyenTitle").textContent || "")
            .indexOf("Sửa") === 0;
        toast(
          isEdit
            ? "Đã lưu thay đổi chuyến. Lịch xe/tài xế đã được kiểm tra."
            : "Đã tạo chuyến mới và công bố bán vé."
        );
        if (window.VvvChuyenLich) window.VvvChuyenLich.refresh();
      });
    });
  }

  /* ---------- Hủy chuyến ---------- */
  var formHuy = document.getElementById("formHuy");
  if (formHuy) {
    formHuy.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = document.getElementById("formHuyStatus");
      if (!document.getElementById("fLyDo").value) {
        setFormStatus(status, "error", "Chọn lý do hủy trước khi xác nhận.");
        return;
      }
      var submitBtn = document.querySelector("button[form='formHuy']");
      fakeSubmit(submitBtn, function () {
        if (cancelCtx.row) {
          var badgeBox = cancelCtx.row.querySelector(".badge-stack");
          if (badgeBox) {
            badgeBox.innerHTML =
              '<span class="status-badge sb--gray">Đã hủy</span>';
          }
          cancelCtx.row.dataset.status = "da-huy";
          Array.prototype.slice
            .call(cancelCtx.row.querySelectorAll("button"))
            .forEach(function (b) {
              if (!b.hasAttribute("data-open-detail")) b.disabled = true;
            });
        }
        closeModal("modalHuy");
        closeModal("modalChitiet");
        toast("Đã hủy chuyến " + cancelCtx.ma + " · vé liên quan chuyển Đã hủy");
        if (window.VvvChuyenList) window.VvvChuyenList.applyFilters();
      });
    });
  }

  window.VvvChuyenFlow = { cancelCtx: cancelCtx };
})();
