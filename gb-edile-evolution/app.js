/* GB Edile Evolution: hero H (a teal curtain with the GB mark wipes up to reveal the photo, the headline reveals
   line by line), header, menu, anchors, reveals, services accordion with photo swap, process line drawn on
   scroll, sticky phone bar, form validation, and the GSAP signature scene "Prima il disegno, poi il cantiere":
   pinned, a flat's floor plan draws itself wall by wall, the rooms get their names, then the finished living
   room rises inside the plan with a 0 to 100 % counter while three stages light up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (elements already in view at load show at once) */
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

  /* progress line that draws with scroll */
  var lines = d.querySelectorAll('[data-draw]');
  function drawLines() {
    lines.forEach(function (ln) {
      var box = ln.parentElement.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - box.top) / (box.height + vh * 0.3)));
      ln.style.setProperty('--p', p.toFixed(3));
    });
  }
  if (lines.length && !reduce) { window.addEventListener('scroll', drawLines, { passive: true }); drawLines(); }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 699px)', function () { return scene(true); });
    mm.add('(min-width: 700px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* services accordion: one open at a time, the photo follows */
  var accs = d.querySelectorAll('.acc'), simgs = d.querySelectorAll('.svc__stage img');
  accs.forEach(function (a) {
    a.addEventListener('toggle', function () {
      if (!a.open) return;
      accs.forEach(function (o) { if (o !== a) o.open = false; });
      var k = +a.getAttribute('data-img');
      simgs.forEach(function (im, i) { im.classList.toggle('is-on', i === k); });
    });
    a.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches && !a.open) a.open = true; });
  });

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var paths = sec.querySelectorAll('.walls path, .doors path, .dims path'), rooms = sec.querySelectorAll('.rooms text');
    var photo = sec.querySelector('.plan__photo'), svg = sec.querySelector('.plan__svg');
    var pct = sec.querySelector('.plan__pct b'), steps = sec.querySelectorAll('.plan__steps li');
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(rooms, { autoAlpha: 0, y: 8 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 });
    gsap.set(svg, { opacity: 1 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(sec.querySelectorAll('.walls path'), { strokeDashoffset: 0, duration: 1.2, stagger: .12 }, 0)
      .to(sec.querySelectorAll('.doors path, .dims path'), { strokeDashoffset: 0, duration: .6, stagger: .08 }, .9)
      .to(rooms, { autoAlpha: 1, y: 0, duration: .4, stagger: .08 }, 1.3)
      .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power1.inOut' }, 2.2)
      .to(photo, { scale: 1, duration: 2 }, 2.2)
      .to(rooms, { autoAlpha: 0, duration: .4 }, 3.2)
      .to(svg, { opacity: small ? 0 : .35, duration: .6 }, 3.4)
      .to({}, { duration: .5 });
    var total = tl.duration(), last = -1;
    tl.eventCallback('onUpdate', function () {
      var p = tl.time() / total;
      if (pct) pct.textContent = Math.round(Math.min(1, p / .9) * 100);
      var c = p < .42 ? 0 : (p < .78 ? 1 : 2);
      if (c !== last) { last = c; steps.forEach(function (s, i) { s.classList.toggle('is-on', i === c); }); }
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { gsap.set([paths, rooms, photo, svg], { clearProps: 'all' }); last = -1; };
  }

})();
