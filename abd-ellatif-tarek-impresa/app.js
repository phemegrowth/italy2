/* Abd Ellatif Tarek Impresa Edile: hero card fan (CSS, class toggles), header, full-screen menu, anchors, reveals,
   service list photo swap, drag strip, magnetic buttons, phone bar, form validation, and the GSAP signature scene:
   a building elevation drawn in pencil lines, then the photo of the building rising floor by floor with a % counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    html.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-in'); });

  /* service list: hovering (desktop) or scrolling past (any) swaps the photo beside it */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('[data-swap]');
  function swap(n) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === n); });
    items.forEach(function (i) { i.classList.toggle('is-hover', i.getAttribute('data-swap') === n); });
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { swap(it.getAttribute('data-swap')); });
  });
  if ('IntersectionObserver' in window && window.matchMedia('(min-width: 960px)').matches) {
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) swap(e.target.getAttribute('data-swap')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (i) { io2.observe(i); });
  }

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
  }
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 960px)', function () { return scene(false); });
    mm.add('(max-width: 959px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var photo = sec.querySelector('.frame__photo'), grid = sec.querySelector('.plan__grid');
    var lines = sec.querySelectorAll('.plan__lines path, .plan__dims path');
    var pctEl = sec.querySelector('[data-pct]'), fl = sec.querySelectorAll('.floors li');
    var copy = sec.querySelectorAll('.scene__copy > *'), frame = sec.querySelector('.frame');
    var state = { pct: 0 };
    pctEl.textContent = '0';
    sec.classList.add('is-live');

    gsap.set(copy, { autoAlpha: 0, y: 30 });
    gsap.set(frame, { autoAlpha: 0, scale: .94 });
    gsap.set(grid, { autoAlpha: 0 });
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(copy, { autoAlpha: 1, y: 0, stagger: .08, duration: .5, ease: 'power2.out' }, 0)
      .to(frame, { autoAlpha: 1, scale: 1, duration: .6, ease: 'power2.out' }, 0)
      .to(grid, { autoAlpha: 1, duration: .5 }, .3)
      .to(lines, { strokeDashoffset: 0, stagger: .14, duration: 1.1, ease: 'power1.inOut' }, .5);
    /* floors: the photo rises from the ground in four steps */
    var cuts = [100, 82, 56, 26, 0];
    var t0 = 2.2;
    for (var i = 1; i < cuts.length; i++) {
      tl.to(photo, { clipPath: 'inset(' + cuts[i] + '% 0% 0% 0%)', duration: .9, ease: 'power2.inOut' }, t0 + (i - 1) * 1.05);
    }
    tl.to(state, { pct: 100, duration: 4.1, ease: 'none', onUpdate: function () { pctEl.textContent = Math.round(state.pct); } }, t0)
      .to('.plan__lines path, .plan__grid', { autoAlpha: .28, duration: 1.2 }, t0 + 2.6)
      .to({}, { duration: .5 });

    var marks = [0, t0, t0 + 1.05, t0 + 2.1, t0 + 3.15];
    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var k = 0; k < marks.length; k++) if (t >= marks[k] + (k ? .2 : 0)) s = k;
      if (s === last) return; last = s;
      fl.forEach(function (li) { var n = +li.getAttribute('data-f'); li.classList.toggle('is-on', n === s); li.classList.toggle('is-done', n < s); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set([copy, frame, grid, lines, photo, '.plan__lines path'], { clearProps: 'all' });
      pctEl.textContent = '100';
      sec.classList.remove('is-live');
    };
  }
})();
