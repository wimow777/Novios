// ============================================================
//  APERTURA DE CORTINAS (SIN CONTRASEÑA)
// ============================================================

function unlockPage() {
  // Ocultar la caja de seguridad con una animación de escala y desvanecimiento
  const lockBox = document.querySelector('.lock-box');
  if (lockBox) {
    lockBox.style.opacity = '0';
    lockBox.style.transform = 'translate(-50%, -45%) scale(0.95)';
    lockBox.style.transition = 'all 0.5s ease';
  }

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
