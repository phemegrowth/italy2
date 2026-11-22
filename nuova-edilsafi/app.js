/* Nuova Edilsafi: header, menu, anchors, reveals, timeline line, phone bar, form, blueprint frame hero (CSS), parallax on the Bolzano photo, and the GSAP signature scene: a house photo cut into four floors that pull apart with scroll, each floor lighting its label. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var bzImg = d.querySelector('.bz__photo img');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
    if (bzImg && !reduce) {
      var r = bzImg.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) bzImg.style.transform = 'translateY(' + (-(1 - (r.top + r.height) / (window.innerHeight + r.height)) * 12).toFixed(2) + '%)';
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
  var labels = sec ? Array.prototype.slice.call(sec.querySelectorAll('.ex__labels li')) : [];
  if (reduce || !window.gsap) labels.forEach(function (l) { l.classList.add('is-on'); });
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', function () { return build(true); });
    mm.add('(min-width: 1024px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var head = q('.ex__head > *'), house = sec.querySelector('.ex__house'), slices = q('.sl');
    var gap = small ? 0.2 : 0.17; /* fraction of slice height between floors */
    labels.forEach(function (l) { l.classList.remove('is-on'); });
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(labels, { autoAlpha: 0, x: -16 });
    gsap.set(house, { clipPath: 'inset(100% 0 0 0)', scale: small ? .94 : .96 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0)
     .to(house, { clipPath: 'inset(0% 0 0 0)', duration: .8, ease: 'power2.out' }, .2)
     .to(labels, { autoAlpha: 1, x: 0, stagger: .06, duration: .3 }, .6);
    /* bottom floor first: fondazioni, then up */
    for (var k = 3; k >= 0; k--) {
      T.to(slices[k], { yPercent: (k - 1.5) * gap * 200, x: small ? 0 : (k % 2 ? 14 : -14), duration: .55, ease: 'power1.inOut' }, 1.1 + (3 - k) * .55);
    }
    T.to(house, { scale: small ? .86 : .9, duration: 2.2 }, 1.1).to({}, { duration: .6 }, 3.3);
    T.eventCallback('onUpdate', function () {
      var t = T.time(), step = t < 1.1 ? -1 : Math.min(3, Math.floor((t - 1.1) / .55)), all = t > 3.4;
      labels.forEach(function (l) { var i = +l.getAttribute('data-l'); l.classList.toggle('is-on', all || (step >= 0 && i === 3 - step)); });
    });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(labels, slices, [house]), { clearProps: 'all' }); };
  }
})();
