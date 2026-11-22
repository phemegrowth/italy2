/* Impresa Costruzioni Gabino: hero entrance (name and headline line by line, photo strip slides in and drifts left on
   scroll), header, full-screen menu, anchors, reveals, service list that drives the photo, drag strip, process line,
   magnetic buttons, phone dock, form validation, and the GSAP signature scene: a house drawn as a blueprint, then built
   with the scroll from foundations to the gutters, with a "% costruito" counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var strip = d.querySelector('[data-strip]');
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

  /* service list drives the photo (scroll position on all screens, hover on desktop) */
  var items = d.querySelectorAll('.srv__list li'), pics = d.querySelectorAll('.srv__frame img');
  function setSrv(k) {
    items.forEach(function (li) { li.classList.toggle('is-act', li.getAttribute('data-k') === k); });
    pics.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  }
  function srvScroll() {
    var line = window.innerHeight * 0.55, cur = null;
    items.forEach(function (li) { if (li.getBoundingClientRect().top < line) cur = li.getAttribute('data-k'); });
    if (cur === null) cur = '0';
    setSrv(cur);
  }
  window.addEventListener('scroll', srvScroll, { passive: true });
  srvScroll();
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    items.forEach(function (li) { li.addEventListener('mouseenter', function () { setSrv(li.getAttribute('data-k')); }); });
  }

  /* drag strip */
  var drag = d.querySelector('[data-drag]');
  if (drag) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx) * 1.4; });
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') drag.scrollBy({ left: 320, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') drag.scrollBy({ left: -320, behavior: 'smooth' });
    });
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

  /* GSAP signature scene: blueprint to building */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', function () { return houseScene(false); });
    mm.add('(max-width: 1080px)', function () { return houseScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function houseScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.scene__pin');
    var q = function (s) { return sec.querySelector(s); };
    var bpG = sec.querySelector('.bp');
    if (!sec.querySelector('.bp-ghost')) {
      var ghost = bpG.cloneNode(true);
      ghost.setAttribute('class', 'bp-ghost');
      ghost.setAttribute('stroke', '#3c4148');
      ghost.setAttribute('stroke-dasharray', '5 7');
      ghost.querySelectorAll('path').forEach(function (p) { p.removeAttribute('class'); });
      bpG.parentNode.insertBefore(ghost, bpG.parentNode.querySelector('.lay-found'));
    }
    var paths = sec.querySelectorAll('.bp-p');
    paths.forEach(function (p) { p.setAttribute('pathLength', '1'); });
    var cw = q('.cw'), cp = q('.cp');
    var pct = q('[data-pct]'), steps = sec.querySelectorAll('.scene__steps li');
    var lays = { found: q('.lay-found'), walls: q('.lay-walls'), plaster: q('.lay-plaster'), win: q('.lay-win'), roof: q('.lay-roof'), gut: q('.lay-gutter') };

    gsap.set(paths, { strokeDashoffset: 1, strokeDasharray: 1 });
    gsap.set([lays.found, lays.walls, lays.plaster, lays.win, lays.roof, lays.gut], { opacity: 0 });
    gsap.set(cw, { attr: { y: 440, height: 0 } });
    gsap.set(cp, { attr: { y: 440, height: 0 } });
    gsap.set(lays.roof, { y: -60 });
    gsap.set(lays.found, { y: 24 });
    gsap.set(q('.bp-txt'), { opacity: 0 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.6, start: 'top top', end: small ? '+=130%' : '+=240%',
        onUpdate: function (self) {
          var p = self.progress;
          pct.textContent = Math.round(Math.max(0, (p - 0.14) / 0.82) * 100 > 100 ? 100 : Math.max(0, (p - 0.14) / 0.82) * 100);
          var idx = p < 0.16 ? 0 : p < 0.32 ? 1 : p < 0.56 ? 2 : p < 0.76 ? 3 : 4;
          steps.forEach(function (li, i) { li.classList.toggle('is-on', i <= idx); li.classList.toggle('is-cur', i === idx); });
        }
      }
    });
    tl.to(paths, { strokeDashoffset: 0, duration: 0.16, stagger: 0.012 }, 0)
      .to(q('.bp-txt'), { opacity: 1, duration: 0.05 }, 0.08)
      .to(lays.found, { opacity: 1, y: 0, duration: 0.12 }, 0.18)
      .to(lays.walls, { opacity: 1, duration: 0.02 }, 0.32)
      .to(cw, { attr: { y: 190, height: 250 }, duration: 0.24 }, 0.32)
      .to(lays.plaster, { opacity: 1, duration: 0.02 }, 0.56)
      .to(cp, { attr: { y: 190, height: 250 }, duration: 0.14 }, 0.56)
      .to(lays.win, { opacity: 1, duration: 0.08 }, 0.66)
      .to(lays.roof, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.76)
      .to(lays.gut, { opacity: 1, duration: 0.08 }, 0.86)
      .to(sec.querySelectorAll('.bp'), { opacity: 0.18, duration: 0.1 }, 0.84)
      .to({}, { duration: 0.06 });
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i === 0); li.classList.toggle('is-cur', i === 0); });

    return function () {
      gsap.set([paths, lays.found, lays.walls, lays.plaster, lays.win, lays.roof, lays.gut, cw, cp, q('.bp-txt'), sec.querySelectorAll('.bp')], { clearProps: 'all' });
      cw.setAttribute('y', 190); cw.setAttribute('height', 250); cp.setAttribute('y', 190); cp.setAttribute('height', 250);
    };
  }
})();
