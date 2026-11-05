/* SOS Dječje selo Hrvatska · interakcije i animacije (početna + Tvrtke prijatelji)
   Radi i bez GSAP-a: stranica ostaje potpuna, samo bez animacija pri skrolanju. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ================= KONFIGURACIJA (zamijeniti stvarnim podacima udruge) ================= */
  const CFG = {
    // DEMO IBAN iz HUB3 primjera. Prije objave upisati IBAN udruge.
    iban: 'HR1210010051863000160',
    recipient: 'SOS Dječje selo Hrvatska',   // najviše 25 znakova
    recipientStreet: '',                      // npr. ulica i kućni broj, najviše 25 znakova
    recipientCity: '',                        // npr. 10000 Zagreb, najviše 27 znakova
    model: 'HR00',
    purpose: 'CHAR',                          // šifra namjene: humanitarna plaćanja
    // raspodjela sredstava iz revidiranog izvješća
    split: [0.88, 0.08, 0.04],
    // materijalizacija iznosa, od najvećeg praga prema najmanjem
    tiers: [
      { min: 50, icon: 'i-talk', what: 'specijalističku psihološku podršku i instrukcije' },
      { min: 25, icon: 'i-meal', what: 'tople obroke i sportske aktivnosti' },
      { min: 10, icon: 'i-book', what: 'školski pribor i knjige za jedno dijete' }
    ],
    minAmount: 2,
    bwip: 'https://cdn.jsdelivr.net/npm/bwip-js@4.5.1/dist/bwip-js-min.js'
  };

  const eur = (n, dec = 2) => n.toLocaleString('hr-HR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + ' €';
  const eur0 = (n) => Math.round(n).toLocaleString('hr-HR') + ' €';
  const amtTxt = (n) => (Number.isInteger(n) ? String(n) : n.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) + ' €';

  /* ---------- zaglavlje ---------- */
  const hdr = $('#hdr');
  const hero = $('.hero, .bhero');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const heroEnd = hero ? hero.offsetHeight - 90 : 80;
    const menuOpen = document.body.classList.contains('menu-open');
    hdr.classList.toggle('is-solid', y > heroEnd || menuOpen);
    hdr.classList.toggle('is-hidden', y > lastY && y > 400 && !menuOpen);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilni izbornik ---------- */
  const burger = $('#burger');
  const mnav = $('#mnav');
  if (burger && mnav) {
    const setMenu = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
      mnav.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      onScroll();
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- pomoćna funkcija za tabove s tipkovnicom ---------- */
  const tablist = (tabs, onSelect) => {
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => onSelect(i));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        onSelect(n); tabs[n].focus();
      });
    });
    return (i) => tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
  };

  /* ---------- sela: tabovi ---------- */
  const vpanel = $('#vpanel');
  if (vpanel) {
    const villages = [
      {
        name: 'SOS Dječje selo Lekenik', coords: '45,58° N · 16,21° E',
        text: 'Naše prvo selo, otvoreno 1993. u Lekeniku, mjestu tridesetak kilometara jugoistočno od Zagreba. Petnaest obiteljskih kuća okruženo je vrtovima, igralištima i voćnjakom.',
        f1: '1993.', f2: '15', f3: 'Sisačko-moslavačka',
        note: 'Sela otvaraju vrata volonterima, donatorima i partnerima. Javite se i dogovorite posjet.',
        img: 'assets/img/lekenik.jpg', alt: 'Obitelj s djecom igra se u dvorištu ispred kuće'
      },
      {
        name: 'SOS Dječje selo Ladimirevci', coords: '45,63° N · 18,45° E',
        text: 'Selo u Slavoniji, nedaleko od Valpova, izgrađeno 1995. i otvoreno za prve obitelji 1997. Ravnica, suncokreti i velika dvorišta u kojima se uvijek nešto događa.',
        f1: '1997.', f2: 'Slavonija', f3: 'Osječko-baranjska',
        note: 'Djeca iz sela pohađaju školu u Ladimirevcima i treniraju u klubovima u Valpovu.',
        img: 'assets/img/ladimirevci.jpg', alt: 'Dvoje djece u zelenom vrtu punom biljaka'
      }
    ];
    const tabs = $$('.vtabs [role="tab"]');
    const glider = $('.vtabs__glider');
    const moveGlider = (btn) => { glider.style.width = btn.offsetWidth + 'px'; glider.style.transform = `translateX(${btn.offsetLeft - 5}px)`; };
    let cur = 0;
    const mark = tablist(tabs, (i) => {
      if (i === cur) return;
      cur = i; mark(i); moveGlider(tabs[i]);
      vpanel.setAttribute('aria-labelledby', tabs[i].id);
      vpanel.classList.add('is-swapping');
      setTimeout(() => {
        const v = villages[i];
        $$('[data-vfield]', vpanel).forEach(el => { el.textContent = v[el.dataset.vfield]; });
        const img = $('[data-vimg]', vpanel); img.src = v.img; img.alt = v.alt;
        requestAnimationFrame(() => vpanel.classList.remove('is-swapping'));
      }, reduce ? 0 : 320);
    });
    const initGlider = () => moveGlider(tabs[cur]);
    initGlider();
    addEventListener('resize', initGlider);
    document.fonts && document.fonts.ready.then(initGlider);
    new Image().src = villages[1].img;
  }

  /* ---------- priče o uspjehu ---------- */
  const impact = $('#impact');
  if (impact) {
    const stories = [
      {
        img: 'assets/img/alumni-ivana.jpg', alt: 'Mlada žena u akademskoj togi drži diplomu',
        now: 'Magistra socijalnog rada',
        quote: '„Mama Ana me naučila da se zadaća piše prije crtića. Danas i ja radim s obiteljima u riziku, samo s druge strane stola.”',
        who: 'Ivana, odrasla u SOS selu Lekenik',
        path: [['2004.', 'Sa sestrom dolazi u SOS obitelj u Lekeniku, ima 7 godina'], ['2015.', 'Matura s odličnim uspjehom'], ['2016.', 'Program podrške mladima i prvi vlastiti stan'], ['2021.', 'Diplomira socijalni rad u Zagrebu'], ['2022.', 'Zapošljava se kao socijalna radnica']]
      },
      {
        img: 'assets/img/alumni-marko.jpg', alt: 'Mladić radi na stroju u radionici',
        now: 'Vlasnik obrta za strojnu obradu',
        quote: '„Prvi put sam nešto popravio sam u selu: bicikl mlađeg brata. Danas imam svoju radionicu i dvojicu zaposlenih.”',
        who: 'Marko, odrastao u SOS selu Ladimirevci',
        path: [['2006.', 'Dolazi u SOS obitelj u Ladimirevcima, ima 8 godina'], ['2016.', 'Završava strukovnu školu za CNC operatera'], ['2017.', 'Prvi posao, uz mentora iz partnerske tvrtke'], ['2021.', 'Majstorski ispit'], ['2023.', 'Otvara vlastiti obrt u Valpovu']]
      },
      {
        img: 'assets/img/alumni-tea.jpg', alt: 'Mlada žena u akademskoj togi i kapi smiješi se u parku',
        now: 'Magistra ekonomije',
        quote: '„Najviše mi je značilo što me netko svaki dan pitao kako je bilo u školi. Svaki dan, bez iznimke.”',
        who: 'Tea, odrasla u SOS selu Ladimirevci',
        path: [['2008.', 'S dvojicom braće dolazi u istu SOS kuću'], ['2017.', 'Matura i stipendija za studij'], ['2022.', 'Diplomira na Ekonomskom fakultetu u Osijeku'], ['2023.', 'Zapošljava se kao financijska analitičarka'], ['2025.', 'Kupuje prvi stan']]
      },
      {
        img: 'assets/img/alumni-luka.jpg', alt: 'Mladić s naočalama radi na laptopu i smiješi se',
        now: 'Programer i SOS mentor',
        quote: '„Kad sam se odselio, mentor mi je pomogao s prvim ugovorom za stan. Sada ja vikendom radim s mladima u istom programu.”',
        who: 'Luka, odrastao u SOS selu Lekenik',
        path: [['2001.', 'Dolazi u SOS obitelj u Lekeniku, ima 6 godina'], ['2013.', 'Matura u tehničkoj školi'], ['2014.', 'Program podrške mladima, prvi posao uz studij'], ['2018.', 'Zaposlen kao programer'], ['2024.', 'Volonter mentor u programu za mlade']]
      }
    ];
    const tabs = $$('.impact__tabs [role="tab"]');
    const panel = $('#istory');
    let cur = 0;
    const render = (i) => {
      const s = stories[i];
      const img = $('#iimg'); img.src = s.img; img.alt = s.alt;
      $('#inow').textContent = s.now;
      $('#iquote').textContent = s.quote;
      $('#iwho').textContent = s.who;
      $('#ipath').innerHTML = s.path.map(([y, t], k) => `<li${k === s.path.length - 1 ? ' class="is-goal"' : ''}><b>${y}</b><span>${t}</span></li>`).join('');
    };
    const show = (i) => {
      i = (i + stories.length) % stories.length;
      if (i === cur) return;
      cur = i; mark(i);
      panel.setAttribute('aria-labelledby', tabs[i].id);
      impact.classList.add('is-swapping');
      setTimeout(() => {
        render(i);
        requestAnimationFrame(() => impact.classList.remove('is-swapping'));
        if (hasGsap && !reduce) gsap.from('#ipath li', { x: -16, opacity: 0, duration: .5, stagger: .07, ease: 'power3.out' });
      }, reduce ? 0 : 320);
    };
    const mark = tablist(tabs, show);
    $('#iprev').addEventListener('click', () => show(cur - 1));
    $('#inext').addEventListener('click', () => show(cur + 1));
    stories.forEach(s => { new Image().src = s.img; });
  }

  /* ================= DONACIJSKI WIDGET ================= */
  const dform = $('#dform');
  let hub3Timer, bwipPromise;
  if (dform) {
    const other = $('#other'), otherIn = $('#amt-other');
    const buys = $('#buys');
    const msg = $('#dmsg');

    const state = () => {
      const sel = $('input[name="amt"]:checked', dform).value;
      const freq = $('input[name="freq"]:checked', dform).value;
      const pay = $('input[name="pay"]:checked', dform).value;
      let amount = sel === 'other' ? parseFloat(String(otherIn.value).replace(',', '.')) : +sel;
      if (!isFinite(amount)) amount = 0;
      amount = Math.round(amount * 100) / 100;
      return { sel, freq, pay, amount, valid: amount >= CFG.minAmount };
    };

    const update = (src) => {
      const st = state();
      const monthly = st.freq === 'm';
      other.hidden = st.sel !== 'other';
      if (src === 'amt' && st.sel === 'other') otherIn.focus();

      // materijalizacija
      const tier = CFG.tiers.find(t => st.amount >= t.min);
      const imp = $('#dimpact');
      $('use', imp).setAttribute('href', '#' + (tier ? tier.icon : 'i-book'));
      const t = $('#dimpact-t'), s = $('#dimpact-s');
      if (!st.valid) {
        t.innerHTML = 'Upišite iznos od najmanje <b>' + CFG.minAmount + ' €</b>.';
        s.textContent = 'Svaki euro ide u svakodnevicu djece u Lekeniku i Ladimirevcima.';
      } else {
        const what = tier ? tier.what : 'dio školskog pribora za jedno dijete';
        t.innerHTML = `Vaših <b>${amtTxt(st.amount)}</b> ${monthly ? 'mjesečno' : 'jednokratno'} osigurava <b>${what}</b>${monthly ? '' : ' kroz jedan mjesec'}.`;
        const direct = eur(st.amount * CFG.split[0]);
        s.textContent = monthly ? `${eur0(st.amount * 12)} godišnje · od toga ${direct} mjesečno izravno djeci` : `od toga ${direct} izravno djeci`;
      }
      if (hasGsap && !reduce && src) gsap.fromTo(imp, { y: 6, opacity: .4 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' });

      // istakni stavku na listi "što kupuje"
      $$('li', buys).forEach(li => li.classList.toggle('is-on', !!tier && +li.dataset.tier === tier.min));
      buys.classList.toggle('has-active', !!tier);

      // gumbi
      const label = st.valid ? `${amtTxt(st.amount)} ${monthly ? 'mjesečno' : 'jednokratno'}` : '';
      $$('[data-pm="card"] .js-cta', dform).forEach(el => (el.textContent = st.valid ? 'Doniraj ' + label : 'Upišite iznos'));
      $$('[data-pm="keks"] .js-cta', dform).forEach(el => (el.textContent = st.valid ? `Plati ${amtTxt(st.amount)} KEKS Payem` : 'Upišite iznos'));
      $$('button[type="submit"]', dform).forEach(b => (b.disabled = !st.valid));

      // način plaćanja
      $$('.pm', dform).forEach(p => (p.hidden = p.dataset.pm !== st.pay));
      $('#hub3-monthly').hidden = !monthly;
      $('#hub3-amt').textContent = st.valid ? eur(st.amount) : '–';
      if (st.pay === 'hub3') { clearTimeout(hub3Timer); hub3Timer = setTimeout(() => drawHub3(st), 250); }

      // transparentnost: "od vaših X €"
      const calc = $('#trcalc');
      if (calc && st.valid) {
        const [a, b, c] = CFG.split.map(p => eur(st.amount * p));
        calc.innerHTML = `Od vaših <b>${amtTxt(st.amount)}</b>: <span><i style="--c:var(--c1)"></i>${a} djeci</span><span><i style="--c:var(--c2)"></i>${b} programi</span><span><i style="--c:var(--c3)"></i>${c} administracija</span>`;
      }
      msg.textContent = '';
    };

    dform.addEventListener('change', e => update(e.target.name));
    otherIn.addEventListener('input', () => update('other'));
    dform.addEventListener('submit', e => {
      e.preventDefault();
      const st = state();
      if (!st.valid) { otherIn.focus(); return; }
      const how = { card: 'siguran obrazac za plaćanje karticom', wallet: (e.submitter && e.submitter.dataset.wallet) || 'Apple Pay ili Google Pay', keks: 'KEKS Pay', hub3: 'm-banking' }[st.pay];
      msg.textContent = `Ovo je koncept stranice. U pravoj verziji ovdje se otvara ${how} za ${amtTxt(st.amount)} ${st.freq === 'm' ? 'mjesečno' : 'jednokratno'}.`;
    });
    update();
  }

  /* ---------- HUB3 2D barkod (PDF417) ---------- */
  const ISO2 = { 'Č': 0xC8, 'č': 0xE8, 'Ć': 0xC6, 'ć': 0xE6, 'Đ': 0xD0, 'đ': 0xF0, 'Š': 0xA9, 'š': 0xB9, 'Ž': 0xAE, 'ž': 0xBE };
  const toIso2 = (str) => [...str].map(ch => {
    const c = ch.charCodeAt(0);
    if (ISO2[ch]) return String.fromCharCode(ISO2[ch]);
    return c < 128 ? ch : '?';
  }).join('');
  const loadBwip = () => bwipPromise || (bwipPromise = new Promise((res, rej) => {
    if (window.bwipjs) return res(window.bwipjs);
    const s = document.createElement('script');
    s.src = CFG.bwip; s.async = true;
    s.onload = () => (window.bwipjs ? res(window.bwipjs) : rej(new Error('bwip')));
    s.onerror = rej;
    document.head.appendChild(s);
  }));
  function hub3Text(st) {
    const d = new Date();
    const ref = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    $('#hub3-ref').textContent = ref;
    $('#hub3-iban').textContent = CFG.iban.replace(/(.{4})/g, '$1 ').trim();
    const desc = (st.freq === 'm' ? 'Mjesečna donacija' : 'Donacija') + ' SOS Dječje selo';
    return [
      'HRVHUB30', 'EUR',
      String(Math.round(st.amount * 100)).padStart(15, '0'),
      '', '', '',                                   // platitelj: popunjava banka
      CFG.recipient.slice(0, 25), CFG.recipientStreet.slice(0, 25), CFG.recipientCity.slice(0, 27),
      CFG.iban, CFG.model, ref, CFG.purpose, desc.slice(0, 35)
    ].join('\n') + '\n';
  }
  function drawHub3(st) {
    const cv = $('#hub3'), load = $('#hub3-load');
    if (!cv || !st.valid) return;
    load.hidden = false; load.textContent = 'Generiram barkod…';
    loadBwip().then(bw => {
      bw.toCanvas(cv, { bcid: 'pdf417', text: toIso2(hub3Text(st)), columns: 9, eclevel: 4, scale: 3, rowmult: 4, padding: 0, binarytext: true });
      load.hidden = true;
      if (hasGsap && !reduce) gsap.fromTo(cv, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out' });
    }).catch(() => { load.textContent = 'Barkod se nije učitao. Upotrijebite podatke za uplatu desno.'; });
  }

  /* ---------- transparentnost: tooltip na grafikonu ---------- */
  const trbar = $('#trbar');
  if (trbar) {
    const tip = $('#trtip');
    const showTip = (seg) => {
      tip.textContent = seg.dataset.tip;
      tip.hidden = false;
      const max = trbar.clientWidth - tip.offsetWidth;
      tip.style.left = Math.max(0, Math.min(seg.offsetLeft + seg.offsetWidth / 2 - tip.offsetWidth / 2, max)) + 'px';
    };
    $$('.trseg', trbar).forEach(seg => {
      seg.addEventListener('pointerenter', () => showTip(seg));
      seg.addEventListener('focus', () => showTip(seg));
      seg.addEventListener('pointerleave', () => (tip.hidden = true));
      seg.addEventListener('blur', () => (tip.hidden = true));
    });
  }

  /* ================= KALKULATOR (Tvrtke prijatelji) ================= */
  const calcf = $('#calcf');
  if (calcf) {
    const rev = $('#c-rev'), don = $('#c-don'), rng = $('#c-don-r');
    const num = (el) => +String(el.value).replace(/\D/g, '') || 0;
    const fmt = (n) => Math.round(n).toLocaleString('hr-HR');
    const tween = (el, to, suffix) => {
      if (!hasGsap || reduce) { el.textContent = fmt(to) + suffix; return; }
      const from = +(el.dataset.v || 0); const o = { v: from };
      el.dataset.v = to;
      gsap.to(o, { v: to, duration: .6, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.v) + suffix) });
    };
    const calc = () => {
      const R = num(rev), D = num(don);
      const cap = R * 0.02;
      const rate = R > 1000000 ? 0.18 : 0.10;
      const ded = Math.min(D, cap);
      const save = ded * rate;
      const cost = D - save;
      tween($('#o-cap'), cap, ' €');
      $('#o-rate').textContent = Math.round(rate * 100) + ' %';
      tween($('#o-save'), save, ' €');
      tween($('#o-cost'), cost, ' €');
      const sp = D ? Math.round(save / D * 100) : 0;
      $('#o-bcost').style.flexGrow = 100 - sp; $('#o-bcost').textContent = (100 - sp) + ' %';
      $('#o-bsave').style.flexGrow = Math.max(sp, 0.001); $('#o-bsave').textContent = sp >= 6 ? sp + ' %' : '';
      $('#o-bar').setAttribute('aria-label', `Od donacije ${fmt(D)} €: stvarni trošak ${fmt(cost)} €, porezna ušteda ${fmt(save)} €`);
      const warn = $('#o-warn');
      warn.hidden = D <= cap;
      if (D > cap) warn.textContent = `Iznos iznad ${fmt(cap)} € (2 % prihoda) nije porezno priznat rashod pa za taj dio nema uštede.`;
      const kids = Math.floor(D / 120);
      $('#o-means').innerHTML = kids >= 1
        ? `To je <b>školski pribor i knjige za ${fmt(kids)} ${kids % 10 === 1 && kids % 100 !== 11 ? 'dijete' : 'djece'}</b> kroz cijelu školsku godinu.`
        : 'Svaka donacija ide u svakodnevicu djece u Lekeniku i Ladimirevcima.';
    };
    const reformat = (el) => { const n = num(el); el.value = n ? fmt(n) : ''; };
    [rev, don].forEach(el => {
      el.addEventListener('input', () => { if (el === don) rng.value = Math.min(num(don), +rng.max); calc(); });
      el.addEventListener('blur', () => reformat(el));
    });
    rng.addEventListener('input', () => { don.value = fmt(+rng.value); calc(); });
    calcf.addEventListener('submit', e => e.preventDefault());
    calc();
  }

  /* ---------- B2B upit ---------- */
  const bform = $('#bform');
  if (bform) {
    bform.addEventListener('submit', e => {
      e.preventDefault();
      const m = $('#bmsg');
      const missing = ['#b-co', '#b-name', '#b-mail'].map(s => $(s)).filter(el => !el.value.trim());
      const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#b-mail').value.trim());
      m.classList.remove('is-err');
      if (missing.length) { m.classList.add('is-err'); m.textContent = 'Upišite naziv tvrtke, ime i prezime te e-adresu.'; missing[0].focus(); return; }
      if (!mailOk) { m.classList.add('is-err'); m.textContent = 'E-adresa treba biti u obliku ime@tvrtka.hr.'; $('#b-mail').focus(); return; }
      m.textContent = 'Hvala! Ovo je koncept stranice: u pravoj verziji upit stiže koordinatoru za tvrtke, koji se javlja u roku od dva radna dana.';
    });
  }

  /* ---------- newsletter ---------- */
  const nform = $('#nform');
  if (nform) nform.addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#nemail').value.trim();
    $('#nmsg').textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Hvala! Prvi broj stiže početkom sljedećeg mjeseca.' : 'Upišite e-adresu u obliku ime@domena.hr.';
  });

  /* ---------- traka u podnožju: dupliciraj za beskonačnu petlju ---------- */
  const strip = $('.foot__strip');
  if (strip) $$('img', strip).forEach(img => strip.appendChild(img.cloneNode()));

  /* ---------- FAQ: otvoreno samo jedno ---------- */
  const dets = $$('.acc details');
  dets.forEach(d => d.addEventListener('toggle', () => {
    if (!d.open) return;
    dets.forEach(o => { if (o !== d) o.open = false; });
    if (hasGsap && !reduce) gsap.fromTo($('.acc__a', d), { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .5, ease: 'power3.out', clearProps: 'height' });
  }));

  /* ---------- uključi se: paneli ---------- */
  const panels = $$('.panel');
  panels.forEach(p => {
    const open = () => panels.forEach(o => o.classList.toggle('is-open', o === p));
    p.addEventListener('mouseenter', open);
    p.addEventListener('focus', open);
  });

  /* ---------- trake mjerača ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .6 });
    $$('.meter').forEach(m => io.observe(m));
  } else $$('.meter').forEach(m => m.classList.add('is-in'));

  /* ---------- magnetski gumbi ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  /* ================= GSAP ================= */
  if (!hasGsap || reduce) {
    $$('[data-count]').forEach(el => (el.textContent = el.dataset.count));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (typeof window.Lenis !== 'undefined') {
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
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'svg') walk(n);
      });
    };
    walk(el);
    return $$('.w', el);
  };

  /* --- hero (početna) --- */
  if ($('.hero')) {
    const u = $('.u path');
    if (u) { const L = u.getTotalLength(); gsap.set(u, { strokeDasharray: L, strokeDashoffset: L }); }
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero__img', { scale: 1.18, duration: 2.4, ease: 'power2.out' }, 0)
      .from('.hero__title .ln > span', { yPercent: 110, duration: 1.2, stagger: .12 }, .15)
      .to(u, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, .9)
      .from('.hero .reveal-up', { y: 24, opacity: 0, duration: 1, stagger: .1 }, .5)
      .from('.hero__card', { y: 40, opacity: 0, rotate: 3, duration: 1.2 }, 1)
      .from('.hdr__in > *', { y: -20, opacity: 0, duration: .8, stagger: .06 }, .2);
    gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__in', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
  }
  /* --- hero (tvrtke) --- */
  if ($('.bhero')) {
    const ws = splitWords($('.split-hero'));
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from(ws, { yPercent: 80, opacity: 0, rotate: 5, duration: 1, stagger: .05 }, .1)
      .from('.bhero .reveal-up', { y: 24, opacity: 0, duration: 1, stagger: .1 }, .4)
      .from('.bhero__media', { clipPath: 'inset(10% 10% 10% 10% round 28px)', opacity: 0, duration: 1.4 }, .2)
      .from('.bhero__media img', { scale: 1.2, duration: 1.8, ease: 'power2.out' }, .2)
      .from('.hdr__in > *', { y: -20, opacity: 0, duration: .8, stagger: .06 }, .2);
  }

  $$('[data-fill]').forEach(el => {
    const ws = splitWords(el);
    gsap.set(ws, { opacity: .2 });
    gsap.to(ws, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  });
  $$('.split').forEach(h => {
    gsap.from(splitWords(h), { yPercent: 60, opacity: 0, rotate: 4, duration: 1, stagger: .05, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  $$('.sec-lead, .pill').forEach(el => {
    if (el.closest('.hero, .bhero')) return;
    gsap.from(el, { y: 20, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  $$('[data-count]').forEach(el => {
    const o = { v: 0 }; el.textContent = '0';
    gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });
  $$('.par').forEach(el => {
    const sp = +el.dataset.speed || 5;
    gsap.fromTo(el, { yPercent: -sp }, { yPercent: sp, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($('img', el), { scale: 1.25, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 30%', scrub: true } });
  });
  if ($('.donate')) gsap.fromTo('.donate__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.donate', start: 'top bottom', end: 'bottom top', scrub: true } });

  gsap.matchMedia().add('(min-width: 761px)', () => {
    const cards = $$('.pcard');
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (next) gsap.to(c, { scale: .92, filter: 'brightness(.94)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } });
      gsap.from($('.pcard__img img', c), { scale: 1.2, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 25%', scrub: true } });
    });
  });

  const enter = (sel, vars, trig, start = 'top 82%') => {
    const els = $$(sel);
    if (!els.length) return;
    // CSS tranzicije na transform/opacity bore se s GSAP-om, pa ih gasimo dok animacija traje
    els.forEach(e => (e.style.transition = 'none'));
    gsap.from(els, Object.assign({ y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: trig || sel, start },
      onComplete: () => els.forEach(e => (e.style.transition = '')) }, vars));
  };
  enter('.prog__item', { stagger: .14 }, '.prog', 'top 80%');
  enter('.panel', { stagger: .12 }, '.panels');
  enter('.vstats > div', { y: 30, stagger: .1 }, '.vstats', 'top 88%');
  enter('.vpanel__card', { x: -40, y: 0 }, '.vpanel', 'top 75%');
  if ($('.vpanel__img')) gsap.from('.vpanel__img', { clipPath: 'inset(0 0 0 100% round 28px)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: '.vpanel', start: 'top 75%' } });
  enter('.dform', {}, '.dform', 'top 85%');
  enter('.buys li', { x: -30, y: 0, stagger: .1 }, '.buys', 'top 85%');
  enter('.acc details', { y: 24, duration: .8, stagger: .08 }, '.acc', 'top 85%');
  if ($('.faq__img')) gsap.from('.faq__img', { clipPath: 'inset(12% 12% 12% 12% round 28px)', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.faq__img', start: 'top 85%' } });
  enter('.collage figure', { y: 60, duration: 1.2, stagger: .12 }, '.collage', 'top 85%');
  enter('.impact__tabs button', { y: 24, stagger: .08 }, '.impact', 'top 85%');
  enter('.impact__story', { y: 60 }, '.impact', 'top 80%');
  enter('.path li', { x: -16, y: 0, duration: .6, stagger: .08 }, '.path', 'top 85%');
  enter('.tr__chart, .tr__docs', { stagger: .12 }, '.tr', 'top 82%');
  enter('.docs li', { x: 20, y: 0, duration: .7, stagger: .08 }, '.docs', 'top 88%');
  enter('.facts3 li', { x: 30, y: 0, stagger: .1 }, '.facts3');
  enter('.model', { y: 60, stagger: .12 }, '.models');
  enter('.ways__list li', { x: 24, y: 0, stagger: .08 }, '.ways__list');
  enter('.steps li', { y: 40, stagger: .1 }, '.steps');
  enter('.bform form', {}, '.bform form', 'top 85%');
  enter('.calc__out', { y: 40 }, '.calc', 'top 78%');

  // grafikon raspodjele: segmenti rastu redom
  if ($('#trbar')) {
    gsap.from('#trbar .trseg', { scaleX: 0, duration: 1.1, stagger: .18, ease: 'power3.inOut', scrollTrigger: { trigger: '#trbar', start: 'top 85%' } });
    gsap.from('.tr__legend li', { opacity: 0, y: 12, duration: .6, stagger: .12, delay: .5, ease: 'power3.out', scrollTrigger: { trigger: '#trbar', start: 'top 85%' } });
  }

  /* --- val galerija --- */
  const rows = $$('.wave__row');
  if (rows.length) {
    document.documentElement.classList.add('js-wave');
    const rowData = rows.map(row => {
      const orig = $$('img', row);
      while ($$('img', row).length < 22) orig.forEach(img => row.appendChild(img.cloneNode()));
      return { imgs: $$('img', row), dir: +row.dataset.dir, off: 0 };
    });
    let boost = 0, visible = false;
    ScrollTrigger.create({ trigger: '.wave', start: 'top bottom', end: 'bottom top', onToggle: s => (visible = s.isActive), onUpdate: s => { boost = Math.min(Math.abs(s.getVelocity()) / 400, 6); } });
    gsap.ticker.add((t, dt) => {
      if (!visible) return;
      const W = rows[0].clientWidth;
      rowData.forEach((d, ri) => {
        const step = (d.imgs[0].offsetWidth || 100) + 16;
        const total = step * d.imgs.length;
        d.off += d.dir * (0.035 + boost * .03) * dt;
        const amp = Math.min(W * .035, 46);
        d.imgs.forEach((img, i) => {
          const x = ((i * step + d.off) % total + total) % total - step;
          const ph = (x / W) * Math.PI * 2 + ri * Math.PI;
          img.style.transform = `translate3d(${x}px, ${Math.sin(ph) * amp}px, 0) rotate(${Math.cos(ph) * 7}deg)`;
        });
      });
      boost *= .94;
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
