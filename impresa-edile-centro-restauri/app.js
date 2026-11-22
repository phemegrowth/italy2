/* Centro Restauri: header, menu, anchors, reveals, accordion with height animation, phone bar, form, Ken Burns hero (CSS), marquee (CSS), and the GSAP signature scene: a weathered condominium facade gets its scaffolding, its repairs, a new facade floor by floor, and the scaffolding comes down. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 140);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* accordion: one open at a time, animated height */
  var items = Array.prototype.slice.call(d.querySelectorAll('.acc__i'));
  items.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !det.open;
      if (open) items.forEach(function (o) { if (o !== det && o.open) close(o); });
      if (open) { det.open = true; if (!reduce && body.animate) body.animate([{ height: '0px', opacity: 0 }, { height: body.scrollHeight + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' }); }
      else close(det);
    });
  });
  function close(det) {
    var body = det.querySelector('.acc__b');
    if (reduce || !body.animate) { det.open = false; return; }
    var a = body.animate([{ height: body.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'ease-in' });
    a.onfinish = function () { det.open = false; };
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) { var first = null; req.forEach(function (f) { if (!check(f) && !first) first = f; }); if (first) { e.preventDefault(); first.focus(); } });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  var steps = sec ? Array.prototype.slice.call(sec.querySelectorAll('.fa__steps li')) : [];
  if (reduce || !window.gsap) steps.forEach(function (l) { l.classList.add('is-on'); });
  function start() {
    if (reduce || !sec || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(max-width: 1023px)', function () { return build(true); });
    mm.add('(min-width: 1024px)', function () { return build(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var head = q('.fa__head > *'), art = sec.querySelector('.fa__art'), sc = q('.fa__sc .sc'), scG = sec.querySelector('.fa__sc');
    var damage = q('.fa__old > path[stroke="#8f948f"], .fa__old > ellipse, .fa__old > rect[fill="#8a8f8a"]');
    var clip = sec.querySelector('.fa__cliprect');
    sc.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L }); });
    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(art, { autoAlpha: 0, y: 40 });
    gsap.set(steps, { autoAlpha: 0, y: 12 });
    gsap.set(clip, { attr: { y: 560, height: 0 } });
    var T = gsap.timeline({ defaults: { ease: 'none' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .08, duration: .4, ease: 'power2.out' }, 0)
     .to(art, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, .15)
     .to(steps, { autoAlpha: 1, y: 0, stagger: .05, duration: .3 }, .4)
     .to(sc, { strokeDashoffset: 0, stagger: .02, duration: .5 }, .7)
     .to(damage, { autoAlpha: 0, stagger: .06, duration: .35 }, 1.7)
     .to(clip, { attr: { y: 0, height: 560 }, duration: 1.3, ease: 'power1.inOut' }, 2.4)
     .to(scG, { autoAlpha: 0, y: -24, duration: .5 }, 3.9)
     .to({}, { duration: .4 }, 4.4);
    T.eventCallback('onUpdate', function () {
      var t = T.time(), s = t < .7 ? -1 : t < 1.6 ? 0 : t < 2.4 ? 1 : t < 3.8 ? 2 : 3;
      steps.forEach(function (l, i) { l.classList.toggle('is-on', i === s); });
    });
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=150%' : '+=250%', pin: true, scrub: .6, animation: T });
    return function () { st.kill(); T.kill(); gsap.set(head.concat(sc, damage, steps, [art, scG]), { clearProps: 'all' }); gsap.set(clip, { attr: { y: 0, height: 560 } }); };
  }
})();
