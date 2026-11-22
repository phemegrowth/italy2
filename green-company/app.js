/* Green Company: hero H (lime curtain wipes up, the mark scales in), header, sliding menu, anchors, reveals,
   count-up of the team size (20+, registry band 20 to 49), phone bar, form validation, and the GSAP scene
   "Prima e dopo": pinned, scroll drags the wipe from the raw room to the finished one, three captions on the way. */
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
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    if (reduce) return;
    var to = +el.getAttribute('data-to'), t0 = performance.now(), dur = 1200;
    (function tick(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var els = Array.prototype.slice.call(d.querySelectorAll('.r, .proof__list'));
  function show(el) { el.classList.add('is-in'); el.querySelectorAll('.count').forEach(countUp); }
  if (!('IntersectionObserver' in window) || reduce) els.forEach(show);
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { show(el); }, (k++) * 90);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el); });
  }

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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 999px)', function () { return scene(true); });
    mm.add('(min-width: 1000px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var dopo = sec.querySelector('.ba__dopo'), line = sec.querySelector('.ba__line'), ba = sec.querySelector('.ba');
    var prima = sec.querySelector('.ba__prima'), caps = sec.querySelectorAll('.ba__caps li');
    var tagA = sec.querySelector('.ba__tag--a'), tagB = sec.querySelector('.ba__tag--b');
    var head = sec.querySelectorAll('.scene__head > *');
    var w = { x: 100 };
    function paint() {
      dopo.style.clipPath = 'inset(0 0 0 ' + w.x.toFixed(2) + '%)';
      line.style.left = w.x.toFixed(2) + '%';
      line.style.opacity = (w.x > 0.5 && w.x < 99.5) ? 1 : 0;
      tagA.style.opacity = w.x > 12 ? 1 : 0;
      tagB.style.opacity = w.x < 88 ? 1 : 0;
    }
    paint();
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.from(head, { y: 24, autoAlpha: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0)
      .from(ba, { clipPath: 'inset(12% 8% 12% 8%)', duration: .6, ease: 'power2.out' }, 0)
      .to(prima, { scale: 1.06, duration: 3.6 }, 0)
      .to(w, { x: 0, duration: 3, onUpdate: paint }, .6)
      .to({}, { duration: .4 });
    var last = -1;
    function upd() {
      var p = 100 - w.x, c = p < 30 ? 0 : (p < 75 ? 1 : 2);
      if (c === last) return;
      last = c;
      caps.forEach(function (li, i) { li.classList.toggle('is-on', i <= c); li.classList.toggle('is-cur', i === c); });
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    return function () {
      st.kill(); tl.kill();
      gsap.set([head, ba, prima], { clearProps: 'all' });
      dopo.style.clipPath = ''; line.style.left = ''; line.style.opacity = ''; tagA.style.opacity = ''; tagB.style.opacity = '';
      caps.forEach(function (li) { li.classList.remove('is-cur'); });
    };
  }
})();
