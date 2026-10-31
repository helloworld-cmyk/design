(function () {
  "use strict";

  /* ---------- Chuyến của tôi: tabs + bộ lọc + tải thêm theo cuộn ---------- */

  const PAGE_SIZE = 5;
  const LOAD_DELAY = 600;

  const tablist = document.querySelector(".tabs");
  const statusEl = document.getElementById("filterStatus");
  const panelsWrap = document.getElementById("tripsPanels");
  const loadingEl = document.getElementById("tripsLoading");
  const errorEl = document.getElementById("tripsError");
  const retryBtn = document.getElementById("retryBtn");
  const searchEl = document.getElementById("tripSearch");
  const routeEl = document.getElementById("tripRoute");
  const clearBtn = document.getElementById("filterClear");

  if (!tablist || !panelsWrap) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs
    .map((tab) => document.getElementById(tab.getAttribute("aria-controls")))
    .filter(Boolean);

  let demoState = "";
  let isLoadingMore = false;

  /* ---------- Phân trang cuộn (lazy load): tab "Đã hoàn thành" ---------- */

  const pages = new Map();

  const setupPages = () => {
    if (!window.VV_TRIPS || !window.VV_TRIPS.data) return;
    panels.forEach((panel) => {
      const end = panel.querySelector(".trips-end");
      const list = panel.querySelector(".trip-list");
      if (!end || !list) return;
      const staticCount = list.querySelectorAll(".ride-card").length;
      const dataCount = window.VV_TRIPS.data.length;
      pages.set(panel, {
        key: end.id.replace(/^end-/, ""),
        index: 0,
        total: staticCount + dataCount,
        remaining: dataCount,
      });
    });
  };

  const appendTrips = (panel, count) => {
    const page = pages.get(panel);
    const list = panel ? panel.querySelector(".trip-list") : null;
    if (!page || !list || count <= 0) return;
    const data = window.VV_TRIPS.data;
    const stop = Math.min(page.index + count, data.length);
    let html = "";
    for (let i = page.index; i < stop; i++) {
      html += window.VV_TRIPS.render(data[i], i);
    }
    list.insertAdjacentHTML("beforeend", html);
    page.index = stop;
    page.remaining = data.length - stop;
  };

  const markPageEnd = (page, allDone) => {
    const end = document.getElementById("end-" + page.key);
    if (end) end.hidden = !allDone;
  };

  const loadMore = (panel) => {
    const page = pages.get(panel);
    if (!page || isLoadingMore || page.remaining <= 0) return;
    if (isFiltering()) return;
    const more = document.getElementById("more-" + page.key);
    isLoadingMore = true;
    if (more) more.hidden = false;
    window.setTimeout(() => {
      appendTrips(panel, PAGE_SIZE);
      if (more) more.hidden = true;
      isLoadingMore = false;
      markPageEnd(page, page.remaining === 0);
      updateStatus();
    }, LOAD_DELAY);
  };

  const setupObserver = () => {
    const sentinels = document.querySelectorAll(".trips-sentinel");
    if (!sentinels.length) return;
    if (!("IntersectionObserver" in window)) {
      pages.forEach((page, panel) => {
        appendTrips(panel, page.remaining);
        markPageEnd(page, true);
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const panel = document.getElementById(entry.target.dataset.panel);
          if (panel) loadMore(panel);
        });
      },
      { rootMargin: "320px 0px" }
    );
    sentinels.forEach((sentinel) => io.observe(sentinel));
  };

  /* ---------- Bộ lọc: tìm kiếm + tuyến ---------- */

  const isFiltering = () => {
    const query = searchEl ? searchEl.value.trim() : "";
    const route = routeEl ? routeEl.value : "all";
    return Boolean(query) || route !== "all";
  };

  const applyFilters = () => {
    const query = searchEl ? searchEl.value.trim().toLowerCase() : "";
    const route = routeEl ? routeEl.value : "all";
    const filtering = Boolean(query) || route !== "all";
    if (clearBtn) clearBtn.hidden = !filtering;

    panels.forEach((panel) => {
      const list = panel.querySelector(".trip-list");
      if (!list) return;
      const page = pages.get(panel);
      if (filtering && page && page.remaining > 0) {
        appendTrips(panel, page.remaining);
        markPageEnd(page, true);
      }
      let visible = 0;
      list.querySelectorAll(".ride-card").forEach((card) => {
        const match =
          (!query || card.textContent.toLowerCase().includes(query)) &&
          (route === "all" || card.dataset.route === route);
        card.hidden = !match;
        if (match) visible++;
      });
      const empty = document.getElementById(
        "empty-" + panel.id.replace(/^panel-/, "")
      );
      if (empty) empty.hidden = visible > 0;
    });

    updateStatus();
  };

  const resetFilters = () => {
    if (searchEl) searchEl.value = "";
    if (routeEl) routeEl.value = "all";
    applyFilters();
  };

  /* ---------- Trạng thái hiển thị ---------- */

  const updateStatus = () => {
    if (!statusEl) return;
    const active = tabs.find(
      (tab) => tab.getAttribute("aria-selected") === "true"
    );
    if (!active) return;
    const panel = document.getElementById(active.getAttribute("aria-controls"));
    if (!panel) return;

    if (isFiltering()) {
      const cards = panel.querySelectorAll(".trip-list .ride-card");
      let visible = 0;
      cards.forEach((card) => {
        if (!card.hidden) visible++;
      });
      statusEl.textContent = visible
        ? "Tìm thấy " + visible + " trong " + cards.length + " chuyến."
        : "Không có chuyến nào phù hợp bộ lọc.";
      return;
    }

    const page = pages.get(panel);
    if (page) {
      const shown = page.total - page.remaining;
      statusEl.textContent =
        page.remaining > 0
          ? "Đang xem " + shown + " trong " + page.total +
            " chuyến · cuộn xuống để xem thêm."
          : "Đang xem tất cả " + page.total + " chuyến đã hoàn thành.";
      return;
    }

    statusEl.textContent = active.getAttribute("data-status") || "";
  };

  const setState = (state) => {
    demoState = state || "";
    const show = Boolean(demoState);
    panelsWrap.hidden = show;
    if (loadingEl) loadingEl.hidden = demoState !== "loading";
    if (errorEl) errorEl.hidden = demoState !== "error";
  };

  const activate = (tab, focus) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
    updateStatus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      setState("");
      activate(tab, false);
    });

    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      let next = null;
      if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
      if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = last;
      if (next === null) return;
      event.preventDefault();
      activate(tabs[next], true);
    });
  });

  if (searchEl) searchEl.addEventListener("input", applyFilters);
  if (routeEl) routeEl.addEventListener("change", applyFilters);
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetFilters();
      if (searchEl) searchEl.focus();
    });
  }

  document.querySelectorAll("[data-clear-filters]").forEach((btn) => {
    btn.addEventListener("click", resetFilters);
  });

  document.querySelectorAll("[data-goto-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.getAttribute("data-goto-tab"));
      setState("");
      if (target) activate(target, false);
    });
  });

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      setState("");
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", location.pathname + location.search);
      }
    });
  }

  /* Trạng thái demo qua URL: #loading hoặc #error */
  const hashState = () => {
    const hash = (location.hash || "").replace("#", "");
    return hash === "loading" || hash === "error" ? hash : "";
  };

  setState(hashState());
  window.addEventListener("hashchange", () => setState(hashState()));

  setupPages();
  pages.forEach((page, panel) => {
    const staticCount = page.total - page.remaining;
    if (page.remaining > 0 && staticCount < PAGE_SIZE) {
      appendTrips(panel, PAGE_SIZE - staticCount);
    }
  });
  setupObserver();
  updateStatus();
})();
