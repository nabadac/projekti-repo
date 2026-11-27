(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Hero: pokreni ulaz kad se fotografija učita (ili najkasnije nakon 1.2 s) */
  const heroImg = $('.hero__media img');
  let started = false;
  const start = () => { if (started) return; started = true; requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-in'))); };
  if (heroImg && !heroImg.complete) { heroImg.addEventListener('load', start, { once: true }); heroImg.addEventListener('error', start, { once: true }); setTimeout(start, 1200); }
  else start();

  /* Glatko skrolanje */
  let lenis = null;
  const hdr = $('#hdr');
  const hdrOffset = () => -(hdr ? hdr.offsetHeight : 0) + 1;
  const initLenis = () => {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };
  if (window.Lenis) initLenis(); else window.addEventListener('load', initLenis, { once: true });

  const scrollToHash = hash => {
    const el = hash === '#top' ? document.body : $(hash);
    if (!el) return;
    if (lenis) lenis.scrollTo(hash === '#top' ? 0 : el, { offset: hdrOffset() });
    else window.scrollTo({ top: hash === '#top' ? 0 : el.getBoundingClientRect().top + scrollY + hdrOffset(), behavior: reduce ? 'auto' : 'smooth' });
  };

  /* Izbornik */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); lenis && lenis.stop(); }
    else { menu.classList.remove('is-open'); lenis && lenis.start(); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 500); }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    if (burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    scrollToHash(hash);
    history.replaceState(null, '', hash);
  }));

  /* Zaglavlje i mobilna traka */
  const mbar = $('.mbar'), heroEl = $('.hero'), quoteSec = $('#ponuda');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 24);
    const menuOpen = burger.getAttribute('aria-expanded') === 'true';
    hdr.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 400);
    lastY = y;
    if (mbar) {
      const pastHero = y > heroEl.offsetHeight * 0.6;
      const qr = quoteSec.getBoundingClientRect();
      const inQuote = qr.top < innerHeight && qr.bottom > 0;
      mbar.classList.toggle('is-on', pastHero && !inQuote);
    }
    parallax();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* Blagi parallax na velikoj fotografiji */
  const px = $('[data-parallax]');
  function parallax() {
    if (!px || reduce) return;
    const r = px.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height) / (innerHeight + r.height);
    px.style.transform = `translate3d(0, ${(-p * 16).toFixed(2)}%, 0)`;
  }

  /* Otkrivanje pri skrolanju, s kratkim razmakom unutar iste grupe */
  /* Elementi odrezani clip-pathom ne javljaju presjek, pa za njih promatramo roditelja */
  const targets = new Map();
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      (targets.get(en.target) || []).forEach(el => el.classList.add('is-seen'));
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  const watch = el => {
    const t = el.dataset.reveal === 'wipe' ? el.parentElement : el;
    if (!targets.has(t)) targets.set(t, []);
    targets.get(t).push(el);
    revealIO.observe(t);
  };

  const groups = new Map();
  $$('[data-reveal]').forEach(el => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    groups.set(parent, i + 1);
    if (i) el.style.setProperty('--d', `${Math.min(i * 70, 280)}ms`);
    watch(el);
  });

  /* Galerija: zavjesa po stupcima kad uđe u kadar */
  const gallery = $('#gallery');
  const items = $$('li', gallery);
  items.forEach((li, i) => {
    const g = $('.g', li);
    g.dataset.reveal = 'wipe';
    g.style.setProperty('--d', `${(i % 3) * 90}ms`);
    li.style.viewTransitionName = `g${i}`;
    watch(g);
  });

  /* Usluge: fotografija se mijenja s odabranom uslugom */
  const svcItems = $$('.svc__item');
  const svcImgs = $$('#svc-media img');
  const setSvc = item => {
    const n = +item.dataset.img;
    svcItems.forEach(x => x.classList.toggle('is-active', x === item));
    svcImgs.forEach((img, i) => img.classList.toggle('is-active', i === n));
  };
  svcItems.forEach(item => {
    const btn = $('.svc__btn', item);
    btn.addEventListener('mouseenter', () => matchMedia('(hover: hover)').matches && setSvc(item));
    btn.addEventListener('focus', () => setSvc(item));
    btn.addEventListener('click', () => setSvc(item));
  });

  /* Filtar radova */
  const chips = $$('.chip');
  const applyFilter = f => {
    items.forEach(li => li.classList.toggle('is-out', f !== 'sve' && !li.dataset.cat.split(' ').includes(f)));
    items.forEach(li => { const g = $('.g', li); if (!li.classList.contains('is-out')) g.classList.add('is-seen'); });
  };
  chips.forEach(chip => chip.addEventListener('click', () => {
    if (chip.classList.contains('is-on')) return;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
    const f = chip.dataset.f;
    if (document.startViewTransition && !reduce) document.startViewTransition(() => applyFilter(f));
    else applyFilter(f);
  }));

  /* Lightbox */
  const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count');
  let cur = 0, opener = null;
  const visible = () => items.filter(li => !li.classList.contains('is-out')).map(li => $('.g', li));
  const show = (i, swap) => {
    const list = visible();
    cur = (i + list.length) % list.length;
    const g = list[cur], img = $('img', g);
    const set = () => {
      lbImg.src = g.dataset.full; lbImg.alt = img.alt;
      lbCap.textContent = $('.g__cap', g).textContent;
      lbCount.textContent = `${cur + 1} / ${list.length}`;
    };
    if (swap && !reduce) {
      lbImg.classList.add('is-swap');
      setTimeout(() => { set(); const done = () => lbImg.classList.remove('is-swap'); lbImg.complete ? requestAnimationFrame(done) : lbImg.addEventListener('load', done, { once: true }); }, 180);
    } else set();
  };
  items.forEach(li => $('.g', li).addEventListener('click', e => {
    opener = e.currentTarget;
    show(visible().indexOf(opener));
    lb.showModal();
    lenis && lenis.stop();
  }));
  $('#lb-prev').addEventListener('click', () => show(cur - 1, true));
  $('#lb-next').addEventListener('click', () => show(cur + 1, true));
  $('#lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => { lenis && lenis.start(); opener && opener.focus(); });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb__stage')) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(cur + 1, true);
    if (e.key === 'ArrowLeft') show(cur - 1, true);
  });
  let tx = null;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), true);
    tx = null;
  });

  /* Obrazac: provjera i priprema e-poruke */
  const form = $('#form');
  const rules = [['f-ime', v => v.trim().length > 1], ['f-tel', v => v.replace(/\D/g, '').length >= 6], ['f-msg', v => v.trim().length > 2]];
  const check = (id, ok) => {
    const input = $('#' + id), field = input.closest('.field');
    const valid = ok(input.value);
    field.classList.toggle('has-err', !valid);
    input.setAttribute('aria-invalid', !valid);
    const err = $('.field__err', field);
    if (!valid) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
    return valid;
  };
  rules.forEach(([id, ok]) => $('#' + id).addEventListener('input', () => { if ($('#' + id).closest('.field').classList.contains('has-err')) check(id, ok); }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = rules.map(([id, ok]) => check(id, ok));
    if (results.includes(false)) { $('#' + rules[results.indexOf(false)][0]).focus(); return; }
    const d = new FormData(form);
    const radovi = d.getAll('radovi').join(', ') || 'nije odabrano';
    const body = `Ime i prezime: ${d.get('ime')}\nTelefon: ${d.get('telefon')}\nRadovi: ${radovi}\nLokacija: ${d.get('lokacija') || '-'}\nPovršina: ${d.get('povrsina') || '-'}\n\n${d.get('poruka')}`;
    location.href = `mailto:info@soboslikanjevivid.hr?subject=${encodeURIComponent('Upit za ponudu: ' + d.get('ime'))}&body=${encodeURIComponent(body)}`;
    $('#form-ok').hidden = false;
  });

  $('#y').textContent = new Date().getFullYear();
  onScroll();
})();
