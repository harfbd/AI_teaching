const spreads = [...document.querySelectorAll('.spread')];
const menu = document.querySelector('.contents');
const menuButton = document.querySelector('.menu-button');
const chapterList = document.querySelector('#chapterList');
const currentPage = document.querySelector('#currentPage');
const totalPages = document.querySelector('#totalPages');
const progressBar = document.querySelector('#progressBar');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let current = 0;
let scrollTicking = false;

function pad(value) { return String(value).padStart(2, '0'); }

function buildMenu() {
  chapterList.innerHTML = spreads.map((spread, index) =>
    `<li><a href="#${spread.id}" data-page="${index}"><span>${pad(index + 1)}</span>${spread.dataset.title}</a></li>`
  ).join('');

  spreads.forEach((spread, index) => {
    const folio = spread.querySelector('.folio');
    if (folio) folio.textContent = `${pad(index + 1)} / ${pad(spreads.length)}`;
  });

  totalPages.textContent = pad(spreads.length);
}

function updateReader(index) {
  current = Math.max(0, Math.min(index, spreads.length - 1));
  currentPage.textContent = pad(current + 1);
  progressBar.style.setProperty('--reader-progress', `${((current + 1) / spreads.length) * 100}%`);
  prevButton.disabled = current === 0;
  nextButton.disabled = current === spreads.length - 1;

  chapterList.querySelectorAll('a').forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function goTo(index) {
  const nextIndex = Math.max(0, Math.min(index, spreads.length - 1));
  const target = spreads[nextIndex];
  if (!target) return;

  updateReader(nextIndex);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${target.id}`);
}

function syncFromScroll() {
  const readingLine = Math.min(window.innerHeight * .38, 340);
  let visibleIndex = 0;

  spreads.forEach((spread, index) => {
    if (spread.getBoundingClientRect().top <= readingLine) visibleIndex = index;
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    visibleIndex = spreads.length - 1;
  }

  updateReader(visibleIndex);
  scrollTicking = false;
}

function queueScrollSync() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(syncFromScroll);
}

prevButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));
document.addEventListener('keydown', event => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('a, button, input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(current + 1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(current - 1);
});
window.addEventListener('scroll', queueScrollSync, { passive: true });
window.addEventListener('resize', queueScrollSync);
menuButton.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelector('[data-close-menu]').addEventListener('click', () => menu.classList.remove('open'));
menu.addEventListener('click', event => {
  const link = event.target.closest('a[data-page]');
  if (!link) return;
  event.preventDefault();
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  goTo(Number(link.dataset.page));
});

buildMenu();
syncFromScroll();
