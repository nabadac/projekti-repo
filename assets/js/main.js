/* =========================================================
   Poliklinika Lipa — interakcije i animacije
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const isDesktop = () => matchMedia('(min-width: 961px)').matches;
  const fmt = n => n.toLocaleString('hr-HR');

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- glatko skrolanje (Lenis) ---------- */
  let lenis = null;
  if (!reduced && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (target, offset = 0) => {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
    else {
      const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY + offset;
      scrollTo.native(y);
    }
  };
  scrollTo.native = y => window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) { e.preventDefault(); return; }
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollTo(t, -20);
  }));

  /* ---------- gumbi: tekst koji se "zarola" ---------- */
  $$('[data-roll]').forEach(btn => {
    const label = btn.textContent.trim();
    btn.setAttribute('aria-label', label);
    btn.innerHTML = `<span class="roll" aria-hidden="true"><span class="roll__inner"><span>${label}</span><span>${label}</span></span></span>`;
  });

  /* ---------- poderani rubovi papira ---------- */
  function seeded(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }
  $$('.torn-edge').forEach((el, i) => {
    const rnd = seeded(97 + i * 131);
    const amp = 1.6, step = 2.2, pts = [];
    const jit = () => rnd() * amp;
    for (let x = 0; x <= 100; x += step) pts.push(`${x}% ${jit()}%`);
    for (let y = 0; y <= 100; y += step * 1.4) pts.push(`${100 - jit()}% ${y}%`);
    for (let x = 100; x >= 0; x -= step) pts.push(`${x}% ${100 - jit()}%`);
    for (let y = 100; y >= 0; y -= step * 1.4) pts.push(`${jit()}% ${y}%`);
    el.style.clipPath = `polygon(${pts.join(',')})`;
  });

  /* ---------- zaglavlje + tema stranice ---------- */
  const header = $('[data-header]');
  const themed = $$('[data-theme]');
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    if (!document.body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > 400 && y - lastY > 2);
      if (lastY - y > 2) header.classList.remove('is-hidden');
    }
    lastY = y;

    const mid = innerHeight * 0.55;
    let bodyTheme = 'dark', headTheme = 'dark';
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) bodyTheme = s.dataset.theme;
      if (r.top <= 44 && r.bottom > 44) headTheme = s.dataset.theme;
    }
    document.body.classList.toggle('theme-light', bodyTheme === 'light');
    document.body.classList.toggle('theme-dark', bodyTheme !== 'light');
    header.classList.toggle('is-light', headTheme === 'light');
  }
  if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilni izbornik ---------- */
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otvori izbornik');
    menu.setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  burger.addEventListener('click', () => {
    if (document.body.classList.contains('menu-open')) return closeMenu();
    document.body.classList.add('menu-open');
    header.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Zatvori izbornik');
    menu.setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- dijeljenje teksta na retke ---------- */
  function splitLines(el) {
    if (!el.dataset.text) el.dataset.text = el.innerHTML.trim();
    const words = el.dataset.text.split(/ (?![^<]*>)/);
    el.innerHTML = words.map(w => `<span class="w-measure">${w}</span>`).join(' ');
    const lines = [];
    let top = null;
    $$('.w-measure', el).forEach(s => {
      const t = Math.round(s.offsetTop);
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(s.innerHTML);
    });
    el.innerHTML = lines.map(l => `<span class="line-mask"><span>${l.join(' ')}</span></span>`).join('');
    return $$('.line-mask > span', el);
  }

  /* ---------- brojači ---------- */
  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduced || !hasGsap) { el.textContent = fmt(end) + suffix; return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(Math.round(o.v)) + suffix; } });
  }

  /* ---------- pokretanje nakon učitavanja fontova ---------- */
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(init);

  function init() {
    const splitEls = $$('[data-split]');
    splitEls.forEach(el => splitLines(el));
    const quoteEls = $$('.quote blockquote');
    quoteEls.forEach(el => splitLines(el));

    let rw;
    let lastW = innerWidth;
    addEventListener('resize', () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      clearTimeout(rw);
      rw = setTimeout(() => {
        [...splitEls, ...quoteEls].forEach(el => splitLines(el));
        if (hasGsap) { gsap.set($$('[data-split] .line-mask > span'), { yPercent: 0 }); ScrollTrigger.refresh(); }
        layoutCarousel();
      }, 200);
    });

    heroIntro();
    scrollAnimations();
    stats();
    carousel();
    quotes();
    pinTabs();
    stepsAccordion();
    bento();
    const yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();
    if (hasGsap) ScrollTrigger.refresh();
  }

  /* ---------- HERO ---------- */
  function heroIntro() {
    if (!hasGsap || reduced) return;
    const lines = $$('.hero__title .line-mask > span');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('[data-hero-frame]', { clipPath: 'inset(6% 4% 6% 4% round 24px)', duration: 1.6, ease: 'expo.inOut' }, 0)
      .from('[data-hero-img]', { scale: 1.25, duration: 2.4 }, 0)
      .from(lines, { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.7)
      .from('[data-reveal-hero]', { y: 24, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.85)
      .from('[data-hero-ui]', { opacity: 0, x: 30, duration: 1.6 }, 1.1)
      .from('.header__inner', { y: -24, opacity: 0, duration: 1.2 }, 0.9)
      .from('.trust > *', { y: 20, opacity: 0, duration: 1.2, stagger: 0.1 }, 1.1);

    // parallax slike i sadržaja pri skrolanju
    gsap.to('[data-hero-img]', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero__frame', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { y: -60, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero__frame', start: 'center center', end: 'bottom top', scrub: true } });
  }

  /* ---------- opće animacije pri skrolanju ---------- */
  function scrollAnimations() {
    if (!hasGsap || reduced) {
      $$('[data-count]').forEach(countUp);
      $$('[data-bento]').forEach(b => b.classList.add('in-view'));
      return;
    }

    // naslovi: redci izlaze iz maske
    $$('[data-split]').forEach(el => {
      if (el.closest('.hero')) return;
      gsap.from($$('.line-mask > span', el), {
        yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // features — tekst + vizual
    $$('[data-feature]').forEach(f => {
      const text = $$('.feature__text > *', f);
      const vis = $('.feature__visual > *', f);
      const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 70%' } });
      tl.from(text, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0)
        .from(vis, { y: 60, opacity: 0, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out' }, 0.1);

      const kind = vis.dataset.anim;
      if (kind === 'appt') {
        tl.from($$('.ui-table div', vis), { opacity: 0, x: 16, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, 0.5)
          .from($('.pill', vis), { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(2)' }, 0.9);
      } else if (kind === 'stack') {
        tl.from($$('.stack__ghost', vis), { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: -0.1 }, 0.4)
          .from($('.stack__card', vis), { y: 30, rotate: -2, duration: 1.2, ease: 'expo.out' }, 0.3)
          .from($('.pill', vis), { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(2)' }, 0.9);
      } else if (kind === 'case') {
        tl.from($$('.ui-cols > div', vis), { y: 14, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.5)
          .from($('.ui-banner', vis), { scaleX: 0.9, opacity: 0, duration: 1, ease: 'expo.out' }, 0.8)
          .from($('.pill--solid-apricot', vis), { x: 20, opacity: 0, duration: 0.8, ease: 'expo.out' }, 1.1);
      } else if (kind === 'flow') {
        tl.from($$('.flow__step', vis), { x: -40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.18 }, 0.5);
      }
      // blagi parallax vizuala
      gsap.fromTo(vis, { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // brojači
    $$('[data-count]').forEach(el => {
      if (el.closest('.scene') || el.closest('[data-bento]')) return;
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => countUp(el) });
    });

    // kartice carousela ulaze s desna
    gsap.from('.ccard', { x: 120, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.stats', start: 'top 70%' } });

    // iskustva
    gsap.from('.quotes__media', { clipPath: 'inset(20% 10% 20% 10% round 12px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.quotes', start: 'top 70%' } });

    // veliki naslov — riječi se "boje" kako skrolate
    const lines = $$('[data-scrub]');
    lines.forEach(l => { l.innerHTML = l.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' '); });
    const words = $$('.human__line .w');
    gsap.to(words, {
      color: '#123a2f', stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: '.human__head', start: 'top 85%', end: 'bottom 40%', scrub: 0.6 }
    });
    gsap.fromTo('[data-float]', { y: -80, rotate: -40, scale: 0.7 }, {
      y: 60, rotate: 25, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.human__head', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // korak panel
    gsap.from('.steps__panel', { y: 80, clipPath: 'inset(8% 3% 0 3% round 24px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 75%' } });
    gsap.from('.acc__item', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.acc', start: 'top 85%' } });

    // bento kartice
    gsap.from('.bcard', { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.bento__grid', start: 'top 80%' } });
    gsap.from('.itile', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.integr', start: 'top 80%' } });
    gsap.from('.integr', { scale: 0.96, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.integr', start: 'top 85%' } });

    // CTA gumbi
    gsap.from('.cta__btns .btn', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.cta__btns', start: 'top 90%' } });

    // podnožje
    gsap.from('.fnav > div', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
    gsap.fromTo('[data-footer-word]', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer__art', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.fromTo('[data-footer-leaf]', { y: 80, rotate: -50 }, { y: 0, rotate: 10, ease: 'none', scrollTrigger: { trigger: '.footer__art', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.fromTo('.footer__torn', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer__art', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- STATISTIKA: brojke koje se "vrte" ---------- */
  const statData = [
    { v: '48h', l: 'Prosječno čekanje na specijalistički pregled' },
    { v: '32+', l: 'Specijalista iz 14 područja medicine' },
    { v: '98%', l: 'Pacijenata preporučuje Lipu obitelji i prijateljima' },
    { v: '25K+', l: 'Pregleda godišnje u dvije lokacije u Zagrebu' },
    { v: '24h', l: 'Do digitalnog nalaza u aplikaciji' }
  ];
  let statIndex = 0;
  let statTimer = null;
  let onStatChange = () => {};

  function renderNum(el, str) {
    const prev = $$('.digit, .ch', el);
    const chars = [...str];
    // gradi stupce znamenki samo ako se promijenio broj znakova/raspored
    const signature = chars.map(c => (/\d/.test(c) ? 'd' : c)).join('');
    if (el.dataset.sig !== signature) {
      el.innerHTML = chars.map(c => /\d/.test(c)
        ? `<span class="digit"><span class="digit__col">${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}</span></span>`
        : `<span class="ch">${c}</span>`).join('');
      el.dataset.sig = signature;
      // forsiraj layout da bi tranzicija krenula od nule
      el.offsetWidth;
    }
    $$('.digit, .ch', el).forEach((node, i) => {
      const c = chars[i];
      if (node.classList.contains('digit')) node.firstElementChild.style.transform = `translateY(${-parseInt(c, 10) * 10}%)`;
    });
    el.setAttribute('aria-label', str);
    return prev;
  }

  function stats() {
    const num = $('[data-numflow]');
    const label = $('[data-stat-label]');
    const dotsWrap = $('[data-dots]');
    if (!num) return;
    statData.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Statistika ${i + 1}`);
      b.addEventListener('click', () => { setStat(i); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);
    function setStat(i, fromCarousel) {
      statIndex = (i + statData.length) % statData.length;
      renderNum(num, statData[statIndex].v);
      label.style.opacity = 0;
      setTimeout(() => { label.textContent = statData[statIndex].l; label.style.opacity = 1; }, 250);
      dots.forEach((d, k) => d.classList.toggle('is-active', k === statIndex));
      if (!fromCarousel) onStatChange(statIndex);
    }
    function restart() {
      clearInterval(statTimer);
      if (!reduced) statTimer = setInterval(() => setStat(statIndex + 1), 3800);
    }
    window.__setStat = setStat;
    window.__restartStats = restart;
    setStat(0);
    // pokreni tek kad je sekcija u vidu
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) restart(); else clearInterval(statTimer); }, { threshold: 0.2 });
    io.observe($('.stats'));
  }

  /* ---------- CAROUSEL s povlačenjem ---------- */
  let layoutCarousel = () => {};
  function carousel() {
    const root = $('[data-carousel]');
    const track = $('[data-track]', root);
    const cards = $$('.ccard', track);
    const dotsWrap = $('[data-car-dots]', root);
    let index = 0, x = 0, startX = 0, startPos = 0, dragging = false, moved = false;

    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Kartica ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);
    const step = () => cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap || 0);
    const maxX = () => Math.max(0, track.scrollWidth - root.clientWidth);

    function apply(animate = true) {
      track.style.transition = animate ? 'transform 1s cubic-bezier(.22,1,.36,1)' : 'none';
      track.style.transform = `translate3d(${-x}px,0,0)`;
    }
    function go(i, fromStats) {
      index = (i + cards.length) % cards.length;
      x = Math.min(index * step(), maxX());
      apply();
      dots.forEach((d, k) => d.classList.toggle('is-active', k === index));
      cards.forEach((c, k) => c.style.transform = k === index ? '' : 'scale(.985)');
      if (!fromStats && window.__setStat) { window.__setStat(index, true); window.__restartStats(); }
    }
    onStatChange = i => go(i, true);
    layoutCarousel = () => go(index, true);

    root.addEventListener('pointerdown', e => {
      dragging = true; moved = false; startX = e.clientX; startPos = x;
      root.classList.add('is-dragging');
      root.setPointerCapture(e.pointerId);
      apply(false);
    });
    root.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      let nx = startPos - dx;
      if (nx < 0) nx *= 0.35;
      if (nx > maxX()) nx = maxX() + (nx - maxX()) * 0.35;
      x = nx; apply(false);
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; root.classList.remove('is-dragging');
      const raw = x / step();
      const dir = x - startPos;
      const target = Math.abs(dir) > 60 ? (dir > 0 ? Math.ceil(raw) : Math.floor(raw)) : Math.round(raw);
      go(Math.max(0, Math.min(cards.length - 1, target)));
    };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    root.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    $$('img', root).forEach(img => img.draggable = false);
    go(0, true);
  }

  /* ---------- ISKUSTVA (slider) ---------- */
  function quotes() {
    const items = $$('.quote');
    const imgs = $$('.qimg');
    const dotsWrap = $('[data-q-dots]');
    let i = 0, timer;
    items.forEach((_, k) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Iskustvo ${k + 1}`);
      b.addEventListener('click', () => { show(k); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);
    function show(n) {
      const prev = i;
      i = (n + items.length) % items.length;
      items.forEach((q, k) => q.classList.toggle('is-active', k === i));
      imgs.forEach(im => im.classList.remove('is-leaving'));
      if (prev !== i) imgs[prev].classList.add('is-leaving');
      imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    }
    function restart() { clearInterval(timer); if (!reduced) timer = setInterval(() => show(i + 1), 7000); }
    show(0);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) restart(); else clearInterval(timer); }, { threshold: 0.3 });
    io.observe($('[data-quotes]'));
  }

  /* ---------- PINNED TABOVI ---------- */
  function pinTabs() {
    const pin = $('[data-pin]');
    const tabs = $$('[data-tab]');
    const scenes = $$('[data-scene]');
    const descs = $$('[data-desc]');
    let active = -1, autoTimer;
    const counted = new Set();

    function set(i) {
      if (i === active) return;
      active = i;
      tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', k === i); });
      scenes.forEach((s, k) => s.classList.toggle('is-active', k === i));
      descs.forEach((d, k) => d.classList.toggle('is-active', k === i));
      $$('[data-count]', scenes[i]).forEach(el => { if (!counted.has(el)) { counted.add(el); countUp(el); } });
      if (!isDesktop()) {
        const t = tabs[i];
        t.parentElement.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
      }
    }
    function progressIndex() {
      const r = pin.getBoundingClientRect();
      const total = pin.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      return Math.min(tabs.length - 1, Math.floor(p * tabs.length));
    }
    const onScrollPin = () => { if (isDesktop()) set(progressIndex()); };
    if (lenis) lenis.on('scroll', onScrollPin); else addEventListener('scroll', onScrollPin, { passive: true });

    tabs.forEach((t, k) => t.addEventListener('click', () => {
      if (isDesktop()) {
        const total = pin.offsetHeight - innerHeight;
        const y = pin.getBoundingClientRect().top + scrollY + total * ((k + 0.5) / tabs.length);
        scrollTo(y);
      } else { set(k); restartAuto(); }
    }));

    function restartAuto() {
      clearInterval(autoTimer);
      if (!isDesktop() && !reduced) autoTimer = setInterval(() => set((active + 1) % tabs.length), 4500);
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) restartAuto(); else clearInterval(autoTimer); }, { threshold: 0.3 });
    io.observe(pin);
    set(isDesktop() ? progressIndex() : 0);
  }

  /* ---------- KORACI (harmonika s automatskim napredovanjem) ---------- */
  function stepsAccordion() {
    const panel = $('[data-steps]');
    const items = $$('.acc__item', panel);
    const vis = $$('[data-svis]', panel);
    let i = 0, inView = false;
    function open(n) {
      i = (n + items.length) % items.length;
      items.forEach((it, k) => {
        it.classList.remove('is-open');
        if (k === i) { void it.offsetWidth; it.classList.add('is-open'); }
        $('.acc__btn', it).setAttribute('aria-expanded', k === i);
      });
      vis.forEach((v, k) => v.classList.toggle('is-active', k === i));
    }
    items.forEach((it, k) => {
      $('.acc__btn', it).addEventListener('click', () => open(k));
      $('.acc__bar i', it).addEventListener('animationend', () => { if (inView) open(i + 1); });
    });
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      panel.classList.toggle('is-paused', !inView);
    }, { threshold: 0.35 });
    io.observe(panel);
    panel.classList.add('is-paused');
    panel.addEventListener('mouseenter', () => panel.classList.add('is-paused'));
    panel.addEventListener('mouseleave', () => { if (inView) panel.classList.remove('is-paused'); });
    open(0);
  }

  /* ---------- BENTO ---------- */
  function bento() {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0.3 });
    $$('[data-bento]').forEach(b => io.observe(b));
  }
})();
