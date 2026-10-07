// Theme toggle (persisted per viewer; falls back silently if storage is blocked)
const root = document.documentElement;
try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
document.querySelector('.theme-btn').addEventListener('click', () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const links = document.querySelector('.links');
menuBtn.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });

// Countdown to the next upcoming deadline
const milestones = [
  ['Submissions due', 'November 20, 2026', '2026-11-20T23:59:00-12:00'],
  ['Notifications', 'December 2, 2026', '2026-12-02T23:59:00-12:00'],
  ['Workshop begins', 'February 22, 2027', '2027-02-22T08:30:00-05:00'],
];
function tick() {
  const now = Date.now();
  const m = milestones.find(x => new Date(x[2]) > now);
  const set = (id, v) => document.getElementById(id).textContent = v;
  if (!m) { document.getElementById('countdown').style.display = 'none'; return; }
  const ms = new Date(m[2]) - now;
  set('cd-label', m[0]); set('cd-date', m[1]);
  set('cd-d', Math.floor(ms / 864e5));
  set('cd-h', Math.floor(ms / 36e5) % 24);
  set('cd-m', Math.floor(ms / 6e4) % 60);
}
tick(); setInterval(tick, 30000);

// Hero background: drifting agent network
(function () {
  const c = document.getElementById('net');
  if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d');
  let w, h, nodes;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(w * h / 18000);
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 2 + Math.random() * 2.5
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const dark = getComputedStyle(root).getPropertyValue('--bg').trim() === '#08151e';
    const col = dark ? '92,200,240' : '14,142,166';
    for (const a of nodes) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 140) { ctx.strokeStyle = `rgba(${col},${.35 * (1 - d / 140)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const a of nodes) { ctx.fillStyle = `rgba(${col},.6)`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill(); }
    requestAnimationFrame(draw);
  }
  resize(); addEventListener('resize', resize); draw();
})();

// Progressive enhancement: scroll reveal, scrollspy, back-to-top
document.body.classList.remove('no-js');
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });

const navLinks = [...document.querySelectorAll('.links a')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });

const toTop = document.querySelector('.to-top');
addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 700), { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
