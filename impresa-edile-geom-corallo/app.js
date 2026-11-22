/* Impresa Edile Geom. Corallo: header, menu, anchors, reveals, count-up, step line, phone bar, form, hero photo
   parallax, service list that swaps the photo, and the GSAP signature scene: one building photo cut into five
   floors that pull apart with scroll, each labelled (copertura, finiture, impianti, murature, struttura). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
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

  /* count-up of years in business (sourced: registro imprese dal 1985) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  var tl = d.querySelector('[data-tl]');
  if (tl) {
    var drawT = function () { var r = tl.getBoundingClientRect(), vh = window.innerHeight; tl.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25))).toFixed(3)); };
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

  /* hero photo parallax: the photo moves slower than the page */
  var ph = d.querySelector('[data-par] img');
  if (ph && !reduce) {
    var par = function () { var y = Math.min(window.scrollY, window.innerHeight * 1.2); ph.style.setProperty('--py', (-y * 0.09).toFixed(1) + 'px'); };
    window.addEventListener('scroll', par, { passive: true }); par();
  }

  /* services: the list drives the photo */
  var sw = d.querySelector('[data-swap]');
  if (sw) {
    var items = Array.prototype.slice.call(sw.querySelectorAll('li'));
    var pics = Array.prototype.slice.call(d.querySelectorAll('.svc__media img'));
    var pick = function (li) {
      items.forEach(function (x) { x.classList.toggle('is-on', x === li); x.querySelector('button').setAttribute('aria-expanded', x === li ? 'true' : 'false'); });
      var k = +li.getAttribute('data-img');
      pics.forEach(function (p, j) { p.classList.toggle('is-on', j === k); });
    };
    items.forEach(function (li) {
      var b = li.querySelector('button');
      b.addEventListener('click', function () { pick(li); });
      if (window.matchMedia('(pointer: fine)').matches) b.addEventListener('mouseenter', function () { pick(li); });
    });
    pick(items[0]);
  }

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
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
    var head = Array.prototype.slice.call(sec.querySelectorAll('.ex__head > *'));
    var bld = sec.querySelector('.ex__bld');
    var slices = Array.prototype.slice.call(sec.querySelectorAll('.slice'));
    var tags = Array.prototype.slice.call(sec.querySelectorAll('.ex__tags li'));
    var gap = function () { return bld.offsetHeight * (small ? 0.055 : 0.07); };
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(bld, { autoAlpha: 0, scale: .94 });
    gsap.set(tags, { autoAlpha: 0, x: -14 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .06, duration: .35, ease: 'power2.out' }, 0)
     .to(bld, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power2.out' }, .1);
    slices.forEach(function (s, i) {
      var off = function () { return (i - 2) * gap(); };
      T.to(s, { y: off, duration: 1.2, ease: 'power1.inOut' }, .6);
      T.to(tags[i], { y: off, duration: 1.2, ease: 'power1.inOut' }, .6);
      T.to(tags[i], { autoAlpha: 1, x: 0, duration: .25, ease: 'power2.out' }, .8 + i * .18);
    });
    T.to({}, { duration: .5 });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: true, scrub: .5, animation: T, invalidateOnRefresh: true });
    return function () { st.kill(); T.kill(); gsap.set(head.concat([bld], slices, tags), { clearProps: 'all' }); };
  }
})();
