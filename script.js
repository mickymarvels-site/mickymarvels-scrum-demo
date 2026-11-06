const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); menu.focus(); } });
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { document.querySelector('select[name="service"]').value = link.dataset.service; }));
document.querySelector('#year').textContent = new Date().getFullYear();
// Local previews cannot process Netlify Forms. Do not imply that a request was sent.
const form = document.querySelector('form');
form.addEventListener('submit', event => {
  if (location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname)) {
    event.preventDefault();
    document.querySelector('#form-status').textContent = 'Preview only: your form entries are valid. Submission becomes available after deployment to Netlify with Forms enabled.';
  }
});
