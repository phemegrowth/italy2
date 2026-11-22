/* Varese Costruzioni: header, menu, anchors, reveals, count-ups, phone bar, form, hero photo strip that slides
   in and drifts with scroll, services accordion, filter chips on the list of works, and the GSAP signature scene:
   a schematic map of the province where the route draws itself and the 14 places of their works drop in. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-ups: years since 1990, works listed, comuni (all sourced from their own site and registry) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0';
    requestAnimationFrame(step);
  });


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
    form.addEventListener('submit', function (e) { var first = null; req.forEach(function (f) { if (!check(f) && !first) first = f; }); if (first) { e.preventDefault(); first.focus(); } });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* hero strip drift */
  var track = d.querySelector('.strip__track');
  if (track && !reduce) {
    var drift = function () { var y = Math.min(window.scrollY, window.innerHeight); track.style.setProperty('--drift', (-y * 0.3).toFixed(1) + 'px'); };
    setTimeout(function () { track.querySelectorAll('figure').forEach(function (f) { f.style.transition = 'none'; }); }, 1700);
    window.addEventListener('scroll', drift, { passive: true });
  }

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__item').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* filter chips */
  var chips = d.querySelectorAll('.chip'), rows = d.querySelectorAll('[data-list] li');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      rows.forEach(function (r) { r.classList.toggle('is-dim', f !== 'all' && r.getAttribute('data-t').split(' ').indexOf(f) < 0); });
    });
  });

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  var info = [
    ['Besozzo', '7 villette a schiera, località Olginasio'],
    ['Biandronno', '9 villette, Via Borghi'],
    ['Bodio Lomnago', '8 ville singole e 2 bifamiliari, località Gallione'],
    ['Barasso', '4 appartamenti e 1 villetta, Via Don Parietti'],
    ['Casciago', '6 appartamenti e 5 villette a schiera, Via Pozzi'],
    ['Morosolo di Casciago', '14 appartamenti, Via Verdi'],
    ['Velate', '6 appartamenti, Via del Fornetto'],
    ['Varese', '11 interventi in città, più 2 ville a Lissago'],
    ['Bobbiate', '4 ville a schiera, Via Govi'],
    ['Induno Olona', '12 appartamenti, Via Tabacchi'],
    ['Castiglione Olona', '8 appartamenti e 8 villette a schiera, Via Turati'],
    ['Albusciago di Sumirago', '6 villette a schiera, Via Trento'],
    ['Tradate', '37 appartamenti, Via Pasteur'],
    ['Busto Arsizio', '16 appartamenti, Via Bellini']
  ];
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', function () { return build(true); });
    mm.add('(min-width: 1024px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var head = Array.prototype.slice.call(sec.querySelectorAll('.map__head > *'));
    var art = sec.querySelector('.map__art'), route = sec.querySelector('.map__route');
    var lake = sec.querySelectorAll('.map__lake, .map__lakename');
    var pins = Array.prototype.slice.call(sec.querySelectorAll('.pin'));
    var town = sec.querySelector('[data-town]'), what = sec.querySelector('[data-what]'), idx = sec.querySelector('[data-idx]');
    var len = route.getTotalLength(), n = pins.length, cur = -1, when = [];
    var set = function (k) {
      if (k === cur) return; cur = k;
      town.textContent = info[k][0]; what.textContent = info[k][1]; idx.textContent = ('0' + (k + 1)).slice(-2);
    };
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(art, { autoAlpha: 0 });
    gsap.set(lake, { autoAlpha: 0 });
    gsap.set(route, { strokeDasharray: len + ' ' + len, strokeDashoffset: len });
    gsap.set(pins, { autoAlpha: 0 });
    gsap.set(pins.map(function (p) { return p.querySelector('circle'); }), { scale: 0, transformOrigin: '50% 50%' });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .05, duration: .3, ease: 'power2.out' }, 0)
     .to(art, { autoAlpha: 1, duration: .3 }, .1)
     .to(lake, { autoAlpha: 1, duration: .3 }, .25)
     .to(route, { strokeDashoffset: 0, duration: 3 }, .5);
    /* each pin drops when the route reaches it: time by cumulative segment length */
    var pts = route.getAttribute('d').match(/-?\d+(\.\d+)?/g).map(Number), acc = [0], tot = 0;
    for (var j = 2; j < pts.length; j += 2) { tot += Math.hypot(pts[j] - pts[j - 2], pts[j + 1] - pts[j - 1]); acc.push(tot); }
    when = acc.map(function (a) { return .5 + 3 * a / tot; });
    pins.forEach(function (p, i) {
      var at = when[i] + .02;
      T.to(p, { autoAlpha: 1, duration: .08 }, at - .04)
       .to(p.querySelector('circle'), { scale: 1, duration: .2, ease: 'back.out(3)' }, at - .04);
    });
    T.to({}, { duration: .4 });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: true, scrub: .5, animation: T,
      onUpdate: function (self) {
        var t = self.progress * T.duration(), k = 0;
        for (var q = 0; q < n; q++) if (t >= when[q] - .05) k = q;
        set(k);
      }
    });
    set(0);
    return function () { st.kill(); T.kill(); gsap.set(head.concat([art, route], Array.prototype.slice.call(lake), pins), { clearProps: 'all' }); };
  }
})();
