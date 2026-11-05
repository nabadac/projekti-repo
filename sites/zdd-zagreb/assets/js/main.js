/* Zagrebačko dijabetičko društvo · koncept · bez vanjskih biblioteka */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  /* zaglavlje: prozirno nad herojem, puno nakon njega, skriva se pri skrolanju dolje */
  const hdr = $('#hdr');
  const hero = $('.hero');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const past = y > hero.offsetHeight - 90;
    hdr.classList.toggle('is-solid', past || $('#mnav').hidden === false);
    hdr.classList.toggle('is-hidden', past && y > lastY && y > 400 && $('#mnav').hidden);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobilni izbornik */
  const burger = $('#burger');
  const mnav = $('#mnav');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    mnav.hidden = !open;
    onScroll();
  };
  burger.addEventListener('click', () => setMenu(mnav.hidden));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* padajući izbornik na tipkovnici / dodiru */
  $$('.nav__drop').forEach(li => {
    const b = $('button', li);
    b.addEventListener('click', () => {
      const open = !li.classList.contains('is-open');
      li.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open);
    });
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) { li.classList.remove('is-open'); b.setAttribute('aria-expanded', false); } });
  });

  /* otkrivanje i brojači */
  const fmt = n => n.toLocaleString('hr-HR').replace(/\s/g, '.');
  const count = el => {
    const end = +el.dataset.count;
    const plain = 'plain' in el.dataset;
    const suf = el.dataset.suffix || '';
    const out = v => plain ? `${v}.` : fmt(v) + suf;
    if (reduce) { el.textContent = out(end); return; }
    const start = plain ? end - 40 : 0;
    const t0 = performance.now();
    const dur = 1500;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = out(Math.round(start + (end - start) * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('is-in');
      $$('[data-count]', el).forEach(count);
      if (el.dataset.count) count(el);
      io.unobserve(el);
    });
  }, { threshold: .18, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  /* klubovi: tabovi + automatska izmjena dok sekcija nije u fokusu korisnika */
  const tabs = $$('.clubs__list [role="tab"]');
  const panels = $$('.club');
  let cur = 0, timer;
  const show = i => {
    cur = i;
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    panels.forEach((p, j) => p.classList.toggle('is-on', j === i));
  };
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((cur + 1) % tabs.length), 5000); };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { show(i); auto(); });
    t.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      show(n); tabs[n].focus(); auto();
    });
  });
  const clubs = $('#klubovi');
  new IntersectionObserver(([en]) => en.isIntersecting ? auto() : clearInterval(timer), { threshold: .3 }).observe(clubs);
  clubs.addEventListener('mouseenter', () => clearInterval(timer));
  clubs.addEventListener('mouseleave', auto);

  /* traka za članove */
  const rail = $('#rail');
  const bar = $('#railbar');
  const upd = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const vis = rail.clientWidth / rail.scrollWidth;
    bar.style.width = `${Math.max(vis * 100, 12)}%`;
    bar.style.transform = `translateX(${max ? (rail.scrollLeft / max) * (1 / Math.max(vis, .12) - 1) * 100 : 0}%)`;
  };
  rail.addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
  $$('[data-rail]').forEach(b => b.addEventListener('click', () => {
    const step = $('.mcard', rail).offsetWidth + 16;
    rail.scrollBy({ left: step * +b.dataset.rail, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* kopiraj IBAN */
  $$('.mlink').forEach(a => {
    if (!a.textContent.includes('IBAN')) return;
    a.addEventListener('click', async e => {
      e.preventDefault();
      try { await navigator.clipboard.writeText('HR0323600001101555499'); a.firstChild.textContent = 'IBAN kopiran'; }
      catch { a.firstChild.textContent = 'HR0323600001101555499'; }
    });
  });

  /* učlani se (demo: ništa se ne šalje) */
  const form = $('#joinform');
  const msg = $('#joinmsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#jmail').value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    msg.classList.toggle('is-err', !ok);
    msg.textContent = ok
      ? `Hvala! Pristupnicu i upute za uplatu poslat ćemo na ${v}.`
      : 'Upišite ispravnu e-mail adresu.';
    if (ok) form.reset();
  });
})();
