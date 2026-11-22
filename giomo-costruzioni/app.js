/* Giomo Costruzioni: header, menu, anchors, reveals, step line, phone bar, form, fanned hero cards (CSS) with a slight scroll drift, and the GSAP signature scene: a house built on scroll, slab first, then brick courses from the bottom up, then the openings, then the roof, with a % counter and four steps. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var cards = Array.prototype.slice.call(d.querySelectorAll('.card'));
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
    if (!reduce && y < hero.offsetHeight) cards.forEach(function (c, i) { c.querySelector('img').style.transform = 'translate3d(0,' + (y * (0.04 + i * 0.025)).toFixed(1) + 'px,0) scale(1.08)'; });
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

  /* bricks (built always, so reduced motion and the static view show the finished wall) */
  var bw = d.querySelector('[data-bricks]');
  if (bw) {
    for (var c = 0; c < 11; c++) {
      var row = d.createElement('div'); row.className = 'course';
      var odd = c % 2 === 1, n = odd ? 5 : 6;
      if (odd) { var h = d.createElement('i'); h.className = 'brick brick--h'; row.appendChild(h); }
      for (var k = 0; k < n; k++) { var b = d.createElement('i'); b.className = 'brick'; row.appendChild(b); }
      if (odd) { var h2 = d.createElement('i'); h2.className = 'brick brick--h'; row.appendChild(h2); }
      bw.appendChild(row);
    }
  }

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.setAttribute('data-on', '');
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
    var courses = q('.course'), slab = sec.querySelector('.slab'), roof = sec.querySelector('.roof'), opens = q('.open');
    var steps = q('.wall__steps li'), pct = sec.querySelector('[data-pct]'), stage = sec.querySelector('.wall__stage');
    var cur = -1;
    function setStep(i) { if (i === cur) return; cur = i; steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); }
    setStep(0);
    gsap.set(stage, { autoAlpha: 0, y: 30 });
    gsap.set(slab, { scaleX: 0 });
    courses.forEach(function (row) { gsap.set(row.children, { y: small ? -36 : -60, autoAlpha: 0 }); });
    gsap.set(opens, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(roof, { y: small ? -50 : -90, autoAlpha: 0 });
    var T = gsap.timeline({ defaults: { ease: 'power2.out' } });
    T.to(stage, { autoAlpha: 1, y: 0, duration: .4 }, 0)
     .addLabel('f', .4).to(slab, { scaleX: 1, duration: .6, ease: 'power3.inOut' }, 'f')
     .addLabel('m', 1.1);
    courses.forEach(function (row, i) { T.to(row.children, { y: 0, autoAlpha: 1, duration: .35, stagger: .035 }, 1.1 + i * .22); });
    var tOpen = 1.1 + courses.length * .22 + .3;
    T.addLabel('o', tOpen).to(opens, { clipPath: 'inset(0% 0 0 0)', duration: .5, stagger: .12, ease: 'power3.out' }, tOpen)
     .addLabel('r', tOpen + .9).to(roof, { y: 0, autoAlpha: 1, duration: .6, ease: 'back.out(1.3)' }, tOpen + .9)
     .to({}, { duration: .5 });
    var total = T.duration(), marks = [T.labels.f, T.labels.m, T.labels.o, T.labels.r];
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=190%' : '+=260%', pin: true, scrub: .5, animation: T,
      onUpdate: function (self) {
        var t = self.progress * total, i = 0;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - .05) i = k;
        setStep(i);
        var p = Math.max(0, Math.min(1, (t - marks[0]) / (marks[3] + .6 - marks[0])));
        pct.textContent = Math.round(p * 100);
      }
    });
    return function () { st.kill(); T.kill(); gsap.set([stage, slab, roof].concat(opens, q('.brick')), { clearProps: 'all' }); };
  }
})();
