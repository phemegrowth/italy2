/* Mladenovic Costruzioni: header, menu, anchors, reveals, step line, phone bar, form, split hero with a slower photo (mechanic B), parallax on the coast photo, and the GSAP signature scene (catalogue 11): a wall is cast: formwork, rebar, a wavy concrete pour, then the formwork comes off. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var heroImg = d.querySelector('[data-par]'), coast = d.querySelector('[data-par2]');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
    if (!reduce) {
      if (heroImg && y < window.innerHeight * 1.2) heroImg.style.transform = 'translate3d(0,' + (y * 0.25).toFixed(1) + 'px,0)';
      if (coast) { var r = coast.parentNode.getBoundingClientRect(); if (r.bottom > 0 && r.top < window.innerHeight) coast.style.transform = 'translate3d(0,' + (-(1 - (r.top + r.height) / (window.innerHeight + r.height)) * 16).toFixed(2) + '%,0)'; }
    }
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
  var steps = sec ? Array.prototype.slice.call(sec.querySelectorAll('.po__steps li')) : [];
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
    var head = q('.po__head > *'), forms = q('.po__form'), ties = sec.querySelector('.po__ties'), rebar = q('.po__rebar path'), pour = sec.querySelector('.po__pour'), dim = sec.querySelector('.po__dim');
    rebar.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(steps, { autoAlpha: 0, y: 10 });
    gsap.set(forms[0], { x: -120, autoAlpha: 0 });
    gsap.set(forms[1], { x: 120, autoAlpha: 0 });
    gsap.set([ties, dim], { autoAlpha: 0 });
    gsap.set(pour, { y: 400 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0)
     .to(steps, { autoAlpha: 1, y: 0, stagger: .05, duration: .3 }, .2)
     .to(forms, { x: 0, autoAlpha: 1, duration: .6, ease: 'power2.out' }, .6)
     .to(ties, { autoAlpha: 1, duration: .3 }, 1.1)
     .to(rebar, { strokeDashoffset: 0, stagger: .04, duration: .45 }, 1.4)
     .to(pour, { y: 52, duration: 1.4, ease: 'power1.inOut' }, 2.3)
     .to(pour, { x: -100, duration: 1.4 }, 2.3)
     .to(forms[0], { x: -90, autoAlpha: 0, duration: .6, ease: 'power2.in' }, 3.9)
     .to(forms[1], { x: 90, autoAlpha: 0, duration: .6, ease: 'power2.in' }, 3.9)
     .to(ties, { autoAlpha: 0, duration: .3 }, 3.9)
     .to(rebar, { autoAlpha: 0, duration: .3 }, 4.1)
     .to(dim, { autoAlpha: 1, duration: .3 }, 4.3)
     .to({}, { duration: .4 }, 4.6);
    var marks = [.6, 1.4, 2.3, 3.9];
    T.eventCallback('onUpdate', function () { var t = T.time(), k = -1; marks.forEach(function (m, i) { if (t >= m) k = i; }); steps.forEach(function (l, i) { l.classList.toggle('is-on', i === k); }); });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=250%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(steps, forms, rebar, [ties, pour, dim]), { clearProps: 'all' }); };
  }
})();
