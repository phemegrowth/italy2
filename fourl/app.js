/* FOURL: header, menu, anchors, reveals, timeline line, phone bar, form, hero curtain (CSS), service hover peek,
   and the GSAP signature scene "Strato su strato": a road section is dug, then gravel, base, binder and wearing course
   pour in one by one, the roller passes and the lane markings draw. */
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

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.lift-x').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
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

  /* service hover peek (desktop only) */
  var peek = d.querySelector('.svc__peek');
  if (peek && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var pimg = peek.querySelector('img'), grid = d.querySelector('.svc__grid');
    d.querySelectorAll('.svc__list li').forEach(function (li) {
      li.addEventListener('mouseenter', function () { pimg.src = './assets/img/' + li.getAttribute('data-img') + '.jpg'; peek.classList.add('is-on'); });
      li.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); });
      li.addEventListener('mousemove', function (e) { var r = grid.getBoundingClientRect(); peek.style.left = (e.clientX - r.left + 24) + 'px'; peek.style.top = (e.clientY - r.top - 110) + 'px'; });
    });
  }

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
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var dig = q('.l-dig'), cut = q('.l-cut'), L = [q('.l-1'), q('.l-2'), q('.l-3'), q('.l-4')], lines = q('.l-lines rect'), roller = q('.l-roller');
    var head = q('.road__head > *'), stage = q('.sect'), lis = q('.layers li');
    gsap.set(dig, { opacity: 1 });
    gsap.set(cut, { autoAlpha: 0 });
    L.forEach(function (l) { gsap.set(l, { autoAlpha: 0, y: -90 }); });
    gsap.set(lines, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(roller, { x: -90, autoAlpha: 0 });
    gsap.set(head.concat(stage), { autoAlpha: 0, y: 30 });
    var T = gsap.timeline({ defaults: { ease: 'power2.out' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4 }, 0)
     .to(stage, { autoAlpha: 1, y: 0, duration: .5 }, .1)
     .to(cut, { autoAlpha: 1, duration: .3 }, .8)
     .to(dig, { y: -160, opacity: 0, duration: .8, ease: 'power2.in' }, 1.0);
    var marks = [0, 2.0, 3.1, 4.2, 5.3, 6.9];
    L.forEach(function (l, i) { T.to(l, { autoAlpha: 1, y: 0, duration: .8, ease: 'bounce.out' }, marks[i + 1]); });
    T.to(roller, { autoAlpha: 1, duration: .2 }, 5.6)
     .to(roller, { x: 560, duration: 1.3, ease: 'none' }, 5.6)
     .to(roller, { autoAlpha: 0, duration: .2 }, 6.8)
     .to(lines, { scaleX: 1, duration: .4, stagger: .12 }, 6.9)
     .to({}, { duration: .5 }, 7.6);
    var total = T.duration(), cur = -1;
    var setStep = function (t) {
      var k = 0; for (var i = 0; i < marks.length; i++) if (t >= marks[i] - .1) k = i;
      if (k === cur) return; cur = k;
      lis.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    };
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: true, scrub: .6, animation: T, onUpdate: function (self) { setStep(self.progress * total); } });
    setStep(0);
    return function () { st.kill(); T.kill(); gsap.set(dig.concat(cut, lines, roller, head, stage, L[0], L[1], L[2], L[3]), { clearProps: 'all' }); lis.forEach(function (li, j) { li.classList.toggle('is-on', j === 0); }); };
  }
})();
