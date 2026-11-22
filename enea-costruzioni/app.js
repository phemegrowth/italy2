/* Enea Costruzioni: hero entrance (name rises, photo reel slides in from the right and drifts with the scroll), header,
   full-screen menu, anchors, reveals, drag strip, method bar, magnetic buttons, phone bar, form validation, and the GSAP
   signature scene: the elevation of a house draws itself as a blueprint, then the house fills in floor by floor with a % counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    html.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up of the sourced number in the proof strip */
  reveal(d.querySelectorAll('[data-count-to]'), function (el) {
    var to = +el.getAttribute('data-count-to');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  reveal(d.querySelectorAll('.mline'), function (el) { el.classList.add('is-in'); });

  reveal(d.querySelectorAll('.mbar'), function (el) { el.classList.add('is-in'); });

  /* hero reel drifts left with the scroll (transform only) */
  var reel = d.querySelector('.reel__track');
  if (reel && !reduce) {
    var rk = false;
    window.addEventListener('scroll', function () {
      if (rk) return; rk = true;
      requestAnimationFrame(function () {
        rk = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) reel.style.translate = (-y * 0.35).toFixed(1) + 'px 0';
      });
    }, { passive: true });
  }

  /* drag strip: mouse drag on desktop, native swipe on phones */
  var drag = d.querySelector('[data-drag]');
  if (drag && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-drag'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx) * 1.2; });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Scrivete dove e cosa.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
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
    mm.add('(min-width: 900px)', function () { return scene(false); });
    mm.add('(max-width: 899px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var photo = sec.querySelector('.bp__photo'), lines = sec.querySelectorAll('.bp__lines path');
    var tags = sec.querySelectorAll('.bp__tag'), pct = sec.querySelector('[data-pct]'), ph = sec.querySelectorAll('.phases li');
    var svg = sec.querySelector('.bp__lines');
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(photo, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(tags, { autoAlpha: 0, x: -10 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    /* 1. the blueprint draws itself */
    tl.to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: .2, ease: 'power1.inOut' }, 0);
    /* 2. the house fills in floor by floor, from the ground up */
    tl.to(photo, { clipPath: 'inset(65.6% 0 0 0)', duration: .9, ease: 'power2.out' }, 2)
      .to(tags[0], { autoAlpha: 1, x: 0, duration: .3 }, 2.1)
      .to(photo, { clipPath: 'inset(15.1% 0 0 0)', duration: 1.1, ease: 'power2.inOut' }, 3)
      .to(tags[1], { autoAlpha: 1, x: 0, duration: .3 }, 3.2)
      .to(photo, { clipPath: 'inset(0% 0 0 0)', duration: .6, ease: 'power2.out' }, 4.2)
      .to(tags[2], { autoAlpha: 1, x: 0, duration: .3 }, 4.3)
      .to(svg, { opacity: .25, duration: .6 }, 4.4)
      .to({}, { duration: .5 });
    var total = tl.duration(), lastPh = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time();
      var v = t < 2 ? t / 2 * 20 : 20 + Math.min(1, (t - 2) / 2.8) * 80;
      pct.textContent = Math.round(v);
      var k = t < 1.9 ? 0 : t < 3 ? 1 : t < 4.2 ? 2 : 3;
      if (k !== lastPh) { lastPh = k; ph.forEach(function (li, i) { li.classList.toggle('is-on', i === k); }); }
    });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=200%' : '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    return function () { st.kill(); tl.kill(); gsap.set([].slice.call(lines).concat([photo, svg], [].slice.call(tags)), { clearProps: 'all' }); };
  }
})();
