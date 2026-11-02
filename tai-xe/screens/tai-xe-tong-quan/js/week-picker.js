/* ================= Date picker lịch tháng cho lịch chạy theo tuần ================= */

(() => {
  const jump = document.querySelector(".tqw-jump");

  if (!jump) return;

  const trigger = jump.querySelector("[data-week-jump]");
  const popover = jump.querySelector("[data-week-popover]");
  const label = jump.querySelector("[data-week-jump-label]");
  const monthLabel = jump.querySelector("[data-pop-month]");
  const grid = jump.querySelector("[data-pop-grid]");
  const prevMonthBtn = jump.querySelector("[data-pop-prev]");
  const nextMonthBtn = jump.querySelector("[data-pop-next]");

  if (!trigger || !popover || !grid) return;

  const dowNames = [
    "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư",
    "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
  ];

  let selected = null;
  let minDate = null;
  let maxDate = null;
  let view = { year: 0, month: 0 };

  function startOfDay(date) {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
  }

  function fmtLabel(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}/${date.getFullYear()}`;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function monthKey(date) {
    return date.getFullYear() * 12 + date.getMonth();
  }

  function renderMonth() {
    const first = new Date(view.year, view.month, 1);
    const last = new Date(view.year, view.month + 1, 0);
    const now = startOfDay(new Date());

    monthLabel.textContent = `Tháng ${view.month + 1}, ${view.year}`;
    prevMonthBtn.disabled = minDate && monthKey(first) <= monthKey(minDate);
    nextMonthBtn.disabled = maxDate && monthKey(last) >= monthKey(maxDate);

    grid.replaceChildren();

    for (let day = 1; day <= last.getDate(); day += 1) {
      const date = new Date(view.year, view.month, day);
      const outOfRange = (minDate && date < minDate)
        || (maxDate && date > maxDate);
      const cell = document.createElement("button");

      const isSelected = Boolean(selected && sameDay(date, selected));

      cell.type = "button";
      cell.className = "tqw-pop-day";
      cell.textContent = String(day).padStart(2, "0");
      cell.setAttribute("aria-label", `${dowNames[date.getDay()]}, ${fmtLabel(date)}`);
      cell.disabled = Boolean(outOfRange);
      cell.classList.toggle("is-today", sameDay(date, now));
      cell.classList.toggle("is-selected", isSelected);
      cell.setAttribute("aria-pressed", String(isSelected));

      if (sameDay(date, now)) {
        cell.setAttribute("aria-current", "date");
      }

      if (!outOfRange) {
        cell.addEventListener("click", () => pick(date));
      }

      grid.append(cell);
    }
  }

  function pick(date) {
    selected = startOfDay(date);
    syncLabel();
    close({ refocus: true });
    jump.dispatchEvent(new CustomEvent("week:goto", {
      detail: { date: new Date(selected) },
      bubbles: true
    }));
  }

  function syncLabel() {
    if (label && selected) {
      label.textContent = fmtLabel(selected);
    }
  }

  function open() {
    if (!popover.hidden) return;

    const base = selected || startOfDay(new Date());

    view = { year: base.getFullYear(), month: base.getMonth() };
    renderMonth();
    popover.hidden = false;
    positionPopover();
    trigger.setAttribute("aria-expanded", "true");

    const current = grid.querySelector(".is-selected")
      || grid.querySelector(".tqw-pop-day:not(:disabled)");

    current?.focus({ preventScroll: true });
  }

  /* Popover là position:fixed để không bị .tqw-board overflow:hidden cắt */
  function positionPopover() {
    if (window.matchMedia("(max-width: 520px)").matches) {
      popover.style.top = "";
      popover.style.left = "";

      return;
    }

    const rect = trigger.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const left = Math.max(16, Math.min(
      rect.right - width,
      window.innerWidth - width - 16
    ));
    let top = rect.bottom + 8;

    if (top + height > window.innerHeight - 16) {
      const above = rect.top - height - 8;

      top = above >= 16
        ? above
        : Math.max(16, window.innerHeight - height - 16);
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  }

  function close({ refocus = true } = {}) {
    if (popover.hidden) return;

    popover.hidden = true;
    trigger.setAttribute("aria-expanded", "false");

    if (refocus) trigger.focus();
  }

  trigger.addEventListener("click", () => {
    if (popover.hidden) {
      open();
    } else {
      close();
    }
  });

  prevMonthBtn?.addEventListener("click", () => {
    view.month -= 1;

    if (view.month < 0) {
      view.month = 11;
      view.year -= 1;
    }

    renderMonth();
  });

  nextMonthBtn?.addEventListener("click", () => {
    view.month += 1;

    if (view.month > 11) {
      view.month = 0;
      view.year += 1;
    }

    renderMonth();
  });

  popover.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!jump.contains(event.target)) {
      close({ refocus: false });
    }
  });

  window.addEventListener("resize", () => close({ refocus: false }));

  window.addEventListener(
    "scroll",
    () => close({ refocus: false }),
    { passive: true, capture: true }
  );

  /* week:change bubble lên từ .tqw-board (cha), nên nghe ở document */
  document.addEventListener("week:change", (event) => {
    selected = startOfDay(event.detail.date);
    minDate = startOfDay(event.detail.min);
    maxDate = startOfDay(event.detail.max);
    syncLabel();

    if (!popover.hidden) {
      renderMonth();
    }
  });
})();
