/* FUGA — atelier keramike · interakcije */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Marquee: dupliciraj red za beskonačnu petlju ---------- */
  const row = $('.strip__row');
  if (row) {
    const clone = row.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    $$('img', clone).forEach(i => (i.alt = ''));
    row.parentNode.appendChild(clone);
  }

  /* ---------- Glatko skrolanje ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Sidrene poveznice ---------- */
  const menu = $('#menu');
  const burger = $('#burger');
  const closeMenu = () => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otvori izbornik');
    document.body.style.overflow = '';
    lenis && lenis.start();
  };
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(t, { offset: id === '#top' ? 0 : -10 });
      else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Mobilni izbornik ---------- */
  burger && burger.addEventListener('click', () => {
    const open = menu.hidden;
    if (!open) return closeMenu();
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Zatvori izbornik');
    document.body.style.overflow = 'hidden';
    lenis && lenis.stop();
    if (hasGsap && !reduce) gsap.from($$('li', menu), { y: 30, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out' });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Zaglavlje: puna pozadina i skrivanje ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    hdr.classList.toggle('is-solid', y > 40);
    hdr.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * .8 && menu.hidden);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Ruta: povezivanje popisa i karte ---------- */
  const setCity = c => {
    $$('[data-city]').forEach(el => el.classList.toggle('is-on', el.dataset.city === c));
  };
  $$('.route__list li').forEach(li => {
    li.addEventListener('mouseenter', () => setCity(li.dataset.city));
  });

  /* ---------- Slider materijala ---------- */
  const rail = $('#rail');
  const bar = $('#railbar');
  if (rail) {
    const step = () => {
      const card = $('.mat', rail);
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 24) : 300;
    };
    $$('.mats__ctrl .circ').forEach(b => b.addEventListener('click', () => {
      rail.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    }));
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const ratio = rail.clientWidth / rail.scrollWidth;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      bar.style.width = (ratio * 100) + '%';
      bar.style.transform = `translateX(${p * (1 / ratio - 1) * 100}%)`;
    };
    rail.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
    // povlačenje mišem
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
      rail.classList.add('is-drag');
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      rail.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      const snapTo = Math.round(rail.scrollLeft / step()) * step();
      rail.classList.remove('is-drag');
      rail.scrollTo({ left: snapTo, behavior: 'smooth' });
    });
    rail.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
  }

  /* ---------- Obrazac (demo, bez slanja) ---------- */
  const form = $('#form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const note = $('#form-note');
      let ok = true;
      $$('[required]', form).forEach(inp => {
        const bad = !inp.value.trim();
        inp.closest('.field').classList.toggle('is-err', bad);
        if (bad) ok = false;
      });
      if (!ok) { note.textContent = 'Molimo upišite ime i kontakt kako bismo vam se mogli javiti.'; return; }
      const name = form.name.value.trim().split(' ')[0];
      note.textContent = `Hvala, ${name}. Upit je zaprimljen, javljamo se unutar jednog radnog dana. (Demo: ništa nije poslano.)`;
      form.reset();
    });
  }

  /* ---------- Brojači ---------- */
  const fmt = (v, dec) => dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('hr-HR');
  const counters = $$('[data-count]');
  const finishCounters = () => counters.forEach(el => (el.textContent = fmt(parseFloat(el.dataset.count), +el.dataset.dec || 0)));

  if (!hasGsap || reduce) {
    finishCounters();
    setCity('zagreb');
    return;
  }

  /* ================= GSAP animacije ================= */
  gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  const heroImg = $('.hero__media img');
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from(heroImg, { scale: 1.25, duration: 2.4 })
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.4, stagger: .14 }, .25)
    .from('.hero__eyebrow, .hero__foot, .hero__coords li', { opacity: 0, y: 20, duration: 1.2, stagger: .08 }, .8)
    .from('.hdr', { opacity: 0, y: -20, duration: 1, clearProps: 'transform,opacity' }, .6);

  gsap.to(heroImg, {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__inner', {
    yPercent: -20, opacity: .2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Općenito otkrivanje
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .1 })
  });

  // Parallax slike u sekciji izrade
  $$('[data-parallax] img').forEach(img => {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // Poglavlje I: okvir se širi do punog ekrana
  const chap = gsap.timeline({
    scrollTrigger: { trigger: '.chapter__pin', start: 'top top', end: '+=110%', scrub: 1, pin: true, anticipatePin: 1 }
  });
  chap
    .to('.chapter__frame', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
    .to('.chapter__frame img', { scale: 1, ease: 'none' }, 0)
    .from('.chapter__copy > *', { y: 60, opacity: 0, stagger: .08, ease: 'power2.out', duration: .5 }, .25);

  // Brojači
  counters.forEach(el => {
    const end = parseFloat(el.dataset.count);
    const dec = +el.dataset.dec || 0;
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt(o.v, dec))
    });
  });

  // Ruta: crtanje putanje i aktivni grad prema skrolu
  const path = $('.map__path');
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.route', start: 'top 60%', end: 'center center', scrub: 1 }
    });
    gsap.from('.map__pts g', {
      opacity: 0, scale: .4, transformOrigin: 'center', stagger: .1, duration: .8, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.route__map', start: 'top 70%', once: true }
    });
  }
  $$('.route__list li').forEach(li => {
    ScrollTrigger.create({
      trigger: li, start: 'top 60%', end: 'bottom 60%',
      onToggle: s => s.isActive && setCity(li.dataset.city)
    });
  });
  setCity('zagreb');

  // Kartice materijala
  gsap.from('.mat', {
    x: 80, opacity: 0, duration: 1.2, stagger: .08, ease: 'power3.out',
    scrollTrigger: { trigger: '.mats__rail', start: 'top 85%', once: true }
  });

  // Upit: parallax pozadine
  gsap.fromTo('.inquiry__bg', { yPercent: -6 }, {
    yPercent: 6, ease: 'none',
    scrollTrigger: { trigger: '.inquiry', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Veliki natpis u podnožju
  gsap.from('.ftr__word', {
    yPercent: 40, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true }
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
