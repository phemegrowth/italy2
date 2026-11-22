/* Mazzalveri & Comelli: hero count-up of years (87, from 1939) + line reveal + arch photo reveal, landmark marquee,
   header, full-screen menu, anchors, reveals, timeline line drawing, magnetic buttons, phone bar, form validation, and
   the GSAP signature scene: a pinned list of their Milan addresses where scroll moves the active address and the
   photo of that building crossfades and settles. */
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

  /* menu */
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

  /* count-up (sourced figures only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null, dur = 1500;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* service list: hovered item swaps the photo (desktop only) */
  var simg = d.querySelector('[data-svc-img]');
  if (simg && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.svc__list li').forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        var src = li.getAttribute('data-img');
        if (!src || simg.getAttribute('src') === src) return;
        simg.style.opacity = '0';
        setTimeout(function () { simg.src = src; simg.style.opacity = '1'; }, 220);
      });
    });
  }

  /* steps line draws with scroll */
  d.querySelectorAll('[data-steps], [data-tl]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.05)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop) */
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
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }


  /* marquee pauses when reduced motion (CSS) and on hover (desktop) */
  var mq = d.querySelector('[data-marq]');
  if (mq) { mq.addEventListener('mouseenter', function () { mq.style.animationPlayState = 'paused'; }); mq.addEventListener('mouseleave', function () { mq.style.animationPlayState = ''; }); }

  /* SIGNATURE SCENE: sticky address list drives the photo */
  var scene = d.querySelector('[data-scene]');
  if (!scene) return;
  if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  function build() {
    html.classList.add('scene-live');
    var pin = scene.querySelector('.scene__pin');
    var items = scene.querySelectorAll('.addr li'), imgs = scene.querySelectorAll('.stack img');
    var cap = scene.querySelector('[data-cap]'), num = scene.querySelector('[data-num]');
    var n = items.length, cur = -1;
    imgs.forEach(function (im) { im.loading = 'eager'; });
    function setA(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      cap.textContent = items[i].querySelector('h3').textContent;
      num.textContent = '0' + (i + 1) + ' / 0' + n;
    }
    setA(0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (c) {
      var st = ST.create({
        trigger: scene, start: 'top top', end: c.conditions.phone ? '+=' + (n * 45) + '%' : '+=' + (n * 55) + '%', pin: pin, scrub: true,
        onUpdate: function (s) { setA(Math.min(n - 1, Math.floor(s.progress * n * 0.999))); }
      });
      /* slow drift of the whole photo while pinned */
      var tw = gsap.fromTo(scene.querySelector('.stack'), { y: 0 }, { y: c.conditions.phone ? 0 : -24, ease: 'none', scrollTrigger: { trigger: scene, start: 'top top', end: '+=' + (st.end - st.start), scrub: true } });
      return function () { st.kill(); tw.kill(); };
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
