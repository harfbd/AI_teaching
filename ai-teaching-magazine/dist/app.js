const spreads = [...document.querySelectorAll('.spread')];
const menu = document.querySelector('.contents');
const menuButton = document.querySelector('.menu-button');
const chapterList = document.querySelector('#chapterList');
const currentPage = document.querySelector('#currentPage');
const progressBar = document.querySelector('#progressBar');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let current = 0;

function pad(value) { return String(value).padStart(2, '0'); }

function buildMenu() {
  chapterList.innerHTML = spreads.map((spread, index) =>
    `<li><a href="#${spread.id}"><span>${pad(index + 1)}</span>${spread.dataset.title}</a></li>`
  ).join('');
}

function updateReader(index) {
  current = Math.max(0, Math.min(index, spreads.length - 1));
  currentPage.textContent = pad(current + 1);
  progressBar.style.width = `${((current + 1) / 12) * 100}%`;
  prevButton.disabled = current === 0;
  nextButton.disabled = current === spreads.length - 1;
}

function goTo(index) {
  const target = spreads[Math.max(0, Math.min(index, spreads.length - 1))];
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) updateReader(spreads.indexOf(entry.target));
  });
}, { threshold: .55 });

spreads.forEach(spread => observer.observe(spread));
prevButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(current + 1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(current - 1);
});
menuButton.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelector('[data-close-menu]').addEventListener('click', () => menu.classList.remove('open'));
menu.addEventListener('click', event => { if (event.target.closest('a')) menu.classList.remove('open'); });

buildMenu();
updateReader(0);
