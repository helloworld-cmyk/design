(() => {
  "use strict";

  /* ---------- Tham chiếu ---------- */
  const rows = Array.from(document.querySelectorAll("#ordersBody tr"));
  const body = document.getElementById("ordersBody");
  const empty = document.getElementById("ordersEmpty");
  const meta = document.getElementById("ordersMeta");
  const pager = document.getElementById("ordersPager");
  const pgPrev = document.getElementById("pgPrev");
  const pgNext = document.getElementById("pgNext");
  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const countEls = Array.from(document.querySelectorAll(".tab-count"));
  const filters = {
    search: document.getElementById("fSearch"),
    ngay: document.getElementById("fNgay"),
    tuyen: document.getElementById("fTuyen"),
    chuyen: document.getElementById("fChuyen"),
    taixe: document.getElementById("fTaixe"),
    thanhtoan: document.getElementById("fThanhtoan"),
  };

  const TODAY = "31/10/2026";
  const PAGE_SIZE = 8;
  const state = { tab: "all", page: 1 };

  /* ---------- Tiện ích dùng chung ---------- */
  const money = (text) => parseInt(String(text).replace(/[^\d]/g, ""), 10) || 0;
  const formatMoney = (value) => value.toLocaleString("vi-VN") + "đ";

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const setBadge = (id, text, map) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "status-badge " + (map[text] || "sb--slate");
  };

  const toast = (message, type) => {
    if (typeof window.adminToast === "function") window.adminToast(message, type);
  };

  /* ---------- Lọc + phân trang ---------- */
  const matches = (row) => {
    const q = (filters.search.value || "").trim().toLowerCase();
    if (q) {
      const hay = [
        row.dataset.ve,
        row.dataset.khach,
        row.dataset.sdt,
        row.dataset.tuyen,
        row.dataset.chuyen,
      ].join(" ");
      if (!hay.toLowerCase().includes(q)) return false;
    }
    if (filters.ngay.value && row.dataset.ngay !== filters.ngay.value) return false;
    if (filters.tuyen.value && row.dataset.tuyen !== filters.tuyen.value) return false;
    if (filters.chuyen.value && row.dataset.chuyen !== filters.chuyen.value) return false;
    if (filters.taixe.value && row.dataset.taixe !== filters.taixe.value) return false;
    if (filters.thanhtoan.value && row.dataset.tttt !== filters.thanhtoan.value) return false;
    if (state.tab !== "all" && row.dataset.ttve !== state.tab) return false;
    return true;
  };

  const renderPager = (pageCount) => {
    if (!pager) return;
    pager.hidden = pageCount <= 1;
    pager.querySelectorAll("[data-page]").forEach((btn) => {
      const page = Number(btn.dataset.page);
      btn.hidden = page > pageCount;
      const current = page === state.page;
      btn.classList.toggle("is-current", current);
      if (current) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    if (pgPrev) pgPrev.disabled = state.page <= 1;
    if (pgNext) pgNext.disabled = state.page >= pageCount;
  };

  const render = () => {
    const list = rows.filter(matches);
    const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > pageCount) state.page = pageCount;

    const start = (state.page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    rows.forEach((row) => {
      row.hidden = true;
    });
    slice.forEach((row) => {
      row.hidden = false;
    });

    if (empty) empty.hidden = list.length > 0;
    if (meta) {
      meta.innerHTML = list.length
        ? "Hiển thị <strong>" + (start + 1) + "–" + (start + slice.length) +
          "</strong> trên <strong>" + list.length + "</strong> đơn"
        : "Không có đơn nào khớp bộ lọc hiện tại";
    }
    renderPager(pageCount);
  };

  /* ---------- KPI + số đếm tab ---------- */
  const updateStats = () => {
    let donHomNay = 0;
    let choThu = 0;
    let daThu = 0;
    let tien = 0;
    rows.forEach((row) => {
      if (row.dataset.ngay === TODAY) donHomNay += 1;
      if (row.dataset.tttt === "Chưa thu" && row.dataset.ttve !== "Đã hủy") choThu += 1;
      if (row.dataset.tttt === "Đã thu") {
        daThu += 1;
        tien += money(row.dataset.tien);
      }
    });
    setText("statDon", donHomNay);
    setText("statCho", choThu);
    setText("statThu", daThu);
    setText("statTien", formatMoney(tien));
  };

  const updateCounts = () => {
    const counts = { all: rows.length };
    rows.forEach((row) => {
      const status = row.dataset.ttve;
      counts[status] = (counts[status] || 0) + 1;
    });
    countEls.forEach((el) => {
      el.textContent = counts[el.dataset.count] || 0;
    });
  };

  /* ---------- Sự kiện lọc ---------- */
  const resetFilters = () => {
    Object.values(filters).forEach((el) => {
      if (el) el.value = "";
    });
    state.tab = "all";
    state.page = 1;
    tabButtons.forEach((btn) => {
      const active = btn.dataset.tab === "all";
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    render();
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab || "all";
      state.page = 1;
      tabButtons.forEach((other) => {
        const active = other === btn;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", String(active));
      });
      render();
    });

    btn.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const index = tabButtons.indexOf(btn);
      const next = event.key === "ArrowRight"
        ? (index + 1) % tabButtons.length
        : (index - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[next].focus();
      tabButtons[next].click();
    });
  });

  Object.values(filters).forEach((el) => {
    if (!el) return;
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
      state.page = 1;
      render();
    });
  });

  ["btnReset", "emptyReset"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", resetFilters);
  });

  /* ---------- Phân trang ---------- */
  if (pgPrev) {
    pgPrev.addEventListener("click", () => {
      state.page = Math.max(1, state.page - 1);
      render();
    });
  }

  if (pgNext) {
    pgNext.addEventListener("click", () => {
      state.page += 1;
      render();
    });
  }

  if (pager) {
    pager.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-page]");
      if (!btn) return;
      state.page = Number(btn.dataset.page);
      render();
    });
  }

  /* ---------- Mở chi tiết + làm mới ---------- */
  if (body) {
    body.addEventListener("click", (event) => {
      const btn = event.target.closest('[data-act="detail"]');
      if (!btn) return;
      const row = btn.closest("tr");
      const panels = window.VvvOrdersPanels;
      if (row && panels) panels.open(row);
    });
  }

  const btnRefresh = document.getElementById("btnRefresh");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      btnRefresh.classList.add("is-loading");
      window.setTimeout(() => {
        btnRefresh.classList.remove("is-loading");
        toast("Danh sách đơn đã được làm mới", "info");
      }, 700);
    });
  }

  /* ---------- API cho orders-panels.js ---------- */
  window.VvvOrders = {
    rows,
    state,
    render,
    updateStats,
    updateCounts,
    setText,
    setBadge,
    toast,
  };

  /* ---------- Khởi tạo ---------- */
  updateCounts();
  updateStats();
  render();
})();