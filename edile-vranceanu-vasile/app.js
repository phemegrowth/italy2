/* Edile Vranceanu Vasile: type-first hero (letters rise, photo strip slides in from the right), header, side menu,
   anchors, reveals, magnetic buttons, phone bar, form validation, tile positions for the floor, and the GSAP signature
   scene: a floor laid with the scroll (screed, notched adhesive, tiles row by row with a counter, grout, sheen). */
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

  /* floor tiles: each tile shows its own piece of the same marble photo */
  var grid = d.querySelector('[data-tilegrid]');
  function layoutTiles() {
    if (!grid) return;
    var wide = window.matchMedia('(min-width: 960px)').matches, cols = wide ? 6 : 4, rows = wide ? 4 : 6;
    grid.querySelectorAll('i').forEach(function (t, i) {
      var c = i % cols, r = Math.floor(i / cols);
      /* use only the lower 55% of the photo (clean marble, no furniture) */
      var f = .55, ih = rows / f, py = (ih - rows + r) / (ih - 1) * 100;
      t.style.backgroundSize = (cols * 100) + '% ' + (ih * 100).toFixed(2) + '%';
      t.style.backgroundPosition = (c / (cols - 1) * 100) + '% ' + py.toFixed(2) + '%';
    });
  }
  layoutTiles();
  window.matchMedia('(min-width: 960px)').addEventListener('change', layoutTiles);

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
    var glue = sec.querySelector('.floor__glue'), grout = sec.querySelector('.floor__grout');
    var tiles = sec.querySelectorAll('.floor__tiles i'), sheen = sec.querySelector('.floor__sheen');
    var copy = sec.querySelectorAll('.scene__copy > .eyebrow, .scene__copy > .h2, .scene__tally');
    var ph = sec.querySelectorAll('.phases li'), tally = sec.querySelector('[data-tiles]');
    var cols = small ? 4 : 6, n = tiles.length, state = { k: 0 };

    gsap.set(copy, { autoAlpha: 0, y: 26 });
    gsap.set(glue, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(grout, { autoAlpha: 0 });
    gsap.set(tiles, { autoAlpha: 0, y: -24, scale: 1.08 });
    gsap.set(sheen, { xPercent: -60, autoAlpha: 0 });
    tally.textContent = '0';

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(copy, { autoAlpha: 1, y: 0, stagger: .08, duration: .5 }, 0)
      .to(glue, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power1.inOut' }, .9)
      .to(tiles, { autoAlpha: 1, y: 0, scale: 1, duration: .45, stagger: { each: 2.4 / n, grid: [n / cols, cols], from: 'start' } }, 2.1)
      .to(state, { k: n, duration: 2.6, ease: 'none', onUpdate: function () { tally.textContent = Math.round(state.k); } }, 2.1)
      .to(grout, { autoAlpha: 1, duration: .7 }, 4.9)
      .to(sheen, { autoAlpha: 1, duration: .2 }, 5.6)
      .to(sheen, { xPercent: 60, duration: 1, ease: 'power1.inOut' }, 5.6)
      .to(sheen, { autoAlpha: 0, duration: .3 }, 6.4)
      .to({}, { duration: .4 });

    var at = [0, .9, 2.1, 4.9];
    var last = -1;
    function sync() {
      var t = tl.time(), s = 1;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k + 1;
      if (s === last) return; last = s;
      ph.forEach(function (li) { var p = +li.getAttribute('data-p'); li.classList.toggle('is-on', p === s); li.classList.toggle('is-done', p < s); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set([copy, glue, grout, tiles, sheen], { clearProps: 'opacity,visibility,transform,clipPath' });
      ph.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
      tally.textContent = '24';
    };
  }
})();
