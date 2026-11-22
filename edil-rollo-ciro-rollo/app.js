/* Edil Rollo: hero card fan, header, phone menu, anchors, reveals, service photo swap, drag strip, steps line,
   phone contact bar, form validation, and the GSAP signature scene: a wall section where the cappotto
   builds up layer by layer while the heat arrows shorten. */
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

  /* services: the active line swaps the photo (hover on desktop, scroll position everywhere) */
  var items = d.querySelectorAll('.svc__item'), photos = d.querySelectorAll('.svc__photo img');
  function setSvc(k) {
    items.forEach(function (it) { it.classList.toggle('is-on', it.getAttribute('data-k') === k); });
    photos.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { setSvc(it.getAttribute('data-k')); }); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) setSvc(e.target.getAttribute('data-k')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { so.observe(it); });
  }

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('.strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx) * 1.2; });
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

  /* GSAP signature scene: the cappotto, layer by layer */
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
    var lys = sec.querySelectorAll('[data-ly]'), caps = sec.querySelectorAll('.wall__caps li'),
        stepEl = sec.querySelector('[data-step]'), heat = sec.querySelector('.heat__g'), title = sec.querySelector('.wall__head'),
        stage = sec.querySelector('.wall__stage'), last = -1, n = lys.length;
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from(stage, { opacity: 0, y: 40, duration: .35 }, 0);
    gsap.set(heat, { transformOrigin: '0% 50%' });
    lys.forEach(function (ly, i) {
      tl.fromTo(ly, { xPercent: 260, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .5 }, .45 + i * .55);
    });
    tl.fromTo(heat, { scaleX: 1, opacity: 1 }, { scaleX: .52, opacity: .55, ease: 'none', duration: n * .55 }, .45);
    tl.to({}, { duration: .3 });
    var paint = function () {
      var t = tl.time(), k = 0;
      lys.forEach(function (ly, i) { if (t >= .45 + i * .55 + .3) k = i + 1; });
      if (k === last) return;
      last = k;
      if (stepEl) stepEl.textContent = k;
      lys.forEach(function (ly, i) { ly.classList.toggle('is-cur', i === k - 1); });
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === Math.max(0, k - 1)); });
    };
    tl.eventCallback('onUpdate', paint);
    paint();
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    return function () { st.kill(); tl.kill(); gsap.set(lys, { clearProps: 'all' }); gsap.set([heat, title, stage], { clearProps: 'all' }); lys.forEach(function (l) { l.classList.remove('is-cur'); }); };
  }
})();
