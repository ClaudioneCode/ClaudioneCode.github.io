// Small effects: text that decodes itself, buttons that lean toward the pointer, a strip that drifts while idle.
(() => {
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

// Each letter cycles through glyphs and settles left to right.
function scramble(el, duration = 900) {
  if (still || el.dataset.busy) return;
  el.dataset.text ??= el.textContent;
  el.dataset.busy = '1';
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / duration, 1);
    // read the target every frame: it can change mid-animation (the reel's address bar)
    const target = el.dataset.text;
    const settled = Math.floor(t * target.length);
    el.textContent = [...target].map((c, i) => (i < settled || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    if (t < 1) requestAnimationFrame(frame);
    else { el.textContent = el.dataset.text; delete el.dataset.busy; }
  };
  requestAnimationFrame(frame);
}

window.scrambleText = scramble;
const name = document.querySelector('.scramble span');
if (name) setTimeout(() => scramble(name, 1400), 350);
document.querySelectorAll('.nav a, .name').forEach((a) => a.addEventListener('pointerenter', () => scramble(a, 450)));

// Project titles and section headings decode once as they arrive.
const titles = document.querySelectorAll('.cluster h3, .work-head h2, .shell h2, .lineup h2, [data-scramble]');
const seen = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e) => {
    seen.unobserve(e.target);
    // only plain-text headings: the <br> in two-line titles must survive
    if (!e.target.querySelector('br, *')) setTimeout(() => scramble(e.target, 700), 150);
  });
}, { threshold: 0.6 });
titles.forEach((t) => seen.observe(t));

// Magnetic buttons: a few pixels toward the pointer, back on leave.
if (!still && matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });
}
})();
