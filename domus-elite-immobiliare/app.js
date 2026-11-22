/* Domus Élite Immobiliare: header, menu, reveals, hero fan, form, and the door scene (GSAP). */
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

  // signature scene: the key turns, the door opens on the room
  var scene = d.querySelector('.door'); if (!scene) return;
  var steps = scene.querySelectorAll('.door__steps li');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('on', k === i); }); }
  if (reduce || !window.gsap || !window.ScrollTrigger) { setStep(3); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var L = scene.querySelector('.leaf--l'), R = scene.querySelector('.leaf--r'), key = scene.querySelector('.keyhole i'), light = scene.querySelector('.door__light'), room = scene.querySelector('.door__room img');
  var start = function () {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (c) {
      gsap.set(L, { rotationY: 0 }); gsap.set(R, { rotationY: 0 }); gsap.set(room, { scale: 1.25 }); gsap.set(light, { opacity: 0 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: c.conditions.phone ? '+=140%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) { var p = st.progress; setStep(p < 0.22 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3); }
        }
      });
      tl.to(key, { rotation: 90, duration: 0.5, ease: 'power2.inOut' })
        .to(light, { opacity: 1, duration: 0.3 }, '>')
        .to(L, { rotationY: -104, duration: 1.6, ease: 'power2.inOut' }, '>')
        .to(R, { rotationY: 104, duration: 1.6, ease: 'power2.inOut' }, '<')
        .to(light, { opacity: 0, duration: 0.6 }, '<0.5')
        .to(room, { scale: 1, duration: 2, ease: 'power1.out' }, '<-0.4')
        .to({}, { duration: 0.4 });
      return function () { gsap.set([L, R, room, light, key], { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  (d.fonts && d.fonts.ready) ? d.fonts.ready.then(start) : start();
})();
