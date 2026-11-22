/* Edilripristini 76: header, menu, anchors, reveals, count-up, timeline line, phone bar, form, drag gallery,
   and the GSAP signature scene: a pinned wall section that builds up layer by layer (muratura, malta,
   rasatura con rete, finitura) with a 01/04 counter and a progress bar. */
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

  /* count-up of years in business (sourced: costituita nel 1993) */
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

  /* drag gallery (mouse); touch scrolls natively */
  var dg = d.querySelector('[data-drag]');
  if (dg) {
    var down = false, sx = 0, sl = 0;
    dg.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = dg.scrollLeft; dg.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { down = false; dg.classList.remove('is-down'); });
    dg.addEventListener('pointermove', function (e) { if (!down) return; dg.scrollLeft = sl - (e.clientX - sx); });
    dg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') dg.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') dg.scrollBy({ left: -300, behavior: 'smooth' }); });
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
    var head = Array.prototype.slice.call(sec.querySelectorAll('.wall__head > *'));
    var cut = sec.querySelector('.wall__cut'), steps = sec.querySelector('.wall__steps');
    var layers = Array.prototype.slice.call(sec.querySelectorAll('.layer'));
    var lis = Array.prototype.slice.call(sec.querySelectorAll('.wall__steps li'));
    var labels = layers.map(function (l) { return l.querySelector('i'); });
    var bar = sec.querySelector('.wall__bar span'), idx = sec.querySelector('[data-idx]');
    var n = lis.length, cur = -1;
    var set = function (k) {
      if (k === cur) return; cur = k;
      lis.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
      idx.textContent = ('0' + (k + 1)).slice(-2);
    };
    gsap.set(head.concat([cut, steps]), { autoAlpha: 0, y: 30 });
    gsap.set(layers.slice(1), { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(labels, { autoAlpha: 0, y: 8 });
    gsap.set(bar, { scaleX: 0 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .05, duration: .3, ease: 'power2.out' }, 0)
     .to(cut, { autoAlpha: 1, y: 0, duration: .35, ease: 'power2.out' }, .05)
     .to(steps, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, .12)
     .to(labels[0], { autoAlpha: 1, y: 0, duration: .2 }, .3);
    layers.slice(1).forEach(function (l, j) {
      var at = .6 + j * .8;
      T.to(l, { clipPath: 'inset(0% 0% 0% 0%)', duration: .55, ease: 'power1.inOut' }, at)
       .to(labels[j + 1], { autoAlpha: 1, y: 0, duration: .2 }, at + .4);
    });
    T.to(bar, { scaleX: 1, duration: T.duration() }, 0);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: true, scrub: .5, animation: T,
      onUpdate: function (self) { set(Math.min(n - 1, Math.floor(self.progress * n * 0.999 + 0.0001))); }
    });
    set(0);
    return function () { st.kill(); T.kill(); gsap.set(head.concat([cut, steps], layers, labels, [bar]), { clearProps: 'all' }); set(0); };
  }
})();
