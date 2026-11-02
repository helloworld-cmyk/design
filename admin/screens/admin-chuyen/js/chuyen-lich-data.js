(function () {
  "use strict";

  /* A2 Quản lý chuyến — hằng số + danh mục tài nguyên cho chế độ
     "Lịch điều phối" (PA2.1). Dữ liệu chuyến lấy trực tiếp từ bảng
     #chuyenTable để bảng, lịch và drawer luôn khớp trạng thái. */

  /* Khung giờ hiển thị: 05:00 → 23:00, 9 cột mỗi cột 2 giờ. */
  var DAY_FROM = 5 * 60;
  var DAY_TO = 23 * 60;

  /* Mốc "hôm nay" của mock (các ngày khác suy ra theo độ lệch). */
  var TODAY = new Date(2026, 9, 31);

  /* Thời lượng tuyến (phút) để tính bề rộng khối chuyến. */
  var DUR = {
    "hn-hp": 90,
    "hn-nd": 90,
    "hn-qnam": 120,
    "hn-tb": 105,
    "hn-hd": 60
  };

  /* Trạng thái chuyến → màu khối (khớp legend) + nhãn. */
  var STATUS = {
    "sap-toi": { cls: "lich-block--orange", label: "Sắp tới" },
    "dang-thuc-hien": { cls: "lich-block--sky", label: "Đang thực hiện" },
    "hoan-thanh": { cls: "lich-block--green", label: "Hoàn thành" },
    "da-huy": { cls: "lich-block--gray", label: "Đã hủy" }
  };

  /* Danh mục tài xế (hàng khi xem "Theo tài xế"). */
  var DRIVERS = [
    { id: "tran-van-binh", name: "Trần Văn Bình", meta: "B2" },
    { id: "nguyen-duc-long", name: "Nguyễn Đức Long", meta: "B2" },
    { id: "pham-thi-hoa", name: "Phạm Thị Hoa", meta: "B2" },
    { id: "vu-dinh-khoa", name: "Vũ Đình Khoa", meta: "B2" },
    { id: "le-van-tu", name: "Lê Văn Tú", meta: "B2" }
  ];

  /* Danh mục xe (hàng khi xem "Theo xe"); off = không khả dụng. */
  var VEHICLES = [
    { id: "30A-123.45", name: "30A-123.45", meta: "16 chỗ" },
    { id: "29B-678.90", name: "29B-678.90", meta: "7 chỗ" },
    { id: "29A-456.78", name: "29A-456.78", meta: "7 chỗ" },
    { id: "30A-234.56", name: "30A-234.56", meta: "16 chỗ" },
    { id: "29C-345.67", name: "29C-345.67", meta: "7 chỗ" },
    {
      id: "30B-890.12",
      name: "30B-890.12",
      meta: "16 chỗ · Bảo trì",
      off: true
    }
  ];

  /* Hàng "chưa phân công" gom chuyến thiếu tài xế/xe. */
  var NONE_DRIVER = {
    id: "chua-phan-cong",
    name: "Chưa phân công",
    meta: "Cần gán tài xế + xe",
    none: true
  };
  var NONE_VEHICLE = {
    id: "chua-gan-xe",
    name: "Chưa gán xe",
    meta: "Cần gán xe",
    none: true
  };

  window.VvvChuyenLichData = {
    DAY_FROM: DAY_FROM,
    DAY_TO: DAY_TO,
    TODAY: TODAY,
    DUR: DUR,
    STATUS: STATUS,
    DRIVERS: DRIVERS,
    VEHICLES: VEHICLES,
    NONE_DRIVER: NONE_DRIVER,
    NONE_VEHICLE: NONE_VEHICLE
  };
})();
