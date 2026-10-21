// The opening scene, driven by scroll: the name lifts away, the window tilts up flat,
// then one project at a time wipes in while its site scrolls inside the window.
(() => {
const reel = document.querySelector('.reel');
const stage = reel.querySelector('.stage');
const intro = reel.querySelector('.intro');
const screen = reel.querySelector('.screen');
const addr = reel.querySelector('.addr');
const ghost = reel.querySelector('.ghost');
const shots = [...reel.querySelectorAll('.shot')];
const infos = [...reel.querySelectorAll('.info')];
const navs = [...reel.querySelectorAll('[data-go]')];
const fades = [reel.querySelector('.infos'), reel.querySelector('.reel-nav')];
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
// With reduced motion there is no scene: the four projects are listed, nothing is pinned.
if (still) { reel.classList.add('flat'); return; }

const INTRO = 0.9; // screens of scroll spent on the opening
const SEG = 1.25; // screens of scroll per project
const WIPE = 0.2; // share of a segment the next project takes to wipe in
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

let vh = innerHeight;
let start = { x: 0, y: 0 };
let active = -1;
let tilt = { x: 0, y: 0 };

function layout() {
  vh = innerHeight;
  reel.style.height = `${(INTRO + shots.length * SEG + 1) * vh}px`;
  // where the window starts: centred, low in the first screen
  const r = { left: screen.offsetLeft, top: screen.offsetTop, w: screen.offsetWidth };
  start = { x: stage.clientWidth / 2 - (r.left + r.w / 2), y: vh * 0.66 - r.top };
}

function setActive(i) {
  if (i === active) return;
  active = i;
  infos.forEach((el, k) => { el.classList.toggle('on', k === i); el.inert = k !== i; });
  navs.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
  addr.dataset.text = shots[i].dataset.addr;
  addr.textContent = shots[i].dataset.addr;
  window.scrambleText?.(addr, 500);
  ghost.textContent = infos[i].querySelector('h2').textContent;
}

function frame() {
  const u = (scrollY - reel.offsetTop) / vh;
  const t = ease(clamp(u / INTRO));
  const pos = clamp((u - INTRO) / SEG, 0, shots.length - 0.001);

  intro.style.transform = `translateY(${-t * 22}vh)`;
  intro.style.opacity = clamp(1 - t * 1.6);
  const k = 1 - t;
  const rot = still ? 0 : 34 * k;
  screen.style.transform = `translate(${start.x * k}px, ${start.y * k}px) perspective(1600px) rotateX(${rot + tilt.x * t}deg) rotateY(${tilt.y * t}deg) scale(${0.84 + 0.16 * t})`;
  // invisible layers must not swallow clicks meant for what is visible
  intro.style.pointerEvents = t > 0.5 ? 'none' : '';
  fades.forEach((el) => { el.style.opacity = clamp((t - 0.55) / 0.45); el.style.pointerEvents = t > 0.55 ? '' : 'none'; });

  const i = Math.min(shots.length - 1, Math.floor(pos + WIPE / 2));
  setActive(i);
  shots.forEach((shot, n) => {
    const enter = n === 0 ? 1 : clamp((pos - n + WIPE) / WIPE);
    shot.style.clipPath = enter >= 1 ? '' : `inset(${(1 - enter) * 100}% 0 0 0)`;
    shot.style.visibility = enter > 0 ? 'visible' : 'hidden';
    const local = clamp(pos - n);
    const imgs = shot.querySelectorAll('img');
    if (shot.classList.contains('tall')) {
      const img = imgs[0];
      const travel = Math.max(0, img.offsetHeight - shot.clientHeight);
      img.style.transform = `translateY(${-ease(local) * travel}px)`;
    } else if (imgs.length > 1) {
      // several screens of one app: each slides in from the right
      const sub = local * imgs.length;
      imgs.forEach((img, j) => {
        const e = j === 0 ? 1 : clamp((sub - j + 0.3) / 0.3);
        img.style.clipPath = e >= 1 ? '' : `inset(0 0 0 ${(1 - e) * 100}%)`;
      });
    } else {
      imgs[0].style.transform = `scale(${1 + 0.08 * local})`;
    }
  });
  navs.forEach((b, n) => { b.querySelector('i').style.setProperty('--p', clamp(pos - n)); });
  ghost.style.transform = `translateX(${-(pos % 1) * 18}vw)`;
}

let queued = false;
const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); }); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', () => { layout(); request(); });

navs.forEach((b) => b.addEventListener('click', () => {
  const n = Number(b.dataset.go);
  scrollTo({ top: reel.offsetTop + (INTRO + n * SEG + WIPE + 0.02) * vh, behavior: still ? 'auto' : 'smooth' });
}));

// The window leans a little toward the pointer.
if (!still && matchMedia('(pointer: fine)').matches) {
  stage.addEventListener('pointermove', (e) => {
    tilt = { x: (0.5 - e.clientY / vh) * 6, y: (e.clientX / innerWidth - 0.5) * 8 };
    request();
  });
  stage.addEventListener('pointerleave', () => { tilt = { x: 0, y: 0 }; request(); });
}

layout();
frame();
addEventListener('load', () => { layout(); frame(); });
})();
