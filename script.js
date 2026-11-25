(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) {}
  $("#theme").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#07080c" : "#f5f6fb");
  });

  /* ---------- Loader ---------- */
  var body = document.body, countEl = $("#loaderCount"), barEl = $("#loaderBar");
  var done = false;
  function finish() {
    if (done) return; done = true;
    countEl.textContent = "100"; barEl.style.width = "100%";
    setTimeout(function () { body.classList.add("loaded"); }, 250);
    setTimeout(function () { var l = $("#loader"); if (l) l.style.display = "none"; }, 1700);
  }
  if (reduce) { body.classList.add("loaded"); }
  else {
    var t0 = null, dur = 1300;
    (function step(t) {
      if (done) return;
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      countEl.textContent = Math.round(e * 100);
      barEl.style.width = e * 100 + "%";
      if (p < 1) requestAnimationFrame(step); else finish();
    })(performance.now());
    setTimeout(finish, 4000); /* safety net */
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Count-up ---------- */
  function countUp(el) {
    var target = +el.getAttribute("data-count");
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1600;
    requestAnimationFrame(function step(t) {
      if (!start) start = t;
      var p = clamp((t - start) / dur, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  $$("[data-count]").forEach(function (el) {
    if (!("IntersectionObserver" in window)) { countUp(el); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { countUp(el); o.disconnect(); } }, { threshold: 0.6 });
    o.observe(el);
  });

  /* ---------- Typing role ---------- */
  var typed = $("#typed");
  if (typed && !reduce) {
    var words = ["Java Backend Developer", "Spring Boot Engineer", "Microservices Builder", "Aspiring Fullstack Engineer"];
    var wi = 0, ci = words[0].length, del = false;
    setTimeout(function tick() {
      var w = words[wi], delay;
      typed.textContent = w.slice(0, ci);
      if (!del && ci === w.length) { del = true; delay = 1900; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; delay = 350; }
      else { ci += del ? -1 : 1; delay = del ? 35 : 80; }
      setTimeout(tick, delay);
    }, 3200);
  }

  /* ---------- Spotlight (cursor-following glow on cards) ---------- */
  $$(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- Page-wide cursor glow, magnetic buttons, avatar tilt ---------- */
  if (fine && !reduce) {
    var glow = $("#cursorGlow"), gx = 0, gy = 0, tx = 0, ty = 0, raf = null;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY; glow.style.opacity = 1;
      if (!raf) raf = requestAnimationFrame(function loop() {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = "translate(" + gx + "px," + gy + "px)";
        raf = (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(loop) : null;
      });
    });

    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.22 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });

    var tilt = $("#heroTilt");
    if (tilt) {
      var art = tilt.parentElement;
      art.addEventListener("pointermove", function (e) {
        var r = art.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = "perspective(900px) rotateY(" + x * 16 + "deg) rotateX(" + -y * 16 + "deg)";
      });
      art.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
    }
  }

  /* ---------- Scroll-driven effects ---------- */
  var nav = $("#nav"), bar = $("#progress"), toTop = $("#toTop");
  var links = $$("#menu a"), sections = links.map(function (a) { return $(a.getAttribute("href")); });
  var timeline = $("#timeline"), rail = $("#railFill"), jobs = $$(".job");
  var projs = $$(".proj"), lastY = 0, ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var h = document.documentElement.scrollHeight - vh;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 700);

    /* hide nav on scroll down, show on scroll up */
    if (!$("#menu").classList.contains("open")) nav.classList.toggle("hide", y > lastY && y > 400);
    lastY = y;

    /* active link */
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.45) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === current); });

    /* timeline fill */
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var p = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
      timeline.style.setProperty("--fill", p * 100 + "%");
      jobs.forEach(function (j) { j.classList.toggle("lit", j.getBoundingClientRect().top < vh * 0.6); });
    }

    /* stacked project cards: scale & dim when covered */
    if (!reduce && window.innerWidth > 720) {
      projs.forEach(function (card, i) {
        var next = projs[i + 1];
        if (!next) { card.style.transform = ""; card.style.filter = ""; return; }
        var dist = next.getBoundingClientRect().top - card.getBoundingClientRect().top;
        var p = clamp(1 - (dist - 20) / (card.offsetHeight * 0.9), 0, 1);
        card.style.transform = "scale(" + (1 - p * 0.06) + ")";
        card.style.filter = "brightness(" + (1 - p * 0.35) + ")";
      });
    } else { projs.forEach(function (c) { c.style.transform = ""; c.style.filter = ""; }); }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();

  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Mobile menu ---------- */
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(o) { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", String(o)); }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Copy email ---------- */
  var copy = $("#copyMail"), label = $("#copyLabel");
  copy.addEventListener("click", function () {
    var mail = copy.getAttribute("data-mail");
    function ok() { label.textContent = "Copied ✓"; setTimeout(function () { label.textContent = mail; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(ok, function () { location.href = "mailto:" + mail; });
    else location.href = "mailto:" + mail;
  });
})();
