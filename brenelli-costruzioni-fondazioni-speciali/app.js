/* Brenelli Costruzioni: survey-grid hero (lines draw, photo opens inside the frame), header, menu, anchors, reveals,
   count-up of sourced quantities, timeline line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   a ground section where micropiles, jet grouting columns and anchors go in with scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var media = d.querySelector('.hero__photo');
  if (media && !reduce) setTimeout(function () { media.classList.add('is-slow'); }, 2000);

  /* header */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar && hero) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 61;
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

  /* count-up (sourced quantities only: crews, injection systems, pumps, plant) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.15)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
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
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe l\'opera.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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

  /* GSAP signature scene: under the building */
  function scene() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var phone = window.innerWidth < 961, lis = gsap.utils.toArray('.phases li'), cur = -1;
    function mark(n) {
      if (n === cur) return; cur = n;
      lis.forEach(function (li, i) { li.classList.toggle('is-on', i === n); });
    }
    gsap.set('.st--0', { autoAlpha: 0, y: 30 });
    gsap.set('.mp', { strokeDasharray: 170, strokeDashoffset: 170 });
    gsap.set('.jg', { scaleY: 0, scaleX: 0.3, transformOrigin: '50% 0%', transformBox: 'fill-box' });
    gsap.set('.ti', { strokeDasharray: 175, strokeDashoffset: 175 });
    gsap.set('.st--3 circle', { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set('.scene__note', { autoAlpha: 0 });
    if (window.innerWidth < 700) { var sv = d.querySelector('.soil'); if (sv) sv.setAttribute('viewBox', '48 32 592 360'); }
    mark(0);
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onUpdate: function () { var t = tl.time(); mark(t < 1.4 ? 0 : t < 3 ? 1 : t < 4.6 ? 2 : 3); },
      scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=150%' : '+=240%', pin: '.scene__pin', scrub: 0.6, anticipatePin: 1 }
    });
    tl.to('.st--0', { autoAlpha: 1, y: 0, duration: 0.9 }, 0)
      .to('.mp', { strokeDashoffset: 0, duration: 1.2, stagger: 0.1, ease: 'power1.inOut' }, 1.4)
      .to('.jg', { scaleY: 1, duration: 1, stagger: 0.12, ease: 'power1.inOut' }, 3)
      .to('.jg', { scaleX: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, 3.6)
      .to('.ti', { strokeDashoffset: 0, duration: 1, stagger: 0.15, ease: 'power1.inOut' }, 4.6)
      .to('.st--3 circle', { scale: 1, duration: 0.4, stagger: 0.15 }, 5.3)
      .to('.scene__note', { autoAlpha: 1, duration: 0.5 }, 5.8)
      .to({}, { duration: 0.5 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else window.addEventListener('load', scene);
})();
