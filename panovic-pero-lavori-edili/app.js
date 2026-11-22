/* Panovic Pero Lavori Edili: header, menu, anchors, reveals, service photo swap, process line, phone bar,
   form validation, and the GSAP signature scene: a damaged wall painted coat by coat (stucco, rasatura,
   fondo, colore) by a roller that crosses it with the scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { html.classList.add('is-ready'); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var how = d.querySelector('[data-line]');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
    if (how && !reduce) {
      var r = how.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.3)));
      how.style.setProperty('--p', p.toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: the photo beside the list follows the hovered or focused row (desktop) */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    d.querySelectorAll('.sv[data-img]').forEach(function (row) {
      var go = function () {
        d.querySelectorAll('.sv').forEach(function (x) { x.classList.toggle('is-active', x === row); });
        var src = row.getAttribute('data-img');
        if (swap.getAttribute('src') === src) return;
        swap.classList.add('is-out');
        setTimeout(function () { swap.setAttribute('src', src); swap.classList.remove('is-out'); }, reduce ? 0 : 260);
      };
      row.addEventListener('mouseenter', go);
      row.addEventListener('focusin', go);
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    scene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var wall = sec.querySelector('.wall');
    var coats = [1, 2, 3, 4].map(function (n) { return sec.querySelector('.cz--' + n); });
    var roller = sec.querySelector('.roller'), head = sec.querySelector('.roller__head');
    var count = sec.querySelector('.wall__count b');
    var lbs = sec.querySelectorAll('.cl');
    var tint = ['#f6f7f7', '#eceeef', '#dfe2e4', '#ffffff', '#f4b70d'];
    var last = -2;
    var light = function (k) {
      if (k === last) return; last = k;
      lbs.forEach(function (l, i) { l.classList.toggle('is-on', i === k + 1); l.classList.toggle('is-done', i < k + 1); });
      count.textContent = String(Math.max(0, k + 1));
      head.style.backgroundColor = tint[Math.max(0, k + 1)];
    };
    gsap.set(coats, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(roller, { x: 0, opacity: 0 });
    light(-1);
    var W = function () { return wall.clientWidth; };
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: sec.querySelector('.coats__pin'), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.to(roller, { opacity: 1, duration: .15 });
    coats.forEach(function (c, i) {
      tl.set(roller, { x: 0 });
      tl.to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, '<');
      tl.to(roller, { x: function () { return W(); }, duration: 1 }, '<');
      tl.to({}, { duration: .18 });
    });
    tl.to(roller, { opacity: 0, duration: .2 });
    tl.to({}, { duration: .2 });
    /* labels and counter follow the scroll position, both ways */
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', onUpdate: function (s) {
      var p = s.progress * tl.duration(), seg = 1.18, k = Math.floor((p - .15) / seg);
      light(p < .15 ? -1 : Math.min(3, k));
    } });
  }
})();
