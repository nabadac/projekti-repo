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
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const show = v => dec
      ? v.toLocaleString('hr-HR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      : fmt(Math.round(v));
    if (reduced || !hasGsap) { el.textContent = show(end) + suffix; return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = show(o.v) + suffix; } });
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
    availability();
    pricing();
    booking();
    visit();
    reviews();
    newSectionAnimations();
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
    gsap.from(['.bform', '.callcard'], { y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.book__grid', start: 'top 85%' } });

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

  /* =========================================================
     SPECIJALNOSTI I DOSTUPNOST TERMINA
     ========================================================= */
  // `first` = koliko radnih dana do prvog slobodnog termina
  const SPECS = [
    { key: 'kardiologija', name: 'Kardiologija', exam: 'kardiološki pregled', first: 1 },
    { key: 'dermatologija', name: 'Dermatologija', exam: 'dermatološki pregled', first: 1 },
    { key: 'ortopedija', name: 'Ortopedija', exam: 'ortopedski pregled', first: 2 },
    { key: 'neurologija', name: 'Neurologija', exam: 'neurološki pregled', first: 4 },
    { key: 'ginekologija', name: 'Ginekologija', exam: 'ginekološki pregled', first: 1 },
    { key: 'pedijatrija', name: 'Pedijatrija', exam: 'pedijatrijski pregled', first: 0 },
    { key: 'ultrazvuk', name: 'Ultrazvuk', exam: 'ultrazvučni pregled', first: 1 },
    { key: 'laboratorij', name: 'Laboratorij', exam: 'vađenje krvi', first: 0 },
    { key: 'sistematski', name: 'Sistematski pregled', exam: 'sistematski pregled', first: 5 }
  ];
  const specByKey = Object.fromEntries(SPECS.map(sp => [sp.key, sp]));
  const DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
  const MONTHS = ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja', 'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenog', 'prosinca'];
  const TIMES = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30'];
  const isWorkday = d => d.getDay() > 0 && d.getDay() < 6;
  const dayStart = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  function addWorkdays(from, n) {
    const d = dayStart(from);
    // nakon 18 h ili vikendom prvi radni dan je sutra
    if (!isWorkday(d) || from.getHours() >= 18) { do { d.setDate(d.getDate() + 1); } while (!isWorkday(d)); }
    for (let i = 0; i < n; i++) { do { d.setDate(d.getDate() + 1); } while (!isWorkday(d)); }
    return d;
  }
  function relLabel(date, now = new Date()) {
    const diff = Math.round((dayStart(date) - dayStart(now)) / 864e5);
    if (diff === 0) return 'danas';
    if (diff === 1) return 'sutra';
    const monday = d => { const m = dayStart(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; };
    const weeks = Math.round((monday(date) - monday(now)) / (7 * 864e5));
    if (weeks === 0) return 'ovaj tjedan';
    if (weeks === 1) return 'sljedeći tjedan';
    return `${date.getDate()}. ${MONTHS[date.getMonth()]}`;
  }
  function firstFree(sp) {
    const d = addWorkdays(new Date(), sp.first);
    const diff = Math.round((d - dayStart(new Date())) / 864e5);
    return { date: d, label: relLabel(d), soon: diff <= 2 };
  }
  // deterministički "slobodni" termini za demo
  function slotsFor(sp) {
    const now = new Date();
    const out = [];
    let d = addWorkdays(now, sp.first);
    for (let day = 0; day < 5; day++) {
      const seed = d.getDate() * 31 + sp.key.length * 7 + day;
      const times = TIMES.filter((t, i) => (seed + i * 5) % 3 !== 0);
      const today = dayStart(d).getTime() === dayStart(now).getTime();
      const free = times.filter(t => !today || +t.slice(0, 2) > now.getHours() + 1);
      if (free.length) out.push({ date: new Date(d), times: free });
      do { d.setDate(d.getDate() + 1); } while (!isWorkday(d));
    }
    return out;
  }
  const dateLong = d => `${DAYS[d.getDay()][0].toUpperCase()}${DAYS[d.getDay()].slice(1)}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;

  function availability() {
    // oznake na karticama liječnika i na ploči uz telefon
    $$('[data-avail]').forEach(el => {
      const sp = specByKey[el.dataset.avail];
      if (!sp) return;
      const f = firstFree(sp);
      el.classList.toggle('avail--week', !f.soon);
      el.innerHTML = `Prvi termin: <b>${f.label}</b>`;
    });
    const board = $('[data-avboard]');
    if (board) {
      board.innerHTML = SPECS.slice(0, 6).map(sp => {
        const f = firstFree(sp);
        return `<li><span>${sp.name}</span><span class="avail${f.soon ? '' : ' avail--week'}"><b>${f.label}</b></span></li>`;
      }).join('');
    }

    // hero: izmjenjuje specijalnosti, počinje s kardiologijom
    const chip = $('[data-hero-avail]');
    if (!chip) return;
    const txt = $('.avail-chip__txt', chip);
    const order = ['kardiologija', 'dermatologija', 'ortopedija', 'neurologija', 'pedijatrija'].map(k => specByKey[k]);
    let i = 0;
    const paint = () => {
      const sp = order[i];
      txt.innerHTML = `Prvi slobodni termini za ${sp.exam}: <b>${firstFree(sp).label}</b>`;
      chip.dataset.book = sp.key;
    };
    paint();
    if (reduced) return;
    setInterval(() => {
      txt.classList.add('is-out');
      setTimeout(() => { i = (i + 1) % order.length; paint(); txt.classList.remove('is-out'); }, 380);
    }, 4800);
  }

  /* =========================================================
     CJENIK S PRETRAGOM
     ========================================================= */
  const PRICES = [
    ['Kardiologija', 'Specijalistički kardiološki pregled', '30 min', 90, 0, 'srce pregled kardiolog'],
    ['Kardiologija', 'UZV srca (ehokardiografija)', '30 min', 110, 0, 'srce eho ultrazvuk'],
    ['Kardiologija', 'EKG s tumačenjem', '10 min', 25, 0, 'srce elektrokardiogram ekg'],
    ['Kardiologija', 'Holter EKG 24 h', '24 h', 85, 0, 'srce ritam holter'],
    ['Kardiologija', 'Holter tlaka 24 h', '24 h', 75, 0, 'tlak hipertenzija holter'],
    ['Kardiologija', 'Ergometrija (test opterećenja)', '45 min', 95, 0, 'srce test opterecenja bicikl'],
    ['Dermatologija', 'Dermatološki pregled', '20 min', 70, 0, 'koza pregled'],
    ['Dermatologija', 'Digitalna dermatoskopija madeža', '30 min', 80, 0, 'madez madezi mladez koza'],
    ['Dermatologija', 'Uklanjanje kožne promjene', '30 min', 120, 1, 'madez kirurski zahvat'],
    ['Ortopedija', 'Ortopedski pregled', '20 min', 80, 0, 'kosti zglobovi koljeno rame kraljeznica'],
    ['Ortopedija', 'UZV koljena ili ramena', '20 min', 65, 0, 'ultrazvuk zglob'],
    ['Ortopedija', 'Intraartikularna injekcija pod UZV-om', '20 min', 90, 0, 'injekcija koljeno zglob'],
    ['Neurologija', 'Neurološki pregled', '30 min', 85, 0, 'glavobolja migrena zivci'],
    ['Neurologija', 'EMNG (elektromioneurografija)', '45 min', 140, 0, 'zivci misici emng'],
    ['Neurologija', 'EEG', '40 min', 95, 0, 'mozak elektroencefalogram'],
    ['Ginekologija', 'Ginekološki pregled s UZV-om', '30 min', 85, 0, 'ginekolog ultrazvuk'],
    ['Ginekologija', 'PAPA test', '10 min', 25, 0, 'papa test bris'],
    ['Pedijatrija', 'Pedijatrijski pregled', '30 min', 60, 0, 'dijete djeca pedijatar'],
    ['Ultrazvuk', 'UZV abdomena', '20 min', 70, 0, 'trbuh jetra bubrezi ultrazvuk'],
    ['Ultrazvuk', 'UZV štitnjače', '15 min', 60, 0, 'stitnjaca stitna ultrazvuk'],
    ['Ultrazvuk', 'UZV dojki', '20 min', 70, 0, 'dojka ultrazvuk'],
    ['Laboratorij', 'Kompletna krvna slika (KKS)', '5 min', 8, 0, 'krv kks vadenje'],
    ['Laboratorij', 'Lipidogram', '5 min', 14, 0, 'kolesterol trigliceridi krv'],
    ['Laboratorij', 'Glukoza u krvi', '5 min', 3, 0, 'secer dijabetes krv'],
    ['Laboratorij', 'TSH', '5 min', 12, 0, 'stitnjaca hormon krv'],
    ['Laboratorij', 'Vitamin D', '5 min', 25, 0, 'vitamin d krv'],
    ['Laboratorij', 'HbA1c', '5 min', 15, 0, 'secer dijabetes krv'],
    ['Sistematski', 'Sistematski pregled · Osnovni', '90 min', 149, 0, 'paket sistematski'],
    ['Sistematski', 'Sistematski pregled · Prošireni', '2,5 h', 289, 0, 'paket sistematski'],
    ['Sistematski', 'Sistematski pregled · Premium', '3,5 h', 449, 0, 'paket sistematski']
  ].map(([cat, name, dur, price, from, kw]) => ({ cat, name, dur, price, from: !!from, kw }));

  // normalizacija znak po znak (indeksi ostaju poravnati za isticanje)
  const normChar = c => c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace('đ', 'd')[0] || c;
  const norm = str => [...str].map(normChar).join('');
  const esc = str => str.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const euro = n => n.toLocaleString('hr-HR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
  const rateText = n => n >= 150 ? `ili <b>12 × ${(n / 12).toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</b> bez kamata` : '';

  function highlight(text, tokens) {
    if (!tokens.length) return esc(text);
    const n = norm(text);
    const marks = new Array(text.length).fill(false);
    tokens.forEach(t => { let i = n.indexOf(t); while (i > -1) { for (let k = i; k < i + t.length; k++) marks[k] = true; i = n.indexOf(t, i + 1); } });
    let out = '', open = false;
    [...text].forEach((c, i) => {
      if (marks[i] && !open) { out += '<mark>'; open = true; }
      if (!marks[i] && open) { out += '</mark>'; open = false; }
      out += esc(c);
    });
    return out + (open ? '</mark>' : '');
  }

  function pricing() {
    $$('[data-rate]').forEach(el => { el.innerHTML = rateText(+el.dataset.rate); });
    const input = $('[data-psearch]');
    const list = $('[data-plist]');
    if (!input || !list) return;
    const chipsWrap = $('[data-pchips]');
    const count = $('[data-pcount]');
    const empty = $('[data-pempty]');
    const cats = [...new Set(PRICES.map(p => p.cat))];
    let cat = 'Sve';
    let refreshT;

    chipsWrap.innerHTML = ['Sve', ...cats].map(c => `<button type="button" aria-pressed="${c === cat}">${c}</button>`).join('');
    chipsWrap.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      cat = b.textContent;
      $$('button', chipsWrap).forEach(x => x.setAttribute('aria-pressed', x === b));
      render();
    });

    function render() {
      const tokens = norm(input.value.trim()).split(/\s+/).filter(Boolean);
      const hits = PRICES.filter(p => {
        if (cat !== 'Sve' && p.cat !== cat) return false;
        const hay = norm(`${p.name} ${p.cat} ${p.kw}`);
        return tokens.every(t => hay.includes(t));
      });
      const groups = {};
      hits.forEach(p => (groups[p.cat] = groups[p.cat] || []).push(p));
      list.innerHTML = Object.entries(groups).map(([g, rows]) => `
        <div class="pgroup">
          <h3>${g}</h3>
          ${rows.map(p => `<div class="prow">
            <span class="prow__name">${highlight(p.name, tokens)}</span>
            <span class="prow__dur">${p.dur}</span>
            <span class="prow__price">${p.from ? '<small>od</small>' : ''}${euro(p.price)}</span>
          </div>`).join('')}
        </div>`).join('');
      empty.hidden = hits.length > 0;
      count.textContent = hits.length
        ? `Prikazano ${hits.length} od ${PRICES.length} usluga`
        : `Nema rezultata za „${input.value.trim()}”`;
      if (hasGsap) { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 250); }
    }
    input.addEventListener('input', render);
    // "/" fokusira pretragu
    addEventListener('keydown', e => {
      if (e.key !== '/' || /input|textarea|select/i.test(document.activeElement.tagName)) return;
      e.preventDefault();
      input.focus({ preventScroll: true });
      scrollTo(input, -140);
    });
    render();
  }

  /* =========================================================
     NARUČIVANJE (online obrazac)
     ========================================================= */
  let preselect = () => {};
  function booking() {
    const form = $('[data-bform]');
    if (!form) return;
    const spec = $('[data-bspec]', form);
    const slot = $('[data-bslot]', form);
    const hint = $('[data-bavail]', form);
    const err = $('[data-berror]', form);
    const fields = $('[data-bform-fields]', form);
    const done = $('[data-bdone]', form);
    const summary = $('[data-bsummary]', form);

    spec.insertAdjacentHTML('beforeend', SPECS.map(sp => `<option value="${sp.key}">${sp.name}</option>`).join(''));

    function fillSlots() {
      const sp = specByKey[spec.value];
      if (!sp) {
        slot.disabled = true;
        slot.innerHTML = '<option value="">Najprije odaberite granu medicine</option>';
        hint.innerHTML = '';
        return;
      }
      const f = firstFree(sp);
      hint.innerHTML = `<span class="avail${f.soon ? '' : ' avail--week'}">Prvi slobodni termini: <b>${f.label}</b></span>`;
      slot.innerHTML = '<option value="">Odaberite termin…</option>' + slotsFor(sp).map(day => {
        const rel = relLabel(day.date);
        const lbl = `${dateLong(day.date)}${/^\d/.test(rel) ? '' : ` (${rel})`}`;
        return `<optgroup label="${lbl}">${day.times.map(t => `<option value="${day.date.toISOString().slice(0, 10)}T${t}">${lbl.split(' (')[0]} u ${t}</option>`).join('')}</optgroup>`;
      }).join('');
      slot.disabled = false;
      spec.removeAttribute('aria-invalid');
    }
    spec.addEventListener('change', fillSlots);
    slot.addEventListener('change', () => slot.removeAttribute('aria-invalid'));
    $$('input', form).forEach(i => i.addEventListener('input', () => i.removeAttribute('aria-invalid')));

    preselect = key => {
      if (!specByKey[key]) return;
      spec.value = key;
      fillSlots();
      setTimeout(() => slot.focus({ preventScroll: true }), 1300);
    };
    $$('[data-book]').forEach(a => a.addEventListener('click', () => preselect(a.dataset.book)));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.elements.ime, phone = form.elements.mobitel, ok = form.elements.privola;
      const problems = [];
      const bad = (el, msg) => { el.setAttribute('aria-invalid', 'true'); problems.push(msg); };
      if (!spec.value) bad(spec, 'odaberite granu medicine');
      else if (!slot.value) bad(slot, 'odaberite termin');
      if (name.value.trim().length < 3) bad(name, 'upišite ime i prezime');
      if (phone.value.replace(/\D/g, '').length < 8) bad(phone, 'upišite ispravan broj mobitela');
      if (!ok.checked) problems.push('potvrdite privolu za kontakt');
      if (problems.length) {
        err.textContent = `Molimo ${problems.join(', ')}.`;
        err.hidden = false;
        const first = $('[aria-invalid="true"]', form) || ok;
        first.focus();
        return;
      }
      err.hidden = true;
      const opt = slot.selectedOptions[0];
      summary.textContent = `${name.value.trim()}, zaprimili smo zahtjev za termin: ${specByKey[spec.value].name}, ${opt.textContent}. Potvrdu šaljemo SMS-om na broj ${phone.value.trim()}.`;
      fields.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
    });
    $('[data-breset]', form).addEventListener('click', () => {
      form.reset();
      fillSlots();
      done.hidden = true;
      fields.hidden = false;
      spec.focus();
    });

    // fiksna traka za poziv ne smije prekrivati obrazac dok se tipka
    form.addEventListener('focusin', () => document.body.classList.add('is-typing'));
    form.addEventListener('focusout', () => document.body.classList.remove('is-typing'));
  }

  /* =========================================================
     KAKO DO NAS + RECENZIJE
     ========================================================= */
  function visit() {
    $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
      const label = $('span', btn);
      const prev = label.textContent;
      try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'Kopirano ✓'; }
      catch { label.textContent = btn.dataset.copy; }
      setTimeout(() => { label.textContent = prev; }, 2200);
    }));
  }
  function reviews() {
    const el = $('.reviews');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in-view'); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
  }
  function newSectionAnimations() {
    if (!hasGsap || reduced) return;
    const up = (targets, trigger, extra = {}) => gsap.from(targets, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger, start: 'top 85%' }, ...extra });
    up('.doc', '.team__grid');
    up('.review', '.reviews__list');
    up('.pkg', '.pkgs');
    up(['.ptool', '.paynote'], '.pricing__grid');
    up('.vrow', '.visit__info', { y: 24 });
    gsap.from('.visit__map', { clipPath: 'inset(10% 6% 10% 6% round 24px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.visit__grid', start: 'top 80%' } });
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
