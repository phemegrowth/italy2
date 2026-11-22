/* Edil D'Or: header, circle menu, anchors, reveals, hero entrance with a count-up figure, service list that drives
   the photo (desktop), drag strip, magnetic buttons, phone bar, form validation, and the GSAP signature scene:
   a house elevation draws itself, the structure and walls fill in, then the photovoltaic panels land on the roof. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero: count-up and slow drift */
  var big = d.querySelector('.big__n');
  if (big && !reduce) {
    var target = +big.getAttribute('data-count'), t0 = null;
    big.textContent = '0';
    var tick = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0 - 350) / 900);
      if (p < 0) { requestAnimationFrame(tick); return; }
      big.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    var arch = d.querySelector('.arch');
    setTimeout(function () { arch.classList.add('is-drift'); }, 1700);
  }

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

  /* services: the active item drives the photo on desktop (hover, focus or scroll position) */
  var items = d.querySelectorAll('.svc__it'), stage = d.querySelectorAll('.svc__stage img');
  function setSvc(i) {
    items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
    stage.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
  }
  items.forEach(function (it, k) {
    it.addEventListener('mouseenter', function () { setSvc(k); });
  });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setSvc(+e.target.getAttribute('data-img')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { sio.observe(it); });
  }

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul progetto.' };
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
    html.classList.add('st-on');
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
    var q = function (s) { return sec.querySelectorAll(s); };
    var steps = q('.scene__steps li'), cap = sec.querySelector('.scene__cap'), pct = sec.querySelector('[data-pct]');
    var names = [], descs = [];
    steps.forEach(function (li) { names.push(li.querySelector('span').textContent); descs.push(li.querySelector('em').textContent); });
    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
      cap.innerHTML = '<b>0' + (i + 1) + '</b> <span>' + names[i] + '</span><em>' + descs[i] + '</em>';
    }
    setStep(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1,
        onToggle: function (s) { scenePinned = s.isActive; bar(); },
        onUpdate: function (s) {
          var p = s.progress;
          pct.textContent = Math.round(Math.min(1, p / 0.92) * 100);
          setStep(p < 0.3 ? 0 : p < 0.52 ? 1 : p < 0.72 ? 2 : 3);
        }
      }
    });
    tl.to(q('.draw path'), { strokeDashoffset: 0, duration: 0.28, stagger: 0.035 }, 0)
      .fromTo(q('.dims'), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.12)
      .fromTo(q('.lay--found'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.1 }, 0.32)
      .fromTo(q('.lay--frame'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.14 }, 0.38)
      .fromTo(q('.lay--walls'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.16 }, 0.54)
      .to(q('.draw'), { opacity: 0.35, duration: 0.12 }, 0.6)
      .fromTo(q('.lay--pv'), { opacity: 0, y: -90 }, { opacity: 1, y: 0, duration: 0.14 }, 0.74)
      .fromTo(q('.sun'), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.76)
      .fromTo(q('.sun__c'), { x: -380, y: 90 }, { x: 0, y: 0, duration: 0.18 }, 0.76)
      .to({}, { duration: 0.08 });
    return function () { scenePinned = false; };
  }
})();
