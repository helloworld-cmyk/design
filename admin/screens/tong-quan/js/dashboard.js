(function () {
  "use strict";

  var USER_KEY = "vvv.auth.admin";
  var root = document.getElementById("admShell");
  var panels = {
    loading: document.querySelector('[data-dash-panel="loading"]'),
    empty: document.querySelector('[data-dash-panel="empty"]'),
    error: document.querySelector('[data-dash-panel="error"]'),
    ready: document.getElementById("dashReady")
  };
  var statusEl = document.getElementById("dashStatus");
  var refreshBtn = document.getElementById("dashRefresh");
  var loadTimer = null;

  function readUser() {
    try {
      return JSON.parse(window.localStorage.getItem(USER_KEY));
    } catch (error) {
      return null;
    }
  }

  /* ---------- Trạng thái: loading · ready · empty · error ---------- */

  function showPanel(name) {
    Object.keys(panels).forEach(function (key) {
      if (panels[key]) panels[key].hidden = key !== name;
    });
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function loadDashboard(target) {
    if (loadTimer) window.clearTimeout(loadTimer);
    showPanel("loading");
    setStatus("Đang tải dữ liệu bảng điều khiển…");
    if (root) root.setAttribute("aria-busy", "true");
    if (refreshBtn) refreshBtn.classList.add("is-loading");

    loadTimer = window.setTimeout(function () {
      showPanel(target);
      if (root) root.removeAttribute("aria-busy");
      if (refreshBtn) refreshBtn.classList.remove("is-loading");
      if (target === "ready") setStatus("Đã tải xong dữ liệu hôm nay.");
      else if (target === "empty") setStatus("Chưa có dữ liệu hôm nay.");
      else setStatus("Không tải được dữ liệu bảng điều khiển.");
    }, 900);
  }

  var params = new URLSearchParams(window.location.search);
  var stateParam = params.get("state");
  var initState =
    stateParam === "empty" || stateParam === "error" ? stateParam : "ready";
  loadDashboard(initState);

  [refreshBtn]
    .concat(
      Array.prototype.slice.call(
        document.querySelectorAll("[data-dash-reload], [data-dash-retry]")
      )
    )
    .forEach(function (button) {
      if (button) {
        button.addEventListener("click", function () {
          loadDashboard("ready");
        });
      }
    });

  /* ---------- Sidebar dạng drawer (≤1024px) ---------- */

  var burger = document.getElementById("admBurger");
  var side = document.getElementById("admSide");
  var scrim = document.getElementById("admScrim");

  function isSideOpen() {
    return !!root && root.classList.contains("is-side-open");
  }

  function setSideOpen(open) {
    if (!root) return;
    root.classList.toggle("is-side-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute(
        "aria-label",
        open ? "Đóng menu quản trị" : "Mở menu quản trị"
      );
    }
    if (scrim) scrim.hidden = !open;
  }

  if (burger && side) {
    burger.addEventListener("click", function () {
      setSideOpen(!isSideOpen());
    });

    if (scrim) {
      scrim.addEventListener("click", function () {
        setSideOpen(false);
        if (burger) burger.focus();
      });
    }

    side.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setSideOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isSideOpen()) {
        setSideOpen(false);
        if (burger) burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && isSideOpen()) setSideOpen(false);
    });
  }

  /* ---------- User dropdown ---------- */

  var userMenu = document.getElementById("admUser");
  var userBtn = document.getElementById("admUserBtn");

  function isUserOpen() {
    return !!userMenu && userMenu.classList.contains("is-open");
  }

  function setUserOpen(open) {
    if (!userMenu || !userBtn) return;
    userMenu.classList.toggle("is-open", open);
    userBtn.setAttribute("aria-expanded", String(open));
  }

  if (userMenu && userBtn) {
    userBtn.addEventListener("click", function () {
      setUserOpen(!isUserOpen());
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isUserOpen()) {
        setUserOpen(false);
        userBtn.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (isUserOpen() && !userMenu.contains(event.target)) setUserOpen(false);
    });
  }

  /* ---------- Đăng xuất ---------- */

  document.querySelectorAll("[data-adm-logout]").forEach(function (button) {
    button.addEventListener("click", function () {
      try {
        window.localStorage.removeItem(USER_KEY);
      } catch (error) {
        /* chế độ riêng tư: bỏ qua */
      }
      window.location.href = "index.html";
    });
  });

  /* ---------- Cá nhân hoá theo phiên đăng nhập ---------- */

  var user = readUser();
  if (user) {
    var source = user.name || user.email || user.phone || "";
    var initial = source.trim().charAt(0).toUpperCase();
    document.querySelectorAll("[data-adm-initial]").forEach(function (el) {
      el.textContent = initial || "A";
    });
    document.querySelectorAll("[data-adm-name]").forEach(function (el) {
      el.textContent = user.name || "Quản trị viên";
    });
  }

  /* ---------- Tooltip biểu đồ (hover + focus) ---------- */

  var wrap = document.getElementById("chartWrap");
  var tip = document.getElementById("chartTip");

  function fillTip(hit) {
    if (!tip) return;
    var strong = tip.querySelector("strong");
    var span = tip.querySelector("span");
    if (strong) strong.textContent = hit.dataset.revenue + " triệu đ";
    if (span) span.textContent = hit.dataset.label + " · " + hit.dataset.trips + " chuyến";
  }

  function placeTip(hit) {
    if (!wrap || !tip) return;
    var wrapBox = wrap.getBoundingClientRect();
    var box = hit.getBoundingClientRect();
    var left = box.left - wrapBox.left + box.width / 2;
    left = Math.max(76, Math.min(left, wrapBox.width - 76));
    tip.style.left = left + "px";
    tip.style.top = box.top - wrapBox.top + "px";
  }

  if (wrap && tip) {
    document.querySelectorAll(".chart-hit").forEach(function (hit) {
      var show = function () {
        fillTip(hit);
        placeTip(hit);
        tip.classList.add("is-on");
        tip.setAttribute("aria-hidden", "false");
      };
      var hide = function () {
        tip.classList.remove("is-on");
        tip.setAttribute("aria-hidden", "true");
      };
      hit.addEventListener("mouseenter", show);
      hit.addEventListener("mouseleave", hide);
      hit.addEventListener("focus", show);
      hit.addEventListener("blur", hide);
    });

    var hideTip = function () {
      tip.classList.remove("is-on");
      tip.setAttribute("aria-hidden", "true");
    };

    window.addEventListener("scroll", hideTip, { passive: true });
    window.addEventListener("resize", hideTip);
  }
})();
