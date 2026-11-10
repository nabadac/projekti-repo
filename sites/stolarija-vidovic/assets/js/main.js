/* Stolarija Vidović — motion
   GSAP + ScrollTrigger + Lenis (CDN). Ako se biblioteke ne učitaju ili korisnik
   traži smanjeno kretanje, sav sadržaj je odmah vidljiv i stranica radi normalno. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;

  // ---------- Osnovno (radi i bez animacija) ----------
  $('#yr').textContent = new Date().getFullYear();

  const header = $('#header');
  const sticky = $('#sticky');
  const hero = $('#vrh');
  const upit = $('#upit');
  const bar = $('#progress');
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > lastY && y > 400);
    lastY = y;
    const pastHero = y > hero.offsetHeight * 0.55;
    const atForm = upit.getBoundingClientRect().top < window.innerHeight * 0.7;
    sticky.classList.toggle('show', pastHero && !atForm);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Gumb "Zatražite ponudu" na radovima unaprijed odabere vrstu projekta
  $$('[data-tip]').forEach((a) =>
    a.addEventListener('click', () => {
      const sel = $('#tip');
      const opt = Array.from(sel.options).find((o) => o.text === a.dataset.tip);
      if (opt) {
        sel.value = opt.value;
        const f = sel.closest('.field');
        f.classList.add('flash');
        setTimeout(() => f.classList.remove('flash'), 1400);
      }
    })
  );

  // Forma: pokušaj Netlify slanje, u svakom slučaju prikaži potvrdu (za demo)
  const form = $('#lead-form');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!form.ime.value.trim() || !form.telefon.value.trim()) {
      form.reportValidity();
      return;
    }
    const data = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
      .catch(() => {}) // na lokalnom pregledu fetch ne uspije — to je ok za demo
      .finally(() => {
        $('#form-view').style.display = 'none';
        $('#form-ok').classList.add('show');
        $('#form-ok').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  });

  // ---------- Motion ----------
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (reduced || !hasGsap) {
    root.classList.add('no-motion');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  // Lenis glatki skrol
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // sidra idu kroz Lenis
    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const el = id.length > 1 && $(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: id === '#vrh' ? 0 : -70, duration: 1.4 });
      })
    );
  }

  // Razbij naslove na riječi za maskirani reveal
  $$('.split').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
  });

  // ----- Loader + intro -----
  const intro = gsap.timeline({ defaults: { ease } });
  gsap.set('.hero-title .line > span', { yPercent: 110 });
  gsap.set('[data-hero]', { y: 24, autoAlpha: 0 });
  gsap.set('.hero-media-in', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.hero-media-in img', { scale: 1.25 });
  gsap.set('.hero-stamp', { scale: 0, rotate: -120 });
  gsap.set('header.site .nav > *', { y: -20, autoAlpha: 0 });

  intro
    .to('.lm-ring', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.12 })
    .to('.lm-sv', { opacity: 1, duration: 0.5 }, '-=.5')
    .to('.loader-line span', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0)
    .to('#loader', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=.15')
    .set('#loader', { display: 'none' })
    .to('header.site .nav > *', { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, '-=.55')
    .to('.hero-eyebrow', { y: 0, autoAlpha: 1, duration: 1 }, '-=.9')
    .to('.hero-title .line > span', { yPercent: 0, duration: 1.3, stagger: 0.1 }, '-=.9')
    .to('.hero-lead, .hero-cta', { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1 }, '-=1')
    .to('.hero-media-in', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, '-=1.2')
    .to('.hero-media-in img', { scale: 1, duration: 1.8 }, '<')
    .to('.hero-stamp', { scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.6)' }, '-=1');

  // Hero: parallax fotografije, pojas teksta lagano odlazi, žig se vrti
  gsap.to('.hero-media-in img', {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.hero-media', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-copy', {
    yPercent: -18, autoAlpha: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.hero-band', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.stamp-ring', {
    rotate: 360, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
  });

  // Brojke
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, {
      v: end, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = Math.round(o.v)),
    });
  });
  gsap.from('.stat', {
    y: 30, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease,
    scrollTrigger: { trigger: '.trust', start: 'top 88%', once: true },
  });

  // Marquee: beskonačno, ubrzava i mijenja smjer s brzinom skrola
  const track = $('.marquee-track');
  if (track) {
    let x = 0, dir = -1, speed = 0.6;
    const half = () => track.scrollWidth / 2;
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: (s) => {
        dir = s.direction === 1 ? -1 : 1;
        speed = 0.6 + Math.min(Math.abs(s.getVelocity()) / 300, 6);
      },
    });
    gsap.ticker.add(() => {
      x += dir * speed;
      speed += (0.6 - speed) * 0.04;
      const h = half();
      if (x <= -h) x += h;
      if (x > 0) x -= h;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

  // Naslovi sekcija: riječi izlaze iz maske
  $$('.split').forEach((el) => {
    if (el.closest('.row-card')) return; // u karticama ih animira timeline reda
    gsap.from(el.querySelectorAll('.w > span'), {
      yPercent: 110, duration: 1.2, stagger: 0.05, ease,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });
  $$('.sec-head').forEach((h) => {
    gsap.from(h.querySelectorAll('.eyebrow, p'), {
      y: 24, autoAlpha: 0, duration: 1, stagger: 0.12, ease,
      scrollTrigger: { trigger: h, start: 'top 86%', once: true },
    });
  });

  // Redovi: tonirani blok klizi, fotografija se otkriva, kartica se podiže, oznaka se iscrta
  $$('.row').forEach((row) => {
    const left = row.classList.contains('row--left');
    const tint = $('.row-tint', row);
    const media = $('.row-media-in', row);
    const img = $('.row-media-in img', row);
    const card = $('.row-card', row);
    const mark = $$('.mini-mark circle', row);
    const markTxt = $('.mini-mark text', row);
    const inner = card.querySelectorAll('.eyebrow, h3, .meta, .pull, .story-body p, .btn');
    const words = card.querySelectorAll('.split .w > span');

    mark.forEach((c) => {
      const len = 2 * Math.PI * c.r.baseVal.value;
      gsap.set(c, { strokeDasharray: len, strokeDashoffset: len });
    });

    const tl = gsap.timeline({ defaults: { ease }, scrollTrigger: { trigger: row, start: 'top 78%', once: true } });
    tl.from(tint, { xPercent: left ? -100 : 100, duration: 1.6, ease: 'expo.inOut' })
      .fromTo(media, { clipPath: left ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .from(img || media, { scale: 1.3, duration: 2 }, 0.15)
      .from(card, { y: 90, autoAlpha: 0, duration: 1.4 }, 0.55)
      .to(mark, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: 'power2.inOut' }, 0.8)
      .from(markTxt, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.8 }, 1.2)
      .from(words, { yPercent: 110, duration: 1.1, stagger: 0.04 }, 0.95)
      .from(inner, { y: 22, autoAlpha: 0, duration: 1, stagger: 0.08 }, 1);

    if (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
    // kartica blago "pluta" suprotno od fotografije
    gsap.fromTo(card, { y: 30 }, {
      y: -30, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Vrijednosti: linije i stavke redom
  gsap.from('.values li', {
    y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.12, ease,
    scrollTrigger: { trigger: '.values', start: 'top 85%', once: true },
  });

  // Proces: linija se iscrtava skrolom i pali korake
  const mq = window.matchMedia('(max-width: 900px)');
  const steps = $$('.step');
  gsap.fromTo('.steps-line span', { scaleX: 0, scaleY: 0 }, {
    scaleX: mq.matches ? 1 : 1, scaleY: 1, ease: 'none',
    scrollTrigger: {
      trigger: '.steps', start: 'top 75%', end: mq.matches ? 'bottom 60%' : 'top 25%', scrub: 0.6,
      onUpdate: (s) => steps.forEach((st, i) => st.classList.toggle('on', s.progress >= i / steps.length + 0.02)),
    },
  });
  gsap.from(steps, {
    y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.15, ease,
    scrollTrigger: { trigger: '.steps', start: 'top 80%', once: true },
  });

  // Recenzije: ulaze s laganim nagibom, zvjezdice se pale redom
  gsap.from('.quote', {
    y: 80, rotateX: -18, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.3, stagger: 0.14, ease,
    scrollTrigger: { trigger: '.quotes', start: 'top 82%', once: true },
  });
  gsap.from('.quote .stars i', {
    scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(3)', delay: 0.5,
    scrollTrigger: { trigger: '.quotes', start: 'top 82%', once: true },
  });
  // 3D nagib prema mišu
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.quote').forEach((q) => {
      q.addEventListener('mousemove', (e) => {
        const r = q.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(q, { rotateY: px * 8, rotateX: -py * 8, y: -6, duration: 0.6, ease: 'power3.out' });
      });
      q.addEventListener('mouseleave', () => gsap.to(q, { rotateY: 0, rotateX: 0, y: 0, duration: 0.8, ease: 'power3.out' }));
    });
  }

  // CTA: parallax pozadine, sadržaj i forma ulaze
  gsap.fromTo('.cta-bg img', { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.from('.cta-copy .eyebrow, .cta-lead, .crow', {
    y: 30, autoAlpha: 0, duration: 1.1, stagger: 0.08, ease,
    scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true },
  });
  gsap.from('.form-card', {
    y: 100, autoAlpha: 0, duration: 1.4, ease,
    scrollTrigger: { trigger: '.cta', start: 'top 65%', once: true },
  });
  gsap.from('.form-card .field, .form-card .btn', {
    y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease, delay: 0.35,
    scrollTrigger: { trigger: '.cta', start: 'top 65%', once: true },
  });

  // Footer: veliki natpis izlazi odozdo, pločica i stupci
  gsap.from('.foot-giant', {
    yPercent: 60, ease: 'none',
    scrollTrigger: { trigger: 'footer.site', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
  gsap.from('.foot-top > *', {
    y: 30, autoAlpha: 0, duration: 1, stagger: 0.08, ease,
    scrollTrigger: { trigger: 'footer.site', start: 'top 88%', once: true },
  });

  // Magnetski gumbi
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'elastic.out(1,.4)' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'elastic.out(1,.4)' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  // Slike koje se kasnije učitaju mijenjaju visinu — osvježi okidače
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
