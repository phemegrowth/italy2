/* Alba Service: header, full-screen menu, anchors, reveals, cascading card hero (four site photos step out
   of a stack into a diagonal cascade, then drift at different speeds), step line, phone bar, form validation and the GSAP signature scene:
   catalogue 7, a sticky list of the four phases of a facade job drives the photo (crossfade + slow scale). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready', 'no-pin'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
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

  reveal(d.querySelectorAll('.about__pic'), function (el) { el.classList.add('is-in'); });

  /* count-up (sourced: 56 years since 16 Nov 1970) */
  var cc = d.querySelector('[data-count]');
  function countUp(el, ms) {
    var target = +el.getAttribute('data-count');
    if (reduce) { el.textContent = target; return; }
    var t0 = performance.now();
    el.textContent = '0';
    (function tick(t) {
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if (cc && 'IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { co.disconnect(); countUp(cc, 1200); } }, { threshold: 0.6 });
    co.observe(cc);
  }

  /* deck drifts: each card at its own speed while the hero scrolls away; step line draws */
  var cards = d.querySelectorAll('.card img'), steps = d.querySelector('.steps__list');
  function onFrame() {
    var vh = window.innerHeight, y = window.scrollY;
    if (!reduce && y < vh * 1.2) cards.forEach(function (im, i) { im.style.transform = 'translate3d(0,' + (y * (0.03 + i * 0.025)).toFixed(1) + 'px,0) scale(1.08)'; });
    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
  }
  window.addEventListener('scroll', onFrame, { passive: true });
  onFrame();

  /* phone contact bar: after the hero, hidden while the scene is pinned and in the contact section */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-pin'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var rooms = sec.querySelectorAll('.rooms li'), pics = sec.querySelectorAll('.scene__pics img');
    var tag = sec.querySelector('.scene__tag b'), bar = sec.querySelector('.rooms__bar i'), n = rooms.length, cur = -1;
    function setRoom(k) {
      if (k === cur) return;
      cur = k;
      rooms.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
      pics.forEach(function (im, j) { im.classList.toggle('is-on', j === k); });
      tag.textContent = '0' + (k + 1);
    }
    setRoom(0);
    gsap.set(bar, { scaleX: 0 });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=160%' : '+=260%', pin: stage, scrub: 0.4,
      onToggle: function (s) { scenePinned = s.isActive; pb(); },
      onUpdate: function (s) {
        gsap.set(bar, { scaleX: s.progress });
        setRoom(Math.min(n - 1, Math.floor(s.progress * n * 0.999)));
      }
    });
    return function () {
      st.kill();
      gsap.set(bar, { clearProps: 'all' });
      rooms.forEach(function (li, j) { li.classList.toggle('is-on', j === 0); });
      pics.forEach(function (im, j) { im.classList.toggle('is-on', j === 0); });
    };
  }
})();
