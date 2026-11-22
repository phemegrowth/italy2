/* Impresa Edile Azzini Norberto: header, full-screen menu, anchors, reveals, hero deck (photos fan out and settle
   into a collage), animated accordion, draggable reel, phone bar, form validation and the GSAP signature scene
   (catalogue 11, material pour: concrete rises over the rebar with a moving wave edge and a % counter). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready', 'no-pin'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
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


  /* hero deck: the four photos start as one pile in the middle, fan out, then settle into the collage (CSS end state) */
  var deck = d.querySelector('.deck');
  if (deck && window.gsap && !reduce) {
    var cards = deck.querySelectorAll('.deck__c');
    var db = deck.getBoundingClientRect(), cx = db.left + db.width / 2, cy = db.top + db.height / 2;
    var fan = [-18, -6, 6, 18];
    var tl0 = gsap.timeline({ delay: 0.05 });
    cards.forEach(function (c, i) {
      var b = c.getBoundingClientRect();
      var dx = cx - (b.left + b.width / 2), dy = cy - (b.top + b.height / 2);
      tl0.from(c, { x: dx, y: dy, rotation: fan[i], scale: 0.82, duration: 0.95, ease: 'power3.out' }, 0.05 + i * 0.07);
    });
    tl0.from(cards, { autoAlpha: 0, duration: 0.25, stagger: 0.05 }, 0);
  }

  /* accordion with a height animation */
  d.querySelectorAll('.acc__i').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        var a = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease' });
        a.onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'ease' });
      }
    });
  });

  /* reel: drag to scroll with the mouse (touch scrolls natively) */
  var track = d.querySelector('.reel__track');
  if (track) {
    var down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (down) { down = false; track.classList.remove('is-drag'); } });
  }

  /* phone contact bar: after the hero, hidden in the contact section and in the scene */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-pin'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 701px)', function () { return build(false); });
    mm.add('(max-width: 700px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var fill = sec.querySelector('.pour__fill'), base = sec.querySelector('.pour__base');
    var steps = sec.querySelectorAll('.pour__steps li'), pct = sec.querySelector('.pour__pct b');
    var copy = sec.querySelectorAll('.scene__copy > .eyebrow, .scene__copy > h2');
    var pour = sec.querySelector('.pour');
    function setStep(k) { steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); }); }
    var st = { y: 100, w: 0 };
    function paint() {
      fill.style.setProperty('--fy', st.y.toFixed(2) + '%');
      fill.style.setProperty('--wx', st.w.toFixed(1) + 'px');
      var p = Math.round(100 - st.y);
      pct.textContent = Math.max(0, Math.min(100, p));
    }
    paint();
    gsap.set(copy, { autoAlpha: 0, y: 22 });
    gsap.set(pour, { autoAlpha: 0, scale: 0.94 });
    gsap.set(base, { scale: 1.12 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.3 ? 0 : p < 0.58 ? 1 : p < 0.8 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.03, ease: 'power2.out' }, 0)
      .to(pour, { autoAlpha: 1, scale: 1, duration: 0.14, ease: 'power2.out' }, 0)
      .to(base, { scale: 1, duration: 0.3 }, 0.05)
      .to(st, { y: 0, duration: 0.62, ease: 'power1.inOut', onUpdate: paint }, 0.2)
      .to(st, { w: small ? -600 : -1000, duration: 0.8, onUpdate: paint }, 0.12)
      .to({}, { duration: 0.08 });
    setStep(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      fill.style.removeProperty('--fy'); fill.style.removeProperty('--wx');
      gsap.set([copy, pour, base], { clearProps: 'all' });
    };
  }
})();
