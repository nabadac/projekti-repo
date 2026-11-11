/* Stolarija Vidović — motion (v2)
   GSAP + ScrollTrigger + Lenis (CDN). Bez biblioteka ili uz smanjeno kretanje
   sav je sadržaj odmah vidljiv, a slider, hero pločice i forma rade i dalje. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#yr').textContent = new Date().getFullYear();

  // ---------- Header, traka napretka, plutajući gumb, aktivni link ----------
  const header = $('#header');
  const fab = $('#fab');
  const hero = $('#vrh');
  const upit = $('#upit');
  const bar = $('#progress');
  const links = $$('.nav-pill a');
  const secs = links.map((a) => $(a.getAttribute('href')));
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    header.classList.toggle('hide', y > lastY + 2 && y > 500);
    if (y < lastY - 2) header.classList.remove('hide');
    lastY = y;
    const r = upit.getBoundingClientRect();
    const atForm = r.top < window.innerHeight * 0.8 && r.bottom > 0;
    fab.classList.toggle('show', y > hero.offsetHeight * 0.6 && !atForm);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    let cur = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Hero: pločice detalja mijenjaju pozadinu (auto svakih 6 s) ----------
  const imgs = $$('.hero-img');
  const thumbs = $$('.thumb');
  let hi = 0, timer = null;
  function showHero(i) {
    hi = i;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    thumbs.forEach((t, k) => {
      t.classList.toggle('is-on', k === i);
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      const ring = $('.ring', t); // restart animacije trake
      ring.style.animation = 'none'; void ring.offsetWidth; ring.style.animation = '';
    });
  }
  function auto() { clearInterval(timer); if (!reduced) timer = setInterval(() => showHero((hi + 1) % imgs.length), 6000); }
  thumbs.forEach((t) => t.addEventListener('click', () => { showHero(+t.dataset.i); auto(); }));
  auto();

  // ---------- Gumbi usluga unaprijed odaberu vrstu projekta ----------
  $$('[data-tip]').forEach((a) =>
    a.addEventListener('click', () => {
      const r = $$('.opts input').find((i) => i.value === a.dataset.tip);
      if (r) {
        r.checked = true;
        const f = $('.opts'); f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash');
      }
    })
  );

  // ---------- Forma ----------
  const form = $('#lead-form');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!form.ime.value.trim() || !form.telefon.value.trim()) { form.reportValidity(); return; }
    const data = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
      .catch(() => {}) // lokalno ne uspije — za demo je u redu
      .finally(() => {
        $('#form-view').style.display = 'none';
        $('#form-ok').classList.add('show');
      });
  });

  // ---------- Slider recenzija ----------
  const track = $('#quotes');
  const qs = $$('.quote', track);
  let qi = 0;
  function maxIndex() {
    const view = track.parentElement.clientWidth;
    const step = qs[0].offsetWidth + 16;
    return Math.max(0, Math.ceil((track.scrollWidth - view) / step));
  }
  function goQ(i) {
    qi = Math.max(0, Math.min(i, maxIndex()));
    track.style.transform = `translateX(${-qi * (qs[0].offsetWidth + 16)}px)`;
  }
  $('#next').addEventListener('click', () => goQ(qi >= maxIndex() ? 0 : qi + 1));
  $('#prev').addEventListener('click', () => goQ(qi <= 0 ? maxIndex() : qi - 1));
  window.addEventListener('resize', () => goQ(qi));

  // ---------- Izjava: riječi u spanove ----------
  const st = $('#stText');
  st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="sw">${w}</span>`).join(' ');

  // ================= MOTION =================
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (reduced || !hasGsap) {
    root.classList.add('no-motion');
    $$('.sw').forEach((s) => (s.style.opacity = 1));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  // Lenis
  if (typeof window.Lenis !== 'undefined') {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const el = id.length > 1 && $(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: id === '#vrh' ? 0 : -90, duration: 1.4 });
      })
    );
  }

  // Riječi naslova
  $$('.split').forEach((el) => {
    const t = el.textContent.trim();
    el.setAttribute('aria-label', t);
    el.innerHTML = t.split(/\s+/).map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
  });

  // ----- Intro heroja -----
  gsap.set('.hero-title .line > span', { yPercent: 110 });
  gsap.set('[data-hero]', { y: 26, autoAlpha: 0 });
  gsap.set('.thumb', { y: 30, autoAlpha: 0 });
  gsap.set('.nav > *', { y: -16, autoAlpha: 0 });
  gsap.timeline({ defaults: { ease }, delay: 0.15 })
    .from('.hero-bg', { scale: 1.18, duration: 2.4, ease: 'power3.out' }, 0)
    .to('.nav > *', { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, 0.3)
    .to('.hero-in .chip', { y: 0, autoAlpha: 1, duration: 1 }, 0.35)
    .to('.hero-title .line > span', { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.45)
    .to('.hero-lead, .hero-cta', { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1 }, 0.8)
    .to('.hero-thumbs', { y: 0, autoAlpha: 1, duration: 0.01 }, 0.9)
    .to('.thumb', { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, 0.95);

  gsap.to('.hero-bg', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-in', { yPercent: -25, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

  // ----- Naslovi i oznake -----
  $$('.split').forEach((el) => {
    gsap.from(el.querySelectorAll('.w > span'), { yPercent: 110, duration: 1.2, stagger: 0.045, ease, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });
  $$('.blk .chip, .values .chip, .sec-head p:not(.chip)').forEach((el) => {
    gsap.from(el, { y: 20, autoAlpha: 0, duration: 0.9, ease, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  // Maskirane slike: otkrivanje + parallax
  $$('.mask').forEach((m) => {
    const img = $('img', m);
    gsap.fromTo(m, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 85%', once: true } });
    gsap.fromTo(img, { yPercent: -8, scale: 1.15 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ----- Priča -----
  gsap.from('.pull, .about-body p, .about-actions, .tags-title', { y: 26, autoAlpha: 0, duration: 1, stagger: 0.1, ease, scrollTrigger: { trigger: '.about-copy', start: 'top 70%', once: true } });
  gsap.from('.tags li', { y: 14, scale: 0.9, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(2)', scrollTrigger: { trigger: '.tags', start: 'top 92%', once: true } });
  gsap.fromTo('.about-macro', { y: 60 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.about-visual', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.stamp', { scale: 0, rotate: -140, duration: 1.4, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.about-visual', start: 'top 70%', once: true } });
  gsap.to('.stamp-ring', { rotate: 360, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });

  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });
  gsap.from('.stat', { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease, scrollTrigger: { trigger: '.stats', start: 'top 90%', once: true } });

  // ----- Usluge (bento) -----
  $$('.svc').forEach((c, i) => {
    gsap.fromTo(c, { clipPath: 'inset(12% 6% 0% 6% round 22px)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', y: 0, duration: 1.4, ease, scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
    gsap.from($('.svc-card', c), { y: 40, autoAlpha: 0, duration: 1.1, delay: 0.25, ease, scrollTrigger: { trigger: c, start: 'top 85%', once: true } });
    gsap.fromTo($('.svc-media img', c), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ----- Vrijednosti: horizontalni pin na desktopu -----
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const tr = $('.values-track');
    const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth);
    gsap.to(tr, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.values-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
  });
  gsap.from('.val', { y: 80, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease, scrollTrigger: { trigger: '.values-track', start: 'top 92%', once: true } });

  // ----- Marquee (brzina prema skrolu) -----
  const mt = $('.marquee-track');
  let mx = 0, dir = -1, sp = 0.7;
  ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: (s) => { dir = s.direction === 1 ? -1 : 1; sp = 0.7 + Math.min(Math.abs(s.getVelocity()) / 280, 7); } });
  // footer wordmark
  const fg = $('.fg-track');
  let fx = 0;
  gsap.ticker.add(() => {
    mx += dir * sp; sp += (0.7 - sp) * 0.04;
    const h = mt.scrollWidth / 2;
    if (mx <= -h) mx += h; if (mx > 0) mx -= h;
    mt.style.transform = `translate3d(${mx}px,0,0)`;
    fx -= 0.5; const fh = fg.scrollWidth / 2; if (fx <= -fh) fx += fh;
    fg.style.transform = `translate3d(${fx}px,0,0)`;
  });

  // ----- Izjava: riječi se pale skrolom -----
  const sws = $$('.sw');
  ScrollTrigger.create({
    trigger: '.statement', start: 'top 70%', end: 'bottom 60%', scrub: true,
    onUpdate: (s) => { const n = Math.round(s.progress * sws.length); sws.forEach((w, i) => (w.style.opacity = i < n ? 1 : 0.25)); },
  });
  gsap.fromTo('.st-media img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ----- Kako radimo: koraci se pale redom -----
  const steps = $$('.step');
  gsap.from(steps, { x: 40, autoAlpha: 0, duration: 1, stagger: 0.12, ease, scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } });
  ScrollTrigger.create({
    trigger: '.steps', start: 'top 65%', end: 'bottom 45%', scrub: true,
    onUpdate: (s) => { const k = Math.min(steps.length - 1, Math.floor(s.progress * steps.length)); steps.forEach((st, i) => st.classList.toggle('on', i === k)); },
  });

  // ----- Recenzije -----
  gsap.from('.quote', { y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.12, ease, scrollTrigger: { trigger: '.quotes', start: 'top 85%', once: true } });

  // ----- Prostori -----
  $$('.room').forEach((r, i) => {
    gsap.fromTo(r, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, delay: (i % 2) * 0.12, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 88%', once: true } });
    gsap.from($('figcaption', r), { y: 20, autoAlpha: 0, duration: 0.8, delay: 0.8, ease, scrollTrigger: { trigger: r, start: 'top 88%', once: true } });
  });

  // ----- Upit -----
  gsap.fromTo('.cta-bg img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.cta-lead, .crow', { y: 26, autoAlpha: 0, duration: 1, stagger: 0.08, ease, scrollTrigger: { trigger: '.cta', start: 'top 65%', once: true } });
  gsap.from('.form-card', { y: 100, rotate: 2, autoAlpha: 0, duration: 1.4, ease, scrollTrigger: { trigger: '.cta', start: 'top 60%', once: true } });

  // ----- Footer -----
  gsap.from('.foot-top > *', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08, ease, scrollTrigger: { trigger: 'footer.site', start: 'top 90%', once: true } });

  // ----- Magnetski gumbi -----
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'elastic.out(1,.4)' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'elastic.out(1,.4)' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.2);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
