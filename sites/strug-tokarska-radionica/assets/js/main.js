// STRUG — mali JS: izbornik, pojavljivanje sekcija, harmonika industrija.
document.documentElement.classList.add('js');

const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open);
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', e => {
  if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
});

const els = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
} else els.forEach(el => el.classList.add('in'));

document.querySelectorAll('.acc li').forEach(li => {
  li.tabIndex = 0;
  const toggle = () => document.querySelectorAll('.acc li').forEach(o => o.classList.toggle('open', o === li));
  li.addEventListener('click', toggle);
  li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});
