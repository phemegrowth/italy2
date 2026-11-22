/* Impresa Edile Giordano Patrizio: header, menu, anchors, reveals, phone bar, form, curtain hero (CSS, mechanic H), and the GSAP signature scene: a stone roof: beams and laths draw in, then stone slabs are laid row by row from the eaves to the ridge. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
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
  var steps = sec ? Array.prototype.slice.call(sec.querySelectorAll('.ro__steps li')) : [];
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 999px)', function () { return build(true); });
    mm.add('(min-width: 1000px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var head = q('.ro__head > *'), lines = q('.ro__frame path'), rows = q('.ro__row'), ridge = sec.querySelector('.ro__ridge');
    lines.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(steps, { autoAlpha: 0, y: 10 });
    rows.forEach(function (r) { gsap.set(r.children, { autoAlpha: 0, y: -26 }); });
    gsap.set(ridge, { autoAlpha: 0, y: -20 });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0)
     .to(steps, { autoAlpha: 1, y: 0, stagger: .05, duration: .3 }, .2)
     .to(lines, { strokeDashoffset: 0, stagger: .05, duration: .4 }, .6);
    rows.forEach(function (r, i) { T.to(r.children, { autoAlpha: 1, y: 0, stagger: .03, duration: .3, ease: 'power2.out' }, 1.6 + i * .32); });
    T.to(ridge, { autoAlpha: 1, y: 0, duration: .35, ease: 'power2.out' }, 1.6 + rows.length * .32)
     .to({}, { duration: .5 }, 1.95 + rows.length * .32);
    var marks = [.6, 1.6, 1.6 + 5 * .32];
    T.eventCallback('onUpdate', function () { var t = T.time(), k = -1; marks.forEach(function (m, i) { if (t >= m) k = i; }); steps.forEach(function (l, i) { l.classList.toggle('is-on', i === k); }); });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=160%' : '+=250%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(steps, lines, [ridge]), { clearProps: 'all' }); rows.forEach(function (r) { gsap.set(r.children, { clearProps: 'all' }); }); };
  }
})();
