/* Natan Costruzioni: number-led hero (years since 2000 count up beside a slanted photo mask), line reveal, header,
   menu, anchors, reveals, magnetic buttons, phone bar, form validation, and the GSAP signature scene: a route that draws
   itself across a simplified map of Monza, Brianza and Milano, with a pin dropping on each comune where they built. */
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
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-in'); });

  /* hero figure: years since the company was formed (registry: 2000), counts up on load */
  d.querySelectorAll('[data-hero-count]').forEach(function (el) {
    var to = +el.getAttribute('data-hero-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1300), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 8;
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return scene(false); });
    mm.add('(max-width: 760px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var route = sec.querySelector('[data-route]'), pins = sec.querySelectorAll('[data-pin]');
    var place = sec.querySelector('[data-place]'), placeN = sec.querySelector('[data-place-n]');
    var L = route.getTotalLength();
    html.classList.add('st-on');
    /* where along the route each pin sits (closest sampled point) */
    var at = [];
    pins.forEach(function (p) {
      var m = p.getAttribute('transform').match(/translate\(([\d.]+)[ ,]([\d.]+)\)/), px = +m[1], py = +m[2], best = 0, bd = 1e9;
      for (var s = 0; s <= 200; s++) { var pt = route.getPointAtLength(L * s / 200), dd = (pt.x - px) * (pt.x - px) + (pt.y - py) * (pt.y - py); if (dd < bd) { bd = dd; best = s / 200; } }
      at.push(best);
    });
    gsap.set(route, { strokeDasharray: L + ' ' + L, strokeDashoffset: L });
    gsap.set(pins, { autoAlpha: 0 });
    pins.forEach(function (p) { gsap.set(p.querySelector('circle'), { transformOrigin: '50% 50%' }); });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(route, { strokeDashoffset: 0, duration: 1 }, 0);
    pins.forEach(function (p, i) {
      tl.to(p, { autoAlpha: 1, duration: .03 }, Math.max(0, at[i] - .02));
      tl.fromTo(p.querySelector('circle'), { scale: 2.4 }, { scale: 1, duration: .08, ease: 'back.out(3)', immediateRender: false }, Math.max(0, at[i] - .02));
    });
    tl.to({}, { duration: .12 });
    var last = -1;
    function setPlace(k) {
      if (k === last) return; last = k;
      place.textContent = pins[k].getAttribute('data-pin');
      placeN.textContent = pins[k].getAttribute('data-n');
    }
    tl.eventCallback('onUpdate', function () {
      var p = Math.min(1, tl.time()), k = 0;
      for (var j = 0; j < at.length; j++) if (p >= at[j] - .02) k = j;
      setPlace(k);
    });
    setPlace(0);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=200%', pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    return function () {
      st.kill(); tl.kill();
      html.classList.remove('st-on');
      gsap.set([route, pins], { clearProps: 'all' });
      pins.forEach(function (p) { gsap.set(p.querySelector('circle'), { clearProps: 'all' }); });
      place.textContent = 'Albiate'; placeN.textContent = '1 lavoro';
    };
  }
})();
