// Entrances: each part of a section rises once, staggered.
(() => {
const io = new IntersectionObserver((entries) => {
  entries.filter((en) => en.isIntersecting).forEach((en) => { en.target.classList.add('in'); io.unobserve(en.target); });
}, { rootMargin: '0px 0px -10% 0px' });
// Stagger counts within each project or section, so late blocks do not wait for earlier ones.
document.querySelectorAll('.reveal').forEach((el) => {
  const group = [...el.closest('article, section, footer, body').querySelectorAll('.reveal')];
  el.style.setProperty('--i', Math.min(group.indexOf(el), 5));
  io.observe(el);
});
// A jump (a nav link, End, a restored scroll) can skip past elements before the observer sees them.
let pending = [...document.querySelectorAll('.reveal')];
const catchUp = () => {
  pending = pending.filter((el) => {
    if (el.classList.contains('in')) return false;
    if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('in'); return false; }
    return true;
  });
  if (!pending.length) removeEventListener('scroll', onScroll);
};
let queued = false;
const onScroll = () => { if (!queued) { queued = true; setTimeout(() => { queued = false; catchUp(); }, 120); } };
addEventListener('scroll', onScroll, { passive: true });
})();
