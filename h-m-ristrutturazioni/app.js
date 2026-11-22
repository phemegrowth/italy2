/* H&M Ristrutturazioni: hero C (type first: the H&M letters rise, the headline reveals line by line, a strip of
   their photos slides in from the right), header, phone menu, anchors, reveals, accordion with height animation,
   sticky process with a line that draws, phone bar, form validation, and the GSAP signature scene: their ten
   finished rooms on a 3D ring that scroll turns one card at a time (snap), the front card outlined, with
   caption, counter and progress bar. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
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
      if (id === '#top' || id === '#') { e.preventDefault(); if (id === '#top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  var els = [].slice.call(d.querySelectorAll('.r'));
  if (!('IntersectionObserver' in window) || reduce) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, (k++) * 90);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* accordion */
  d.querySelectorAll('.acc__it button').forEach(function (bt) {
    bt.addEventListener('click', function () {
      var it = bt.closest('.acc__it'), open = !it.classList.contains('is-open');
      d.querySelectorAll('.acc__it').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); bt.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* process line */
  var wrapS = d.querySelector('.steps__wrap'), line = d.querySelector('.steps__line i');
  if (wrapS && line) {
    if (reduce) line.style.setProperty('--p', 1);
    else {
      var lp = function () {
        var r = wrapS.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.7 - r.top) / r.height;
        line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', lp, { passive: true });
      lp();
    }
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* ring */
  var ring = d.querySelector('[data-scene]');
  var cards = [].slice.call(ring.querySelectorAll('.rc'));
  cards.forEach(function (c, i) { c.style.setProperty('--i', i); });

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    ring.classList.add('is-3d');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 760px)', function () { return scene(true); });
    mm.add('(min-width: 761px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var wheel = ring.querySelector('.ring__wheel'), cap = ring.querySelector('[data-cap]'), num = ring.querySelector('[data-n]');
    var pbar = ring.querySelector('.ring__bar i'), stage = ring.querySelector('.ring__stage');
    var n = cards.length, step = 360 / n, last = -1;
    var caps = cards.map(function (c) { return c.querySelector('figcaption').textContent; });
    var st = { rot: 0 };
    var R = parseFloat(getComputedStyle(wheel).getPropertyValue('--R')) || 560;
    gsap.set(wheel, { z: -R, rotationY: 0, rotationX: -3 });
    gsap.set(stage, { autoAlpha: 0, scale: .9 });
    function front() {
      var k = ((Math.round(-st.rot / step) % n) + n) % n;
      if (k === last) return;
      last = k;
      cards.forEach(function (c, i) { c.classList.toggle('is-front', i === k); });
      cap.textContent = caps[k];
      num.textContent = (k < 9 ? '0' : '') + (k + 1);
    }
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(stage, { autoAlpha: 1, scale: 1, duration: .6, ease: 'power2.out' }, 0)
      .to(st, { rot: -step * (n - 1), duration: n - 1, onUpdate: function () { gsap.set(wheel, { rotationY: st.rot }); front(); } }, .4)
      .to({}, { duration: .3 });
    var trig = ScrollTrigger.create({
      trigger: ring, start: 'top top', end: small ? '+=220%' : '+=320%', pin: true, scrub: .7, animation: tl,
      snap: { snapTo: function (v) { var a = .4 / tl.duration(), b = (.4 + n - 1) / tl.duration(); if (v < a) return v < a / 2 ? 0 : a; if (v > b) return v; var s = (b - a) / (n - 1); return a + Math.round((v - a) / s) * s; }, duration: { min: .2, max: .6 }, delay: .05, ease: 'power1.inOut' },
      onUpdate: function (self) { pbar.style.setProperty('--p', (0.1 + 0.9 * self.progress).toFixed(3)); }
    });
    front();
    return function () { trig.kill(); tl.kill(); gsap.set([wheel, stage], { clearProps: 'all' }); };
  }
})();
