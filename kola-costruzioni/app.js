/* Kola Costruzioni: hero G (15+ counts up, the house-shaped photo opens), header, circle menu, anchors, reveals,
   accordion with height animation, phone bar, form validation, and the GSAP scene "Dal disegno all'edificio":
   pinned, a blueprint elevation draws itself, then the building photo rises floor by floor with a % counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); countUp(); }); });

  function countUp() {
    var el = d.querySelector('.num__v');
    if (!el) return;
    var to = +el.getAttribute('data-to'), t0 = performance.now(), dur = 1100;
    el.textContent = '0';
    (function tick(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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

  /* accordion: animate height, one open at a time */
  var acc = d.querySelectorAll('.acc__item');
  acc.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.1,1)' }).onfinish = function () { det.open = false; };
      } else {
        acc.forEach(function (o) { if (o !== det && o.open) o.open = false; });
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
      }
    });
  });

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
    var paths = sec.querySelectorAll('.bp__draw path'), dims = sec.querySelector('.bp__dims');
    var photo = sec.querySelector('.bp__photo'), crane = sec.querySelector('.bp__crane');
    var steps = sec.querySelectorAll('.scene__steps li'), v = sec.querySelector('.scene__v');
    var copy = sec.querySelectorAll('.scene__copy > *');
    var st8 = { p: 0 };
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(dims, { autoAlpha: 0 });
    function paint() {
      // p 0..100: building rises in 5 floors; the photo shows floor by floor
      var p = st8.p, floors = 5, f = p / 100 * floors, whole = Math.floor(f), part = f - whole;
      var shown = Math.min(1, (whole + Math.min(1, part * 1.6)) / floors);
      photo.style.clipPath = 'inset(' + ((1 - shown) * 100).toFixed(2) + '% 0 0 0)';
      crane.style.bottom = 'calc(3.85% + ' + (shown * 88.45).toFixed(2) + '%)';
      crane.style.opacity = p > 0 && p < 100 ? 1 : 0;
    }
    paint();
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.from(copy, { y: 26, autoAlpha: 0, stagger: .06, duration: .4, ease: 'power2.out' }, 0)
      .to(paths, { strokeDashoffset: 0, duration: .5, stagger: .22 }, .1)
      .to(dims, { autoAlpha: 1, duration: .3 }, 1)
      .addLabel('build', 1.4)
      .to(st8, { p: 100, duration: 3, onUpdate: paint }, 'build')
      .to({}, { duration: .4 });
    var last = -1;
    function upd() {
      var t = tl.time(), b = tl.labels.build, pct;
      if (t < b) pct = 0; else pct = Math.round(st8.p);
      v.textContent = pct;
      var c = t < b ? 0 : (pct < 45 ? 1 : (pct < 85 ? 2 : 3));
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); s.classList.toggle('is-cur', i === c); });
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    return function () {
      st.kill(); tl.kill();
      gsap.set([paths, dims, copy], { clearProps: 'all' });
      photo.style.clipPath = ''; crane.style.opacity = ''; crane.style.bottom = '';
      steps.forEach(function (s) { s.classList.remove('is-cur'); });
    };
  }
})();
