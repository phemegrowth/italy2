/* Gruppo Enersic: hero plate + line reveal (Ken Burns in CSS), header, full-screen menu, anchors, reveals, accordion with photo swap,
   process line, magnetic buttons, phone bar, form validation, and the GSAP signature scene: one building read three ways
   (blueprint lines draw, the photo rises floor by floor, a thermal sweep covers half the facade). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var yr = d.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('[data-mbar]'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar && hero) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); if (id === '#top' && a.getAttribute('aria-disabled') !== 'true') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* count-up (sourced figures only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count'), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)); };
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = null, dur = 1400;
    el.textContent = fmt(0);
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
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
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete in due righe di cosa avete bisogno.' };
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
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* services accordion + photo swap */
  var acc = d.querySelector('[data-acc]'), simg = d.querySelector('[data-svc-img]');
  if (acc) {
    var items = acc.querySelectorAll('.acc__it');
    items.forEach(function (it) {
      var b = it.querySelector('.acc__btn');
      b.addEventListener('click', function () {
        var open = !it.classList.contains('is-open');
        items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false'); });
        if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
        if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 520);
        var src = it.getAttribute('data-img');
        if (simg && open && src && simg.getAttribute('src') !== src) {
          simg.classList.add('is-swap');
          setTimeout(function () { simg.src = src; simg.classList.remove('is-swap'); }, reduce ? 0 : 300);
        }
      });
    });
  }

  /* SIGNATURE SCENE: one building, three readings (lines draw, floors rise, thermal sweep) */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  function build() {
    html.classList.add('scene-live');
    var pin = scene.querySelector('.scene__pin'), bld = scene.querySelector('[data-bld]');
    var paths = scene.querySelectorAll('[data-lines] path'), photo = scene.querySelector('[data-photo]'), th = scene.querySelector('[data-thermal]');
    var scan = scene.querySelector('[data-scan]'), lines = scene.querySelector('[data-lines]');
    var steps = scene.querySelectorAll('.scene__steps li'), tag = scene.querySelector('[data-tag]');
    var meter = scene.querySelector('[data-meter]'), mlab = scene.querySelector('[data-meter-label]');
    var labels = ['Progetto', 'Cantiere', 'Termografia'], mlabels = ['Disegno', 'Costruito', 'Analisi'];
    var st = { a: 0, b: 0, c: 0 }, lastStep = -1;
    function render() {
      paths.forEach(function (p) { p.style.strokeDashoffset = (1 - st.a).toFixed(3); });
      lines.style.opacity = Math.max(0, 1 - st.b * 0.55 - st.c * 0.45).toFixed(3);
      photo.style.clipPath = 'inset(' + ((1 - st.b) * 100).toFixed(2) + '% 0 0 0)';
      th.style.clipPath = 'inset(0 ' + (100 - st.c * 45).toFixed(2) + '% 0 0)';
      scan.style.transform = 'translateX(' + (-(100 - st.c * 45)).toFixed(2) + '%)'; scan.style.opacity = st.c > 0.02 ? 1 : 0;
      var s = st.c > 0.01 ? 2 : (st.b > 0.01 ? 1 : 0);
      var v = s === 0 ? st.a : (s === 1 ? st.b : st.c);
      meter.textContent = Math.round(v * 100) + '%';
      if (s !== lastStep) {
        lastStep = s;
        steps.forEach(function (li, i) { li.classList.toggle('is-on', i === s); });
        tag.textContent = labels[s]; mlab.textContent = mlabels[s];
      }
    }
    render();
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (c) {
      st.a = 0; st.b = 0; st.c = 0; lastStep = -1; render();
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: scene, start: 'top top', end: c.conditions.phone ? '+=150%' : '+=240%', pin: pin, scrub: 0.6 } });
      tl.to(st, { a: 1, duration: 1, onUpdate: render })
        .to(st, { b: 1, duration: 1.1, ease: 'power1.inOut', onUpdate: render })
        .to(st, { c: 1, duration: 1, ease: 'power1.inOut', onUpdate: render })
        .to({}, { duration: 0.25 });
      return function () { st.a = 1; st.b = 1; st.c = 1; render(); };
    });
    window.addEventListener('load', function () { ST.refresh(); });
    setTimeout(function () { ST.refresh(); }, 700);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
