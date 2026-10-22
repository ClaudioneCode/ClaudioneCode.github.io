// Real code from each project: highlighted once, then typed line by line when it scrolls into view.
(() => {
const KEYWORDS = {
  js: 'export function const let return if continue for of new await async true false null',
  cs: 'public private async await string var new return Task default switch',
  php: 'function string int void if return array foreach as private public static self',
};
const TOKEN = /(\/\/.*$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\$\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)(?=\s*\()|(\b[A-Za-z_]\w*\b)/gm;

const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function highlightLine(line, words) {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    out += esc(line.slice(last, m.index));
    const [text, comment, str, variable, number, call, word] = m;
    const cls = comment ? 'c' : str ? 's' : variable ? 'v' : number ? 'n' : words.has(call ?? word) ? 'k' : call ? 'f' : '';
    out += cls ? `<span class="t-${cls}">${esc(text)}</span>` : esc(text);
    last = m.index + text.length;
  }
  return out + esc(line.slice(last));
}

function prepare(code) {
  const words = new Set((KEYWORDS[code.dataset.lang] ?? '').split(' '));
  let delay = 0;
  code.innerHTML = code.textContent.split('\n').map((line) => {
    const n = Math.max(line.length, 1);
    const html = `<span class="ln" style="--n:${n};--d:${delay}ms">${highlightLine(line, words) || ' '}</span>`;
    delay += Math.min(n * 9, 380); // long lines type faster so a block takes about two seconds
    return html;
  }).join('\n');
}

const codes = document.querySelectorAll('.code code');
codes.forEach(prepare);
const typer = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e) => { e.target.classList.add('typing'); typer.unobserve(e.target); });
}, { threshold: 0.35 });
codes.forEach((c) => typer.observe(c.closest('.code')));
})();
