/* FF Ristrutturazioni e Impianti: hero H (curtain: a green panel wipes up off the photo, the FF mark turns once,
   headline line by line), header, phone menu, anchors, reveals, process line, phone bar, form validation, and the
   GSAP signature scene "Sotto il pavimento": pinned, a floor section builds layer by layer (solaio, isolante,
   tubi radianti, massetto, parquet) and heat rises; the list on the side follows the layer being laid. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id === '#') { e.preventDefault(); if (id === '#top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var els = [].slice.call(d.querySelectorAll('.r'));
  if (!('IntersectionObserver' in window) || reduce) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* process line */
  var wrapS = d.querySelector('.steps__wrap'), line = d.querySelector('.steps__line i');
  if (wrapS && line) {
    if (reduce) line.style.setProperty('--p', 1);
    else {
      var lp = function () {
        var r = wrapS.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
        line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', lp, { passive: true });
      lp();
    }
  }

  /* form validation */
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

  /* GSAP signature scene: floor section built layer by layer */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.classList.add('is-live');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 900px)', function () { return scene(true); });
    mm.add('(min-width: 901px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var L1 = sec.querySelector('.L1'), L2 = sec.querySelector('.L2'), pipes = sec.querySelectorAll('.pipe');
    var screed = sec.querySelector('.screed-r'), wood = sec.querySelector('.wood-r'), waves = [].slice.call(sec.querySelectorAll('.w'));
    var items = [].slice.call(sec.querySelectorAll('.scene__list li')), last = -1;
    waves.forEach(function (p) { var l = Math.ceil(p.getTotalLength()) + 2; gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.set([L1, L2], { autoAlpha: 0, y: 50 });
    gsap.set(pipes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(screed, { attr: { y: 284, height: 0 } });
    gsap.set(wood, { attr: { width: 0 } });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(L1, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 0)
      .to(L2, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, .7)
      .to(pipes, { scale: 1, duration: .25, stagger: .06, ease: 'back.out(2)' }, 1.4)
      .to(screed, { attr: { y: 214, height: 70 }, duration: .8, ease: 'power1.inOut' }, 2.5)
      .to(wood, { attr: { width: 720 }, duration: .8, ease: 'power1.inOut' }, 3.4)
      .to(waves, { strokeDashoffset: 0, duration: .6, stagger: .1 }, 4.3)
      .to({}, { duration: .3 });
    function upd() {
      var t = tl.time();
      var k = t < .7 ? 0 : t < 1.4 ? 1 : t < 2.5 ? 2 : t < 3.4 ? 3 : 4;
      if (k === last) return;
      last = k;
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%', pin: true, scrub: .6, animation: tl });
    return function () { st.kill(); tl.kill(); };
  }
})();
