(function () {
  "use strict";

  /* ---------- Reveal on scroll ---------- */
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || prefersReduced) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      reveals.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ---------- Active nav link theo section ---------- */
  const navLinks = Array.from(
    document.querySelectorAll(".main-nav a[href^='#']")
  );
  if (navLinks.length && "IntersectionObserver" in window) {
    const linksBySection = new Map();

    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = id ? document.getElementById(id) : null;
      if (section) linksBySection.set(section, link);
    });

    if (linksBySection.size) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navLinks.forEach((link) => {
              link.classList.remove("is-active");
              link.removeAttribute("aria-current");
            });

            const active = linksBySection.get(entry.target);
            if (active) {
              active.classList.add("is-active");
              active.setAttribute("aria-current", "location");
            }
          });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );

      linksBySection.forEach((_, section) => sectionObserver.observe(section));
    }
  }
})();
