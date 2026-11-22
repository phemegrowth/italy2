/* Arte Edilizia Generale: hero B (split screen: the headline reveals line by line, the tall facade photo opens
   with a clip-path wipe and moves slower than the page), header, menu, anchors, reveals, services marquee,
   sticky phone bar (Chiama, WhatsApp, Email), form validation, and the GSAP signature scene "Sei mestieri, una
   sola impresa": pinned, the scroll walks through six services; the active one lights up and its photo
   crossfades in with a slow settle, with a 01 / 06 counter and a progress bar. Phones: one service at a time
   under the photo. */
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
    /* hero photo parallax: moves slower than the page */
    var mover = d.querySelector('.hero__mover');
    var px = mover ? gsap.to(mover, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }) : null;

    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var items = sec.querySelectorAll('.svc__list li'), pics = sec.querySelectorAll('.svc__pic');
    var count = sec.querySelector('.svc__count b'), bar = sec.querySelector('.svc__bar');
    var n = items.length, last = -1;
    function set(i) {
      if (i === last) return;
      last = i;
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
      pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
      if (count) count.textContent = (i < 9 ? '0' : '') + (i + 1);
    }
    set(0);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p = self.progress;
        set(Math.min(n - 1, Math.floor(p * n * 0.999)));
        if (bar) bar.style.setProperty('--p', p.toFixed(3));
      }
    });
    return function () { if (px) { px.scrollTrigger.kill(); px.kill(); gsap.set(mover, { clearProps: 'all' }); } st.kill(); last = -1; };
  }

})();
