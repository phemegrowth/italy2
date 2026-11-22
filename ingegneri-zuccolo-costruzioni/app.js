/* Ingegneri Zuccolo: header, menu, anchors, reveals, count-up, drag strip, history line, phone bar, form, Ken Burns hero (CSS), and the GSAP signature scene: the Lambro bridge drawing builds itself: grid and dimensions, piers rise, the deck is launched span by span, the prestressing tendon draws. */
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

  /* count-up (sourced quantity only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var n = +el.getAttribute('data-count');
    if (reduce) { el.textContent = n; return; }
    var t0 = null;
    var step = function (ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  });

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') strip.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') strip.scrollBy({ left: -300, behavior: 'smooth' }); });
  }

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  var steps = sec ? Array.prototype.slice.call(sec.querySelectorAll('.br__steps li')) : [];
  if (reduce || !window.gsap) steps.forEach(function (l) { l.classList.add('is-on'); });
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', function () { return build(true); });
    mm.add('(min-width: 900px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var head = q('.br__head > *'), grid = sec.querySelector('.br__grid'), dims = q('.br__dim path'), dimT = q('.br__dim text');
    var piers = q('.br__pier'), caps = q('.br__cap'), deck = sec.querySelector('.br__deck'), nose = sec.querySelector('.br__nose'), tendon = sec.querySelector('.br__tendon');
    var water = q('.br__water, .br__wave, .br__bank');
    dims.concat([tendon]).forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(steps, { autoAlpha: 0 });
    gsap.set([grid].concat(dimT, water), { autoAlpha: 0 });
    gsap.set(piers, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(caps, { autoAlpha: 0 });
    gsap.set(deck, { x: -720 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0)
     .to(steps, { autoAlpha: 1, stagger: .05, duration: .3 }, .3)
     .to([grid].concat(water), { autoAlpha: 1, duration: .4 }, .4)
     .to(dims, { strokeDashoffset: 0, duration: .5 }, .7)
     .to(dimT, { autoAlpha: 1, duration: .3 }, 1)
     .to(piers, { scaleY: 1, stagger: .15, duration: .5, ease: 'power2.out' }, 1.4)
     .to(caps, { autoAlpha: 1, stagger: .15, duration: .2 }, 1.8)
     .to(deck, { x: 0, duration: 1.6, ease: 'power1.inOut' }, 2.3)
     .to(nose, { autoAlpha: 0, duration: .3 }, 3.8)
     .to(tendon, { strokeDashoffset: 0, duration: .9 }, 4.1)
     .to({}, { duration: .4 }, 5);
    T.eventCallback('onUpdate', function () {
      var t = T.time(), s = t < .6 ? -1 : t < 1.4 ? 0 : t < 2.3 ? 1 : t < 4.05 ? 2 : 3;
      steps.forEach(function (l, i) { l.classList.toggle('is-on', i === s); });
    });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(steps, dims, dimT, piers, caps, water, [grid, deck, nose, tendon]), { clearProps: 'all' }); };
  }
})();
