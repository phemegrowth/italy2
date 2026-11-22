/* Edilgaggero: header, menu, anchors, reveals, count-ups, service photo swap, drag strip, process line, phone bar,
   form validation, and the GSAP signature scene: a blueprint elevation draws itself, then the building photo rises
   inside the frame floor by floor while a counter shows the % built and four phases light up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { html.classList.add('is-ready'); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  var how = d.querySelector('[data-line]');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
    if (how && !reduce) {
      var r = how.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      how.style.setProperty('--p', p.toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (reduce && how) how.style.setProperty('--p', 1);

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
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
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 59;
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

  /* count-ups (quantities only; data-plain = no thousands separator) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    if (reduce || el.dataset.done) return;
    el.dataset.done = 1;
    var to = +el.dataset.count, from = el.hasAttribute('data-plain') ? to - 60 : 0, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* service list swaps the photo (desktop), marks the active row */
  var swap = d.querySelector('[data-swap]');
  d.querySelectorAll('.bi').forEach(function (li) {
    function on() {
      d.querySelectorAll('.bi').forEach(function (x) { x.classList.toggle('is-act', x === li); });
      if (!swap || swap.getAttribute('src') === li.dataset.img) return;
      swap.style.opacity = 0;
      setTimeout(function () { swap.src = li.dataset.img; swap.style.opacity = 1; }, 200);
    }
    li.addEventListener('mouseenter', on);
    li.addEventListener('focusin', on);
  });

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
  }

  /* year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      if (err) err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    form.querySelectorAll('[required]').forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (f) { if (!check(f) && !bad) bad = f; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  /* signature scene */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function build() {
    scene.classList.add('is-scene');
    var paths = scene.querySelectorAll('.bp__draw path');
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var photo = scene.querySelector('.bp__photo'), draw = scene.querySelector('.bp__draw');
    var pct = scene.querySelector('.bp__pct b'), steps = scene.querySelectorAll('.bs');
    var head = scene.querySelector('.bp__head'), frame = scene.querySelector('.bp__frame');
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    pct.textContent = '0';
    var st = { v: 0 };
    function setStep(p) {
      var i = Math.min(3, Math.floor(p * 4.0001));
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    }
    setStep(0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', wide: '(min-width: 700px)' }, function (ctx) {
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: ctx.conditions.phone ? '+=130%' : '+=220%',
          pin: scene.querySelector('.bp__pin'), scrub: 0.6, anticipatePin: 1,
          onUpdate: function (self) { setStep(self.progress); }
        }
      });
      tl.to(scene.querySelectorAll('.ln-a'), { strokeDashoffset: 0, duration: 0.18, stagger: 0.03 }, 0.06)
        .to(scene.querySelectorAll('.ln-b, .ln-d'), { strokeDashoffset: 0, duration: 0.14 }, 0.16)
        .to(scene.querySelectorAll('.ln-c path'), { strokeDashoffset: 0, duration: 0.1, stagger: 0.012 }, 0.2)
        .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 }, 0.42)
        .to(st, { v: 100, duration: 0.5, onUpdate: function () { pct.textContent = Math.round(st.v); } }, 0.42)
        .to(draw, { opacity: 0.18, duration: 0.3 }, 0.62)
        .to({}, { duration: 0.08 });
      return function () { gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' }); };
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
