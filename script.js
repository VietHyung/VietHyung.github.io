(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $("#year").textContent = new Date().getFullYear();

  /* Scroll reveal */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Count-up stats */
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  $$("[data-count]").forEach(function (el) {
    if (!("IntersectionObserver" in window)) { countUp(el); return; }
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { countUp(el); o.disconnect(); }
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* Typing role rotator */
  var typed = $("#typed");
  if (typed && !reduce) {
    var words = ["Java Backend Developer", "Spring Boot Engineer", "Microservices Builder", "Aspiring Fullstack Engineer"];
    var wi = 0, ci = words[0].length, deleting = true;
    (function tick() {
      var w = words[wi];
      typed.textContent = w.slice(0, ci);
      var delay = deleting ? 40 : 85;
      if (!deleting && ci === w.length) { deleting = true; delay = 1900; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
      else { ci += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    })();
  }

  /* Nav: shadow, progress bar, active link, back-to-top */
  var nav = $("#nav"), bar = $("#progress"), toTop = $("#toTop");
  var links = $$("#menu a"), sections = links.map(function (a) { return $(a.getAttribute("href")); });
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    nav.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 600);
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* Mobile menu */
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(open) { menu.classList.toggle("open", open); burger.setAttribute("aria-expanded", String(open)); }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* Card spotlight follows the cursor */
  $$(".glow").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* 3D tilt on avatars (fine pointers only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(700px) rotateY(" + x * 14 + "deg) rotateX(" + -y * 14 + "deg) scale(1.03)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }
})();
