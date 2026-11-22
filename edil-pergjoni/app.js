/* Edil Pergjoni: hero A (Ken Burns photo, line-by-line headline), header, clip menu, anchors, reveals, drag strip,
   phone bar, form validation, and the GSAP scene "La casa": pinned, the word CASA is cut out of a deep teal layer
   with a finished house behind it; scroll flies through the stroke of the C until the house fills the screen,
   then the copy rises. */
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
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
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
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  var els = Array.prototype.slice.call(d.querySelectorAll('.r'));
  function show(el) { el.classList.add('is-in'); }
  if (!('IntersectionObserver' in window) || reduce) els.forEach(show);
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { show(el); }, (k++) * 90);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el); });
  }

  var strip = d.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (down) { down = false; strip.classList.remove('is-drag'); } });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 340, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -340, behavior: 'smooth' });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul progetto.' };
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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 999px)', function () { return scene(true); });
    mm.add('(min-width: 1000px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var stage = sec.querySelector('.scene__stage'), svg = sec.querySelector('.scene__mask'), word = sec.querySelector('.word');
    var layer = sec.querySelector('.scene__layer'), photo = sec.querySelector('.scene__photo img');
    var copy = sec.querySelector('.scene__copy'), kick = sec.querySelector('.scene__kicker');
    var WW = 432, WH = 120, PX = 16, PY = 60; // word box; zoom point inside the C stroke
    var g = { s0: 1, tx: 0, ty: 0, zmax: 30 }, st8 = { z: 1 };
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight;
      g.W = W; g.H = H;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      g.s0 = Math.min(W * (small ? .84 : .62) / WW, H * .32 / WH);
      g.tx = (W - WW * g.s0) / 2;
      g.ty = (H - WH * g.s0) / 2 - H * .04;
      g.zmax = Math.max(W * 1.3 / (32 * g.s0), H * 1.3 / (WH * g.s0));
      paint();
    }
    function paint() {
      var s = g.s0 * st8.z, k = Math.min(1, (st8.z - 1) / Math.max(1, g.zmax * .25));
      var px = g.tx + g.s0 * PX, py = g.ty + g.s0 * PY;
      px += (g.W / 2 - px) * k; py += (g.H / 2 - py) * k;
      word.setAttribute('transform', 'translate(' + (px - s * PX).toFixed(2) + ' ' + (py - s * PY).toFixed(2) + ') scale(' + s.toFixed(4) + ')');
    }
    layout();
    gsap.set(copy, { autoAlpha: 0, y: 40 });
    gsap.set(layer, { opacity: 1 });
    gsap.set(photo, { scale: 1.25 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(kick, { autoAlpha: 0, duration: .3 }, 0)
      .to(st8, { z: function () { return g.zmax; }, duration: 3, ease: 'power3.in', onUpdate: paint }, 0)
      .to(photo, { scale: 1, duration: 3.4, ease: 'power1.out' }, 0)
      .to(layer, { opacity: 0, duration: .45 }, 2.45)
      .to(copy, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 3.05)
      .to({}, { duration: .5 });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true, onRefreshInit: layout, onRefresh: layout });
    window.addEventListener('resize', layout);
    return function () {
      window.removeEventListener('resize', layout);
      st.kill(); tl.kill();
      gsap.set([copy, layer, photo, kick], { clearProps: 'all' });
      word.removeAttribute('transform');
    };
  }
})();
