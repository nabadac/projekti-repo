/* IRONGATE — grupni treninzi
   GSAP + ScrollTrigger + Lenis; radi i bez njih (bez animacija). */
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap && !reduce) doc.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pad = (n, l = 2) => String(n).padStart(l, '0');

  /* ───────── podaci ───────── */
  const PROG = {
    start: { n: 'Start 30', d: 'početnici · 50 min', dur: 50 },
    hiit:  { n: 'HIIT 45', d: 'kondicija · 45 min', dur: 45 },
    snaga: { n: 'Barbell Club', d: 'snaga · 60 min', dur: 60 },
    box:   { n: 'Box Fit', d: 'boks · 50 min', dur: 50 },
    wod:   { n: 'Functional WOD', d: 'funkcionalno · 50 min', dur: 50 },
    mob:   { n: 'Mobility & Core', d: 'mobilnost · 45 min', dur: 45 },
  };
  const DAYS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
  const DAYS_LONG = ['ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota', 'nedjelja'];
  // [vrijeme, program, trener, kapacitet, zauzeto]
  const S = [
    [['06:30','hiit','Sara M.',12,9],['12:00','mob','Ana B.',14,6],['17:00','start','Sara M.',6,4],['18:00','box','Ivan K.',12,12],['19:00','snaga','Luka D.',8,7],['20:00','wod','Marko T.',12,8]],
    [['07:00','wod','Marko T.',12,7],['12:00','hiit','Sara M.',12,5],['17:30','hiit','Marko T.',12,11],['18:30','snaga','Luka D.',8,8],['19:30','box','Ivan K.',12,9],['20:30','mob','Ana B.',14,6]],
    [['06:30','hiit','Sara M.',12,10],['12:00','wod','Marko T.',12,4],['17:00','start','Sara M.',6,3],['18:00','hiit','Marko T.',12,12],['19:00','snaga','Luka D.',8,6],['20:00','box','Ivan K.',12,7]],
    [['07:00','mob','Ana B.',14,5],['12:00','hiit','Sara M.',12,6],['17:30','wod','Marko T.',12,10],['18:30','box','Ivan K.',12,11],['19:30','snaga','Luka D.',8,5],['20:30','hiit','Sara M.',12,7]],
    [['06:30','hiit','Sara M.',12,8],['12:00','mob','Ana B.',14,4],['17:00','start','Sara M.',6,5],['18:00','wod','Marko T.',12,9],['19:00','box','Ivan K.',12,6],['20:00','hiit','Marko T.',12,10]],
    [['09:00','hiit','Marko T.',12,12],['10:00','snaga','Luka D.',8,6],['11:00','box','Ivan K.',12,8],['12:00','mob','Ana B.',14,7]],
    [['10:00','start','Sara M.',6,2],['11:00','mob','Ana B.',14,5]],
  ];
  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7;
  const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  // sljedećih n termina (od sada), opcionalno za jedan program
  function upcoming(prog, n = 10) {
    const out = [];
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let off = 0; off < 14 && out.length < n; off++) {
      const di = (todayIdx + off) % 7;
      for (const c of S[di]) {
        if (prog && c[1] !== prog) continue;
        if (off === 0 && mins(c[0]) <= nowMin + 30) continue;
        const date = new Date(now); date.setDate(now.getDate() + off);
        // na sljedećem tjednu termin je "svjež": manje zauzet
        const booked = off >= 7 ? Math.max(1, c[4] - 5) : c[4];
        out.push({ off, di, date, t: c[0], p: c[1], coach: c[2], cap: c[3], booked });
        if (out.length >= n) break;
      }
    }
    return out;
  }
  const dayLabel = (o) => o.off === 0 ? 'danas' : o.off === 1 ? 'sutra' : `${DAYS[o.di].toLowerCase()} ${o.date.getDate()}. ${o.date.getMonth() + 1}.`;

  /* ───────── Lenis ───────── */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function goTo(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    closeMenu();
    goTo(id);
  });

  /* ───────── navigacija ───────── */
  const nav = $('#nav'), burger = $('#burger'), mnav = $('#mnav'), mcta = $('#mcta');
  function closeMenu() { mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); mnav.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = !mnav.classList.contains('is-open');
    mnav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mnav.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  let lastY = 0;
  const signupEl = $('#prijava');
  const rulerCur = $('.ruler-cursor'), rulerVal = $('#rulerVal');
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > 600 && y > lastY + 2 && !mnav.classList.contains('is-open'));
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
    const max = doc.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    if (rulerCur) {
      rulerCur.style.transform = `translateY(${p * rulerCur.parentElement.clientHeight}px)`;
      rulerVal.textContent = pad(Math.round(p * 2290), 4);
    }
    const sr = signupEl.getBoundingClientRect();
    mcta.classList.toggle('is-on', y > innerHeight * .8 && !(sr.top < innerHeight && sr.bottom > 0));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // aktivni link u navigaciji
  const links = $$('.nav-links a');
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(l => l.classList.toggle('is-cur', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['programi', 'prvi-tjedan', 'raspored', 'paketi', 'pitanja'].forEach(id => $('#' + id) && io.observe($('#' + id)));

  /* ───────── pokazivač intenziteta, rupe na racku ───────── */
  $$('.int').forEach(el => { const v = +el.dataset.v; el.innerHTML = [1,2,3,4,5].map(i => `<i class="${i <= v ? 'on' : ''}"></i>`).join(''); el.setAttribute('aria-label', `${v} od 5`); });
  const holes = $('#rackHoles');
  if (holes) {
    let h = '';
    for (let y = 150; y <= 700; y += 26) h += `<circle class="th" cx="177" cy="${y}" r="4"/><circle class="th" cx="623" cy="${y}" r="4"/>`;
    holes.innerHTML = h;
  }

  /* ───────── sljedeći termin (hero) ───────── */
  const nc = upcoming(null, 1)[0];
  if (nc) {
    const free = nc.cap - nc.booked;
    $('#ncName').textContent = PROG[nc.p].n;
    $('#ncMeta').textContent = `${dayLabel(nc)} · ${nc.t} · ${nc.coach}`;
    $('#ncSpots').textContent = free > 0 ? `${free} / ${nc.cap} mjesta slobodno` : 'popunjeno · lista čekanja';
    $('#ncBook').addEventListener('click', () => preselect(nc.p, nc));
    setTimeout(() => { $('#ncBar').style.transform = `scaleX(${nc.booked / nc.cap})`; }, reduce ? 0 : 1600);
  }

  /* ───────── raspored ───────── */
  const daysEl = $('#days'), slotsEl = $('#slots');
  let curDay = todayIdx, curF = 'all';
  daysEl.innerHTML = Array.from({ length: 7 }, (_, off) => {
    const i = (todayIdx + off) % 7;
    const dt = new Date(now); dt.setDate(now.getDate() + off);
    return `<button class="day${i === curDay ? ' is-on' : ''}" role="tab" aria-selected="${i === curDay}" data-d="${i}"><b>${off === 0 ? 'Danas' : DAYS[i]}</b><span>${off === 0 ? DAYS[i].toUpperCase() + ' ' : ''}${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.</span></button>`;
  }).join('');
  function renderSlots(animate = true) {
    const list = S[curDay].filter(c => curF === 'all' || c[1] === curF);
    if (!list.length) { slotsEl.innerHTML = `<p class="slot-empty mono">Taj program nije na rasporedu za ${DAYS_LONG[curDay]}. Odaberi drugi dan.</p>`; return; }
    slotsEl.innerHTML = list.map(c => {
      const [t, p, coach, cap, bk] = c, free = cap - bk, full = free <= 0, hot = !full && free <= 3;
      return `<div class="slot${full ? ' full' : hot ? ' hot' : ''}">
        <div class="slot-t">${t}</div>
        <div class="slot-n"><b>${PROG[p].n}</b><span>${PROG[p].d}</span></div>
        <div class="slot-c">${coach}</div>
        <div class="slot-cap">${full ? 'Popunjeno' : hot ? `Još samo ${free} ${free === 1 ? 'mjesto' : 'mjesta'}` : `${free} / ${cap} slobodno`}<div class="cap">${Array.from({ length: cap }, (_, i) => `<i class="${i < bk ? 'on' : ''}"></i>`).join('')}</div></div>
        <button class="slot-b" data-p="${p}" data-t="${t}">${full ? 'Drugi termin' : 'Rezerviraj'}</button>
      </div>`;
    }).join('');
    if (animate && hasGsap && !reduce) {
      gsap.fromTo($$('.slot', slotsEl), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out' });
      gsap.fromTo($$('.slot .cap i.on', slotsEl), { scaleY: 0 }, { scaleY: 1, duration: .4, stagger: .008, ease: 'power2.out', transformOrigin: 'bottom' });
    }
  }
  daysEl.addEventListener('click', e => {
    const b = e.target.closest('.day'); if (!b) return;
    curDay = +b.dataset.d;
    $$('.day', daysEl).forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    renderSlots();
  });
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    curF = b.dataset.f;
    $$('.chip').forEach(x => x.classList.toggle('is-on', x === b));
    renderSlots();
  });
  slotsEl.addEventListener('click', e => {
    const b = e.target.closest('.slot-b'); if (!b) return;
    const off = (curDay - todayIdx + 7) % 7;
    const pick = upcoming(b.dataset.p, 20).find(o => o.di === curDay && o.t === b.dataset.t && o.off >= off);
    preselect(b.dataset.p, pick && pick.cap - pick.booked > 0 ? pick : null);
    goTo('#prijava');
  });
  renderSlots(false);

  /* ───────── paketi: razdoblje + odbrojavanje ───────── */
  const tog = $('.toggle'), knob = $('.toggle-knob');
  function placeKnob() { const on = $('button.is-on', tog); knob.style.width = on.offsetWidth + 'px'; knob.style.transform = `translateX(${on.offsetLeft - 4}px)`; }
  placeKnob(); addEventListener('resize', placeKnob);
  document.fonts && document.fonts.ready.then(placeKnob);
  tog.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', tog).forEach(x => x.classList.toggle('is-on', x === b));
    placeKnob();
    const per = b.dataset.per;
    $$('.price b[data-m]').forEach(el => {
      const to = +el.dataset[per];
      if (hasGsap && !reduce) {
        const o = { v: +el.textContent };
        gsap.to(o, { v: to, duration: .7, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) });
        gsap.fromTo(el, { y: -8 }, { y: 0, duration: .6, ease: 'back.out(3)' });
      } else el.textContent = to;
    });
    $$('.per[data-pm]').forEach(el => el.textContent = per === 'q' ? el.dataset.pq : el.dataset.pm);
  });
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  const cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  function tick() {
    let ms = Math.max(0, end - new Date());
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4); ms -= m * 6e4;
    cd.d.textContent = pad(d); cd.h.textContent = pad(h); cd.m.textContent = pad(m); cd.s.textContent = pad(Math.floor(ms / 1000));
  }
  tick(); setInterval(tick, 1000);

  /* ───────── FAQ: glatko otvaranje ───────── */
  $$('#faqList details').forEach(d => {
    const sum = $('summary', d), body = $('.acc-body', d);
    sum.addEventListener('click', e => {
      if (reduce || !hasGsap) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .45, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; ScrollTrigger.refresh(); } });
      } else {
        $$('#faqList details[open]').forEach(o => { if (o !== d) $('summary', o).click(); });
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .55, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo($('p', body), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, delay: .1 });
      }
    });
  });

  /* ───────── obrazac (radni nalog u 3 koraka) ───────── */
  const form = $('#order'), nextB = $('#next'), backB = $('#back'), err = $('#err');
  const state = { step: 1, prog: null, term: null, plan: null };
  $('#progOpts').innerHTML = Object.entries(PROG).map(([k, v]) => `<button type="button" class="opt" data-p="${k}"><b>${v.n}</b><span>${v.d}</span></button>`).join('');
  function renderTerms() {
    const list = upcoming(state.prog, 10);
    $('#termFor').textContent = PROG[state.prog].n;
    $('#terms').innerHTML = list.map((o, i) => {
      const free = o.cap - o.booked;
      const on = state.term && state.term.off === o.off && state.term.t === o.t;
      return `<button type="button" class="term${on ? ' is-on' : ''}" data-i="${i}" ${free <= 0 ? 'disabled' : ''}>
        <span class="d">${dayLabel(o)}</span><span class="t">${o.t}</span><span class="c">${o.coach}</span>
        <span class="s">${free <= 0 ? 'popunjeno' : free <= 3 ? `još ${free}` : `${free} slob.`}</span></button>`;
    }).join('');
    $('#terms')._list = list;
  }
  function setStep(n) {
    state.step = n;
    $$('.order-pane').forEach(p => p.classList.toggle('is-on', +p.dataset.step === n));
    $$('.order-steps span').forEach((s, i) => { s.classList.toggle('is-on', i + 1 === n); s.classList.toggle('is-done', i + 1 < n); });
    $('#orderBar').style.width = (n / 3 * 100) + '%';
    backB.hidden = n === 1;
    $('span', nextB).textContent = n === 3 ? 'Potvrdi rezervaciju' : 'Dalje';
    err.textContent = '';
    if (n === 2) renderTerms();
    if (n === 3) {
      const o = state.term;
      $('#sum').innerHTML = `Program: <b>${PROG[state.prog].n}</b><br>Termin: <b>${dayLabel(o)} u ${o.t}</b> · trener ${o.coach}${state.plan ? `<br>Zanima me paket: <b>${state.plan}</b>` : ''}<br>Cijena: <b>0 €</b>`;
    }
    validate();
    const pane = $(`.order-pane[data-step="${n}"]`);
    if (hasGsap && !reduce) gsap.fromTo(pane.children, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: .5, stagger: .05, ease: 'power3.out' });
  }
  function validate() {
    let ok = false;
    if (state.step === 1) ok = !!state.prog;
    if (state.step === 2) ok = !!state.term;
    if (state.step === 3) ok = true;
    nextB.disabled = !ok;
  }
  form.addEventListener('click', e => {
    const o = e.target.closest('.opt');
    if (o) {
      state.prog = o.dataset.p; state.term = null;
      $$('.opt').forEach(x => x.classList.toggle('is-on', x === o));
      validate();
      return;
    }
    const t = e.target.closest('.term');
    if (t && !t.disabled) {
      state.term = $('#terms')._list[+t.dataset.i];
      $$('.term').forEach(x => x.classList.toggle('is-on', x === t));
      validate();
    }
  });
  backB.addEventListener('click', () => setStep(state.step - 1));
  nextB.addEventListener('click', () => {
    if (state.step < 3) return setStep(state.step + 1);
    const f = form.elements;
    const bad = [];
    f.ime.classList.toggle('bad', f.ime.value.trim().length < 2) && bad.push('ime');
    const tel = f.tel.value.replace(/[\s/-]/g, '');
    f.tel.classList.toggle('bad', !/^\+?\d{8,13}$/.test(tel)) && bad.push('tel');
    if (f.email.value && !f.email.checkValidity()) { f.email.classList.add('bad'); bad.push('email'); } else f.email.classList.remove('bad');
    if (!f.gdpr.checked) bad.push('gdpr');
    if (bad.length) {
      err.textContent = bad.includes('gdpr') && bad.length === 1 ? 'Označi privolu za kontakt.' : 'Provjeri označena polja: ime i ispravan broj mobitela su obavezni.';
      if (hasGsap && !reduce) gsap.fromTo(form, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
      return;
    }
    // demo: bez slanja na poslužitelj
    const no = 'IG-' + String(Date.now()).slice(-5);
    $('#ticketNo').textContent = 'NALOG #' + no;
    $('#doneTxt').textContent = `${f.ime.value.trim().split(' ')[0]}, čekamo te ${dayLabel(state.term)} u ${state.term.t} na treningu ${PROG[state.prog].n}. Dođi 15 minuta ranije, SMS s detaljima stiže na ${f.tel.value.trim()}.`;
    $$('.order-pane').forEach(p => p.classList.remove('is-on'));
    $('#orderNav').hidden = true; err.textContent = '';
    $('.order-steps').querySelectorAll('span').forEach(s => { s.classList.remove('is-on'); s.classList.add('is-done'); });
    $('#done').hidden = false;
    if (hasGsap && !reduce) {
      gsap.fromTo('.stamp', { scale: 2.4, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: -6, duration: .6, ease: 'back.out(2.2)' });
      gsap.fromTo('#done > :not(.stamp)', { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .08, delay: .3, duration: .5 });
    }
  });
  form.addEventListener('input', e => e.target.classList.remove('bad'));
  form.addEventListener('submit', e => { e.preventDefault(); nextB.click(); });

  function preselect(p, term) {
    if (!$('#done').hidden) return;
    state.prog = p;
    $$('.opt').forEach(x => x.classList.toggle('is-on', x.dataset.p === p));
    if (term) { state.term = term; setStep(2); renderTerms(); validate(); }
    else { state.term = null; setStep(2); }
  }
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => preselect(a.dataset.pick)));
  $$('[data-plan]').forEach(a => a.addEventListener('click', () => { state.plan = a.dataset.plan === 'Probni' ? null : a.dataset.plan; }));

  /* ───────── hover efekti ───────── */
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hero = $('.hero'), cross = $('.cross');
  if (fine) {
    const cx = $('.cx', cross), cy = $('.cy', cross), rd = $('.cread', cross);
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      cx.style.transform = `translateY(${y}px)`; cy.style.transform = `translateX(${x}px)`;
      rd.style.transform = `translate(${x + 10}px,${y + 8}px)`;
      rd.textContent = `X ${pad(Math.round(x / r.width * 2200), 4)} · Y ${pad(Math.round(y / r.height * 900), 4)}`;
    });
  } else cross.remove();

  /* ───────── bez GSAP-a / smanjeno kretanje: kraj ───────── */
  if (!hasGsap || reduce) {
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || ''));
    $$('.acc-out').forEach(el => el.style.color = 'var(--acc)');
    return;
  }

  /* ═════════ animacije ═════════ */
  gsap.registerPlugin(ScrollTrigger);

  // magnetski gumbi
  if (fine) $$('.mag').forEach(b => {
    const qx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .25); qy((e.clientY - r.top - r.height / 2) * .35); });
    b.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });

  // pripremi crteže za iscrtavanje
  const GEO = 'path,line,rect,circle,ellipse,polyline,polygon';
  function prepDraw(svg) {
    const isSoft = el => el.closest('defs,pattern,marker') || el.matches('.c,.hid,.kn,[marker-start],[stroke-dasharray]');
    const els = $$(GEO, svg).filter(el => !isSoft(el));
    els.forEach(el => { let L = 0; try { L = el.getTotalLength(); } catch (_) {} L = Math.ceil(L) + 2; el.style.strokeDasharray = `${L} ${L}`; el.style.strokeDashoffset = L; if (el.classList.contains('fbg')) el.style.fillOpacity = 0; });
    const soft = $$('.c,.hid,.kn,[marker-start],[stroke-dasharray],text', svg).filter(el => !el.closest('defs,pattern,marker'));
    gsap.set(soft, { opacity: 0 });
    return { els, soft };
  }

  // naslovi: riječi izlaze iz maske
  $$('.title.split').forEach(t => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(' '));
          else { const o = document.createElement('span'); o.className = 'w'; o.innerHTML = `<span>${w}</span>`; frag.appendChild(o); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(t);
    gsap.from($$('.w>span', t), { yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: t, start: 'top 85%' } });
  });

  // općenito pojavljivanje
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .09, overwrite: true, clearProps: 'transform' }),
  });

  /* hero uvod */
  const heroSvg = $('.hero-bp');
  const hd = prepDraw(heroSvg);
  const acc = $('.acc-out'); acc.dataset.fill = acc.textContent;
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.hero-title .ln>span', { yPercent: 115, duration: 1.3, stagger: .1 }, .1)
    .from('.eyebrow', { opacity: 0, y: 12, duration: .8 }, .2)
    .to(hd.els, { strokeDashoffset: 0, fillOpacity: 1, duration: 2.2, ease: 'power2.inOut', stagger: { each: .012, from: 'center' } }, .2)
    .to(hd.soft, { opacity: 1, duration: 1, stagger: .01 }, 1.2)
    .from('.hero-copy > *', { opacity: 0, y: 24, duration: 1, stagger: .1 }, .7)
    .from('.next', { opacity: 0, x: 30, duration: 1 }, .9)
    .from('.titleblock, .scroll-cue', { opacity: 0, y: 10, duration: .8 }, 1.4);
  // ispuna riječi "ekipi." pri skrolu
  const fillStyle = document.createElement('style'); document.head.appendChild(fillStyle);
  gsap.to({ p: 100 }, { p: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '40% top', scrub: true },
    onUpdate() { fillStyle.textContent = `.acc-out::after{clip-path:inset(0 ${this.targets()[0].p}% 0 0)}`; } });
  // šipka se rastavlja na skrolu
  const hs = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 };
  gsap.to('.plates-l', { x: -220, scrollTrigger: hs });
  gsap.to('.plates-r', { x: 220, scrollTrigger: hs });
  gsap.to('.plate-front', { rotate: 140, svgOrigin: '1300 250', scrollTrigger: hs });
  gsap.to(heroSvg, { yPercent: 14, opacity: .35, scrollTrigger: hs });
  gsap.to('.hero-inner', { yPercent: -12, opacity: .2, scrollTrigger: { ...hs, start: '30% top' } });

  // traka: brzina prati skrol
  const tape = $('#tape');
  const tapeTw = gsap.to(tape, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  let dir = 1;
  ScrollTrigger.create({ onUpdate: s => {
    if (s.direction !== dir) dir = s.direction;
    const v = gsap.utils.clamp(-6, 6, s.getVelocity() / 300);
    gsap.to(tapeTw, { timeScale: (dir) * (1 + Math.abs(v)), duration: .3, overwrite: true });
  } });
  gsap.fromTo('.tape', { rotate: -3 }, { rotate: 1, ease: 'none', scrollTrigger: { trigger: '.tape', start: 'top bottom', end: 'bottom top', scrub: true } });

  // brojači
  $$('[data-count]').forEach(el => {
    const o = { v: 0 }, to = +el.dataset.count, suf = el.dataset.suffix || '';
    gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(o.v) + suf });
  });

  // pozadinski crteži: iscrtavanje uz skrol
  $$('.bg-draw').forEach(svg => {
    const d = prepDraw(svg);
    const sec = svg.closest('.sec');
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 75%', end: 'center 40%', scrub: 1.2 } });
    tl.to(d.els, { strokeDashoffset: 0, fillOpacity: 1, ease: 'none', stagger: .04, duration: 1 }).to(d.soft, { opacity: 1, duration: .4, stagger: .02 }, '-=.4');
    gsap.fromTo(svg, { yPercent: 8 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.bag-swing', { rotate: -4 }, { rotate: 4, svgOrigin: '200 20', ease: 'sine.inOut', scrollTrigger: { trigger: '.sched', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
  gsap.to('.gear-draw', { rotate: 90, ease: 'none', scrollTrigger: { trigger: '.signup', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  // kartice programa
  gsap.from('.card', { opacity: 0, y: 60, duration: 1.1, ease: 'expo.out', stagger: { each: .08, grid: 'auto' }, scrollTrigger: { trigger: '#cards', start: 'top 80%' } });
  $$('.card').forEach(c => gsap.from($$('.int i.on', c), { scaleY: 0, duration: .4, stagger: .07, ease: 'back.out(3)', scrollTrigger: { trigger: c, start: 'top 75%' } }));

  // prvi tjedan: sklapanje racka
  const rack = $('.rack');
  const rd = prepDraw(rack);
  const groups = $$('.st', rack);
  const labels = ['POSTOLJE', 'NOSAČI', 'SIGURNOST', 'OPTEREĆENJE'];
  const steps = $$('.step');
  let curStep = -1;
  function setRackStep(i) {
    if (i === curStep) return; curStep = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k <= i));
    $('#rackLabel').textContent = `POZ. ${pad(i + 1)} / 04 — ${labels[i]}`;
  }
  const softOf = g => rd.soft.filter(el => g.contains(el));
  const linesOf = g => rd.els.filter(el => g.contains(el));
  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top top', end: '+=2200', pin: '.steps-pin', scrub: 1,
      onUpdate: s => setRackStep(Math.min(3, Math.floor(s.progress * 4 * .999))) } });
    tl.to([...$$('.c', rack), ...$$(':scope > text', rack)], { opacity: 1, duration: .3 }, 0);
    groups.forEach((g, i) => {
      tl.to(linesOf(g), { strokeDashoffset: 0, fillOpacity: 1, duration: 1, stagger: .03, ease: 'power1.inOut' }, i * 1.2)
        .to(softOf(g), { opacity: 1, duration: .3 }, i * 1.2 + .7);
    });
    tl.to({}, { duration: .4 });
    return () => { setRackStep(0); };
  });
  mm.add('(max-width: 960px)', () => {
    gsap.set([...$$('.c', rack), ...$$(':scope > text', rack)], { opacity: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: rack, start: 'top 75%' } });
    groups.forEach((g, i) => {
      tl.call(() => setRackStep(i), null, i * .9)
        .to(linesOf(g), { strokeDashoffset: 0, fillOpacity: 1, duration: 1, stagger: .02, ease: 'power2.out' }, i * .9)
        .to(softOf(g), { opacity: 1, duration: .4 }, i * .9 + .6);
    });
  });
  setRackStep(0);

  // paketi
  gsap.from('.offer-tape', { scaleY: 0, transformOrigin: 'top', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.offer', start: 'top 85%' } });

  // podnožje
  gsap.fromTo('.foot-big', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 30%', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
