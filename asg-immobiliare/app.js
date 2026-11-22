/* ASG Immobiliare: hero entrance (house-shaped photo reveal, line reveal, count-up of the founders' 10+ years),
   header, menu, anchors, reveals, magnetic buttons, phone bar, form, and the GSAP signature scene:
   the front door at number 37 opens with the scroll while the four steps from visit to keys light up. */
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

  /* count-up (sourced quantity only: years of experience) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    el.textContent = '0';
    var t0 = null, dur = 1100;
    setTimeout(function () {
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      });
    }, 700);
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

  /* signature scene: the door opens */
  var scene = d.querySelector('[data-scene]');
  if (!scene) return;
  var items = scene.querySelectorAll('.scene__list li');
  var L = scene.querySelector('.door__leaf--l'), R = scene.querySelector('.door__leaf--r'), frame = scene.querySelector('.door__frame'), room = scene.querySelector('.door__room img'), tag = scene.querySelector('[data-tag]');
  var N = items.length;
  function setStep(k) { items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); }); }
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    items.forEach(function (li) { li.classList.add('is-on'); });
    L.style.transform = 'rotateY(-80deg)'; R.style.transform = 'rotateY(80deg)';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  function build() {
    scene.classList.add('is-scrub');
    var phone = window.matchMedia('(max-width: 760px)').matches;
    gsap.set(frame, { y: 80, opacity: 0 });
    gsap.set([L, R], { rotateY: 0 });
    gsap.set(room, { scale: 1.25 });
    gsap.set(tag, { opacity: 0, y: 16 });
    setStep(-1);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, pin: true, scrub: 0.6, start: 'top top', end: phone ? '+=160%' : '+=230%',
        onUpdate: function (s) {
          var p = s.progress, k = p < 0.12 ? -1 : Math.min(N - 1, Math.floor((p - 0.12) / 0.68 * N));
          setStep(k);
        }
      }
    });
    tl.to(frame, { y: 0, opacity: 1, duration: 0.12, ease: 'power2.out' }, 0)
      .to(L, { rotateY: -78, duration: 0.6, ease: 'power1.inOut' }, 0.22)
      .to(R, { rotateY: 78, duration: 0.6, ease: 'power1.inOut' }, 0.22)
      .to(room, { scale: 1, duration: 0.7 }, 0.2)
      .to(tag, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.84)
      .to({}, { duration: 0.08 }, 0.92);
  }
  var go = function () { build(); ScrollTrigger.refresh(); };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
