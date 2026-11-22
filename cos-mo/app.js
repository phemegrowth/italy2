/* COS.MO. S.p.A.: hero entrance (photo wipe, line reveal, red line), slow photo parallax, header, menu, anchors,
   reveals, accordion, timeline line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   the building section is built layer by layer with the scroll (foundations to roof), each layer named from
   their capitolato, then the floors open apart and the A+ stamp lands. */
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

  /* accordion (first one open) */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i) {
    var b = it.querySelector('.acc__btn');
    function set(o) { it.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    if (i === 0) set(true);
    b.addEventListener('click', function () { set(!it.classList.contains('is-open')); });
  });

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
  var cnt = scene.querySelector('[data-scount]'), bar = scene.querySelector('[data-sbar]'), stamp = scene.querySelector('[data-stamp]');
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
    gsap.set(lays, { opacity: 0, y: -90 });
    gsap.set(stamp, { opacity: 0, scale: .8, y: 12 });
    gsap.set(bar, { scaleX: 0 });
    setStep(-1);
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: scene, pin: true, scrub: 0.6, start: 'top top', end: phone ? '+=170%' : '+=260%',
        onUpdate: function (s) {
          var p = s.progress, k = Math.min(N - 1, Math.floor(p / 0.74 * N));
          if (p < 0.02) k = -1;
          setStep(k);
          bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        }
      }
    });
    var step = 0.74 / N;
    lays.forEach(function (l, i) { tl.to(l, { opacity: 1, y: 0, duration: step * 0.8 }, 0.02 + i * step); });
    var gap = phone ? 12 : 20;
    lays.forEach(function (l, i) { tl.to(l, { y: (1 - i) * gap, duration: 0.16, ease: 'power1.inOut' }, 0.78); });
    tl.to(stamp, { opacity: 1, scale: 1, y: 0, duration: 0.1 }, 0.84);
    tl.to({}, { duration: 0.06 }, 0.94);
  }
  var go = function () { build(); ScrollTrigger.refresh(); };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
