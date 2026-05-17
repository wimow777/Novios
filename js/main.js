// ============================================================
//  INICIALIZACIÓN PRINCIPAL
// ============================================================

function getDays() {
  return Math.floor((new Date() - CONFIG.startDate) / 86400000);
}

function initPage() {
  const days = getDays();
  animateDaysCounter('days-count', days);
  animateDaysCounter('days-count-2', days);
  createPetals();
  createNotes();
  createPolaroids();
  createCierreSparkles();
  if (typeof initSectionDecos === 'function') initSectionDecos('carta');
  buildGallery();
  buildTimeline();
  showView('home');
}
