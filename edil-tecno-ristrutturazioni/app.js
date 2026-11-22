/* Edil Tecno Ristrutturazioni: header, menu, anchors, reveals, phone bar, form, floor-plan hero (CSS), map pulse (CSS), and the GSAP signature scene (catalogue 4): pinned before/after; scrolling wipes from the old kitchen to the renovated one, with three captions on the way. */
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

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  var caps = sec ? Array.prototype.slice.call(sec.querySelectorAll('.ba__caps li')) : [];
  if (reduce || !window.gsap) caps.forEach(function (c) { c.classList.add('is-on'); });
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 999px)', function () { return build(true); });
    mm.add('(min-width: 1000px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var head = q('.ba__head > *'), stage = sec.querySelector('.ba__stage'), after = sec.querySelector('.ba__img--after'), bar = sec.querySelector('.ba__bar'), bImg = sec.querySelector('.ba__img--before img'), aImg = sec.querySelector('.ba__img--after img');
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(stage, { clipPath: 'inset(0 0 100% 0)' });
    gsap.set(caps, { autoAlpha: 0, y: 12 });
    gsap.set(after, { clipPath: 'inset(0 0 0 100%)' });
    gsap.set(bar, { left: '100%' });
    gsap.set(aImg, { scale: 1.12 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .3, ease: 'power2.out' }, 0)
     .to(stage, { clipPath: 'inset(0 0 0% 0)', duration: .5, ease: 'power2.out' }, .1)
     .to(caps, { autoAlpha: 1, y: 0, stagger: .06, duration: .3 }, .4)
     .to(bImg, { scale: 1.02, duration: 2.6 }, .6)
     .to(after, { clipPath: 'inset(0 0 0 0%)', duration: 2.2, ease: 'power1.inOut' }, .9)
     .to(bar, { left: '0%', duration: 2.2, ease: 'power1.inOut' }, .9)
     .to(aImg, { scale: 1, duration: 2.2 }, .9)
     .to(bar, { autoAlpha: 0, duration: .2 }, 3.1)
     .to({}, { duration: .4 }, 3.3);
    T.eventCallback('onUpdate', function () {
      var t = T.time(), k = t < .6 ? -1 : t < 1.6 ? 0 : t < 2.6 ? 1 : 2;
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
    });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=230%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(caps, [stage, after, bar, bImg, aImg]), { clearProps: 'all' }); };
  }
})();
