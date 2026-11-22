/* Fratelli N.P.C.: hero B (split screen, photo wipes in and parallaxes slower), header, phone menu, anchors,
   reveals, services list that swaps the photo, drag strip with progress, process line, phone bar, form validation,
   and the GSAP signature scene "Prima il disegno, poi il palazzo": pinned, the blueprint of a Milanese palazzina
   draws itself line by line, then the building fills in from the ground up while a counter shows % built. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id === '#') { e.preventDefault(); if (id === '#top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var els = [].slice.call(d.querySelectorAll('.r'));
  if (!('IntersectionObserver' in window) || reduce) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* services: active item swaps the photo (hover on desktop, scroll position everywhere) */
  var items = [].slice.call(d.querySelectorAll('.svc__list li')), pics = [].slice.call(d.querySelectorAll('.svc__pic img'));
  function setSvc(k) {
    items.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-k') === k); });
    pics.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  }
  items.forEach(function (li) { li.addEventListener('mouseenter', function () { setSvc(li.getAttribute('data-k')); }); });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) setSvc(e.target.getAttribute('data-k')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { sio.observe(li); });
  }

  /* strip: drag, arrows, progress */
  var strip = d.querySelector('.strip'), wbar = d.querySelector('.work__bar i');
  if (strip) {
    var prog = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? vis + (1 - vis) * (strip.scrollLeft / max) : 1;
      if (wbar) wbar.style.setProperty('--p', p.toFixed(3));
    };
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    d.querySelectorAll('.arrow').forEach(function (b) {
      b.addEventListener('click', function () { strip.scrollBy({ left: +b.getAttribute('data-dir') * strip.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' }); });
    });
  }

  /* process line */
  var wrapS = d.querySelector('.steps__wrap'), line = d.querySelector('.steps__line i');
  if (wrapS && line) {
    if (reduce) line.style.setProperty('--p', 1);
    else {
      var lp = function () {
        var r = wrapS.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
        line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', lp, { passive: true });
      lp();
    }
  }

  /* hero photo parallax: slower than the page (desktop) */
  var hp = d.querySelector('.hero__pic img');
  if (hp && !reduce && window.matchMedia('(min-width: 761px)').matches) {
    var tk = false;
    var par = function () { tk = false; var y = Math.min(window.scrollY, window.innerHeight * 1.2); hp.style.transform = 'translate3d(0,' + (y * 0.2).toFixed(1) + 'px,0) scale(1.04)'; };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(par); } }, { passive: true });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(max-width: 900px)', function () { return scene(true); });
    mm.add('(min-width: 901px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var paths = [].slice.call(sec.querySelectorAll('.lines .p'));
    var rise = sec.querySelector('.rise'), grid = sec.querySelector('.gridbg'), lines = sec.querySelector('.lines');
    var svg = sec.querySelector('.bld'), pct = sec.querySelector('[data-pct]'), now = sec.querySelector('[data-now]');
    var steps = [].slice.call(sec.querySelectorAll('.scene__steps li'));
    var labels = ['Il progetto', 'Fondazioni e struttura', 'Tamponamenti e tetto', 'Facciata e finiture'];
    paths.forEach(function (p) { var l = Math.ceil(p.getTotalLength()) + 2; gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.set(rise, { attr: { y: 460, height: 0 } });
    gsap.set(svg, { autoAlpha: 0, y: 30 });
    gsap.set(grid, { opacity: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(svg, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, 0)
      .to(grid, { opacity: .9, duration: .4 }, 0)
      .to(paths, { strokeDashoffset: 0, duration: .5, stagger: .22 }, .2)
      .to(rise, { attr: { y: 330, height: 130 }, duration: .8, ease: 'power1.inOut' }, 2.0)
      .to(rise, { attr: { y: 180, height: 280 }, duration: .9, ease: 'power1.inOut' }, 2.8)
      .to(rise, { attr: { y: 0, height: 460 }, duration: .9, ease: 'power1.inOut' }, 3.7)
      .to(lines, { opacity: .25, duration: .5 }, 4.2)
      .to(grid, { opacity: .3, duration: .5 }, 4.2)
      .to({}, { duration: .4 });
    var last = -1;
    function upd() {
      var t = tl.time();
      var built = Math.max(0, Math.min(1, (t - 2.0) / 2.6));
      pct.textContent = Math.round(built * 100);
      var k = t < 2.0 ? 0 : t < 2.8 ? 1 : t < 3.7 ? 2 : 3;
      if (k !== last) {
        last = k;
        steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        if (now) now.textContent = labels[k];
      }
    }
    tl.eventCallback('onUpdate', upd);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: true, scrub: .6, animation: tl
    });
    return function () { st.kill(); tl.kill(); gsap.set([rise, svg, grid, lines].concat(paths), { clearProps: 'all' }); };
  }
})();
