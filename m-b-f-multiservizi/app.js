/* M.B.F. Multiservizi: hero reel that drifts with scroll, header, phone menu, anchors, reveals, count-up,
   steps line, phone contact bar, form validation, and the GSAP signature scene: a window assembled
   piece by piece (frame, sashes, glass, seals and handle, shutter). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* count-ups: sourced quantities only */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1300;
    el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* hero reel drifts left with scroll (clipped, never over the headline) */
  var track = d.querySelector('[data-drift]');
  if (track && !reduce) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      var max = Math.max(0, track.scrollWidth - track.parentNode.clientWidth);
      var x = Math.min(max, window.scrollY * 0.45);
      track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.2)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: a window assembled piece by piece */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var q = function (s) { return sec.querySelector(s); };
    var frame = q('.w-frame'), sash = sec.querySelectorAll('.w-sash path'), glass = q('.w-glass'), seal = q('.w-seal'),
        handle = q('.w-handle'), shutter = q('.w-shutter'), box = q('.w-box'), caps = sec.querySelectorAll('.win__caps li'),
        stepEl = q('[data-step]'), stage = q('.win__stage'), last = -1;
    var marks = [.35, .95, 1.55, 2.15, 2.85];
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from(stage, { opacity: 0, y: 40, duration: .3 }, 0)
      .fromTo(frame, { scale: 1.25, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: .5 }, .1)
      .fromTo(sash[0], { x: -170, opacity: 0 }, { x: 0, opacity: 1, duration: .5 }, .7)
      .fromTo(sash[1], { x: 170, opacity: 0 }, { x: 0, opacity: 1, duration: .5 }, .75)
      .fromTo(glass, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, 1.3)
      .fromTo(seal, { opacity: 0 }, { opacity: 1, duration: .3 }, 1.9)
      .fromTo(handle, { rotation: -90, opacity: 0, svgOrigin: '143 181' }, { rotation: 0, opacity: 1, duration: .35 }, 2.0)
      .fromTo(box, { opacity: 0 }, { opacity: 1, duration: .2 }, 2.55)
      .fromTo(shutter, { y: 0 }, { y: 170, duration: .7, ease: 'none' }, 2.65)
      .to({}, { duration: .3 });
    var paint = function () {
      var t = tl.time(), k = 0;
      marks.forEach(function (m, i) { if (t >= m) k = i + 1; });
      if (k === last) return;
      last = k;
      if (stepEl) stepEl.textContent = k;
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === Math.max(0, k - 1)); });
    };
    tl.eventCallback('onUpdate', paint);
    paint();
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    return function () { st.kill(); tl.kill(); gsap.set([frame, glass, seal, handle, shutter, box, stage].concat([].slice.call(sash)), { clearProps: 'all' }); };
  }
})();
