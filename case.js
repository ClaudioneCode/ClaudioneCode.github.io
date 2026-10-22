// Case study pages: the app tilts up, names light up, figures count, the diagram draws in, screens slide sideways.
(() => {
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const tilt = document.querySelector('.tilt');
const words = [...document.querySelectorAll('.names span')];
const namesBox = document.querySelector('.names');
const screens = document.querySelector('.bs-screens');
const track = document.querySelector('.hs-track');

// The sideways section needs enough height for its track to pass by.
function sizeScreens() {
  if (!track) return 0;
  const travel = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 40);
  screens.style.height = `${innerHeight + travel}px`;
  return travel;
}
let travel = sizeScreens();

function frame() {
  const vh = innerHeight;
  if (tilt && !still) {
    const r = tilt.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh * 0.85));
    tilt.style.transform = `perspective(1600px) rotateX(${(1 - p) * 26}deg) scale(${0.9 + 0.1 * p})`;
  }
  if (namesBox) {
    // words light in reading order as the paragraph crosses the middle of the screen
    const n = namesBox.getBoundingClientRect();
    const lit = Math.round(clamp((vh * 0.8 - n.top) / (n.height + vh * 0.3)) * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
  }
  if (track) {
    const s = screens.getBoundingClientRect();
    const q = clamp(-s.top / Math.max(1, s.height - vh));
    track.style.transform = `translateX(${-q * travel}px)`;
  }
}

let queued = false;
const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); }); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', () => { travel = sizeScreens(); request(); });
addEventListener('load', () => { travel = sizeScreens(); frame(); });
frame();

// Figures count up from zero the first time they are seen.
const counter = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e) => {
    counter.unobserve(e.target);
    const el = e.target;
    const to = Number(el.dataset.count);
    const dec = Number(el.dataset.dec || 0);
    if (still || to === 0) return;
    const t0 = performance.now();
    const step = (now) => {
      const t = clamp((now - t0) / 1400);
      el.textContent = (to * (1 - (1 - t) ** 3)).toFixed(dec);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => counter.observe(el));

// The diagram's nodes arrive in the order data flows.
const diagram = document.querySelector('.diagram');
if (diagram) {
  new IntersectionObserver((entries, io) => {
    if (entries[0].isIntersecting) { diagram.classList.add('in'); io.disconnect(); }
  }, { threshold: 0.3 }).observe(diagram);
}
})();
