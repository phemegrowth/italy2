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

  // named works: the active line swaps the photo (hover + scroll position)
  var wks = $$('.wk'), wimgs = $$('.works__photo img');
  function setWk(it) {
    var k = it.getAttribute('data-k');
    wks.forEach(function (x) { x.classList.toggle('is-on', x === it); });
    wimgs.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-k') === k); });
  }
  wks.forEach(function (it) { it.addEventListener('mouseenter', function () { setWk(it); }); it.addEventListener('click', function () { setWk(it); }); });
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setWk(e.target); }); }, { rootMargin: '-40% 0px -45% 0px' });
    wks.forEach(function (it) { io2.observe(it); });
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

  // signature scene: vertical scroll drives the strip of their own work
  var reel = $('.reel'), track = $('.reel__track'), cards = $$('.rc'), cnt = $('.reel__count b'), pbar = $('.reel__bar');
  if (!reel || !track || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var build = function () {
    reel.classList.add('is-pinned');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + (phone ? 16 : Math.max(40, (window.innerWidth - 1240) / 2))); };
      gsap.set(cards, { clipPath: 'inset(0% 0% 0% 100%)' });
      gsap.set(cards[0], { clipPath: 'inset(0% 0% 0% 0%)' });
      if (pbar) pbar.style.setProperty('--p', 0);
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.reel__pin', start: 'top top', end: phone ? '+=170%' : '+=260%', pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (st) {
            if (pbar) pbar.style.setProperty('--p', st.progress.toFixed(3));
            var i = Math.min(cards.length, 1 + Math.floor(st.progress * cards.length * 0.999));
            if (cnt) cnt.textContent = (i < 10 ? '0' : '') + i;
          }
        }
      });
      tl.to(track, { x: function () { return -dist(); }, duration: 1 });
      cards.forEach(function (c, i) {
        if (i === 0) return;
        var at = Math.max(0, (i - (phone ? 1.1 : 2.6)) / cards.length);
        tl.to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, ease: 'power2.out' }, at);
        tl.fromTo($('img', c), { scale: 1.18 }, { scale: 1, duration: 0.2 }, at);
      });
      return function () { tl.kill(); gsap.set(cards, { clearProps: 'clipPath' }); gsap.set(track, { clearProps: 'transform' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
