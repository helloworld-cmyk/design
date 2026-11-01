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

  /* ---------- Drawer chi tiết chuyến ---------- */
  var ctEditBtn = document.getElementById("ctEditBtn");
  var ctCancelBtn = document.getElementById("ctCancelBtn");

  function fillDrawer(row) {
    if (!row) return;
    var d = row.dataset;
    var cells = row.querySelectorAll("td");
    var route = cells[1] ? cells[1].querySelector(".td-strong") : null;
    var time = cells[2] ? cells[2].querySelector(".td-strong") : null;
    var badge = row.querySelector(".badge-stack .status-badge");
    var seat = cells[5] ? cells[5].querySelector(".seat-num strong") : null;
    var price = cells[6] ? cells[6].querySelector(".td-strong") : null;
    var driver = cells[3] ? cells[3].querySelector(".td-name") : null;

    document.getElementById("ctMa").textContent = d.ma || "";
    document.getElementById("chitietTitle").textContent =
      route ? route.textContent : "";
    document.getElementById("ctThoiGian").textContent =
      time ? time.textContent : "";

    var ctBadge = document.getElementById("ctBadge");
    if (badge) {
      ctBadge.textContent = badge.textContent.trim();
      ctBadge.className = badge.className;
    }
    document.getElementById("ctTaiXe").textContent = driver
      ? driver.textContent
      : "Chưa phân công";
    document.getElementById("ctXe").textContent = cells[4]
      ? cells[4].textContent.trim()
      : "";
    document.getElementById("ctGhe").textContent = seat ? seat.textContent : "0";
    document.getElementById("ctTien").textContent = price
      ? price.textContent + " mỗi ghế"
      : "";

    var suCo = document.getElementById("ctSuCo");
    if (d.suco) {
      document.getElementById("ctSuCoText").textContent = d.suco;
      suCo.hidden = false;
    } else {
      suCo.hidden = true;
    }

    var canEdit = d.status === "sap-toi";
    if (ctEditBtn) {
      ctEditBtn.disabled = !canEdit;
      ctEditBtn.title = canEdit
        ? "Sửa chuyến này"
        : "Chuyến đang thực hiện — không sửa trực tiếp";
    }
    if (ctCancelBtn) {
      ctCancelBtn.disabled = !canEdit;
      ctCancelBtn.title = canEdit
        ? "Hủy chuyến này"
        : "Chuyến đang thực hiện — xử lý qua báo sự cố";
    }
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-open-detail]");
    if (!btn || btn.disabled) return;
    fillDrawer(btn.closest("tr"));
  });

  if (ctEditBtn) {
    ctEditBtn.addEventListener("click", function () {
      if (ctEditBtn.disabled) return;
      var ma = document.getElementById("ctMa").textContent;
      closeModal("modalChitiet");
      var title = document.getElementById("modalChuyenTitle");
      if (title) title.textContent = "Sửa chuyến " + ma;
      setFormStatus(document.getElementById("formChuyenStatus"), null, "");
      openModal("modalChuyen");
    });
  }

  if (ctCancelBtn) {
    ctCancelBtn.addEventListener("click", function () {
      if (ctCancelBtn.disabled) return;
      var ma = document.getElementById("ctMa").textContent;
      var huyMa = document.getElementById("huyMa");
      if (huyMa) huyMa.textContent = ma;
      closeModal("modalChitiet");
      openModal("modalHuy");
    });
  }

  /* ---------- Xử lý sự cố trong drawer ---------- */
  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-suco]");
    if (!btn || btn.disabled) return;
    var suCo = document.getElementById("ctSuCo");
    if (suCo) suCo.hidden = true;
    if (btn.dataset.suco === "tiep-tuc") {
      toast("Đã ghi nhận xử lý sự cố: chuyến tiếp tục chạy.");
    } else {
      toast(
        "Đã ghi nhận kết thúc sớm — vui lòng đối soát vé ở A6.",
        "info"
      );
    }
  });
})();
