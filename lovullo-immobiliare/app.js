/* Lovullo immobiliare: hero (photo opens inside the house shape of their sign, 5,0 counts up, headline line by line),
   header, menu, anchors, reveals, services list that swaps the photo, route on the map, phone dock, form validation,
   and the GSAP signature scene: their house mark draws itself, then the house opens wide onto an interior. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* count-up 0,0 -> 5,0 */
  var sc = d.querySelector('[data-count]');
  if (sc && !reduce) {
    var target = parseFloat(sc.getAttribute('data-count')), t0 = null;
    sc.textContent = '0,0';
    setTimeout(function () {
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
        sc.textContent = (target * e).toFixed(1).replace('.', ',');
        if (k < 1) requestAnimationFrame(step);
      });
    }, 650);
  }

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
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
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); if (id === '#top' && a.getAttribute('aria-disabled') !== 'true') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
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

  /* services: the item in the middle of the screen (or hovered) is current and picks the photo */
  var items = d.querySelectorAll('.srv__i'), pics = d.querySelectorAll('.srv__pic img');
  function setCur(i) {
    items.forEach(function (it, j) { it.classList.toggle('is-cur', j === i); });
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === i); });
  }
  if (items.length) {
    setCur(0);
    items.forEach(function (it, i) { it.addEventListener('mouseenter', function () { setCur(i); }); });
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) setCur(Array.prototype.indexOf.call(items, e.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(function (it) { io2.observe(it); });
    }
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Questo indirizzo email non sembra valido.', message: 'Scrivete due righe sulla casa.' };
    var fields = form.querySelectorAll('[required], input[type="email"]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim();
      var ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 8;
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
    mm.add('(min-width: 761px)', function () { return houseScene(false); });
    mm.add('(max-width: 760px)', function () { return houseScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function houseScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.scene__pin'), photo = sec.querySelector('.scene__photo'), img = photo.querySelector('img');
    var mark = sec.querySelector('.scene__mark'), paths = mark.querySelectorAll('path'), caps = sec.querySelectorAll('.cap li');
    var head = sec.querySelector('.scene__head');
    var st = { s: 0 };
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    function draw() {
      var w = pin.offsetWidth, h = pin.offsetHeight;
      var cs = getComputedStyle(mark), mw = parseFloat(cs.width) || 200, mh = parseFloat(cs.height) || 160, mt = parseFloat(cs.marginTop) || 0;
      var w0 = mw * 0.8, h0 = w0 * 0.72;
      var cx = w / 2 - mw * 0.03, cy = h / 2 + mt + mh / 2 + mw * 0.06;
      var W = w0 + (Math.max(w, h) * 3.4 - w0) * st.s, H = h0 + (Math.max(w, h) * 3.4 - h0) * st.s;
      var top = cy - H / 2, eave = top + H * 0.34, bot = cy + H / 2;
      photo.style.clipPath = 'polygon(' + cx + 'px ' + top + 'px,' + (cx + W / 2) + 'px ' + eave + 'px,' + (cx + W / 2) + 'px ' + bot + 'px,' + (cx - W / 2) + 'px ' + bot + 'px,' + (cx - W / 2) + 'px ' + eave + 'px)';
    }
    function setCap(i) { caps.forEach(function (c, j) { c.classList.toggle('is-cur', j === i); }); }
    setCap(-1); draw();
    window.addEventListener('resize', draw);
    gsap.set(mark, { opacity: 1, scale: 1 });
    gsap.set(img, { scale: 1.25 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.6, start: 'top top', end: small ? '+=150%' : '+=240%',
        onUpdate: function (self) { var p = self.progress; setCap(p < 0.52 ? -1 : p < 0.7 ? 0 : p < 0.86 ? 1 : 2); }
      }
    });
    tl.to(paths, { strokeDashoffset: 0, duration: 0.22, stagger: 0.04 }, 0)
      .to(st, { s: 1, duration: 0.4, ease: 'power2.in', onUpdate: draw }, 0.3)
      .to(mark, { scale: 6, opacity: 0, duration: 0.16, ease: 'power2.in' }, 0.3)
      .to(head, { opacity: 0, y: -20, duration: 0.12 }, 0.42)
      .to(img, { scale: 1, duration: 0.6 }, 0.3);
    return function () { photo.style.clipPath = ''; gsap.set([mark, img, head], { clearProps: 'all' }); paths.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); setCap(-1); };
  }
})();
