/* RC Edilizia: header, menu, anchors, reveals, hero reel drifting with scroll (mechanic E), phone bar, form, and the GSAP signature scene: the trades a client would otherwise chase (fabbro, imbianchino, piastrellista, impianti, progettista) gather into one RC Edilizia contact. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var reelT = d.querySelector('[data-reel]');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
    if (reelT && !reduce && y < window.innerHeight * 1.5) reelT.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
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
    var head = q('.one__head > *'), trs = q('.tr'), hub = sec.querySelector('.hub'), end = sec.querySelector('.one__end'), stage = sec.querySelector('.one__stage');
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(trs, { autoAlpha: 0, scale: .6, rotation: function (i) { return [-8, 6, 5, -6, 3][i] || 0; } });
    gsap.set(hub, { autoAlpha: 0, scale: .4 });
    gsap.set(end, { autoAlpha: 0, y: 20 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0);
    trs.forEach(function (el, i) { T.to(el, { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(1.6)' }, .5 + i * .22); });
    T.to(hub, { autoAlpha: 1, scale: 1, duration: .4, ease: 'back.out(1.4)' }, 1.8);
    trs.forEach(function (el, i) {
      T.to(el, { x: function () { var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return (s.left + s.width / 2) - (r.left + r.width / 2); },
                 y: function () { var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return (s.top + s.height / 2) - (r.top + r.height / 2); },
                 scale: .25, rotation: 0, autoAlpha: 0, duration: .7, ease: 'power2.in' }, 2.4 + i * .12);
    });
    T.to(hub, { scale: small ? 1.15 : 1.2, duration: .5, ease: 'power2.out' }, 3.3)
     .to(end, { autoAlpha: 1, y: 0, duration: .4 }, 3.5)
     .to({}, { duration: .5 }, 3.9);
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: true, scrub: .6, animation: T, invalidateOnRefresh: true });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(trs, [hub, end]), { clearProps: 'all' }); };
  }
})();
