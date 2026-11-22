/* Edil Krusha: header, menu, reveals, hero, services hover image, drag strip, steps line, form, and the pour scene (GSAP). */
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

  // services: floating photo follows the cursor (desktop only)
  var fl = d.querySelector('.svc__float');
  if (fl && window.matchMedia('(hover: hover) and (min-width: 900px)').matches && !reduce) {
    var fimg = fl.querySelector('img'), tx = 0, ty = 0, cx = 0, cy = 0, raf;
    d.querySelectorAll('.row').forEach(function (row) {
      row.addEventListener('mouseenter', function () { fimg.src = row.dataset.img; fl.classList.add('on'); });
      row.addEventListener('mouseleave', function () { fl.classList.remove('on'); });
    });
    d.addEventListener('mousemove', function (e) { tx = e.clientX + 190; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    function loop() { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; fl.style.left = cx + 'px'; fl.style.top = cy + 'px'; raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5) ? requestAnimationFrame(loop) : null; }
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
  var himg = d.querySelector('.hero__frame img');
  if (himg && !reduce) window.addEventListener('scroll', function () { var y = window.scrollY; if (y < innerHeight * 1.2) himg.style.transform = 'translateY(' + (-y * 0.12) + 'px)'; }, { passive: true });

  // signature scene
  var scene = d.querySelector('.pour'); if (!scene) return;
  var steps = scene.querySelectorAll('.pour__steps li'), pct = scene.querySelector('[data-pct]');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('on', k === i); }); }
  var wave = scene.querySelector('.pour__wave'), rebar = scene.querySelectorAll('.pour__rebar path'), form1 = scene.querySelector('.pour__form path'), trowel = scene.querySelector('.pour__trowel');
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    wave.setAttribute('transform', 'translate(0 30)'); pct.textContent = '100'; setStep(3); return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var start = function () {
    gsap.set([form1].concat([].slice.call(rebar)), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(wave, { attr: { transform: 'translate(0 275)' } });
    var o = { y: 275, x: 0 };
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (c) {
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: c.conditions.phone ? '+=130%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) {
            var p = st.progress; setStep(p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.82 ? 2 : 3);
          }
        }
      });
      tl.to(form1, { strokeDashoffset: 0, duration: 1 })
        .to(rebar, { strokeDashoffset: 0, duration: 0.5, stagger: 0.08 }, '>-0.1')
        .to(o, { y: 30, x: -200, duration: 2.6, ease: 'power1.inOut', onUpdate: function () {
            wave.setAttribute('transform', 'translate(' + o.x.toFixed(1) + ' ' + o.y.toFixed(1) + ')');
            pct.textContent = Math.round((275 - o.y) / 245 * 100);
          } }, '>')
        .to(trowel, { opacity: 0.14, duration: 0.6 }, '>')
        .to(trowel, { opacity: 0, duration: 0.4 }, '>');
      return function () { o.y = 275; o.x = 0; };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  (d.fonts && d.fonts.ready) ? d.fonts.ready.then(start) : start();
})();
