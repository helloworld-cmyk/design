(function () {
  "use strict";

  /* Form xe + modal xác nhận xóa. Mở/đóng/focus-trap do
     admin/js/modal.js chung lo; toast do admin/js/admin-shell.js. */

  const STATUS_CLASS = {
    "Đang hoạt động": "sb--green",
    "Đang bảo trì": "sb--orange",
    "Ngưng sử dụng": "sb--slate",
  };

  const form = document.getElementById("vehicleForm");
  const modalTitle = document.getElementById("vehicleModalTitle");
  const submitBtn = document.getElementById("vehicleSubmit");
  const statusBox = document.getElementById("vehicleFormStatus");

  let editingRow = null;
  let deleteRow = null;

  function clearInvalid() {
    if (!form) return;
    form.querySelectorAll(".field.is-invalid").forEach(function (field) {
      field.classList.remove("is-invalid");
    });
    if (statusBox) {
      statusBox.className = "form-status";
      statusBox.textContent = "";
    }
  }

  function markInvalid(input) {
    const field = input.closest(".field");
    if (field) field.classList.add("is-invalid");
  }

  /* ---------- Chuẩn bị nội dung trước khi modal chung mở ---------- */

  document.addEventListener("click", function (event) {
    const opener = event.target.closest("[data-modal-open]");
    if (!opener || opener.disabled) return;
    const id = opener.getAttribute("data-modal-open");

    if (id === "vehicleModal" && form) {
      clearInvalid();
      if (opener.dataset.mode === "edit") {
        editingRow = opener.closest("tr");
        modalTitle.textContent = "Cập nhật xe " + opener.dataset.plate;
        submitBtn.textContent = "Lưu thay đổi";
        form.elements.plate.value = opener.dataset.plate || "";
        form.elements.type.value = opener.dataset.type || "";
        form.elements.seats.value = opener.dataset.seats || "";
        form.elements.driver.value = opener.dataset.driver || "";
        form.elements.status.value = opener.dataset.status || "Đang hoạt động";
        form.elements.inspection.value = opener.dataset.inspection || "";
        form.elements.insurance.value = opener.dataset.insurance || "";
      } else {
        editingRow = null;
        modalTitle.textContent = "Thêm xe mới";
        submitBtn.textContent = "Lưu xe";
        form.reset();
      }
      form.elements.plate.focus();
      return;
    }

    if (id === "vehicleDeleteModal") {
      deleteRow = opener.closest("tr");
      const plateEl = document.getElementById("deletePlate");
      if (plateEl) plateEl.textContent = opener.dataset.plate || "";
    }
  });

  /* Dọn trạng thái mỗi khi một modal đóng (mọi cách đóng) */
  document.addEventListener("vvv:modal-close", function () {
    clearInvalid();
    editingRow = null;
    deleteRow = null;
  });

  /* ---------- Đồng bộ dòng xe sau khi sửa ---------- */

  function setDriverCell(td, driver) {
    td.textContent = "";
    if (driver) {
      td.textContent = driver;
      return;
    }
    const none = document.createElement("span");
    none.className = "xe-driver-none";
    none.textContent = "— Chưa gán";
    td.appendChild(none);
  }

  function updateStats() {
    const all = Array.from(document.querySelectorAll(".xe-table tbody tr"));
    const values = document.querySelectorAll(".xe-stats .stat-body strong");
    if (values.length < 4) return;
    values[0].textContent = String(all.length);
    values[1].textContent = String(
      all.filter(function (r) {
        return r.dataset.status === "Đang hoạt động";
      }).length
    );
    values[2].textContent = String(
      all.filter(function (r) {
        return r.dataset.status === "Đang bảo trì";
      }).length
    );
    values[3].textContent = String(
      document.querySelectorAll(".xe-doc--warn").length
    );
  }

  function syncRow(row, data) {
    row.dataset.plate = data.plate;
    row.dataset.type = data.seats + " chỗ";
    row.dataset.driver = data.driver;
    row.dataset.status = data.status;

    const editBtn = row.querySelector('[data-mode="edit"]');
    if (editBtn) {
      editBtn.dataset.plate = data.plate;
      editBtn.dataset.type = data.type;
      editBtn.dataset.seats = data.seats;
      editBtn.dataset.driver = data.driver;
      editBtn.dataset.status = data.status;
    }

    const plateEl = row.querySelector(".xe-plate");
    const typeEl = row.querySelector(".xe-type");
    if (plateEl) plateEl.textContent = data.plate;
    if (typeEl) typeEl.textContent = data.type;

    const seatsEl = row.querySelector(".xe-seats");
    if (seatsEl) {
      const text = Array.from(seatsEl.childNodes).find(function (node) {
        return node.nodeType === 3;
      });
      if (text) text.nodeValue = " " + data.seats + " chỗ";
    }

    const driverTd = row.querySelector('td[data-label="Tài xế phụ trách"]');
    if (driverTd) setDriverCell(driverTd, data.driver);

    const badge = row.querySelector(".status-badge");
    if (badge) {
      badge.className = "status-badge " + (STATUS_CLASS[data.status] || "");
      badge.textContent = data.status;
    }

    updateStats();
    if (typeof window.xeApplyFilter === "function") window.xeApplyFilter();
  }

  /* ---------- Validate + lưu form xe ---------- */

  if (form) {
    form.addEventListener("input", function (event) {
      const field = event.target.closest(".field");
      if (field) field.classList.remove("is-invalid");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearInvalid();

      const plate = form.elements.plate.value.trim();
      const type = form.elements.type.value.trim();
      const seats = Number(form.elements.seats.value);
      const driver = form.elements.driver.value;
      const status = form.elements.status.value;
      const errors = [];

      if (!plate) {
        markInvalid(form.elements.plate);
        errors.push("Nhập biển số xe.");
      } else {
        const key = plate.toLowerCase().replace(/\s+/g, "");
        const dup = Array.from(
          document.querySelectorAll(".xe-table tbody tr")
        ).some(function (row) {
          const other = (row.dataset.plate || "").toLowerCase();
          return row !== editingRow && other.replace(/\s+/g, "") === key;
        });
        if (dup) {
          markInvalid(form.elements.plate);
          errors.push("Biển số " + plate + " đã tồn tại trong đội xe.");
        }
      }

      if (!type) {
        markInvalid(form.elements.type);
        errors.push("Nhập loại xe.");
      }

      if (!seats || seats < 1 || seats > 50) {
        markInvalid(form.elements.seats);
        errors.push("Sức chứa phải từ 1 đến 50 chỗ.");
      }

      if (errors.length) {
        if (statusBox) {
          statusBox.classList.add("is-error");
          statusBox.textContent = errors.join(" ");
        }
        return;
      }

      if (editingRow) {
        syncRow(editingRow, {
          plate: plate,
          type: type,
          seats: seats,
          driver: driver,
          status: status,
        });
        window.adminToast("Đã lưu thay đổi cho xe " + plate + ".", "success");
      } else {
        window.adminToast("Đã ghi nhận xe " + plate + " (bản dựng mẫu).", "info");
      }
      window.VvvModal.close("vehicleModal");
    });
  }

  /* ---------- Xác nhận xóa xe ---------- */

  const deleteConfirm = document.getElementById("vehicleDeleteConfirm");
  if (deleteConfirm) {
    deleteConfirm.addEventListener("click", function () {
      const plateEl = document.getElementById("deletePlate");
      const plate = plateEl ? plateEl.textContent : "";
      if (deleteRow) {
        deleteRow.remove();
        deleteRow = null;
        updateStats();
        if (typeof window.xeApplyFilter === "function") window.xeApplyFilter();
      }
      window.adminToast("Đã xóa xe " + plate + " khỏi đội xe.", "success");
      window.VvvModal.close("vehicleDeleteModal");
    });
  }
})();
