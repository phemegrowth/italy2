/* Caravati: header, menu, anchors, reveals, count-up, process line, phone bar, form validation, and the GSAP
   signature scene: a text-mask fly-through. The word VARESE is cut out of a solid layer with a photo behind; the
   scroll zooms into one letter stroke until the photo fills the screen, then a short line rises. */
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

  /* accordion with height animation */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it) {
    var btn = it.querySelector('button'), panel = it.querySelector('.acc__p');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      it.classList.toggle('is-open', open);
      if (reduce || !panel.animate) { panel.hidden = !open; return; }
      if (open) {
        panel.hidden = false;
        var h = panel.scrollHeight;
        panel.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else {
        var h2 = panel.scrollHeight;
        var an = panel.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'ease-in' });
        an.onfinish = function () { panel.hidden = true; };
      }
    });
  });

  /* hero photo moves slower than the page (desktop and phone) */
  var par = d.querySelector('[data-par] img');
  if (par && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight * 1.2);
        par.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
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

  var svg = scene.querySelector('.tm__mask'), word = scene.querySelector('.tm__word');
  var mr = scene.querySelector('.tm__mr'), fill = scene.querySelector('.tm__fill');
  var head = scene.querySelector('.tm__head'), end = scene.querySelector('.tm__end');
  var pin = scene.querySelector('.tm__pin');

  function layout() {
    var W = pin.clientWidth, H = pin.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    [mr, fill].forEach(function (r) { r.setAttribute('width', W); r.setAttribute('height', H); });
    var fs = Math.min(W * (W < 700 ? 0.27 : 0.21), H * 0.42);
    var cx = W / 2, by = H * 0.56 + fs * 0.35;
    word.setAttribute('x', cx); word.setAttribute('y', by); word.setAttribute('font-size', fs);
    /* find a point inside a letter stroke near the middle: draw the same word on a canvas and scan */
    var c = d.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d');
    g.font = '900 ' + fs + 'px "Alegreya Sans"'; g.textAlign = 'center'; g.fillStyle = '#000';
    g.fillText('VARESE', cx, by);
    var data = g.getImageData(0, 0, W, H).data, y = Math.round(by - fs * 0.36), best = null;
    function on(x, yy) { return data[(yy * W + x) * 4 + 3] > 200; }
    for (var dx = 0; dx < W / 2 && !best; dx++) {
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        var x = Math.round(cx + sgn * dx);
        if (x > 6 && x < W - 6 && on(x, y) && on(x - 5, y) && on(x + 5, y) && on(x, y - 5) && on(x, y + 5)) { best = [x, y]; break; }
      }
    }
    if (!best) best = [cx, y];
    svg.style.transformOrigin = best[0] + 'px ' + best[1] + 'px';
  }

  function build() {
    scene.classList.add('is-scene');
    layout();
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', wide: '(min-width: 700px)' }, function (ctx) {
      gsap.set(end, { opacity: 0, y: 30 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: scene, start: 'top top', end: ctx.conditions.phone ? '+=130%' : '+=200%', pin: pin, scrub: 0.6, anticipatePin: 1, onRefresh: layout }
      });
      tl.to(svg, { scale: 24, duration: 0.6, ease: 'power2.in' }, 0.08)
        .to(head, { opacity: 0, y: -20, duration: 0.12 }, 0.12)
        .to(svg, { opacity: 0, duration: 0.08 }, 0.6)
        .to(end, { opacity: 1, y: 0, duration: 0.14 }, 0.7)
        .to({}, { duration: 0.12 });
      return function () { gsap.set([svg, head, end], { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
