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

  // tabs (click + arrow keys)
  var tabs = $$('.tab'), panels = $$('.panel');
  function setTab(t) {
    tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
    panels.forEach(function (p) { var on = p.id === t.getAttribute('aria-controls'); p.hidden = !on; p.classList.toggle('is-on', on); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; setTab(n); n.focus(); }
    });
  });

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

  // signature scene: the house section draws, then fills from the ground up
  var pour = $('.pour'), psteps = $$('.pour__steps li'), pct = $('.pour__pct b'), lbls = $$('.house__lbl text');
  function setStep(i) { psteps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); }
  if (!pour || reduce || !window.gsap || !window.ScrollTrigger) {
    psteps.forEach(function (li) { li.classList.add('is-on'); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var build = function () {
    pour.classList.add('is-pinned');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', big: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var o = { v: 0 };
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.pour__pin', start: 'top top', end: phone ? '+=150%' : '+=240%', pin: true, scrub: 0.6,
          onUpdate: function (st) {
            var f = Math.max(0, (st.progress - 0.22) / 0.72);
            setStep(Math.min(4, Math.floor(Math.min(1, f) * 5 * 0.999)));
          }
        }
      });
      tl.fromTo('.house__line path', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1, stagger: 0.12 })
        .fromTo('.rise', { y: 380 }, { y: 0, duration: 3 }, '>-0.1')
        .to(o, { v: 100, duration: 3, onUpdate: function () { if (pct) pct.textContent = Math.round(o.v); } }, '<')
        .fromTo(lbls, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.25, stagger: 0.6 }, '<')
        .fromTo('.wave', { attr: { d: 'M0 100 Q25 90 50 100 T100 100 T150 100 T200 100 T250 100 T300 100 T350 100 T400 100 V96 H0Z' } }, { attr: { d: 'M0 100 Q25 100 50 100 T100 100 T150 100 T200 100 T250 100 T300 100 T350 100 T400 100 V96 H0Z' }, duration: 0.4 }, '>-0.4')
        .to({}, { duration: 0.3 });
      return function () { tl.kill(); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
