/* Impresa Edile R.C.M.: curtain hero (CSS, class toggles), header, circle menu, anchors, reveals, accordion with
   height animation, magnetic buttons, phone bar, form validation, and the GSAP signature scene: a drywall partition
   built with the scroll (steel frame, mineral wool, boards, tape and filler, paint with a roller). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    html.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-in'); });

  /* accordion: animate height on open/close */
  d.querySelectorAll('.acc__it').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (det.open) {
        var h = body.scrollHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var h2 = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  });

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
  }
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return scene(false); });
    mm.add('(max-width: 899px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var W = function (k) { return sec.querySelector('.W--' + k); };
    var studs = sec.querySelectorAll('.W--telaio rect'), lana = sec.querySelectorAll('.W--lana rect');
    var la = sec.querySelector('.lastra--a'), lb = sec.querySelector('.lastra--b'), screws = sec.querySelector('.W--lastre g');
    var stucco = W('stucco'), mask = sec.querySelector('.paint-mask'), roller = sec.querySelector('.roller');
    var steps = sec.querySelectorAll('.layers li'), cnt = sec.querySelector('[data-count]');
    var copy = sec.querySelectorAll('.scene__copy > .eyebrow, .scene__copy > .h2, .scene__count');
    sec.classList.add('is-live');

    gsap.set(copy, { autoAlpha: 0, y: 28 });
    gsap.set(studs, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(lana, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(la, { x: -340, autoAlpha: 0 });
    gsap.set(lb, { x: 340, autoAlpha: 0 });
    gsap.set(screws, { autoAlpha: 0 });
    gsap.set(stucco, { autoAlpha: 0 });
    gsap.set(mask, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(roller, { x: 20, y: 200, autoAlpha: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(copy, { autoAlpha: 1, y: 0, stagger: .08, duration: .5 }, 0)
      .to(studs, { scaleY: 1, stagger: .08, duration: .6 }, .2)
      .to(lana, { scaleY: 1, stagger: .12, duration: .6 }, 1.4)
      .to(la, { x: 0, autoAlpha: 1, duration: .7, ease: 'power3.out' }, 2.5)
      .to(lb, { x: 0, autoAlpha: 1, duration: .7, ease: 'power3.out' }, 2.75)
      .to(screws, { autoAlpha: 1, duration: .3 }, 3.3)
      .to(stucco, { autoAlpha: 1, duration: .6 }, 3.8)
      .to(roller, { autoAlpha: 1, duration: .2 }, 4.8)
      .to(mask, { scaleX: 1, duration: 1.1, ease: 'none' }, 4.9)
      .to(roller, { x: 580, duration: 1.1, ease: 'none' }, 4.9)
      .to(roller, { y: 120, duration: .55, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 4.9)
      .to(roller, { autoAlpha: 0, duration: .2 }, 6.0)
      .to({}, { duration: .4 });

    var at = [0, 1.3, 2.4, 3.7, 4.8];
    var last = -1;
    function sync() {
      var t = tl.time(), s = 1;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k + 1;
      if (s === last) return; last = s;
      cnt.textContent = '0' + s;
      steps.forEach(function (li) { var n = +li.getAttribute('data-step'); li.classList.toggle('is-on', n === s); li.classList.toggle('is-done', n < s); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set([copy, studs, lana, la, lb, screws, stucco, mask, roller], { clearProps: 'all' });
      sec.classList.remove('is-live');
      steps.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
      cnt.textContent = '05';
    };
  }
})();
