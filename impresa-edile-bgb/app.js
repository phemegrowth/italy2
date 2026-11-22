/* Impresa Edile BGB: hero entrance (frame lines draw, photo fades in inside the frame, headline card rises, line by
   line), slow hero parallax, header, full-screen menu, anchors, reveals, process bar, magnetic buttons, phone dock, form
   validation, and the GSAP signature scene: a pinned list of the 7 trades drives the photo, each new photo wiping in
   from the right behind an orange edge, with a 01 / 07 counter and a progress bar. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var pic = d.querySelector('.hero__pic img');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 200);
    if (pic && !reduce && y < window.innerHeight * 1.5) pic.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0) scale(1.06)';
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

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height * 0.9)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
      var bar = l.parentNode.querySelector('.bar'); if (bar) bar.style.setProperty('--p', p.toFixed(3));
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

  /* GSAP signature scene: the list of trades drives the photo */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', function () { return listScene(false); });
    mm.add('(max-width: 1080px)', function () { return listScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function listScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.scene__pin'), stack = sec.querySelector('.stack');
    var imgs = Array.prototype.slice.call(stack.querySelectorAll('img'));
    var lis = sec.querySelectorAll('.scene__list li'), cur = sec.querySelector('[data-cur]'), bar = sec.querySelector('[data-bar]');
    var n = imgs.length;
    var edge = stack.querySelector('.edge');
    if (!edge) { edge = d.createElement('span'); edge.className = 'edge'; edge.setAttribute('aria-hidden', 'true'); stack.appendChild(edge); }
    imgs.forEach(function (im, i) { gsap.set(im, { clipPath: i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)', zIndex: i + 1, scale: 1.08 }); });
    gsap.set(edge, { x: 0, opacity: 0 });
    gsap.set(bar, { scaleX: 1 / n });
    function setIdx(k) {
      lis.forEach(function (li, i) { li.classList.toggle('is-cur', i === k); });
      cur.textContent = (k < 9 ? '0' : '') + (k + 1);
    }
    setIdx(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.5, start: 'top top', end: small ? '+=170%' : '+=320%',
        onUpdate: function (self) { setIdx(Math.min(n - 1, Math.floor(self.progress * (n - 0.15)))); gsap.set(bar, { scaleX: Math.max(1 / n, self.progress) }); }
      }
    });
    tl.to(imgs[0], { scale: 1, duration: 1 }, 0);
    for (var i = 1; i < n; i++) {
      var t = i - 0.55;
      tl.to(imgs[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power1.inOut' }, t)
        .to(imgs[i], { scale: 1, duration: 1.1 }, t)
        .fromTo(edge, { x: function () { return stack.offsetWidth; }, opacity: 1 }, { x: 0, duration: 0.5, ease: 'power1.inOut', immediateRender: false }, t)
        .to(edge, { opacity: 0, duration: 0.08 }, t + 0.5);
    }
    tl.to({}, { duration: 0.4 });
    return function () { gsap.set(imgs.concat([edge, bar]), { clearProps: 'all' }); };
  }
})();
