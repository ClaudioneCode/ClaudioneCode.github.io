// A small terminal that answers from the page's own content. No eval, no network: input is only matched against a fixed list.
(() => {
const MAIL = 'claudio.dilecce.lavoro@gmail.com';
const COMMANDS = {
  help: () => 'Commands: <b>whoami</b>, <b>projects</b>, <b>open</b> &lt;project&gt;, <b>stack</b>, <b>contact</b>, <b>cv</b>, <b>github</b>, <b>clear</b>.',
  whoami: () => 'Claudio Di Lecce. Senior software engineer and full-stack developer in Milan, at SYS-DAT Group since 2023. Before: consultant and technical lead for enterprise clients, and founder of two companies. In my own time I ship desktop apps, AI assistants and web platforms.',
  ls: () => 'better-stomp/  fieldbot/  smartarchivista/  open-dpp/  tcg-profit-lab/  about.txt',
  'cat about.txt': () => COMMANDS.whoami(),
  projects: () => [
    '<b>better-stomp</b>     Windows app for League of Legends players · released',
    '<b>fieldbot</b>         AI booking assistant on WhatsApp · in development',
    '<b>smartarchivista</b>  document archiving for Windows · live',
    '<b>open-dpp</b>         digital product passports for WordPress · in development',
    '<b>tcg-profit-lab</b>   trading card price tool · personal',
    'Try <b>open better-stomp</b>.',
  ].join('\n'),
  stack: () => 'Angular, TypeScript, C#, .NET · Java, PHP, Node.js, Python · Ionic, Flutter, React Native · Electron · PostgreSQL, MySQL, Oracle, DB2 · WordPress, Magento, PrestaShop · Docker, Cloudflare Workers · Claude API, Stripe.',
  contact: () => `Email <a href="mailto:${MAIL}">${MAIL}</a> · <a href="https://www.linkedin.com/in/claudiodilecce/">LinkedIn</a> · <a href="https://github.com/ClaudioneCode">GitHub</a>`,
  cv: () => { window.open('https://www.linkedin.com/in/claudiodilecce/', '_blank', 'noopener'); return 'Opening LinkedIn…'; },
  github: () => { window.open('https://github.com/ClaudioneCode', '_blank', 'noopener'); return 'Opening GitHub…'; },
  'sudo hire claudio': () => { location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Working together')}`; return 'Permission granted. Opening your email…'; },
};
const PROJECTS = { 'better-stomp': 'p-better-stomp', fieldbot: 'p-fieldbot', smartarchivista: 'p-smartarchivista', 'open-dpp': 'p-open-dpp', 'tcg-profit-lab': 'p-tcg-profit-lab' };

const term = document.querySelector('.term');
const out = term.querySelector('.term-out');
const form = term.querySelector('.term-in');
const input = form.querySelector('input');
const history = [];
let back = 0;

const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function answer(raw) {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
  if (!cmd) return '';
  if (cmd.startsWith('open ')) {
    const id = PROJECTS[cmd.slice(5)];
    if (!id) return `No project called "${esc(cmd.slice(5))}". Try <b>projects</b>.`;
    document.getElementById(id).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    return `Opening ${esc(cmd.slice(5))}…`;
  }
  return COMMANDS[cmd]?.() ?? `command not found: ${esc(cmd)}. Type <b>help</b>.`;
}

function run(raw) {
  if (raw.trim().toLowerCase() === 'clear') { out.innerHTML = ''; return; }
  const p = document.createElement('p');
  p.innerHTML = `<span class="prompt">$</span> ${esc(raw)}\n${answer(raw)}`;
  out.append(p);
  out.scrollTop = out.scrollHeight;
  if (raw.trim()) history.push(raw);
  back = history.length;
}

// Types a command as if someone were at the keyboard, then runs it.
function typeAndRun(cmd) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { run(cmd); return; }
  let i = 0;
  const tick = () => {
    input.value = cmd.slice(0, ++i);
    if (i < cmd.length) setTimeout(tick, 45 + Math.random() * 60);
    else setTimeout(() => { input.value = ''; run(cmd); }, 250);
  };
  tick();
}

form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
input.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  back = Math.max(0, Math.min(history.length, back + (e.key === 'ArrowUp' ? -1 : 1)));
  input.value = history[back] ?? '';
});
document.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => typeAndRun(b.dataset.cmd)));
term.addEventListener('click', (e) => { if (!e.target.closest('a')) input.focus({ preventScroll: true }); });

// The first time the terminal is seen, it introduces itself.
new IntersectionObserver((entries, io) => {
  if (!entries[0].isIntersecting) return;
  io.disconnect();
  setTimeout(() => typeAndRun('whoami'), 500);
}, { threshold: 0.6 }).observe(term);
})();
