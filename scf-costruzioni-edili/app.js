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

  // hero photo parallaxes slower than the page
  var hp = $('.hero__photo img');
  if (hp && !reduce) {
    var par = function () { var y = Math.min(window.scrollY, 1200); hp.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px'); };
    window.addEventListener('scroll', par, { passive: true }); par();
  }

  // drag strip (mouse); touch scrolls natively
  var drag = $('.drag');
  if (drag) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx); });
  }

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

  // signature scene: the thermal coat builds layer by layer
  var coat = $('.coat'), steps5 = $$('.coat__steps li'), count = $('.coat__count b'), tag = $('.wall__tag');
  var names = ['Muratura', 'Collante', 'Pannelli isolanti', 'Rasante e rete', 'Finitura'];
  function setStep(i) {
    steps5.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    if (count) count.textContent = '0' + (i + 1);
    if (tag) tag.innerHTML = 'Strato <b>0' + (i + 1) + '</b> · ' + names[i];
  }
  if (!coat || reduce || !window.gsap || !window.ScrollTrigger) {
    steps5.forEach(function (li) { li.classList.add('is-on'); });
    if (tag) tag.innerHTML = 'Cappotto <b>finito</b>';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var build = function () {
    coat.classList.add('is-pinned');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', big: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.coat__pin', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: 0.6,
          onUpdate: function (st) { setStep(Math.min(4, Math.floor(st.progress * 5 * 0.999))); }
        }
      });
      tl.fromTo('.ly-1', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
        .fromTo('.ly-2', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
        .fromTo('.ly-3 i', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.25, stagger: 0.1 })
        .fromTo('.ly-3 .ly__n', { opacity: 0 }, { opacity: 1, duration: 0.1 }, '<')
        .fromTo('.ly-4', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
        .fromTo('.ly-5', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 });
      gsap.set('.ly-3', { opacity: 1 });
      return function () { tl.kill(); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
