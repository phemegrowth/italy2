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

  // hero reel drifts left with scroll
  var track = $('.reel__track');
  if (track && !reduce) {
    var drift = function () { var y = Math.min(window.scrollY, 1000); track.style.setProperty('--sx', (-y * 0.18).toFixed(1) + 'px'); };
    window.addEventListener('scroll', drift, { passive: true }); drift();
  }

  // accordion: one open at a time
  var accs = $$('.acc__it');
  accs.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) accs.forEach(function (o) { if (o !== d) o.open = false; }); }); });

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

  // signature scene: scroll moves the wipe from before to after
  var ba = $('.ba'), stage = $('.ba__stage'), bsteps = $$('.ba__steps li');
  function setStep(i) { bsteps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); }
  if (!ba || !stage || reduce || !window.gsap || !window.ScrollTrigger) { if (stage) stage.style.setProperty('--cut', '50%'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var build = function () {
    ba.classList.add('is-pinned');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 759px)', big: '(min-width: 760px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var o = { c: 100 };
      stage.style.setProperty('--cut', '100%');
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.ba__pin', start: 'top top', end: phone ? '+=130%' : '+=200%', pin: true, scrub: 0.5,
          onUpdate: function (st) { setStep(Math.min(2, Math.floor(st.progress * 3 * 0.999))); }
        }
      });
      tl.fromTo('.ba__stage', { scale: 0.94 }, { scale: 1, duration: 0.15 })
        .to(o, { c: 0, duration: 0.8, onUpdate: function () { stage.style.setProperty('--cut', o.c.toFixed(2) + '%'); } }, 0.1)
        .fromTo('.ba__after img', { scale: 1.08 }, { scale: 1, duration: 0.8 }, 0.1)
        .to({}, { duration: 0.1 });
      return function () { tl.kill(); stage.style.setProperty('--cut', '50%'); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
