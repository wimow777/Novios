// ============================================================
//  CONTRASEÑA + APERTURA DE CORTINAS
// ============================================================

function checkPassword() {
  const input = document.getElementById('password-input').value.trim().toLowerCase();
  if (input === CONFIG.password.toLowerCase()) {
    unlockPage();
  } else {
    const err = document.getElementById('error-msg');
    err.textContent = "Eso no es, mi amor. Intenta de nuevo 💜";
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
    setTimeout(() => { err.textContent = ''; }, 3000);
  }
}

function unlockPage() {
  // Abrir cortinas — transition dura 1800ms (definida en .curtain)
  document.querySelector('.curtain-left').classList.add('open');
  document.querySelector('.curtain-right').classList.add('open');

  // Esperar que la transición termine (1800ms) + pequeño buffer
  setTimeout(() => {
    const lock = document.getElementById('lock-screen');
    lock.style.transition = 'opacity 0.6s ease';
    lock.style.opacity = '0';
    setTimeout(() => {
      lock.style.display = 'none';
      document.getElementById('main-content').classList.remove('hidden');
      initPage();
    }, 600);
  }, 1900);
}

document.getElementById('password-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPassword();
});
