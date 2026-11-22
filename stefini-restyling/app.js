/* Stefini Restyling: header, menu, reveals, curtain hero, form, and the room-in-section scene (GSAP). */
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

  // signature scene: the trades layer into a room drawn in section
  var scene = d.querySelector('.room'); if (!scene) return;
  var steps = scene.querySelectorAll('.room__steps li'), pnum = scene.querySelector('[data-p]');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('on', k === i); }); pnum.textContent = i + 1; }
  if (reduce || !window.gsap || !window.ScrollTrigger) { setStep(4); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var q = function (sel) { return scene.querySelectorAll(sel); };
  var start = function () {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (c) {
      gsap.set(q('.l-wall'), { opacity: 0.15 });
      gsap.set(q('.l-paint, .l-paint2, .l-water-fix, .l-elec-fix'), { opacity: 0 });
      gsap.set(q('.l-water path, .l-elec path'), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q('.l-floor'), { x: -380 });
      pnum.textContent = '0';
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: c.conditions.phone ? '+=150%' : '+=240%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) { var p = st.progress; setStep(Math.min(4, Math.floor(p * 5))); }
        }
      });
      tl.to(q('.l-wall'), { opacity: 1, duration: 1 })
        .to(q('.l-water path'), { strokeDashoffset: 0, duration: 0.8, stagger: 0.1 }, '>')
        .to(q('.l-water-fix'), { opacity: 1, duration: 0.2 }, '>')
        .to(q('.l-elec path'), { strokeDashoffset: 0, duration: 0.8, stagger: 0.1 }, '>')
        .to(q('.l-elec-fix'), { opacity: 1, duration: 0.2 }, '>')
        .to(q('.l-floor'), { x: 0, duration: 1, ease: 'power2.out' }, '>')
        .to(q('.l-paint'), { opacity: 0.92, duration: 0.6 }, '>')
        .to(q('.l-paint2'), { opacity: 0.9, duration: 0.4 }, '>')
        .to({}, { duration: 0.3 });
      return function () { gsap.set(q('.l-wall, .l-paint, .l-paint2, .l-water-fix, .l-elec-fix, .l-water path, .l-elec path, .l-floor'), { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  (d.fonts && d.fonts.ready) ? d.fonts.ready.then(start) : start();
})();
