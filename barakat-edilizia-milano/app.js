/* Edilizia Barakat: hero entrance (headline line by line, reel of four tall photos slides in, then drifts left with the
   scroll), header, menu, anchors, reveals, count-up of the 50 km radius, rings that draw, steps that light up, magnetic
   buttons, phone dock, form validation, and the GSAP signature scene: a drywall partition built in six layers with the
   scroll (guides, studs, insulation, boards, tape and filler, paint). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var strip = d.querySelector('[data-reel]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 200);
    if (strip && !reduce && y < window.innerHeight * 2) strip.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
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

  /* count-up (50 km, a sourced quantity) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    reveal([el], function () {
      if (reduce) { el.textContent = to; return; }
      var t0 = null;
      function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }
      el.textContent = '0'; requestAnimationFrame(f);
    });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height * 0.9)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Questo indirizzo email non sembra valido.', message: 'Descrivete il lavoro in due righe.' };
    var fields = form.querySelectorAll('[required], input[type="email"]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim();
      var ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 8;
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

  /* GSAP signature scene: a drywall partition in six layers */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', function () { return wallScene(false); });
    mm.add('(max-width: 1080px)', function () { return wallScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.scene__pin'), q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var steps = qa('.scene__steps li'), k = q('[data-k]');
    var L = { guide: q('.lw-guide'), stud: q('.lw-stud'), wool: q('.lw-wool'), board: q('.lw-board'), tape: q('.lw-tape'), paint: q('.lw-paint'), door: q('.lw-door') };
    var studs = L.stud.querySelectorAll('rect'), boards = L.board.querySelectorAll('.bd'), tp = q('.tp');
    tp.setAttribute('pathLength', '1');
    gsap.set([L.guide, L.stud, L.wool, L.board, L.tape, L.paint, L.door], { opacity: 0 });
    gsap.set(L.guide.children, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(studs, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.cwool'), { attr: { y: 400, height: 0 } });
    gsap.set(boards, { opacity: 0, y: -18 });
    gsap.set(tp, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q('.cpaint'), { attr: { width: 0 } });
    function setStep(i) {
      steps.forEach(function (li, j) { li.classList.toggle('is-on', j < i); li.classList.toggle('is-cur', j === i); });
      k.textContent = i + 1;
    }
    setStep(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.6, start: 'top top', end: small ? '+=140%' : '+=260%',
        onUpdate: function (self) { var p = self.progress; setStep(p < 0.15 ? 0 : p < 0.32 ? 1 : p < 0.48 ? 2 : p < 0.66 ? 3 : p < 0.82 ? 4 : 5); }
      }
    });
    tl.set([L.guide, L.door], { opacity: 1 }, 0)
      .to(L.guide.children, { scaleX: 1, duration: 0.1, stagger: 0.03 }, 0.02)
      .set(L.stud, { opacity: 1 }, 0.15)
      .to(studs, { scaleY: 1, duration: 0.12, stagger: 0.018 }, 0.15)
      .set(L.wool, { opacity: 1 }, 0.32)
      .to(q('.cwool'), { attr: { y: 40, height: 360 }, duration: 0.14 }, 0.32)
      .set(L.board, { opacity: 1 }, 0.48)
      .to(boards, { opacity: 1, y: 0, duration: 0.05, stagger: 0.016 }, 0.48)
      .set(L.tape, { opacity: 1 }, 0.66)
      .to(tp, { strokeDashoffset: 0, duration: 0.14 }, 0.66)
      .set(L.paint, { opacity: 1 }, 0.82)
      .to(q('.cpaint'), { attr: { width: 560 }, duration: 0.14 }, 0.82)
      .to({}, { duration: 0.04 });
    return function () {
      gsap.set([L.guide, L.stud, L.wool, L.board, L.tape, L.paint, L.door, L.guide.children, studs, boards, tp], { clearProps: 'all' });
      q('.cwool').setAttribute('y', 40); q('.cwool').setAttribute('height', 360); q('.cpaint').setAttribute('width', 560);
    };
  }
})();
