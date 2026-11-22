/* GZ Impresa Edile: header, menu, reveals, hero reel, steps line, form, and the phases scene (GSAP). */
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

  // hero reel drifts left with the scroll
  var track = d.querySelector('.reel__track');
  if (track && !reduce) {
    var drift = function () { var y = window.scrollY; if (y < innerHeight * 1.5) track.style.transform = 'translateX(' + (-y * 0.45) + 'px)'; };
    window.addEventListener('scroll', drift, { passive: true });
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

  // signature scene: the timeline of phases drives the photo
  var scene = d.querySelector('.fasi'); if (!scene) return;
  var items = scene.querySelectorAll('.tlx li'), pics = scene.querySelectorAll('.fp'), num = scene.querySelector('[data-n]'), tlx = scene.querySelector('.tlx');
  var cur = -1;
  function setPhase(i, p) {
    tlx.style.setProperty('--p', p.toFixed(3));
    if (i === cur) return; cur = i;
    items.forEach(function (li, k) { li.classList.toggle('on', k === i); });
    pics.forEach(function (im, k) { im.classList.toggle('on', k === i); im.classList.toggle('past', k < i); });
    num.textContent = '0' + (i + 1);
  }
  if (reduce || !window.gsap || !window.ScrollTrigger) { setPhase(pics.length - 1, 1); return; }
  setPhase(0, 0);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var start = function () {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (c) {
      ScrollTrigger.create({
        trigger: scene, start: 'top top', end: c.conditions.phone ? '+=160%' : '+=240%', pin: true, anticipatePin: 1,
        onUpdate: function (st) { var p = st.progress; setPhase(Math.min(pics.length - 1, Math.floor(p * pics.length * 1.08)), p); }
      });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  (d.fonts && d.fonts.ready) ? d.fonts.ready.then(start) : start();
})();
