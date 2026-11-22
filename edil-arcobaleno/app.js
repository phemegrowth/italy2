/* Edil Arcobaleno: hero entrance (azure curtain wipes away from the photo, arc mark turns in, headline line by line),
   slow photo zoom-out, header, menu, anchors, reveals, accordion with height animation, ticks that light up, magnetic
   buttons, phone dock, form validation, and the GSAP signature scene: before / after, the renovated room rises from the
   floor inside a growing arc while three captions change. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var strip = null;
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 200);
    if (strip && !reduce && y < window.innerHeight * 2) strip.style.transform = 'translate3d(' + (-y * 0.3).toFixed(1) + 'px,0,0)';
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
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

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__i').forEach(function (it, i, all) {
    var btn = it.querySelector('.acc__b'), pan = it.querySelector('.acc__p');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      all.forEach(function (o) {
        if (o === it) return;
        var b2 = o.querySelector('.acc__b'), p2 = o.querySelector('.acc__p');
        if (b2.getAttribute('aria-expanded') === 'true') { b2.setAttribute('aria-expanded', 'false'); o.classList.remove('is-open'); collapse(p2); }
      });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      it.classList.toggle('is-open', !open);
      if (open) collapse(pan); else expand(pan);
    });
  });
  function expand(p) {
    p.hidden = false;
    if (reduce) return;
    var h = p.scrollHeight; p.style.height = '0px';
    requestAnimationFrame(function () { p.style.height = h + 'px'; });
    p.addEventListener('transitionend', function f() { p.style.height = ''; p.removeEventListener('transitionend', f); });
  }
  function collapse(p) {
    if (reduce) { p.hidden = true; return; }
    p.style.height = p.scrollHeight + 'px';
    requestAnimationFrame(function () { p.style.height = '0px'; });
    p.addEventListener('transitionend', function f() { p.hidden = true; p.style.height = ''; p.removeEventListener('transitionend', f); });
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height * 0.9)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
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
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Questo indirizzo email non sembra valido.', message: 'Descrivete il lavoro in due righe.' };
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

  /* GSAP signature scene: before / after inside a rising arc */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', function () { return baScene(false); });
    mm.add('(max-width: 1080px)', function () { return baScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function baScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.scene__pin'), after = sec.querySelector('.ba__after'), before = sec.querySelector('.ba__before');
    var ring = sec.querySelector('.ba__ring circle'), caps = sec.querySelectorAll('.cap li');
    var tagA = sec.querySelector('.ba__tag--a'), tagB = sec.querySelector('.ba__tag--b');
    var st = { r: 0 };
    var svg = ring.ownerSVGElement;
    function draw() {
      var w = after.offsetWidth, h = after.offsetHeight;
      var R = st.r / 100 * Math.sqrt(w * w + h * h) / Math.SQRT2;
      after.style.clipPath = 'circle(' + R.toFixed(1) + 'px at 50% 100%)';
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      ring.setAttribute('cx', w / 2); ring.setAttribute('cy', h); ring.setAttribute('r', R.toFixed(1));
      ring.style.opacity = st.r > 1 && st.r < 118 ? 1 : 0;
    }
    window.addEventListener('resize', draw);
    function setCap(i) { caps.forEach(function (c, j) { c.classList.toggle('is-cur', j === i); }); }
    setCap(0); draw();
    gsap.set(tagB, { opacity: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.6, start: 'top top', end: small ? '+=130%' : '+=220%',
        onUpdate: function (self) { var p = self.progress; setCap(p < 0.22 ? 0 : p < 0.72 ? 1 : 2); }
      }
    });
    tl.to(before, { scale: 1.04, duration: 0.2 }, 0)
      .to(st, { r: 120, duration: 0.6, ease: 'power1.inOut', onUpdate: draw }, 0.18)
      .to(tagA, { opacity: 0, duration: 0.08 }, 0.5)
      .to(tagB, { opacity: 1, duration: 0.08 }, 0.6)
      .to(after.querySelector('img'), { scale: 1.03, duration: 0.3 }, 0.7);
    return function () { after.style.clipPath = ''; gsap.set([before, tagA, tagB, after.querySelector('img')], { clearProps: 'all' }); ring.style.opacity = 0; };
  }
})();
