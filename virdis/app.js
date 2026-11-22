/* Virdis S.r.l.: header, menu, reveals, curtain hero, form, and the aerial platform scene (GSAP). */
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

  // signature scene: the platform rises along the facade
  var scene = d.querySelector('.lift-scene'); if (!scene) return;
  var arm = scene.querySelector('.ls__arm'), arm2 = scene.querySelector('.ls__arm2'), basket = scene.querySelector('.ls__basket'), done = scene.querySelector('.ls__done');
  var fl = scene.querySelector('[data-floor]'), steps = scene.querySelectorAll('.ls__steps li');
  var rows = [310, 250, 190, 130, 70], names = ['T', '1', '2', '3', '4'], NS = 'http://www.w3.org/2000/svg';
  var marks = rows.map(function (y) { var g = d.createElementNS(NS, 'g'); [190, 238, 286].forEach(function (x) { var r = d.createElementNS(NS, 'rect'); r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', 34); r.setAttribute('height', 40); g.appendChild(r); }); g.style.opacity = 0; g.style.transition = 'opacity .4s'; done.appendChild(g); return g; });
  done.setAttribute('opacity', 1);
  function setTop(top) {
    arm.setAttribute('y2', top); arm2.setAttribute('y2', top); basket.setAttribute('transform', 'translate(0 ' + (top - 22) + ')');
    var k = 0; rows.forEach(function (y, i) { if (top - 22 <= y + 20) k = i; marks[i].style.opacity = (top - 22 <= y + 20) ? 1 : 0; });
    fl.textContent = top < 60 ? 'Tetto' : names[k];
  }
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('on', k === i); }); }
  if (reduce || !window.gsap || !window.ScrollTrigger) { setTop(40); setStep(3); return; }
  setTop(300);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var start = function () {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (c) {
      var o = { t: 300 };
      gsap.timeline({
        scrollTrigger: {
          trigger: scene, start: 'top top', end: c.conditions.phone ? '+=140%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) { var p = st.progress; setStep(p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3); }
        }
      }).to(o, { t: 40, duration: 1, ease: 'none', onUpdate: function () { setTop(o.t); } }).to({}, { duration: 0.12 });
      return function () { setTop(300); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  (d.fonts && d.fonts.ready) ? d.fonts.ready.then(start) : start();
})();
