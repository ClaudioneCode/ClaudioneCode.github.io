// About: the career line fills as you read, the role in the middle of the screen lights up.
// Contact: an email composer (mailto, nothing is sent from the page), a copy button and Milan's local time.
(() => {
const timeline = document.querySelector('.timeline');
const jobs = [...timeline.querySelectorAll('.job')];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function frame() {
  const mid = innerHeight * 0.55;
  const r = timeline.getBoundingClientRect();
  timeline.style.setProperty('--fill', clamp((mid - r.top) / r.height));
  let current = -1;
  jobs.forEach((job, i) => { if (job.getBoundingClientRect().top < mid) current = i; });
  jobs.forEach((job, i) => { job.classList.toggle('now', i === current); job.classList.toggle('past', i < current); });
}
let queued = false;
addEventListener('scroll', () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; frame(); });
}, { passive: true });
frame();

// Composer: builds the email; inputs are length-limited and only ever placed in a mailto URL.
const MAIL = 'claudio.dilecce.lavoro@gmail.com';
const form = document.querySelector('.composer');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const topic = String(data.get('topic') || 'Hello').slice(0, 60);
  const name = String(data.get('name') || '').trim().slice(0, 80);
  const message = String(data.get('message') || '').trim().slice(0, 2000);
  const subject = name ? `${topic} · ${name}` : topic;
  const body = `${message || 'Hi Claudio,'}\n\n${name}`.trim();
  location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const copy = document.querySelector('.copy');
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copy.dataset.copy);
    copy.textContent = 'Copied';
  } catch {
    copy.textContent = 'Select and copy';
  }
  setTimeout(() => { copy.textContent = 'Copy'; }, 1800);
});

// Milan's time, so a visitor in another time zone knows when I am likely to answer.
const clock = document.querySelector('.clock');
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
const tick = () => { clock.textContent = `${fmt.format(new Date())} there now`; };
tick();
setInterval(tick, 20000);
})();
