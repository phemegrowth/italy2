/* Edil di Gallo Cassarino Giuseppe: hero curtain (CSS), header, menu, anchors, reveals, process line, magnetic buttons,
   phone bar, form, and the GSAP signature scene: a pinned horizontal strip of their own work, cards unmask as they enter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
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

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { s.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { s.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone contact bar after the hero */
  var mbar = d.querySelector('[data-mbar]'), hero = d.querySelector('.hero');
  if (mbar && hero) {
    var mb = function () { mbar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80); };
    window.addEventListener('scroll', mb, { passive: true }); mb();
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    strip(window.innerWidth < 700);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function strip(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('[data-track]'), slides = sec.querySelectorAll('.slide'), cnt = sec.querySelector('[data-count]'), bar = sec.querySelector('[data-bar]');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
    gsap.set(bar, { scaleX: 0 });
    var move = gsap.to(track, { x: function () { return -dist(); }, ease: 'none' });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.1 : 1.2)); },
      pin: true, scrub: .6, anticipatePin: 1, animation: move, invalidateOnRefresh: true,
      onUpdate: function (self) {
        bar.style.transform = 'scaleX(' + self.progress.toFixed(3) + ')';
        var n = Math.min(slides.length, 1 + Math.floor(self.progress * slides.length * 0.999));
        cnt.textContent = (n < 10 ? '0' : '') + n;
      }
    });
    cnt.textContent = '01';
    slides.forEach(function (s, i) {
      var img = s.querySelector('.slide__img'), cap = s.querySelector('figcaption');
      if (i === 0 || (!small && i < 3)) return;
      gsap.fromTo(img, { clipPath: 'inset(0% 0% 0% 100%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: s, containerAnimation: move, start: 'left 100%', end: 'left 55%', scrub: true }
      });
      gsap.fromTo(cap, { autoAlpha: 0, y: 16 }, {
        autoAlpha: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: s, containerAnimation: move, start: 'left 80%', end: 'left 55%', scrub: true }
      });
    });
  }
})();
