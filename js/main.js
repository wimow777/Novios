// ============================================================
//  INICIALIZACIÓN PRINCIPAL
// ============================================================

function getDays() {
  return Math.floor((new Date() - CONFIG.startDate) / 86400000);
}

async function initPage() {
  const days = getDays();
  animateDaysCounter('days-count', days);
  animateDaysCounter('days-count-2', days);
  createPetals();
  createNotes();
  createCierreSparkles();
  if (typeof initSectionDecos === 'function') initSectionDecos('carta');
  buildTimeline();
  showView('home');

  // Cargar fotos desde Google Drive si está configurado
  if (CONFIG.googleDriveFolderId && CONFIG.sheetsUpdateUrl) {
    try {
      const res = await fetch(`${CONFIG.sheetsUpdateUrl}?action=getPhotos&folderId=${CONFIG.googleDriveFolderId}`);
      const data = await res.json();
      if (data.status === 'success' && data.photos && data.photos.length > 0) {
        CONFIG.photos = data.photos;
      }
    } catch (err) {
      console.error('Error al cargar fotos de Google Drive:', err);
    }
  }

  // Ahora que las fotos están cargadas, creamos la galería y los polaroids
  createPolaroids();
  buildGallery();
}
