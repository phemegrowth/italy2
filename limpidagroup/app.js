/* Limpida Group: hero F (blueprint: grid hairlines draw in, a frame draws round the photo, the photo fades in
   inside it, the headline sits over the frame edge), header, phone menu, anchors, reveals, phone bar, form
   validation, and the GSAP signature scene "exploded floors": one building photo in five slices rises, then the
   slices pull apart; each slice is one step of their method and its label lights up in turn. */
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

  /* menu */
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

  /* anchors */
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

  /* reveals */
  var els = [].slice.call(d.querySelectorAll('.r'));
  if (!('IntersectionObserver' in window) || reduce) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* form validation */
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

  /* GSAP signature scene: exploded floors */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.classList.add('is-live');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 760px)', function () { return scene(true); });
    mm.add('(min-width: 761px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var stack = sec.querySelector('.stack'), slices = [].slice.call(sec.querySelectorAll('.sl'));
    var labels = [].slice.call(sec.querySelectorAll('.labels li')), last = -1;
    var G = small ? 14 : 30;
    gsap.set(stack, { clipPath: 'inset(100% 0% 0% 0%)' });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(stack, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power2.out' }, 0);
    slices.forEach(function (s, i) {
      tl.to(s, { y: (i - 2) * G, x: small ? 0 : (i % 2 ? 10 : -10), duration: 1.6, ease: 'power1.inOut' }, .9);
    });
    if (!small) labels.forEach(function (l, i) { tl.to(l, { y: (i - 2) * G, duration: 1.6, ease: 'power1.inOut' }, .9); });
    tl.to({}, { duration: 1.2 });
    function upd() {
      var t = tl.time();
      var k = Math.max(0, Math.min(4, Math.floor((t - .5) / .62)));
      if (k === last) return;
      last = k;
      labels.forEach(function (l, i) { l.classList.toggle('is-on', i === k); l.classList.toggle('is-seen', i < k); });
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: true, scrub: .6, animation: tl });
    return function () { st.kill(); tl.kill(); };
  }
})();
