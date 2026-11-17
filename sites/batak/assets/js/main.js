/* Batak · koncept web stranice — bez vanjskih biblioteka */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* ---------- zaglavlje ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 60);
    hdr.classList.toggle('is-hidden', y > 500 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilni izbornik ---------- */
  const burger = $('.hdr__burger');
  const drawer = $('#drawer');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    drawer.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    hdr.classList.add('is-solid');
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });

  /* ---------- reveal + brojači ---------- */
  const countUp = (el) => {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  // blagi zaostatak za susjedne elemente
  $$('.reveal').forEach(el => {
    const sib = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
    const i = sib.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.08, .4) + 's');
    io.observe(el);
  });
  $$('.sig').forEach(el => io.observe(el));

  /* ---------- žar uz pokazivač ---------- */
  if (fine && !reduce) {
    addEventListener('pointermove', e => {
      document.body.style.setProperty('--mx', e.clientX + 'px');
      document.body.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---------- paralaksa ---------- */
  const px = $$('[data-parallax]');
  if (px.length && !reduce) {
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      px.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.translate = `0 ${off.toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- čestice: iskre (gore) i snijeg (dolje) ---------- */
  const particles = (canvas, mode) => {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, parts = [], running = false, raf;
    const N = mode === 'snow' ? 90 : 55;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (initial) => {
      if (mode === 'snow') return {
        x: Math.random() * w, y: initial ? Math.random() * h : -10,
        r: Math.random() * 2.2 + .6, vy: Math.random() * .6 + .3, vx: Math.random() * .4 - .2,
        ph: Math.random() * 6.28, a: Math.random() * .5 + .3
      };
      return {
        x: Math.random() * w, y: initial ? h - Math.random() * h * .6 : h + 10,
        r: Math.random() * 1.8 + .6, vy: -(Math.random() * 1.1 + .4), vx: Math.random() * .6 - .3,
        ph: Math.random() * 6.28, life: 1, decay: Math.random() * .004 + .002,
        hue: 18 + Math.random() * 25
      };
    };
    const reset = () => { size(); parts = Array.from({ length: N }, () => spawn(true)); };
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.ph += .02;
        p.x += p.vx + Math.sin(p.ph) * (mode === 'snow' ? .35 : .5);
        p.y += p.vy;
        if (mode === 'snow') {
          ctx.globalAlpha = p.a;
          ctx.fillStyle = '#e8f1f6';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          if (p.y > h + 10) parts[i] = spawn(false);
        } else {
          p.life -= p.decay;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = `hsl(${p.hue} 100% 60%)`;
          ctx.shadowColor = `hsl(${p.hue} 100% 55%)`;
          ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          if (p.life <= 0 || p.y < -10) parts[i] = spawn(false);
        }
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };
    reset();
    addEventListener('resize', () => { size(); });
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(step); }
      else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  };
  if (!reduce) {
    $$('[data-embers]').forEach(c => particles(c, 'embers'));
    $$('[data-snow]').forEach(c => particles(c, 'snow'));
  }

  /* ---------- Zimska plata: točke ---------- */
  const hotInfo = [
    'Domaće sarme: kiseli kupus punjen mesom, kuhan polako, baš kao kod bake.',
    'Češnjovke: savršeno začinjene kobasice s češnjakom, ravno sa žara.',
    'Buncek sa zeljem: sočan, mekan i topao, onaj koji grije u najhladnijim danima.',
    'Domaći krumpir: zlatno pečen, hrskav izvana i mekan iznutra.',
    'Senf: oštra točka na i koja upotpunjuje zimsku priču.'
  ];
  const note = $('#plate-note');
  const setHot = (i) => {
    $$('[data-hot]').forEach(b => {
      const on = +b.dataset.hot === i;
      b.classList.toggle('is-on', on);
      if (b.classList.contains('hot')) b.setAttribute('aria-pressed', on);
    });
    note.textContent = hotInfo[i];
  };
  $$('[data-hot]').forEach(b => {
    b.addEventListener('click', () => setHot(+b.dataset.hot));
    if (fine) b.addEventListener('mouseenter', () => setHot(+b.dataset.hot));
  });

  /* ---------- zimski termometar ---------- */
  const picks = [
    { max: -6, mood: 'Ovo je hladnoća za', dish: 'Zimsku platu za cijelo društvo', img: 'assets/img/zimska-plata.webp' },
    { max: -1, mood: 'Kad zagrize mraz, naruči', dish: 'Buncek sa zeljem i slaninom', img: 'assets/img/buncek.webp' },
    { max: 4, mood: 'Pravo vrijeme za', dish: 'Sarmu na kremastom pireu', img: 'assets/img/sarma.webp' },
    { max: 9, mood: 'Za gurmane, danas', dish: 'Teleća jetrica sa žara', img: 'assets/img/jetrica.webp' },
    { max: 99, mood: 'Toplo je? Uvijek može', dish: 'Ćevapi od 100 % junetine', img: 'assets/img/jela-cevapi.webp' }
  ];
  const temp = $('#temp'), tVal = $('#temp-val'), tImg = $('#temp-img'), tMood = $('#temp-mood'), tDish = $('#temp-dish');
  const thermo = $('.thermo');
  let curPick = null;
  const updTemp = () => {
    const v = +temp.value;
    tVal.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
    thermo.dataset.warm = v > 6 ? '1' : '0';
    const p = picks.find(x => v <= x.max);
    if (p === curPick) return;
    curPick = p;
    tMood.textContent = p.mood;
    tDish.textContent = p.dish;
    tImg.classList.add('is-swap');
    setTimeout(() => { tImg.src = p.img; tImg.alt = p.dish; tImg.classList.remove('is-swap'); }, reduce ? 0 : 200);
  };
  temp.addEventListener('input', updTemp);
  updTemp();

  /* ---------- jelovnici: slika prati pokazivač ---------- */
  const float = $('.mrow__float'), fImg = $('img', float);
  if (fine && !reduce) {
    let fx = 0, fy = 0, tx = 0, ty = 0, on = false;
    const loop = () => {
      fx += (tx - fx) * .15; fy += (ty - fy) * .15;
      float.style.left = fx + 'px'; float.style.top = fy + 'px';
      if (on || Math.abs(tx - fx) > .5) requestAnimationFrame(loop);
    };
    $$('.mrow').forEach(row => {
      row.addEventListener('mouseenter', e => {
        fImg.src = row.dataset.img; tx = fx = e.clientX; ty = fy = e.clientY;
        float.classList.add('is-on'); if (!on) { on = true; requestAnimationFrame(loop); }
      });
      row.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
      row.addEventListener('mouseleave', () => { float.classList.remove('is-on'); on = false; });
    });
  }

  /* ---------- lokacije ---------- */
  const L = [
    ['Kajzerica', 'Remetinečka 14, Zagreb', '01 4888 001', 'zagreb'],
    ['Radnička', 'Radnička cesta 37c, Zagreb', '01 606 1155', 'zagreb'],
    ['Centar Cvjetni', 'Trg Petra Preradovića 6, Zagreb', '091 462 2334', 'zagreb'],
    ['Kvatrić', 'Jakova Gotovca 1, Zagreb', '01 4664 331', 'zagreb'],
    ['Supernova Buzin', 'Av. Većeslava Holjevca 62, Zagreb', '01 647 1111', 'zagreb'],
    ['Rudeš', 'Rudeška cesta 87, Zagreb', '01 8890 833', 'zagreb'],
    ['Savica', 'Lastovska 1a, Zagreb', '01 4952 200', 'zagreb'],
    ['Golf', 'Jadranska avenija 6, Zagreb', '01 6530 722', 'zagreb'],
    ['Slavonska', 'Slavonska avenija 26/1, Zagreb', '01 3770 407', 'zagreb'],
    ['Tkalčićeva', 'Ulica Ivana Tkalčića 70, Zagreb', '01 4841 283', 'zagreb'],
    ['Family Mall', 'Ulica Velimira Škorpika 11b, Zagreb', '01 2105 643', 'zagreb'],
    ['Dubrava', 'Avenija Dubrava 122, Zagreb', '01 6886 495', 'zagreb'],
    ['Jarun', 'Aleja Matije Ljubeka 4, Zagreb', '01 6886 524', 'zagreb'],
    ['Črnomerec', 'Ul. Ivana Cankara 17, Zagreb', '01 6887 042', 'zagreb', 1],
    ['Sesvete', 'Trakošćanska 36, Sesvete', '01 4952 201', 'okolica'],
    ['Novi Dvori', 'Bana Josipa Jelačića 164, Zaprešić', '01 485 5999', 'okolica'],
    ['Westgate', 'Zaprešićka 2a, Jablanovec', '01 377 3924', 'okolica'],
    ['Velika Gorica', 'Ul. Matije Slatinskog 9, Velika Gorica', '01 383 1910', 'okolica'],
    ['Bjelovar', 'Pakračka ul. 11, Bjelovar', '043 635 010', 'kontinent', 1],
    ['Čakovec', 'Ul. Zrinsko-Frankopanska 1, Čakovec', '040 630 418', 'kontinent'],
    ['Osijek', 'Svilajska ulica 35B, Osijek', '031 659 056', 'kontinent'],
    ['Sisak', 'Ul. dr. Ante Starčevića 27, Sisak', '044 635 742', 'kontinent'],
    ['Vinkovci', 'Ul. Hansa Dietricha Genschera 2, Vinkovci', '032 616 476', 'kontinent'],
    ['Virovitica', 'Ul. Stjepana Radića 64, Virovitica', '033 618 226', 'kontinent'],
    ['Pula City Mall', 'Ul. Rimske centurijacije 101, Pula', '052 511 511', 'obala'],
    ['Rijeka', 'Riva 12, Rijeka', '051 309 590', 'obala'],
    ['City Park Zadar', 'Ul. 4. gardijske brigade 1, Zadar', '023 551 051', 'obala'],
    ['Split', 'Vukovarska ulica 207, Split', '021 293 269', 'obala'],
    ['Šibenik', 'Žaborička ul. 3e, Šibenik', '022 565 457', 'obala'],
    ['Umag', 'Ul. Miroslava Krleže 1, Umag', '052 771 475', 'obala'],
    ['Makarska', 'Ul. Europske zajednice 1, Makarska', '021 243 031', 'obala']
  ];
  const list = $('#loc-list'), q = $('#loc-q'), cnt = $('#loc-count'), lbl = $('#loc-label'), empty = $('#loc-empty');
  let region = 'sve';
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const plural = n => (n % 10 === 1 && n % 100 !== 11) ? 'restoran' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'restorana' : 'restorana';
  const renderLocs = () => {
    const term = norm(q.value.trim());
    const rows = L.filter(l => (region === 'sve' || l[3] === region) && (!term || norm(l[0] + ' ' + l[1]).includes(term)));
    list.innerHTML = rows.map((l, i) => `
      <li class="loc" style="animation-delay:${Math.min(i * 25, 400)}ms">
        <h3>Batak ${l[0]}</h3>${l[4] ? '<span class="loc__new">Novo</span>' : '<span></span>'}
        <p class="loc__adr"><svg aria-hidden="true"><use href="#pin"/></svg>${l[1]}</p>
        <a class="loc__tel" href="tel:+385${l[2].replace(/\s/g, '').replace(/^0/, '')}"><svg aria-hidden="true"><use href="#phone"/></svg>${l[2]}</a>
      </li>`).join('');
    cnt.textContent = rows.length;
    lbl.textContent = plural(rows.length);
    empty.hidden = rows.length > 0;
  };
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    region = c.dataset.region;
    $$('.chip').forEach(x => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c); });
    renderLocs();
  }));
  q.addEventListener('input', renderLocs);
  renderLocs();

  /* ---------- rezervacija (demo) ---------- */
  const sel = $('#b-loc');
  L.forEach(l => sel.insertAdjacentHTML('beforeend', `<option>Batak ${l[0]} · ${l[1].split(', ').pop()}</option>`));
  const date = $('#b-date');
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  date.min = today.toISOString().slice(0, 10);
  date.value = date.min;
  const guests = $('#b-guests');
  $$('[data-step]').forEach(b => b.addEventListener('click', () => {
    guests.textContent = Math.max(1, Math.min(12, +guests.textContent + +b.dataset.step));
  }));
  const form = $('#book'), msg = $('#book-msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let bad = null;
    $$('[required]', form).forEach(f => {
      const ok = f.value.trim() !== '' && (f.type !== 'tel' || /^[+\d][\d\s/-]{5,}$/.test(f.value.trim()));
      f.closest('.f').classList.toggle('is-bad', !ok);
      if (!ok && !bad) bad = f;
    });
    if (bad) {
      msg.className = 'form__msg is-bad';
      msg.textContent = 'Molimo ispuni označena polja.';
      bad.focus();
      return;
    }
    const d = new Date(date.value).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' });
    msg.className = 'form__msg is-ok';
    msg.textContent = `Hvala, ${$('#b-name').value.split(' ')[0]}! Stol za ${guests.textContent} u ${sel.value.split(' · ')[0]}, ${d} u ${$('#b-time').value}. (Demo: ništa nije poslano.)`;
  });
})();
