/* Servizi Immobiliari Peaquin: header, menu, reveals, hero reel, service tabs, steps line, form, and the facade scene (GSAP). */
(function () {
  var d = document, html = d.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // year
  d.querySelectorAll('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // hero entrance on the first frame
  var hero = d.querySelector('.hero');
  requestAnimationFrame(function () { hero && hero.classList.add('go'); });

  // header shrink + phone bar after the hero
  var hd = d.querySelector('.hd'), bar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('show', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu
  var burger = d.querySelector('.burger'), nav = d.getElementById('menu');
  function closeMenu() { html.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); }
  burger.addEventListener('click', function () {
    var open = !html.classList.contains('menu-open');
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // reveals
  var rs = d.querySelectorAll('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e, i) {
      e.style.transitionDelay = (i % 4) * 80 + 'ms';
      if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  // service tabs swap the photo
  var pic = d.querySelector('.svc__pic img');
  d.querySelectorAll('.tab').forEach(function (t) {
    function act() {
      if (t.classList.contains('on')) return;
      d.querySelectorAll('.tab').forEach(function (o) { o.classList.toggle('on', o === t); o.setAttribute('aria-pressed', String(o === t)); });
      if (!pic) return;
      pic.classList.add('swap');
      setTimeout(function () { pic.src = t.dataset.img; pic.alt = t.querySelector('.tab__t').textContent; pic.onload = function () { pic.classList.remove('swap'); }; setTimeout(function () { pic.classList.remove('swap'); }, 500); }, reduce ? 0 : 250);
    }
    t.addEventListener('click', act);
    if (window.matchMedia('(hover: hover)').matches) t.addEventListener('mouseenter', act);
  });

  // hero reel drifts left with the scroll
  var track = d.querySelector('.reel__track');
  if (track && !reduce) {
    var drift = function () { var y = window.scrollY; if (y < innerHeight * 1.5) track.style.transform = 'translateX(' + (-y * 0.45) + 'px)'; };
    window.addEventListener('scroll', drift, { passive: true }); drift();
  }

  // drag strip
  var strip = d.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  // steps line fills with scroll
  var list = d.querySelector('.steps__list');
  if (list && !reduce) {
    var setP = function () { var r = list.getBoundingClientRect(); var p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35))); list.style.setProperty('--p', p.toFixed(3)); };
    window.addEventListener('scroll', setP, { passive: true }); setP();
  } else if (list) list.style.setProperty('--p', 1);

  // form validation
  var form = d.querySelector('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    form.querySelectorAll('[required], input[type=email]').forEach(function (el) {
      var f = el.closest('.f'), v = el.value.trim(), bad = false;
      if (el.required && !v) bad = true;
      if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad = true;
      if (el.type === 'tel' && v && v.replace(/\D/g, '').length < 6) bad = true;
      f.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { e.preventDefault(); var first = form.querySelector('.bad input, .bad textarea'); first && first.focus(); }
  });
  form && form.addEventListener('input', function (e) { var f = e.target.closest('.f'); f && f.classList.remove('bad'); });

  // hero photo drifts slower than the page
  var himg = null;
  if (himg && !reduce) window.addEventListener('scroll', function () { var y = window.scrollY; if (y < innerHeight * 1.2) himg.style.transform = 'translateY(' + (-y * 0.12) + 'px)'; }, { passive: true });

  // signature scene: the facade lights up floor by floor
  var scene = d.querySelector('.pal'); if (!scene) return;
  var g = scene.querySelector('.pal__floors'), NS = 'http://www.w3.org/2000/svg';
  var rows = [{ y: 302, xs: [64, 98, 194, 228] }, { y: 247, xs: [70, 117, 173, 220] }, { y: 192, xs: [70, 117, 173, 220] }, { y: 137, xs: [70, 117, 173, 220] }, { y: 82, xs: [70, 117, 173, 220] }];
  var floors = rows.map(function (r) {
    var wins = r.xs.map(function (x) { var e = d.createElementNS(NS, 'rect'); e.setAttribute('x', x); e.setAttribute('y', r.y); e.setAttribute('width', 30); e.setAttribute('height', 38); e.setAttribute('rx', 1.5); e.setAttribute('class', 'win'); g.appendChild(e); return e; });
    var ln = d.createElementNS(NS, 'path'); ln.setAttribute('d', 'M274 ' + (r.y + 19) + 'H300'); ln.setAttribute('class', 'flr-line'); g.appendChild(ln);
    return { wins: wins, ln: ln };
  });
  var notes = scene.querySelectorAll('.pal__notes li'), cnt = scene.querySelector('[data-floor]');
  function setFloors(n) {
    floors.forEach(function (f, i) { var on = i < n; f.wins.forEach(function (w) { w.classList.toggle('lit', on); }); f.ln.classList.toggle('lit', i === n - 1); });
    notes.forEach(function (li, i) { li.classList.toggle('lit', i < n); li.classList.toggle('cur', i === Math.max(0, n - 1)); });
    cnt.textContent = n;
  }
  if (reduce || !window.gsap || !window.ScrollTrigger) { setFloors(5); return; }
  setFloors(0);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var start = function () {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (c) {
      ScrollTrigger.create({
        trigger: scene, start: 'top top', end: c.conditions.phone ? '+=140%' : '+=200%', pin: true, anticipatePin: 1,
        onUpdate: function (st) { setFloors(Math.min(5, Math.floor(st.progress * 5.6))); }
      });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  (d.fonts && d.fonts.ready) ? d.fonts.ready.then(start) : start();
})();
