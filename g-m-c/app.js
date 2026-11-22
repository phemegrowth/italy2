/* G.M.C. S.r.l.: hero A (a modern villa photo with a slow 20 s Ken Burns scale; the headline reveals line by line
   on its own navy panel), header, menu, anchors, reveals, service rows with a photo that appears on hover
   (desktop), FAQ accordions, sticky phone bar (Chiama, WhatsApp, Email), form validation, and the GSAP
   signature scene "Dai cantieri di quest'autunno": pinned horizontal strip of five work cards taken from their
   own Facebook posts; each card unmasks as it enters, with a 01 / 05 counter and a progress bar. Phones: the
   cards stack one over the other instead of a horizontal strip. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (elements already in view at load show at once) */
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

  /* progress line that draws with scroll */
  var lines = d.querySelectorAll('[data-draw]');
  function drawLines() {
    lines.forEach(function (ln) {
      var box = ln.parentElement.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - box.top) / (box.height + vh * 0.3)));
      ln.style.setProperty('--p', p.toFixed(3));
    });
  }
  if (lines.length && !reduce) { window.addEventListener('scroll', drawLines, { passive: true }); drawLines(); }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
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
    mm.add('(max-width: 699px)', function () { return scene(true); });
    mm.add('(min-width: 700px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('.proj__track'), cards = sec.querySelectorAll('.pcard');
    var count = sec.querySelector('.proj__count b'), bar = sec.querySelector('.proj__bar');
    var n = cards.length, last = -1;
    function setIdx(i) {
      if (i === last) return;
      last = i;
      if (count) count.textContent = '0' + (i + 1);
    }
    var tl = gsap.timeline({ defaults: { ease: 'none' } }), st;
    if (small) {
      cards.forEach(function (c, i) { gsap.set(c, { yPercent: i ? 108 : 0, zIndex: i + 1 }); });
      for (var i = 1; i < n; i++) {
        tl.to(cards[i], { yPercent: 0, duration: 1, ease: 'power1.inOut' }, i - 1)
          .to(cards[i - 1], { scale: .92, autoAlpha: .5, duration: 1 }, i - 1);
      }
      tl.to({}, { duration: .3 });
    } else {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      tl.to(track, { x: function () { return -dist(); }, duration: 1 });
      cards.forEach(function (c, i) {
        if (!i) return;
        var fig = c.querySelector('figure');
        var at = function () { return Math.max(0, Math.min(.85, (c.offsetLeft - window.innerWidth * .9) / (dist() || 1))); };
        tl.fromTo(fig, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .22, ease: 'power2.out' }, at());
      });
    }
    st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=' + (n * 60) + '%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p = self.progress;
        if (bar) bar.style.setProperty('--p', p.toFixed(3));
        setIdx(Math.min(n - 1, Math.round(p * (n - 1))));
      }
    });
    setIdx(0);
    return function () { st.kill(); tl.kill(); gsap.set([track, cards, sec.querySelectorAll('.pcard figure')], { clearProps: 'all' }); last = -1; };
  }

})();
