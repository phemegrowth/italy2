/* Edil Gio': header, menu, anchors, reveals, service photo swap, process line, phone bar, form validation, and the
   GSAP signature scene: a brick wall built course by course with the scroll (running bond), a course counter, a
   spirit-level line on top at the end; four masonry steps light up on the way. */
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


  /* bricks for the scene: 8 courses, running bond (built for no-JS too, so the wall is visible without motion) */
  var g = d.querySelector('.bricks');
  if (g) {
    var NS = 'http://www.w3.org/2000/svg', W = 360, bw = 60, bh = 30, x0 = 20, y0 = 290;
    for (var row = 0; row < 8; row++) {
      var off = row % 2 ? -bw / 2 : 0;
      for (var x = off; x < W; x += bw) {
        var r = d.createElementNS(NS, 'rect');
        var xa = Math.max(0, x), xb = Math.min(W, x + bw);
        r.setAttribute('x', x0 + xa + 1.5); r.setAttribute('y', y0 - row * (bh + 3)); r.setAttribute('width', xb - xa - 3); r.setAttribute('height', bh); r.setAttribute('rx', 2);
        r.setAttribute('data-row', row); g.appendChild(r);
      }
    }
  }
  /* services: photo follows the hovered row (desktop) */
  var swap = d.querySelector('[data-swap]');
  if (swap) d.querySelectorAll('.si[data-img]').forEach(function (row) {
    var go = function () { d.querySelectorAll('.si').forEach(function (x) { x.classList.toggle('is-active', x === row); }); var src = row.getAttribute('data-img'); if (swap.getAttribute('src') === src) return; swap.classList.add('is-out'); setTimeout(function () { swap.setAttribute('src', src); swap.classList.remove('is-out'); }, reduce ? 0 : 260); };
    row.addEventListener('mouseenter', go); row.addEventListener('focusin', go);
  });

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var rows = [], steps = sec.querySelectorAll('.ws'), n = sec.querySelector('.wall__n b'), lvl = sec.querySelector('.level'), last = -2;
    for (var i = 0; i < 8; i++) rows.push(sec.querySelectorAll('rect[data-row="' + i + '"]'));
    var light = function (k) { if (k === last) return; last = k; steps.forEach(function (s, j) { s.classList.toggle('is-on', j === k); s.classList.toggle('is-done', j < k); }); };
    rows.forEach(function (r) { gsap.set(r, { y: -60, opacity: 0 }); });
    gsap.set(lvl, { opacity: 0, scaleX: 0, transformOrigin: '50% 50%' });
    light(-1);
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=150%' : '+=230%', pin: sec.querySelector('.wall__pin'), scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { var p = s.progress; n.textContent = Math.min(8, Math.max(0, Math.floor((p - .04) / .105) + 1)) ; if (p < .04) n.textContent = 0; light(p < .04 ? -1 : p < .2 ? 0 : p < .5 ? 1 : p < .8 ? 2 : 3); } } });
    tl.to({}, { duration: .3 });
    rows.forEach(function (r) { tl.to(r, { y: 0, opacity: 1, duration: 1, stagger: .08, ease: 'power2.out' }, '>-0.4'); });
    tl.to(lvl, { opacity: 1, scaleX: 1, duration: .8, ease: 'power2.out' });
    tl.to({}, { duration: .4 });
  }

})();
