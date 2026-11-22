/* Chistè: header, menu, anchors, reveals, step line, phone bar, form, blueprint-frame hero (CSS), valley photo parallax, and the GSAP signature scene: a pinned before / after scrub of a kitchen, the wipe line moves with scroll and three captions change on the way. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var comoImg = d.querySelector('.dove__img img'), como = d.querySelector('.dove');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
    if (comoImg && !reduce) {
      var r = como.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom > 0 && r.top < vh) comoImg.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -0.08 - 30).toFixed(1) + 'px,0)';
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
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.setAttribute('data-on', '');
    sec.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; });
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
    var stage = sec.querySelector('.ba__stage'), after = sec.querySelector('.ba__after'), line = sec.querySelector('.ba__line');
    var caps = q('.ba__caps li'), tagB = sec.querySelector('.ba__tag--b'), tagA = sec.querySelector('.ba__tag--a'), afterImg = after.querySelector('img');
    var cur = -1;
    function setCap(i) { if (i === cur) return; cur = i; caps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); }
    setCap(0);
    var s = { x: 100 };
    function draw() { after.style.clipPath = 'inset(0 0 0 ' + s.x.toFixed(2) + '%)'; line.style.left = s.x.toFixed(2) + '%'; }
    draw();
    gsap.set(stage, { autoAlpha: 0, y: 30, clipPath: 'inset(10% 8% 10% 8%)' });
    gsap.set([tagB], { autoAlpha: 0 });
    gsap.set(afterImg, { scale: 1.08 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(stage, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .6, ease: 'power2.out' }, 0)
     .to(s, { x: 62, duration: 1, onUpdate: draw }, .8)
     .to(s, { x: 0, duration: 1.4, onUpdate: draw }, 1.9)
     .to(afterImg, { scale: 1, duration: 2.4 }, .8)
     .to(tagB, { autoAlpha: 1, duration: .2 }, 1)
     .to(tagA, { autoAlpha: 0, duration: .2 }, 3)
     .to(line, { autoAlpha: 0, duration: .2 }, 3.2)
     .to({}, { duration: .5 }, 3.4);
    var total = T.duration();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=240%', pin: true, scrub: .5, animation: T,
      onUpdate: function (self) { var t = self.progress * total; setCap(t < 1.5 ? 0 : (t < 2.8 ? 1 : 2)); }
    });
    return function () { st.kill(); T.kill(); after.style.clipPath = ''; line.style.left = ''; gsap.set([stage, tagA, tagB, line, afterImg], { clearProps: 'all' }); };
  }
})();
