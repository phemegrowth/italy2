/* Domus Pro: hero entrance (photo wipe, line reveal), slow photo parallax, header, menu, anchors, reveals,
   services photo swap, process line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   one room, seven trades in turn (walls, plumbing, wiring, plaster, parquet, paint, window and ironwork). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var yr = d.querySelector('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* header */
  var header = d.querySelector('.header'), pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (pbar) pbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* hero photo moves slower than the page */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    window.addEventListener('scroll', function () {
      if (pt) return; pt = true;
      requestAnimationFrame(function () {
        pt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) par.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* services: hover (desktop) or the group nearest the middle of the screen swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), grps = d.querySelectorAll('.grp');
  function showPic(k, g) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    grps.forEach(function (it) { it.classList.toggle('is-act', it === g); });
  }
  grps.forEach(function (g) { g.addEventListener('mouseenter', function () { showPic(g.getAttribute('data-for'), g); }); });
  if (!reduce) {
    var gt = false;
    window.addEventListener('scroll', function () {
      if (gt || window.innerWidth < 761) return; gt = true;
      requestAnimationFrame(function () {
        gt = false;
        var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
        grps.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* timeline line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.3)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sulla richiesta.' };
    function check(inp) {
      var f = inp.closest('.field'), e = f.querySelector('.err'), ok = true, v = inp.value.trim();
      if (inp.required && !v) ok = false;
      if (ok && inp.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && inp.type === 'tel') ok = v.replace(/\D/g, '').length >= 6;
      f.classList.toggle('is-bad', !ok);
      if (e) e.textContent = ok ? '' : msgs[inp.name] || 'Campo obbligatorio.';
      return ok;
    }
    var req = form.querySelectorAll('[required]');
    req.forEach(function (i) { i.addEventListener('blur', function () { check(i); }); });
    form.addEventListener('submit', function (e) {
      var bad = null;
      req.forEach(function (i) { if (!check(i) && !bad) bad = i; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  /* signature scene */
  var scene = d.querySelector('[data-scene]');
  if (!scene) return;
  var lays = scene.querySelectorAll('.lay'), items = scene.querySelectorAll('.scene__list li');
  var cnt = scene.querySelector('[data-scount]'), bar = scene.querySelector('[data-sbar]'), stamp = scene.querySelector('[data-stamp]'), paint = scene.querySelector('[data-paint]');
  var N = lays.length;
  function setStep(k) {
    items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
    cnt.textContent = ('0' + Math.max(0, k + 1)).slice(-2);
  }
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    setStep(N - 1);
    items.forEach(function (li) { li.classList.add('is-on'); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  function build() {
    scene.classList.add('is-scrub');
    var phone = window.matchMedia('(max-width: 760px)').matches;
    gsap.set(lays, { opacity: 0, y: 24 });
    gsap.set(paint, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(stamp, { opacity: 0, y: 16 });
    setStep(-1);
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: scene, pin: true, scrub: 0.6, start: 'top top', end: phone ? '+=180%' : '+=280%',
        onUpdate: function (s) {
          var p = s.progress, k = Math.min(N - 1, Math.floor(p / 0.84 * N));
          if (p < 0.02) k = -1;
          setStep(k);
          bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        }
      }
    });
    var step = 0.84 / N;
    lays.forEach(function (l, i) {
      tl.to(l, { opacity: 1, y: 0, duration: step * 0.6 }, 0.02 + i * step);
      if (i === 5) tl.to(paint, { scaleX: 1, duration: step * 0.8, ease: 'none' }, 0.02 + i * step);
    });
    tl.to(stamp, { opacity: 1, y: 0, duration: 0.08 }, 0.88);
    tl.to({}, { duration: 0.04 }, 0.96);
  }
  var go = function () { build(); ScrollTrigger.refresh(); };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
