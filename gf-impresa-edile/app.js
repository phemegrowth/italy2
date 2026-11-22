/* GF Impresa Edile: hero F (frame draws, photo opens inside it), header, menu, anchors, reveals, services photo swap,
   drag strip, process line, phone bar, form validation, and the GSAP scene "Il cappotto, strato per strato":
   pinned, the wall section builds layer by layer while the heat lines through it get shorter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var howList = d.querySelector('.how__list');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
    if (howList) {
      var r = howList.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      howList.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
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
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var els = Array.prototype.slice.call(d.querySelectorAll('.r'));
  function show(el) { el.classList.add('is-in'); }
  if (!('IntersectionObserver' in window) || reduce) els.forEach(show);
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { show(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el); });
  }

  /* services: hover or focus swaps the photo (desktop); on phones the list simply reads */
  var items = d.querySelectorAll('.sv__item'), imgs = d.querySelectorAll('.sv__fig img');
  function pick(it) {
    items.forEach(function (x) { x.classList.toggle('is-on', x === it); });
    var k = it.getAttribute('data-img');
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === k); });
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { pick(it); });
    it.addEventListener('click', function () { pick(it); });
  });
  if ('IntersectionObserver' in window && window.matchMedia('(min-width: 1000px)').matches) {
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) pick(e.target); }); }, { rootMargin: '-45% 0px -50% 0px' });
    items.forEach(function (it) { sio.observe(it); });
  }

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  /* form */
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

  /* GSAP scene */
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
    var steps = sec.querySelectorAll('.scene__steps li'), cur = sec.querySelector('.scene__cur');
    var L = function (s) { return sec.querySelector('.wall__l--' + s); };
    var glue = L('glue'), eps = L('eps'), mesh = L('mesh'), fin = L('finish');
    var dowels = sec.querySelectorAll('.wall__l--dowel i'), heat = sec.querySelectorAll('.wall__heat span');
    var copy = sec.querySelectorAll('.scene__copy > *');

    gsap.set([glue, eps, mesh, fin], { xPercent: 260, autoAlpha: 0 });
    gsap.set(dowels, { scaleX: 0, autoAlpha: 0 });
    gsap.set(heat, { scaleX: 1 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from(copy, { y: 30, autoAlpha: 0, stagger: .08, duration: .5 }, 0)
      .to({}, { duration: .4 })
      .addLabel('s1')
      .to([glue, eps], { xPercent: 0, autoAlpha: 1, duration: 1, stagger: .15 }, 's1')
      .to(heat, { scaleX: .62, duration: 1, ease: 'none' }, 's1')
      .addLabel('s2')
      .to(dowels, { scaleX: 1, autoAlpha: 1, duration: .8, stagger: .12 }, 's2')
      .addLabel('s3')
      .to(mesh, { xPercent: 0, autoAlpha: 1, duration: .9 }, 's3')
      .to(heat, { scaleX: .5, duration: .9, ease: 'none' }, 's3')
      .addLabel('s4')
      .to(fin, { xPercent: 0, autoAlpha: 1, duration: .9 }, 's4')
      .to(heat, { scaleX: .42, autoAlpha: .55, duration: .9, ease: 'none' }, 's4')
      .to({}, { duration: .5 });

    var marks = [0, tl.labels.s1, tl.labels.s2, tl.labels.s3, tl.labels.s4];
    var last = -1;
    function upd() {
      var t = tl.time(), c = 0;
      for (var i = 0; i < marks.length; i++) if (t >= marks[i] + (i ? .35 : 0)) c = i;
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); s.classList.toggle('is-cur', i === c); s.style.opacity = i <= c ? 1 : .35; });
      cur.textContent = '0' + (c + 1);
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () {
      st.kill(); tl.kill();
      gsap.set([glue, eps, mesh, fin, dowels, heat, copy], { clearProps: 'all' });
      steps.forEach(function (s) { s.style.opacity = ''; s.classList.remove('is-cur'); });
    };
  }
})();
