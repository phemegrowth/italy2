/* Geimpre: hero entrance (stacked cards fan out into a collage), header, full-screen menu, anchors, reveals,
   count-up, timeline bars, magnetic buttons, phone bar, form validation, and the GSAP signature scene:
   a four-storey block comes apart floor by floor while each floor shows what goes inside. */
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

  /* count-up of the sourced number in the proof strip */
  reveal(d.querySelectorAll('[data-count-to]'), function (el) {
    var to = +el.getAttribute('data-count-to');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* collage drifts a little with the scroll (desktop) */
  var cards = d.querySelectorAll('.stack .card');
  if (cards.length && !reduce && window.matchMedia('(min-width: 900px)').matches) {
    var tk = false, speeds = [0.05, -0.08, 0.12, -0.04];
    window.addEventListener('scroll', function () {
      if (tk) return; tk = true;
      requestAnimationFrame(function () {
        tk = false;
        var y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        cards.forEach(function (c, i) { c.style.translate = '0 ' + (y * speeds[i]).toFixed(1) + 'px'; });
      });
    }, { passive: true });
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul progetto.' };
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
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return scene(false); });
    mm.add('(max-width: 899px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var fl = {}, tg = {};
    sec.querySelectorAll('.fl').forEach(function (g) { fl[g.getAttribute('data-fl')] = g; });
    sec.querySelectorAll('.tag').forEach(function (t) { tg[t.getAttribute('data-t')] = t; });
    var gap = small ? 16 : 26; /* SVG units between floors when apart */
    var off = { 5: -2.5, 4: -1.5, 3: -.5, 2: .5, 1: 1.5, 0: 2.5 };
    var all = [fl[0], fl[1], fl[2], fl[3], fl[4], fl[5]];
    var tags = [tg[5], tg[4], tg[3], tg[2], tg[1], tg[0]];
    gsap.set(tags, { autoAlpha: 0, y: small ? 14 : 20 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    /* 1. the block splits into its floors */
    Object.keys(off).forEach(function (k) {
      tl.to(fl[k], { y: off[k] * gap, duration: 1, ease: 'power2.inOut' }, 0);
    });
    /* 2. top to bottom, one floor lights up and says what is inside */
    [5, 4, 3, 2, 1, 0].forEach(function (k, i) {
      var at = 1 + i;
      var others = all.filter(function (g) { return g !== fl[k]; });
      tl.to(others, { opacity: .35, duration: .3 }, at)
        .to(fl[k], { opacity: 1, x: small ? 0 : -8, duration: .3 }, at)
        .to(tg[k], { autoAlpha: 1, y: 0, duration: .35, ease: 'power2.out' }, at + .05);
      if (i > 0) {
        var prev = tg[[5, 4, 3, 2, 1, 0][i - 1]], prevFl = fl[[5, 4, 3, 2, 1, 0][i - 1]];
        tl.to(prevFl, { x: 0, duration: .3 }, at);
        if (small) tl.to(prev, { autoAlpha: 0, y: -10, duration: .25 }, at);
        else tl.to(prev, { opacity: .55, duration: .3 }, at);
      }
    });
    /* 3. it closes up again, whole house */
    tl.to(all, { opacity: 1, x: 0, duration: .4 }, 7.1);
    if (!small) tl.to(tags, { opacity: 1, duration: .4 }, 7.1);
    Object.keys(off).forEach(function (k) { tl.to(fl[k], { y: off[k] * gap * .35, duration: .6, ease: 'power2.inOut' }, 7.1); });
    tl.to({}, { duration: .3 });

    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    return function () { st.kill(); tl.kill(); gsap.set(all.concat(tags), { clearProps: 'all' }); };
  }
})();
