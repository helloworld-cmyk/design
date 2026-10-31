(function () {
  "use strict";

  /* Dữ liệu demo tab "Đã hoàn thành" — trips.js render theo đợt 5 chuyến
     mỗi lần người dùng cuộn tới cuối danh sách (lazy load). */

  const ROUTES = [
    { to: "Ninh Bình", dur: "3h 00p", note: "Cao tốc Pháp Vân – Cầu Giẽ" },
    { to: "Sa Pa", dur: "7h 30p", note: "Cao tốc Nội Bài – Lào Cai" },
    { to: "Hải Phòng", dur: "1h 45p", note: "Cao tốc Hà Nội – Hải Phòng" },
    { to: "Hạ Long", dur: "3h 00p", note: "Cao tốc Hà Nội – Hạ Long" },
    { to: "Thái Nguyên", dur: "2h 00p", note: "Quốc lộ 3 mới" },
  ];

  const DRIVERS = [
    {
      name: "Trần Văn Minh",
      rating: "4.9",
      count: 326,
      car: "Ford Transit Limousine · 16 chỗ",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=160",
    },
    {
      name: "Lê Đức Anh",
      rating: "4.8",
      count: 512,
      car: "Ford Transit · 9 chỗ",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=160",
    },
    {
      name: "Phạm Thị Lan",
      rating: "5.0",
      count: 214,
      car: "Hyundai Solati Limousine · 11 chỗ",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=160",
    },
    {
      name: "Hoàng Minh Tuấn",
      rating: "4.9",
      count: 389,
      car: "Ford Transit · 16 chỗ",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=160",
    },
    {
      name: "Đỗ Quang Huy",
      rating: "4.7",
      count: 178,
      car: "Toyota Hiace · 9 chỗ",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=160",
    },
  ];

  const PICKUPS = [
    "145 Giải Phóng",
    "bến xe Mỹ Đình",
    "bến xe Giáp Bát",
    "bến xe Nước Ngầm",
  ];

  const DROPS = [
    "trung tâm thành phố",
    "Ngã tư Sở",
    "bãi chợ Đêm",
    "khu phố Cầu Mây",
  ];

  const WEEKDAYS = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  /* Mỗi chuyến: [mã, tuyến, ngày, giờ đi, giờ đến, ghế, giá (nghìnđ),
     số ghế, tài xế, điểm đón, điểm trả, đã đánh giá] */
  const TRIPS = [
    ["VV-260725-209", 2, "25/07/2026", "07:15", "09:00", "B1", 90, 1, 2, 1, 1, 1],
    ["VV-260718-114", 0, "18/07/2026", "07:30", "10:30", "A2", 180, 1, 0, 0, 0, 1],
    ["VV-260711-032", 3, "11/07/2026", "07:00", "10:00", "C3", 120, 1, 3, 0, 2, 1],
    ["VV-260704-288", 1, "04/07/2026", "22:00", "05:30", "A1", 250, 1, 1, 1, 3, 0],
    ["VV-260627-051", 4, "27/06/2026", "14:00", "16:00", "B2", 120, 1, 4, 2, 0, 1],
    ["VV-260620-407", 2, "20/06/2026", "06:30", "08:15", "A1, A2", 180, 2, 2, 2, 1, 1],
    ["VV-260613-166", 0, "13/06/2026", "08:00", "11:00", "B1", 180, 1, 0, 1, 0, 1],
    ["VV-260606-243", 3, "06/06/2026", "07:30", "10:30", "C1, C2", 240, 2, 3, 0, 2, 1],
    ["VV-260530-078", 2, "30/05/2026", "07:00", "08:45", "B2", 90, 1, 2, 3, 1, 0],
    ["VV-260523-315", 1, "23/05/2026", "21:30", "05:00", "A1", 250, 1, 1, 1, 3, 1],
    ["VV-260516-129", 4, "16/05/2026", "13:30", "15:30", "B1", 120, 1, 4, 2, 0, 1],
    ["VV-260509-361", 0, "09/05/2026", "07:00", "10:00", "A2, B2", 360, 2, 0, 0, 0, 1],
    ["VV-260502-084", 3, "02/05/2026", "08:00", "11:00", "C2", 120, 1, 3, 1, 2, 1],
    ["VV-260425-272", 2, "25/04/2026", "06:45", "08:30", "A1", 90, 1, 2, 2, 1, 1],
    ["VV-260418-147", 0, "18/04/2026", "07:30", "10:30", "B1", 180, 1, 0, 3, 0, 0],
    ["VV-260411-296", 1, "11/04/2026", "22:15", "05:45", "A1", 250, 1, 1, 1, 3, 1],
    ["VV-260404-063", 3, "04/04/2026", "07:00", "10:00", "C1", 120, 1, 3, 0, 2, 1],
    ["VV-260328-231", 4, "28/03/2026", "14:30", "16:30", "B2", 120, 1, 4, 2, 0, 1],
    ["VV-260321-104", 2, "21/03/2026", "07:15", "09:00", "A2", 90, 1, 2, 0, 1, 1],
    ["VV-260314-339", 0, "14/03/2026", "08:30", "11:30", "B1, B2", 360, 2, 0, 1, 0, 1],
    ["VV-260307-072", 3, "07/03/2026", "07:45", "10:45", "C3", 120, 1, 3, 0, 2, 1],
    ["VV-260228-418", 1, "28/02/2026", "21:45", "05:15", "A1", 250, 1, 1, 1, 3, 1],
    ["VV-260221-155", 2, "21/02/2026", "06:30", "08:15", "B1", 90, 1, 2, 2, 1, 0],
    ["VV-260214-287", 0, "14/02/2026", "07:00", "10:00", "A1", 180, 1, 0, 0, 0, 1],
    ["VV-260207-096", 4, "07/02/2026", "13:00", "15:00", "B2", 120, 1, 4, 2, 0, 1],
    ["VV-260131-324", 3, "31/01/2026", "07:30", "10:30", "C1, C2", 240, 2, 3, 0, 2, 1],
  ];

  const weekdayOf = (date) => {
    const parts = date.split("/");
    const day = new Date(+parts[2], parts[1] - 1, +parts[0]).getDay();
    return WEEKDAYS[day];
  };

  const priceText = (value) => (value * 1000).toLocaleString("vi-VN") + "đ";

  function render(trip) {
    const route = ROUTES[trip[1]];
    const driver = DRIVERS[trip[8]];
    const weekday = weekdayOf(trip[2]);
    return `
      <article class="ride-card ride-card--list" data-route="${route.to}"
        aria-label="Chuyến Hà Nội đi ${route.to}, ${weekday.toLowerCase()} ${trip[2]}">
        <div class="ride-head">
          <strong class="ride-time">${trip[3]} – ${trip[4]}</strong>
          <span class="ride-dur">${route.dur}</span>
          <span class="status-badge status-badge--done">
            <svg class="icon" aria-hidden="true">
              <use href="#i-check-circle"></use>
            </svg>
            Đã hoàn thành
          </span>
        </div>

        <p class="ride-route">
          <svg class="icon" aria-hidden="true">
            <use href="#i-pin"></use>
          </svg>
          ${PICKUPS[trip[9]]}, Hà Nội
          <svg class="icon" aria-hidden="true">
            <use href="#i-arrow-right"></use>
          </svg>
          ${DROPS[trip[10]]}, ${route.to}
        </p>

        <p class="ride-meta">
          <span>${weekday}, ${trip[2]}</span>
          <span class="ride-code">Mã đặt chỗ ${trip[0]}</span>
        </p>

        <div class="ride-driver">
          <div class="driver">
            <img class="avatar avatar--driver avatar--photo" src="${driver.photo}"
              alt="" width="44" height="44" loading="lazy" />
            <div class="driver-info">
              <strong>${driver.name}</strong>
              <span class="driver-meta">
                <svg class="icon icon-star" aria-hidden="true">
                  <use href="#i-star"></use>
                </svg>
                ${driver.rating} · ${driver.count} chuyến
              </span>
            </div>
          </div>
          <span class="driver-car">${driver.car}</span>
        </div>

        <div class="ride-foot">
          <div class="ride-price">
            <strong>${priceText(trip[6])}</strong>
            <span>Ghế ${trip[5]} · đã trả tiền mặt</span>
          </div>
          <div class="ride-actions">
            <a class="btn btn-primary btn-sm" href="dat-cho-thanh-cong.html">
              Xem vé
            </a>
            <a class="btn btn-ghost btn-sm" href="index.html#dat-xe">Đặt lại</a>
          </div>
        </div>
      </article>`;
  }

  window.VV_TRIPS = { data: TRIPS, render: render };
})();
