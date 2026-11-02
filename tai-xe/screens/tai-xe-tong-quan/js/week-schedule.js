/* ================= Lịch tuần tài xế: điều hướng nhiều tuần ================= */

(() => {
  const board = document.querySelector(".tqw-board");

  if (!board) return;

  const buttons = [...board.querySelectorAll("[data-day-index]")];
  const agendaList = board.querySelector(".tqw-agenda-list");

  if (!buttons.length || !agendaList) return;

  const staticGroups = [...board.querySelectorAll("[data-week-section]")]
    .sort((a, b) => Number(a.dataset.weekSection) - Number(b.dataset.weekSection));

  const prevButton = board.querySelector("[data-week-prev]");
  const nextButton = board.querySelector("[data-week-next]");
  const relLabel = board.querySelector("[data-week-rel]");
  const rangeLabel = board.querySelector("[data-week-range]");

  const MIN_WEEK = -5;
  const MAX_WEEK = 4;

  const shortNames = {
    0: "CN", 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7"
  };

  const longNames = {
    0: "Chủ Nhật", 1: "Thứ Hai", 2: "Thứ Ba", 3: "Thứ Tư",
    4: "Thứ Năm", 5: "Thứ Sáu", 6: "Thứ Bảy"
  };

  /* Dữ liệu chuyến mẫu của các tuần lân cận (week-trips.js) */
  const demoTrips = window.taiXeDemoTrips;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let weekOffset = 0;
  let selectedDay = (today.getDay() + 6) % 7;

  const dynamicGroup = document.createElement("article");
  dynamicGroup.className = "tqw-day-group";
  dynamicGroup.hidden = true;
  agendaList.append(dynamicGroup);

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
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
  }

  function weekStart() {
    return addDays(getMonday(today), weekOffset * 7);
  }

  function tripCount(offset, day) {
    if (offset === 0) {
      return staticGroups[day].querySelectorAll(".tqw-trip-card").length;
    }

    const week = demoTrips[String(offset)];

    return week && week[day] ? week[day].length : 0;
  }

  function emptyText(offset) {
    if (offset === -1) return "Tuần trước không có chuyến được phân công.";
    if (offset === 1) return "Tuần sau chưa có chuyến được phân công.";

    return "Khoảng thời gian này chưa có chuyến được phân công.";
  }

  function relativeLabel(offset) {
    if (offset === 0) return "Tuần này";
    if (offset === -1) return "Tuần trước";
    if (offset === 1) return "Tuần sau";
    if (offset < 0) return `${-offset} tuần trước`;

    return `${offset} tuần sau`;
  }

  function buildTripCard(trip) {
    const card = document.createElement("a");
    const arrow = '<use href="#i-arrow-right"></use>';

    card.className = "tqw-trip-card";
    card.href = "tai-xe-chi-tiet-chuyen.html";

    card.innerHTML = `
      <div class="tqw-trip-time">
        <strong>${trip.time}</strong><span>${trip.period}</span>
      </div>
      <div class="tqw-trip-info">
        <div class="tqw-trip-route">
          <strong>${trip.from}</strong>
          <svg class="icon" aria-hidden="true">${arrow}</svg>
          <strong>${trip.to}</strong>
        </div>
        <div class="tqw-trip-meta">
          <span>${trip.pax} khách</span><span>${trip.car}</span>
        </div>
      </div>
      <svg class="icon tqw-trip-link" aria-hidden="true">${arrow}</svg>`;

    return card;
  }

  function renderDates() {
    const start = weekStart();
    const end = addDays(start, 6);

    buttons.forEach((button, index) => {
      const date = addDays(start, index);
      const name = button.querySelector("[data-day-name]");
      const number = button.querySelector("[data-day-date]");

      if (name) {
        name.textContent = shortNames[date.getDay()];
      }

      if (number) {
        number.textContent = String(date.getDate()).padStart(2, "0");
      }

      button.setAttribute(
        "aria-label",
        `${longNames[date.getDay()]}, ${formatDate(date)}`
      );
      button.classList.toggle("is-today", date.getTime() === today.getTime());
      button.classList.toggle("has-trips", tripCount(weekOffset, index) > 0);
    });

    if (relLabel) {
      relLabel.textContent = relativeLabel(weekOffset);
    }

    if (rangeLabel) {
      rangeLabel.textContent = `${formatDate(start)} – ${formatDate(end)}`;
    }

    if (prevButton) {
      prevButton.disabled = weekOffset <= MIN_WEEK;
    }

    if (nextButton) {
      nextButton.disabled = weekOffset >= MAX_WEEK;
    }

    board.dispatchEvent(new CustomEvent("week:change", {
      bubbles: true,
      detail: {
        date: addDays(start, selectedDay),
        min: addDays(getMonday(today), MIN_WEEK * 7),
        max: addDays(getMonday(today), MAX_WEEK * 7 + 6)
      }
    }));
  }

  function renderAgenda() {
    const isCurrentWeek = weekOffset === 0;

    buttons.forEach((button, index) => {
      const active = index === selectedDay;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    staticGroups.forEach((group, index) => {
      group.hidden = isCurrentWeek ? index !== selectedDay : true;
    });

    dynamicGroup.hidden = isCurrentWeek;

    if (isCurrentWeek) return;

    dynamicGroup.replaceChildren();

    const week = demoTrips[String(weekOffset)];
    const trips = week && week[selectedDay] ? week[selectedDay] : [];

    if (!trips.length) {
      const empty = document.createElement("p");

      empty.className = "tqw-empty";
      empty.textContent = emptyText(weekOffset);
      dynamicGroup.append(empty);

      return;
    }

    trips.forEach((trip) => {
      dynamicGroup.append(buildTripCard(trip));
    });
  }

  function render() {
    renderDates();
    renderAgenda();
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedDay = Number(button.dataset.dayIndex);
      render();
    });
  });

  prevButton?.addEventListener("click", () => {
    weekOffset = Math.max(MIN_WEEK, weekOffset - 1);
    render();
  });

  nextButton?.addEventListener("click", () => {
    weekOffset = Math.min(MAX_WEEK, weekOffset + 1);
    render();
  });

  /* Nhận ngày từ date picker (week-picker.js) → nhảy tới tuần chứa ngày đó */
  board.addEventListener("week:goto", (event) => {
    const picked = new Date(event.detail.date);
    const base = getMonday(today);

    let offset = Math.round((getMonday(picked) - base) / 604800000);

    offset = Math.min(MAX_WEEK, Math.max(MIN_WEEK, offset));

    const start = addDays(base, offset * 7);
    const dayDiff = Math.round((picked - start) / 86400000);

    weekOffset = offset;
    selectedDay = Math.min(6, Math.max(0, dayDiff));
    render();
  });

  render();
})();
