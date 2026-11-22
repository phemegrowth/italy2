/* Costruzioni T.M.: header, menu, anchors, reveals, step line, phone bar, form, hero photo parallax, and the
   GSAP signature scene: a 3D ring of six room cards turned by scroll, snapping to the front card, 01/06 counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('is-menu', open);
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
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up of years in business (sourced: costituita nel 1993) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  var tl = d.querySelector('[data-tl]');
  if (tl) {
    var drawT = function () { var r = tl.getBoundingClientRect(), vh = window.innerHeight; tl.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25))).toFixed(3)); };
    window.addEventListener('scroll', drawT, { passive: true }); window.addEventListener('resize', drawT); drawT();
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
    form.addEventListener('submit', function (e) { var first = null; req.forEach(function (f) { if (!check(f) && !first) first = f; }); if (first) { e.preventDefault(); first.focus(); } });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  var ph = d.querySelector('[data-par] img');
  if (ph && !reduce) {
    var par = function () { var y = Math.min(window.scrollY, window.innerHeight * 1.2); ph.style.setProperty('--py', (-y * 0.09).toFixed(1) + 'px'); };
    window.addEventListener('scroll', par, { passive: true }); par();
  }

  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', function () { return build(true); });
    mm.add('(min-width: 1024px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var head = Array.prototype.slice.call(sec.querySelectorAll('.ring__head > *'));
    var wheel = sec.querySelector('.ring__wheel'), stage = sec.querySelector('.ring__stage');
    var cards = Array.prototype.slice.call(sec.querySelectorAll('.rc'));
    var idx = sec.querySelector('[data-idx]'), name = sec.querySelector('[data-name]');
    var n = cards.length, cur = -1;
    var set = function (k) {
      if (k === cur) return; cur = k;
      cards.forEach(function (c, j) { c.classList.toggle('is-front', j === k); });
      idx.textContent = ('0' + (k + 1)).slice(-2); name.textContent = cards[k].querySelector('span').textContent;
    };
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(stage, { autoAlpha: 0, scale: .9 });
    gsap.set(wheel, { rotationY: 0 });
    var T = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: function () { var r = -gsap.getProperty(wheel, 'rotationY'); set(Math.max(0, Math.min(n - 1, Math.round(r / 60)))); } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .05, duration: .3, ease: 'power2.out' }, 0)
     .to(stage, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power2.out' }, .05);
    for (var k = 1; k < n; k++) {
      T.to({}, { duration: .25 });
      T.to(wheel, { rotationY: -60 * k, duration: .5, ease: 'power2.inOut' });
    }
    T.to({}, { duration: .3 });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=160%' : '+=280%', pin: true, scrub: .5, animation: T
    });
    set(0);
    return function () { st.kill(); T.kill(); gsap.set(head.concat([stage, wheel]), { clearProps: 'all' }); set(0); };
  }
})();
