/* Impresa Edile Tallarico: header, full-screen menu, anchors, reveals, split hero (photo wipes in, then
   parallaxes slower than the page), services accordion, photo parallax, drawing step line, phone bar,
   form validation and the GSAP signature scene: one wall, four coats (muratura, intonaco, rasatura,
   stanza finita), each new coat wiped across the last one by the scroll, like a straightedge pass. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready', 'no-pin'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
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

  /* accordion: one open at a time, height animates through grid rows */
  var accs = d.querySelectorAll('.acc__item');
  accs.forEach(function (it) {
    var b = it.querySelector('.acc__btn');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      accs.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* hero photo and the Torino photo move slower than the page; step line draws */
  var heroImg = d.querySelector('.hero__frame img'), placeImg = d.querySelector('.place__pic img'), steps = d.querySelector('.steps__list');
  function onFrame() {
    var vh = window.innerHeight;
    if (!reduce && heroImg && window.scrollY < vh * 1.2) heroImg.style.transform = 'translate3d(0,' + (window.scrollY * 0.18).toFixed(1) + 'px,0)';
    if (!reduce && placeImg) {
      var b = placeImg.parentNode.getBoundingClientRect();
      if (b.bottom > 0 && b.top < vh) placeImg.style.transform = 'translate3d(0,' + (-(1 - (b.top + b.height) / (vh + b.height)) * 11).toFixed(2) + '%,0)';
    }
    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
  }
  window.addEventListener('scroll', onFrame, { passive: true });
  onFrame();

  /* phone contact bar: after the hero, hidden while the scene is pinned and in the contact section */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-pin'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage'), wall = sec.querySelector('.wall');
    var layers = sec.querySelectorAll('.wall__l'), edge = sec.querySelector('.wall__edge'), caps = sec.querySelectorAll('.wall__caps li');
    var count = sec.querySelector('.wall__count b'), copy = sec.querySelectorAll('.scene__copy > *'), capList = sec.querySelector('.wall__caps');
    var HIDE = 'inset(0% 100% 0% 0%)', SHOW = 'inset(0% 0% 0% 0%)';
    var mids = [], active = -1;
    function setActive(k) {
      if (k === active) return;
      active = k;
      caps.forEach(function (c, j) { c.classList.toggle('is-on', j === k); });
      count.textContent = '0' + (k + 1);
    }
    gsap.set(copy, { autoAlpha: 0, y: 24 });
    gsap.set(wall, { autoAlpha: 0, y: 40 });
    gsap.set(capList, { autoAlpha: 0, y: 12 });
    for (var i = 1; i < layers.length; i++) gsap.set(layers[i], { clipPath: HIDE });
    gsap.set(edge, { x: 0, autoAlpha: 0 });
    setActive(0);
    var W = function () { return wall.offsetWidth; };
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: stage, scrub: 0.6, invalidateOnRefresh: true,
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      },
      onUpdate: function () {
        var t = tl.time(), k = 0;
        for (var j = 0; j < mids.length; j++) if (t >= mids[j]) k = j + 1;
        setActive(k);
      }
    });
    tl.to(copy, { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.06, ease: 'power2.out' }, 0);
    tl.to(wall, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.02);
    tl.to(capList, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.06);
    /* three passes, each one covers the coat before it from left to right */
    var s = 0.2, len = 0.24, gap = 0.06;
    for (var k = 1; k < layers.length; k++) {
      tl.set(edge, { x: 0 }, s);
      tl.to(edge, { autoAlpha: 1, duration: 0.03 }, s);
      tl.to(layers[k], { clipPath: SHOW, duration: len, ease: 'power1.inOut' }, s);
      tl.to(edge, { x: W, duration: len, ease: 'power1.inOut' }, s);
      tl.to(edge, { autoAlpha: 0, duration: 0.03 }, s + len - 0.03);
      mids.push(s + len * 0.55);
      s += len + gap;
    }
    tl.to({}, { duration: 0.1 });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([copy, wall, capList, edge].concat(Array.prototype.slice.call(layers)), { clearProps: 'all' });
      caps.forEach(function (c, j) { c.classList.toggle('is-on', j === caps.length - 1); });
      count.textContent = '04';
    };
  }
})();
