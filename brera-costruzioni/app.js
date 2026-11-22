/* Brera Costruzioni: header, menu, anchors, reveals, hero reel drifting with scroll (mechanic E), step line, phone bar, form, and the GSAP signature scene: a section of one floor builds itself: concrete frame, infill walls, partition, suspended ceiling, screed and tiles. */
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
    if (reelT && !reduce && y < window.innerHeight * 1.5) reelT.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
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


  var tl = d.querySelector('[data-tl]');
  if (tl) {
    var drawT = function () { var r = tl.getBoundingClientRect(), vh = window.innerHeight; tl.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2))).toFixed(3)); };
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

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  var items = sec ? Array.prototype.slice.call(sec.querySelectorAll('.sx__list li')) : [];
  if (reduce || !window.gsap) items.forEach(function (l) { l.classList.add('is-on'); });
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
    var head = q('.sx__head > *');
    var ca = q('.sx__ca > *'), tamp = q('.sx__tamp > *'), tram = q('.sx__tram > *'), cs = q('.sx__cs > *'), ms = q('.sx__ms > *');
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(items, { autoAlpha: 0, x: -12 });
    gsap.set(ca, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(tamp, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(tram, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(cs, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(ms, { autoAlpha: 0, y: -14 });
    var T = gsap.timeline({ defaults: { ease: 'power2.out' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4 }, 0)
     .to(items, { autoAlpha: 1, x: 0, stagger: .05, duration: .3 }, .2)
     .to(ca, { scaleY: 1, stagger: .12, duration: .5 }, .6)
     .to(tamp, { scaleY: 1, stagger: .1, duration: .5 }, 1.5)
     .to(tram, { scaleY: 1, stagger: .1, duration: .45 }, 2.2)
     .to(cs, { scaleX: 1, stagger: .05, duration: .4 }, 2.8)
     .to(ms, { autoAlpha: 1, y: 0, stagger: .05, duration: .35 }, 3.5)
     .to({}, { duration: .5 }, 4.3);
    var marks = [.6, 1.5, 2.2, 2.8, 3.5];
    T.eventCallback('onUpdate', function () {
      var t = T.time(), k = -1;
      marks.forEach(function (m, i) { if (t >= m) k = i; });
      items.forEach(function (l, i) { l.classList.toggle('is-on', i === k); });
    });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(items, ca, tamp, tram, cs, ms), { clearProps: 'all' }); };
  }
})();
