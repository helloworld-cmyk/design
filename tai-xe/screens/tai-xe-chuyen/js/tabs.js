(function () {
  "use strict";

  var tablist = document.querySelector(".txc-tabs");
  if (!tablist) return;

  var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".txc-tab"));

  var select = function (tab, focus) {
    tabs.forEach(function (item) {
      var active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      var panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !active;
    });
    if (focus) tab.focus();
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      select(tab, false);
    });
  });

  tablist.addEventListener("keydown", function (event) {
    var index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    var next = null;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") {
      next = tabs[(index - 1 + tabs.length) % tabs.length];
    }
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      event.preventDefault();
      select(next, true);
    }
  });
})();
