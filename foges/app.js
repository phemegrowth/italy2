/* Foges: gate curtain hero, header, menu, anchors, reveals, accordion with photo swap, river parallax,
   process line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   a pinned horizontal strip of their real residential schemes; each card unmasks and its line drawing draws itself. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });
  var hm = d.querySelector('.hero__media');
  if (hm && !reduce) setTimeout(function () { hm.classList.add('is-slow'); }, 2100);

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar && hero) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 63;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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

  /* accordion, one open at a time, photo follows */
  var pics = d.querySelectorAll('.method__pics img'), its = d.querySelectorAll('.acc__it');
  its.forEach(function (it) {
    var b = it.querySelector('.acc__btn');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      its.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
      var k = +it.getAttribute('data-img');
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === (open ? k : 0)); });
    });
    it.addEventListener('mouseenter', function () {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      var k = +it.getAttribute('data-img');
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    });
  });

  /* river parallax */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var k = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + (-k * 15).toFixed(2) + '%,0)';
    };
    window.addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(movePar); } }, { passive: true });
    movePar();
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.15)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa che cercate.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function scene() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var track = d.querySelector('[data-track]'), cards = gsap.utils.toArray('.wk'), num = d.querySelector('[data-wk-n]'), bar = d.querySelector('[data-wk-bar]');
    var phone = window.innerWidth < 701, n = cards.length;
    var cur = -1;
    function mark(i) {
      if (i === cur) return; cur = i;
      if (num) num.textContent = ('0' + (i + 1)).slice(-2);
    }
    function lines(c) { return c.querySelectorAll('.wk__draw path:not(.wk__river)'); }
    if (phone) {
      /* portrait: a deck. Each card slides up over the previous one, which steps back */
      html.classList.add('wk-stack');
      var tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onUpdate: function () {
          var p = tl.progress();
          if (bar) bar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
          mark(Math.max(0, Math.min(n - 1, Math.floor((tl.time() - 0.5) / 1.2))));
        },
        scrollTrigger: { trigger: '.works', start: 'top top', end: '+=' + (n * 70) + '%', pin: '.works__pin', scrub: 0.5, anticipatePin: 1 }
      });
      gsap.set(cards, { clipPath: 'inset(0 0% 0 0)' });
      gsap.set(cards.slice(1), { yPercent: 108 });
      gsap.set(cards[0], { opacity: 0, y: 40 });
      tl.to(cards[0], { opacity: 1, y: 0, duration: 0.6 }, 0);
      tl.to(lines(cards[0]), { strokeDashoffset: 0, duration: 0.9, stagger: 0.08 }, 0.2);
      cards.forEach(function (c, i) {
        if (!i) return;
        var at = i * 1.2;
        tl.to(c, { yPercent: 0, duration: 1 }, at);
        tl.to(cards[i - 1], { scale: 0.92, opacity: 0.35, duration: 1 }, at);
        tl.to(lines(c), { strokeDashoffset: 0, duration: 0.9, stagger: 0.08 }, at + 0.5);
      });
      tl.to({}, { duration: 0.6 });
    } else {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 32); };
      var tl2 = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: function () {
          var p = tl2.progress();
          if (bar) bar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
          mark(Math.min(n - 1, Math.round(p * (n - 1))));
        },
        scrollTrigger: { trigger: '.works', start: 'top top', end: function () { return '+=' + Math.round(dist() + window.innerHeight * 0.7); }, pin: '.works__pin', scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
      });
      tl2.to(track, { x: function () { return -dist(); }, duration: 10 }, 0);
      cards.forEach(function (c, i) {
        var at = Math.max(0, (i - 1.6) * (10 / Math.max(1, n - 1)));
        tl2.to(c, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.out' }, at);
        tl2.to(lines(c), { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut', stagger: 0.15 }, at + 0.3);
      });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else window.addEventListener('load', scene);
})();
