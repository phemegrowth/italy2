/* Costruzioni Tagliamento: hero cards fan out + line reveal, header, full-screen menu, anchors, reveals, count-up,
   values line, magnetic buttons, phone bar, form validation, and the GSAP signature scene: a ground section where the
   six jobs happen in order (demolition, excavation, underground services, reinforced concrete, structure, facade). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var yr = d.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('[data-mbar]'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar && hero) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
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

  /* count-up (figures from their own site) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null, dur = 1400;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* drag strip + progress */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth, vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (sbar) sbar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(2) + '%) scaleX(' + vis.toFixed(3) + ')';
    };
    if (sbar) { sbar.style.transformOrigin = 'left'; sbar.parentNode.style.overflow = 'hidden'; }
    strip.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* work list: hovered name swaps the photo (desktop) */
  var wimg = d.querySelector('[data-work-img]');
  if (wimg && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.work__list li').forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        var src = li.getAttribute('data-img');
        if (!src || wimg.getAttribute('src') === src) return;
        wimg.style.opacity = '0';
        setTimeout(function () { wimg.src = src; wimg.style.opacity = '1'; }, 200);
      });
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop) */
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
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* SIGNATURE SCENE */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  function build() {
    html.classList.add('scene-live');
    var pin = scene.querySelector('.scene__pin'), q = function (s) { return scene.querySelectorAll(s); };
    var old = q('.s-old'), hole = q('.s-hole'), trench = q('.s-trench'), pipes = q('.s-pipes circle');
    var found = q('.s-found, .s-found2'), fls = q('.s-fl'), slabs = q('.s-slab'), fin = q('.s-fin');
    var ph = q('.phases li');
    function setP(i) { ph.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); }
    setP(0);
    var mm = gsap.matchMedia();
    var sec = scene.querySelector('[data-sec]');
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (c) {
      sec.setAttribute('viewBox', c.conditions.phone ? '310 40 580 580' : '0 0 1000 620');
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: {
        trigger: scene, start: 'top top', end: c.conditions.phone ? '+=150%' : '+=240%', pin: pin, scrub: 0.6,
        onUpdate: function (s) { setP(Math.min(5, Math.floor(s.progress * 6 * 0.999))); }
      } });
      tl.set(hole, { scaleY: 0, transformOrigin: '50% 0%' }, 0)
        .set(trench, { opacity: 0 }, 0).set(pipes, { x: 160, opacity: 0 }, 0)
        .set(found, { scaleY: 0, transformOrigin: '50% 100%' }, 0)
        .set([fls, slabs], { scaleY: 0, transformOrigin: '50% 100%' }, 0)
        .set(fin, { opacity: 0 }, 0)
        .to(old, { y: 60, rotation: 4, opacity: 0, transformOrigin: '50% 100%', duration: 0.12, ease: 'power2.in' }, 0.04)
        .to(hole, { scaleY: 1, duration: 0.12 }, 0.2)
        .to(trench, { opacity: 1, duration: 0.05 }, 0.36)
        .to(pipes, { x: 0, opacity: 1, duration: 0.1, stagger: 0.03 }, 0.38)
        .to(found, { scaleY: 1, duration: 0.12, stagger: 0.04 }, 0.53)
        .to([fls[0], slabs[2]], { scaleY: 1, duration: 0.05 }, 0.69)
        .to([fls[1], slabs[1]], { scaleY: 1, duration: 0.05 }, 0.74)
        .to([fls[2], slabs[0]], { scaleY: 1, duration: 0.05 }, 0.79)
        .to(fin, { opacity: 1, duration: 0.1 }, 0.86)
        .to({}, { duration: 0.04 }, 0.96);
      return function () { gsap.set([old, hole, trench, pipes, found, fls, slabs, fin], { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
