(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // header shrink + phone bar after the hero
  var hdr = $('#hdr'), bar = $('#bar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // full-screen phone menu
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // hero entrance: first frame, done inside 1.6 s
  if (hero) {
    $$('.ln > span', hero).forEach(function (s, i) { s.style.setProperty('--d', (i * 90) + 'ms'); });
    requestAnimationFrame(function () { hero.classList.add('is-go'); });
  }

  // reveals with above-the-fold guard
  var rv = $$('.reveal');
  rv.forEach(function (el, i) { el.style.setProperty('--d', ((i % 4) * 80) + 'ms'); });
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  // process line
  var steps = $('.steps');
  function stepLine() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
    steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
  }
  window.addEventListener('scroll', stepLine, { passive: true });
  stepLine();

  // form validation
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      $$('[required]', form).forEach(function (f) {
        var wrap = f.closest('.f'), msg = wrap && $('.err', wrap), bad = false, txt = '';
        if (!f.value.trim()) { bad = true; txt = 'Campo obbligatorio.'; }
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) { bad = true; txt = 'Controllate l\'indirizzo email.'; }
        else if (f.type === 'tel' && f.value.replace(/\D/g, '').length < 8) { bad = true; txt = 'Numero troppo corto.'; }
        if (wrap) wrap.classList.toggle('is-bad', bad);
        if (msg) msg.textContent = txt;
        if (bad && ok) { ok = false; f.focus(); }
      });
      if (!ok) e.preventDefault();
    });
  }

  // signature scene: a bathroom wall tiled piece by piece
  var tiles = $('.tiles'), tw = $('.tw'), grid = $('#tw-grid'), tsteps = $$('.tiles__steps li'), tag = $('.tw__tag');
  var names = ['Fondo', 'Colla', 'Posa', 'Fughe'];
  function setStep(i) {
    tsteps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    if (tag) tag.innerHTML = '<b>0' + (i + 1) + '</b> / 04 · ' + names[i];
    if (tw) tw.classList.toggle('is-grout', i === 3);
  }
  if (!tiles || !grid || reduce || !window.gsap || !window.ScrollTrigger) {
    tsteps.forEach(function (li) { li.classList.add('is-on'); });
    if (tag) tag.innerHTML = 'Bagno <b>finito</b>';
    if (tw) tw.classList.add('is-grout');
    return;
  }
  var C = 6, R = 8, frag = document.createDocumentFragment();
  for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) {
    var t = document.createElement('i');
    t.style.backgroundPosition = (c / (C - 1) * 100).toFixed(2) + '% ' + (r / (R - 1) * 100).toFixed(2) + '%';
    frag.appendChild(t);
  }
  grid.appendChild(frag); grid.classList.add('is-built');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var build = function () {
    tiles.classList.add('is-pinned');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', big: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.tiles__pin', start: 'top top', end: phone ? '+=150%' : '+=240%', pin: true, scrub: 0.6,
          onUpdate: function (st) { var p = st.progress; setStep(p < 0.14 ? 0 : p < 0.28 ? 1 : p < 0.86 ? 2 : 3); }
        }
      });
      tl.to({}, { duration: 0.6 })
        .fromTo('.tw__glue', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8 })
        .fromTo('#tw-grid i', { opacity: 0, scale: 0.6, y: -18, rotation: -5 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.5, ease: 'power2.out', stagger: { each: 0.08, grid: [R, C], from: 'end' } })
        .to({}, { duration: 1.2 });
      return function () { tl.kill(); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
