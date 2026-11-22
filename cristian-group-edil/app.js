/* Cristian Group Edil: header, menu, anchors, reveals, hero count, timeline line, magnetic buttons, phone bar, form,
   and the GSAP signature scene "Pannello dopo pannello": an old facade gets its cappotto with scroll
   (boards row by row from the bottom, dowels, mesh, render, colour) while the heat-loss gauge drops. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('reduce', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero number */
  var hn = d.querySelector('[data-hero-count]');
  if (hn && !reduce) {
    var to = +hn.getAttribute('data-hero-count'), t0 = null;
    hn.textContent = '0';
    var step = function (ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 900); hn.textContent = Math.round(to * p); if (p < 1) requestAnimationFrame(step); };
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  }

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

  var tl = d.querySelector('[data-tl]');
  if (tl) {
    var drawT = function () { var r = tl.getBoundingClientRect(), vh = window.innerHeight; tl.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2))).toFixed(3)); };
    window.addEventListener('scroll', drawT, { passive: true }); window.addEventListener('resize', drawT); drawT();
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
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

  /* build the boards and dowels once (also used by the static final state) */
  var NS = 'http://www.w3.org/2000/svg';
  var sec = d.querySelector('[data-scene]');
  var rows = [];
  if (sec) {
    var gB = sec.querySelector('.h-boards'), gD = sec.querySelector('.h-dowels');
    var bw = 64, bh = 32, y0 = 470;
    for (var r = 0; y0 - (r + 1) * bh > 40; r++) {
      var row = [], off = (r % 2) ? -bw / 2 : 0;
      for (var x = 60 + off; x < 540; x += bw) {
        var b = d.createElementNS(NS, 'rect');
        b.setAttribute('x', x + 1); b.setAttribute('y', y0 - (r + 1) * bh + 1);
        b.setAttribute('width', bw - 2); b.setAttribute('height', bh - 2);
        b.setAttribute('fill', (r + Math.round(x / bw)) % 5 === 0 ? '#d9c9a3' : '#e3d5b2');
        gB.appendChild(b); row.push(b);
        if ((r % 2 === 0) && x > 70 && x < 520) {
          var c = d.createElementNS(NS, 'circle');
          c.setAttribute('cx', x + 1); c.setAttribute('cy', y0 - r * bh - 1); c.setAttribute('r', 3.2); c.setAttribute('fill', '#6f7b88');
          gD.appendChild(c);
        }
      }
      rows.push(row);
    }
  }

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
    var boards = q('.h-boards rect'), dowels = q('.h-dowels circle'), mesh = q('.h-mesh'), render = q('.h-render'), paint = q('.h-paint');
    var head = q('.scene__head > *'), stage = q('.house, .therm'), bar = sec.querySelector('[data-bar]');
    var lis = q('.steps li');
    gsap.set(boards, { autoAlpha: 0, x: function (i, el) { return (+el.getAttribute('x') > 300 ? 60 : -60); }, y: -10 });
    gsap.set(dowels, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set(mesh, { autoAlpha: 0 });
    gsap.set(render, { autoAlpha: 0 });
    gsap.set(paint, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(bar, { scaleY: 1 });
    gsap.set(head.concat(stage), { autoAlpha: 0, y: 30 });

    var T = gsap.timeline({ defaults: { ease: 'power2.out' } });
    T.to(head, { autoAlpha: 1, y: 0, stagger: .1, duration: .5 }, 0)
     .to(stage, { autoAlpha: 1, y: 0, duration: .6 }, .15);
    var t = 1.2;
    rows.forEach(function (row, i) {
      T.to(row, { autoAlpha: 1, x: 0, y: 0, duration: .45, stagger: .03 }, t + i * .32);
    });
    var tb = t + rows.length * .32 + .3;
    T.to(bar, { scaleY: .32, duration: tb - t, ease: 'none' }, t)
     .to(dowels, { autoAlpha: 1, scale: 1, duration: .3, stagger: .015 }, tb)
     .to(mesh, { autoAlpha: .9, duration: .8 }, tb + 1.1)
     .to(render, { autoAlpha: 1, duration: .9 }, tb + 2.1)
     .to(bar, { scaleY: .2, duration: .9 }, tb + 2.1)
     .to(paint, { scaleY: 1, duration: 1.1, ease: 'power1.inOut' }, tb + 3.2)
     .to({}, { duration: .5 }, tb + 4.3);
    var marks = [0, t, tb, tb + 1.1, tb + 3.0];
    var total = T.duration();
    var cur = -1;
    var setStep = function (time) {
      var k = 0; for (var i = 0; i < marks.length; i++) if (time >= marks[i]) k = i;
      if (k === cur) return; cur = k;
      lis.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    };
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: true, scrub: .6, animation: T,
      onUpdate: function (self) { setStep(self.progress * total); }
    });
    setStep(0);
    return function () { st.kill(); T.kill(); gsap.set(boards.concat(dowels, mesh, render, paint, head, stage, [bar]), { clearProps: 'all' }); lis.forEach(function (li, j) { li.classList.toggle('is-on', j === 0); }); };
  }
})();
