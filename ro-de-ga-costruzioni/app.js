/* RO.DE.GA Costruzioni: curtain hero, header, drop-down menu, anchors, reveals, accordion with height animation,
   phone bar, form validation, and the GSAP signature scene: a floor section built layer by layer with the scroll
   (slab, pipes drawing in, insulation, a screed pour with a wavy edge, tiles dropping in). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var pic = d.querySelector('.hero__pic');
  if (pic && !reduce) setTimeout(function () { pic.classList.add('is-drift'); }, 2000);

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

  /* accordion: animate height on open/close */
  d.querySelectorAll('.acc__it').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (det.open) {
        var h = body.scrollHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var h2 = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  });

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
    var q = function (x) { return sec.querySelectorAll(x); };
    var items = q('.scene__list li'), num = sec.querySelector('[data-n]'), cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
      num.textContent = i + 1;
    }
    setStep(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1,
        onToggle: function (s) { scenePinned = s.isActive; bar(); },
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.58 ? 2 : p < 0.78 ? 3 : 4); }
      }
    });
    tl.fromTo(q('.L1'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1 }, 0.02)
      .fromTo(q('.tg1'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.05 }, 0.08)
      .set(q('.L2'), { opacity: 1 }, 0.2)
      .fromTo(q('.pipe'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.14, stagger: 0.03 }, 0.2)
      .fromTo(q('.tg2'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.05 }, 0.28)
      .fromTo(q('.L3'), { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.1 }, 0.4)
      .fromTo(q('.tg3'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.05 }, 0.46)
      .set(q('.L4'), { opacity: 1 }, 0.58)
      .fromTo(q('.pour__p'), { y: 70, x: 0 }, { y: 0, x: 80, duration: 0.16 }, 0.58)
      .fromTo(q('.tg4'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.05 }, 0.68)
      .set(q('.L5'), { opacity: 1 }, 0.78)
      .fromTo(q('.tiles rect'), { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.06, stagger: 0.025 }, 0.78)
      .fromTo(q('.tg5'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.05 }, 0.9)
      .to({}, { duration: 0.06 });
    return function () { scenePinned = false; };
  }
})();
