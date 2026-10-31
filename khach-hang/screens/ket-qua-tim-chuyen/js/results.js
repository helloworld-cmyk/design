"use strict";

/* Kết quả tìm kiếm chuyến: skeleton khi tải, sắp xếp, lọc theo khung giờ
   (thanh kéo 2 đầu) và loại xe (dropdown), phân trang, empty/error state.
   Không JS → hiện toàn bộ danh sách. */

(function () {
  const PER_PAGE = 6;
  const MIN_GAP = 30;
  const MAX_TIME = 1440;
  const list = document.getElementById("rideList");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(".ride-card--list"));
  const skeleton = document.getElementById("rideSkeletons");
  const loading = document.getElementById("loadingState");
  const empty = document.getElementById("emptyState");
  const errorBox = document.getElementById("errorState");
  const region = document.getElementById("danh-sach-chuyen");
  const pagination = document.getElementById("pagination");
  const statusEl = document.getElementById("resultsStatus");
  const sortSelect = document.getElementById("sortSelect");
  const clearBtn = document.getElementById("clearFilters");
  const emptyReset = document.getElementById("emptyReset");
  const retryBtn = document.getElementById("retryBtn");
  const timeFrom = document.getElementById("timeFrom");
  const timeTo = document.getElementById("timeTo");
  const timeFill = document.getElementById("timeFill");
  const timeValue = document.getElementById("timeValue");
  const dropBtn = document.getElementById("xeDropBtn");
  const dropMenu = document.getElementById("xeMenu");
  const dropLabel = document.getElementById("xeDropLabel");
  const dropOpts = Array.from(document.querySelectorAll(".drop-opt"));

  let page = 1;
  let errorMode = false;

  const show = (el, on) => {
    if (el) el.hidden = !on;
  };

  const fmtTime = (mins) => {
    const m = Math.min(Number(mins), MAX_TIME) % MAX_TIME;
    const h = Math.floor(m / 60);
    return (h < 10 ? "0" + h : String(h)) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60);
  };

  const syncRange = (fromChanged) => {
    if (!timeFrom || !timeTo) return;
    let lo = Number(timeFrom.value);
    let hi = Number(timeTo.value);
    if (hi - lo < MIN_GAP) {
      if (fromChanged) lo = Math.max(0, hi - MIN_GAP);
      else hi = Math.min(MAX_TIME, lo + MIN_GAP);
    }
    timeFrom.value = lo;
    timeTo.value = hi;
    if (timeFill) {
      timeFill.style.left = (lo / MAX_TIME) * 100 + "%";
      timeFill.style.width = ((hi - lo) / MAX_TIME) * 100 + "%";
    }
    if (timeValue) {
      if (lo === 0 && hi === MAX_TIME) timeValue.textContent = "Cả ngày";
      else if (hi === MAX_TIME) timeValue.textContent = "Từ " + fmtTime(lo);
      else if (lo === 0) timeValue.textContent = "Đến " + fmtTime(hi);
      else timeValue.textContent = fmtTime(lo) + " – " + fmtTime(hi);
    }
  };

  const selectedCars = () =>
    dropOpts
      .filter((opt) => opt.getAttribute("aria-selected") === "true")
      .map((opt) => opt.dataset.value);

  const applyFilters = () => {
    const cars = selectedCars();
    const lo = timeFrom ? Number(timeFrom.value) : 0;
    const hi = timeTo ? Number(timeTo.value) : MAX_TIME;
    return cards.filter((card) => {
      const time = Number(card.dataset.time);
      const okTime = time >= lo && time <= hi;
      const okCar = !cars.length || cars.includes(card.dataset.car);
      return okTime && okCar;
    });
  };

  const sortCards = (items) => {
    const mode = sortSelect ? sortSelect.value : "gio";
    return items.slice().sort((a, b) => {
      if (mode === "gia") return Number(a.dataset.price) - Number(b.dataset.price);
      if (mode === "hang") return Number(b.dataset.rating) - Number(a.dataset.rating);
      return Number(a.dataset.time) - Number(b.dataset.time);
    });
  };

  const renderPagination = (pages) => {
    if (!pagination) return;
    pagination.textContent = "";
    show(pagination, pages > 1 && !errorMode);
    if (pages <= 1) return;
    const mkBtn = (label, target) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-btn";
      btn.textContent = label;
      btn.dataset.page = String(target);
      return btn;
    };
    const prev = mkBtn("Trước", page - 1);
    prev.disabled = page === 1;
    pagination.appendChild(prev);
    for (let i = 1; i <= pages; i++) {
      const btn = mkBtn(String(i), i);
      if (i === page) {
        btn.classList.add("is-current");
        btn.setAttribute("aria-current", "page");
      }
      pagination.appendChild(btn);
    }
    const next = mkBtn("Sau", page + 1);
    next.disabled = page === pages;
    pagination.appendChild(next);
  };

  const apply = () => {
    if (errorMode) return;
    const items = sortCards(applyFilters());
    const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
    if (page > pages) page = pages;
    const start = (page - 1) * PER_PAGE;
    items.forEach((card, index) => {
      show(card, index >= start && index < start + PER_PAGE);
      list.appendChild(card);
    });
    cards.forEach((card) => {
      if (!items.includes(card)) show(card, false);
    });
    const has = items.length > 0;
    show(list, has);
    show(empty, !has);
    renderPagination(pages);
    if (statusEl) {
      statusEl.textContent = has
        ? (items.length === cards.length
            ? "Tìm thấy " + cards.length + " chuyến khớp tìm kiếm"
            : "Khớp " + items.length + "/" + cards.length + " chuyến theo bộ lọc") +
          (pages > 1 ? " · Trang " + page + "/" + pages : "")
        : "Không còn chuyến nào khớp bộ lọc hiện tại.";
    }
  };

  const closeDrop = () => {
    if (!dropMenu || !dropBtn) return;
    show(dropMenu, false);
    dropBtn.setAttribute("aria-expanded", "false");
  };

  const syncDropLabel = () => {
    if (!dropLabel) return;
    const on = dropOpts.filter(
      (opt) => opt.getAttribute("aria-selected") === "true"
    );
    if (!on.length) dropLabel.textContent = "Tất cả";
    else if (on.length === 1) dropLabel.textContent = on[0].querySelector("span").textContent;
    else dropLabel.textContent = on.length + " loại xe";
  };

  const resetFilters = () => {
    if (sortSelect) sortSelect.value = "gio";
    if (timeFrom && timeTo) {
      timeFrom.value = 0;
      timeTo.value = MAX_TIME;
      syncRange(false);
    }
    dropOpts.forEach((opt) => opt.setAttribute("aria-selected", "false"));
    syncDropLabel();
    closeDrop();
    page = 1;
    apply();
  };

  const beginLoading = () => {
    errorMode = false;
    show(errorBox, false);
    show(empty, false);
    show(list, false);
    show(pagination, false);
    show(skeleton, true);
    show(loading, true);
    if (statusEl) statusEl.textContent = "Đang tải chuyến phù hợp…";
    if (region) region.setAttribute("aria-busy", "true");
    window.setTimeout(finishLoading, 750);
  };

  const finishLoading = () => {
    show(skeleton, false);
    show(loading, false);
    if (region) region.setAttribute("aria-busy", "false");
    page = 1;
    apply();
  };

  const showError = () => {
    errorMode = true;
    show(list, false);
    show(pagination, false);
    show(skeleton, false);
    show(loading, false);
    show(errorBox, true);
    if (statusEl) statusEl.textContent = "Không tải được danh sách chuyến.";
  };

  if (timeFrom && timeTo) {
    timeFrom.addEventListener("input", () => syncRange(true));
    timeTo.addEventListener("input", () => syncRange(false));
    const onRangeApplied = () => {
      page = 1;
      apply();
    };
    timeFrom.addEventListener("change", onRangeApplied);
    timeTo.addEventListener("change", onRangeApplied);
    syncRange();
  }

  if (dropBtn && dropMenu) {
    dropBtn.addEventListener("click", () => {
      const open = dropBtn.getAttribute("aria-expanded") === "true";
      dropBtn.setAttribute("aria-expanded", open ? "false" : "true");
      show(dropMenu, !open);
    });
    dropOpts.forEach((opt) => {
      opt.addEventListener("click", () => {
        const on = opt.getAttribute("aria-selected") === "true";
        opt.setAttribute("aria-selected", on ? "false" : "true");
        syncDropLabel();
        page = 1;
        apply();
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".drop")) closeDrop();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrop();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      page = 1;
      apply();
    });
  }

  if (clearBtn) clearBtn.addEventListener("click", resetFilters);
  if (emptyReset) {
    emptyReset.addEventListener("click", () => {
      resetFilters();
      if (region) region.scrollIntoView({ block: "start" });
    });
  }
  if (retryBtn) retryBtn.addEventListener("click", beginLoading);

  if (pagination) {
    pagination.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-page]");
      if (!btn || btn.disabled) return;
      page = parseInt(btn.dataset.page, 10);
      apply();
      if (region) region.scrollIntoView({ block: "start" });
    });
  }

  if (document.documentElement.classList.contains("js")) {
    if (window.location.hash === "#loi") {
      showError();
    } else {
      beginLoading();
    }
  }
})();
