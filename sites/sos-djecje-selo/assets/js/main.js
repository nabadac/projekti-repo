/* SOS Dječje selo Hrvatska · interakcije i animacije
   Radi i bez GSAP-a (stranica ostaje potpuna, samo bez animacija pri skrolanju). */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- zaglavlje ---------- */
  const hdr = $('#hdr');
  const hero = $('.hero');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const heroEnd = hero ? hero.offsetHeight - 90 : 80;
    hdr.classList.toggle('is-solid', y > heroEnd || document.body.classList.contains('menu-open'));
    hdr.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilni izbornik ---------- */
  const burger = $('#burger');
  const mnav = $('#mnav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    mnav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    onScroll();
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- sela: tabovi ---------- */
  const villages = [
    {
      name: 'SOS Dječje selo Lekenik',
      coords: '45,58° N · 16,21° E',
      text: 'Naše prvo selo, otvoreno 1993. u Lekeniku, mjestu tridesetak kilometara jugoistočno od Zagreba. Petnaest obiteljskih kuća okruženo je vrtovima, igralištima i voćnjakom.',
      f1: '1993.', f2: '15', f3: 'Sisačko-moslavačka',
      note: 'Sela otvaraju vrata volonterima, donatorima i partnerima. Javite se i dogovorite posjet.',
      img: 'assets/img/lekenik.jpg', alt: 'Obitelj s djecom igra se u dvorištu ispred kuće'
    },
    {
      name: 'SOS Dječje selo Ladimirevci',
      coords: '45,63° N · 18,45° E',
      text: 'Selo u Slavoniji, nedaleko od Valpova, izgrađeno 1995. i otvoreno za prve obitelji 1997. Ravnica, suncokreti i velika dvorišta u kojima se uvijek nešto događa.',
      f1: '1997.', f2: 'Slavonija', f3: 'Osječko-baranjska',
      note: 'Djeca iz sela pohađaju školu u Ladimirevcima i treniraju u klubovima u Valpovu.',
      img: 'assets/img/ladimirevci.jpg', alt: 'Dvoje djece u zelenom vrtu punom biljaka'
    }
  ];
  const tabs = $$('.vtabs [role="tab"]');
  const glider = $('.vtabs__glider');
  const panel = $('#vpanel');
  const moveGlider = (btn) => {
    glider.style.width = btn.offsetWidth + 'px';
    glider.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
  };
  const showVillage = (i, focus) => {
    const v = villages[i];
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    moveGlider(tabs[i]);
    panel.setAttribute('aria-labelledby', tabs[i].id);
    panel.classList.add('is-swapping');
    setTimeout(() => {
      $$('[data-vfield]', panel).forEach(el => { el.textContent = v[el.dataset.vfield]; });
      const img = $('[data-vimg]', panel);
      img.src = v.img; img.alt = v.alt;
      requestAnimationFrame(() => panel.classList.remove('is-swapping'));
    }, reduce ? 0 : 320);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { if (t.getAttribute('aria-selected') !== 'true') showVillage(i); });
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        showVillage((i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length, true);
      }
    });
  });
  const initGlider = () => moveGlider(tabs.find(t => t.getAttribute('aria-selected') === 'true'));
  initGlider();
  addEventListener('resize', initGlider);
  document.fonts && document.fonts.ready.then(initGlider);
  new Image().src = villages[1].img;

  /* ---------- priče: carousel ---------- */
  const quotes = [
    ['„Kad je Lana prvi put rekla ‘idemo doma’, a mislila je na našu kuću u selu, znala sam da smo uspjeli.”', 'Ana, SOS mama'],
    ['„Najvažnije mi je bilo da me ne odvoje od sestre. Danas ona studira, a ja sam joj i dalje najveći navijač.”', 'Luka, odrastao u SOS obitelji'],
    ['„U programu za mlade naučio sam platiti račun, skuhati ručak i otići na prvi razgovor za posao. I da se uvijek mogu vratiti.”', 'Marko, 19 godina'],
    ['„Dvaput tjedno dolazim pomagati s matematikom. Djeca me dočekaju na vratima kao da sam dio obitelji.”', 'Petra, volonterka'],
    ['„Nedjeljni ručak kod nas traje dva sata. Svi pričaju odjednom, i to je najljepši zvuk u kući.”', 'Obitelj iz Ladimirevaca']
  ];
  const slides = $$('.slide');
  const quote = $('.quote');
  const qtext = $('#qtext'), qwho = $('#qwho'), qi = $('#qi');
  let cur = 0, timer;
  const go = (i) => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === cur));
    quote.classList.add('is-out');
    setTimeout(() => {
      qtext.textContent = quotes[cur][0];
      qwho.textContent = quotes[cur][1];
      qi.textContent = String(cur + 1).padStart(2, '0');
      quote.classList.remove('is-out');
    }, reduce ? 0 : 300);
  };
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(cur + 1), 6500); };
  slides.forEach((s, j) => s.addEventListener('click', () => { go(j); auto(); }));
  $('#prev').addEventListener('click', () => { go(cur - 1); auto(); });
  $('#next').addEventListener('click', () => { go(cur + 1); auto(); });
  const car = $('#carousel');
  car.addEventListener('mouseenter', () => clearInterval(timer));
  car.addEventListener('mouseleave', auto);
  slides[0].classList.add('is-active');
  auto();

  /* ---------- donacija ---------- */
  const dform = $('#dform');
  const dsum = $('#dsum'), dfreq = $('#dfreq'), dmsg = $('#dmsg');
  const updateSum = () => {
    const a = $('input[name="amt"]:checked', dform).value;
    const f = $('input[name="freq"]:checked', dform).value;
    dsum.textContent = a + ' €';
    dfreq.textContent = f === 'm' ? 'mjesečno' : 'jednokratno';
    if (hasGsap && !reduce) gsap.fromTo(dsum, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' });
  };
  dform.addEventListener('change', updateSum);
  dform.addEventListener('submit', e => {
    e.preventDefault();
    dmsg.textContent = 'Ovo je koncept stranice. U pravoj verziji ovdje se otvara siguran obrazac za plaćanje.';
  });

  /* ---------- newsletter ---------- */
  $('#nform').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#nemail').value.trim();
    $('#nmsg').textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? 'Hvala! Prvi broj stiže početkom sljedećeg mjeseca.'
      : 'Upišite e-adresu u obliku ime@domena.hr.';
  });

  /* ---------- FAQ: otvoreno samo jedno ---------- */
  const dets = $$('.acc details');
  dets.forEach(d => d.addEventListener('toggle', () => {
    if (!d.open) return;
    dets.forEach(o => { if (o !== d) o.open = false; });
    const a = $('.acc__a', d);
    if (hasGsap && !reduce) gsap.fromTo(a, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'height' });
  }));

  /* ---------- uključi se: paneli ---------- */
  const panels = $$('.panel');
  const openPanel = (p) => panels.forEach(o => o.classList.toggle('is-open', o === p));
  panels.forEach(p => {
    p.addEventListener('mouseenter', () => openPanel(p));
    p.addEventListener('focus', () => openPanel(p));
  });

  /* ---------- traka u podnožju: dupliciraj za beskonačnu petlju ---------- */
  const strip = $('.foot__strip');
  if (strip) $$('img', strip).forEach(img => strip.appendChild(img.cloneNode()));

  /* ---------- trake mjerača ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .6 });
    $$('.meter').forEach(m => io.observe(m));
  } else {
    $$('.meter').forEach(m => m.classList.add('is-in'));
  }

  /* ---------- magnetski gumbi ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => {
        b.style.transition += ', transform .5s cubic-bezier(.2,.7,.1,1)';
        b.style.transform = '';
      });
    });
  }

  /* ================= GSAP ================= */
  if (!hasGsap) { $$('.intro__text .w').forEach(w => (w.style.opacity = 1)); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Lenis glatko skrolanje
  if (!reduce && typeof window.Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === '#top' ? 0 : -70 });
    }));
  }

  // podijeli tekst u riječi
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = 'w'; s.style.display = 'inline-block'; s.textContent = part;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'svg') {
          walk(n);
        }
      });
    };
    walk(el);
    return $$('.w', el);
  };

  if (reduce) {
    $$('.intro__text .w').forEach(w => (w.style.opacity = 1));
    $$('[data-count]').forEach(el => (el.textContent = el.dataset.count));
    return;
  }

  /* --- hero uvod --- */
  const u = $('.u path');
  if (u) { const L = u.getTotalLength(); gsap.set(u, { strokeDasharray: L, strokeDashoffset: L }); }
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero__img', { scale: 1.18, duration: 2.4, ease: 'power2.out' }, 0)
    .from('.hero__title .ln > span', { yPercent: 110, duration: 1.2, stagger: .12 }, .15)
    .to(u, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, .9)
    .from('.hero .reveal-up', { y: 24, opacity: 0, duration: 1, stagger: .1 }, .5)
    .from('.hero__card', { y: 40, opacity: 0, rotate: 3, duration: 1.2 }, 1)
    .from('.hdr__in > *', { y: -20, opacity: 0, duration: .8, stagger: .06 }, .2);

  gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__in', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });

  /* --- uvodni tekst se "puni" skrolanjem --- */
  $$('[data-fill]').forEach(el => {
    const ws = splitWords(el);
    gsap.to(ws, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  });

  /* --- naslovi: riječi izranjaju --- */
  $$('.split').forEach(h => {
    const ws = splitWords(h);
    gsap.from(ws, { yPercent: 60, opacity: 0, rotate: 4, duration: 1, stagger: .05, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });

  /* --- pill oznake i lead tekstovi --- */
  $$('.sec-lead, .pill:not(.hero .pill)').forEach(el => {
    gsap.from(el, { y: 20, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* --- brojači --- */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: end, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* --- parallax kolaž --- */
  $$('.par').forEach(el => {
    const sp = +el.dataset.speed || 5;
    gsap.fromTo(el, { yPercent: -sp }, { yPercent: sp, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($('img', el), { scale: 1.25, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 30%', scrub: true } });
  });
  gsap.fromTo('.donate__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.donate', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* --- načela: kartice se slažu jedna na drugu --- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const cards = $$('.pcard');
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(c, {
        scale: .92, filter: 'brightness(.94)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true }
      });
    });
    cards.forEach(c => gsap.from($('.pcard__img img', c), { scale: 1.2, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 25%', scrub: true } }));
  });

  /* --- programi i paneli ulaze --- */
  gsap.from('.prog__item', { y: 60, opacity: 0, duration: 1.1, stagger: .14, ease: 'power3.out', scrollTrigger: { trigger: '.prog', start: 'top 80%' } });
  gsap.from('.panel', { y: 60, opacity: 0, duration: 1.1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.panels', start: 'top 82%' } });
  gsap.from('.vstats > div', { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.vstats', start: 'top 88%' } });
  gsap.from('.vpanel__card', { x: -40, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.vpanel', start: 'top 75%' } });
  gsap.from('.vpanel__img', { clipPath: 'inset(0 0 0 100% round 28px)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: '.vpanel', start: 'top 75%' } });
  gsap.from('.dform', { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.dform', start: 'top 85%' } });
  gsap.from('.acc details', { y: 24, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.acc', start: 'top 85%' } });
  gsap.from('.faq__img', { clipPath: 'inset(12% 12% 12% 12% round 28px)', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.faq__img', start: 'top 85%' } });
  gsap.from('.collage figure', { opacity: 0, y: 60, duration: 1.2, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.collage', start: 'top 85%' } });

  /* --- val galerija: fotografije plove po sinusoidi --- */
  const rows = $$('.wave__row');
  document.documentElement.classList.add('js-wave');
  const rowData = rows.map(row => {
    const orig = $$('img', row);
    // dupliciraj dok traka nije dovoljno duga za široke ekrane
    while ($$('img', row).length < 22) orig.forEach(img => row.appendChild(img.cloneNode()));
    return { row, imgs: $$('img', row), dir: +row.dataset.dir, off: 0 };
  });
  let speedBoost = 0;
  ScrollTrigger.create({ trigger: '.wave', start: 'top bottom', end: 'bottom top', onUpdate: self => { speedBoost = Math.min(Math.abs(self.getVelocity()) / 400, 6); } });
  let visible = false;
  ScrollTrigger.create({ trigger: '.wave', start: 'top bottom', end: 'bottom top', onToggle: s => (visible = s.isActive) });
  const tick = (t, dt) => {
    if (!visible) return;
    const W = rows[0].clientWidth;
    rowData.forEach((d, ri) => {
      const size = d.imgs[0].offsetWidth || 100;
      const step = size + 16;
      const total = step * d.imgs.length;
      d.off += d.dir * (0.035 + speedBoost * .03) * dt;
      const amp = Math.min(W * .035, 46);
      d.imgs.forEach((img, i) => {
        let x = ((i * step + d.off) % total + total) % total - step;
        const phase = (x / W) * Math.PI * 2 + ri * Math.PI;
        const y = Math.sin(phase) * amp;
        const r = Math.cos(phase) * 7;
        img.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
      });
    });
    speedBoost *= .94;
  };
  gsap.ticker.add((t, dt) => tick(t, dt));

  addEventListener('load', () => ScrollTrigger.refresh());
})();
