/* ================= Điều khiển lịch tuần tài xế ================= */

(() => {
  const calendar = document.querySelector("[data-week-calendar]");

  if (!calendar) return;

  const prevButton = document.querySelector("[data-week-prev]");
  const nextButton = document.querySelector("[data-week-next]");
  const todayButton = document.querySelector("[data-week-today]");
  const weekLabel = document.querySelector("[data-week-label]");
  const selectedLabel = document.querySelector("[data-selected-day]");
  const detailList = document.querySelector("[data-day-details]");
  const dayButtons = [...calendar.querySelectorAll("[data-day]")];

  const dayNames = [
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
    "Chủ Nhật"
  ];

  const currentDate = new Date();
  let weekStart = getMonday(currentDate);
  let selectedDay = (currentDate.getDay() + 6) % 7;

  function getMonday(date) {
    const result = new Date(date);
    const offset = (result.getDay() + 6) % 7;

    result.setDate(result.getDate() - offset);
    result.setHours(0, 0, 0, 0);

    return result;
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);

    return result;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  }

  function renderWeek() {
    const endDate = addDays(weekStart, 6);

    if (weekLabel) {
      weekLabel.textContent =
        `${formatDate(weekStart)} – ${formatDate(endDate)}`;
    }

    dayButtons.forEach((button, index) => {
      const date = addDays(weekStart, index);
      const dateElement = button.querySelector("[data-date]");

      if (dateElement) {
        dateElement.textContent = String(date.getDate()).padStart(2, "0");
      }
    });

    renderSelectedDay();
  }

  function renderSelectedDay() {
    const date = addDays(weekStart, selectedDay);

    dayButtons.forEach((button, index) => {
      button.setAttribute(
        "aria-pressed",
        String(index === selectedDay)
      );
    });

    if (selectedLabel) {
      selectedLabel.textContent =
        `${dayNames[selectedDay]}, ${formatDate(date)}`;
    }

    if (!detailList) return;

    detailList.replaceChildren();

    const trips = calendar.querySelectorAll(
      `[data-day-trip="${selectedDay}"]`
    );

    if (!trips.length) {
      const empty = document.createElement("p");

      empty.className = "tqw-detail-empty";
      empty.textContent = "Ngày này hiện chưa có chuyến được phân công.";

      detailList.append(empty);
      return;
    }

    trips.forEach((trip) => {
      detailList.append(trip.cloneNode(true));
    });
  }

  dayButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedDay = Number(button.dataset.day);
      renderSelectedDay();
    });
  });

  prevButton?.addEventListener("click", () => {
    weekStart = addDays(weekStart, -7);
    renderWeek();
  });

  nextButton?.addEventListener("click", () => {
    weekStart = addDays(weekStart, 7);
    renderWeek();
  });

  todayButton?.addEventListener("click", () => {
    weekStart = getMonday(new Date());
    selectedDay = (new Date().getDay() + 6) % 7;
    renderWeek();
  });

  renderWeek();
})();
