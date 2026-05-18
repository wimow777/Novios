// ============================================================
//  INICIALIZACIÓN PRINCIPAL
// ============================================================

function getDays() {
  return Math.floor((new Date() - CONFIG.startDate) / 86400000);
}

// Convierte {id, name, caption, src} de Drive → {src, caption, id} que usa la página
function drivePhotosToConfig(drivePhotos) {
  return (drivePhotos || []).map(p => ({
    id:      p.id || '',
    src:     p.src || (p.id ? `https://lh3.googleusercontent.com/d/${p.id}` : ''),
    caption: p.caption || p.name || ''
  }));
}

// Pide fotos al Apps Script y actualiza CONFIG.photos
async function loadPhotosFromDrive() {
  if (!CONFIG.googleDriveFolderId || !CONFIG.sheetsUpdateUrl) return;
  try {
    const res  = await fetch(`${CONFIG.sheetsUpdateUrl}?action=getPhotos&folderId=${CONFIG.googleDriveFolderId}&token=${encodeURIComponent(CONFIG.apiToken)}`);
    const data = await res.json();
    if (data && data.photos && data.photos.length > 0) {
      CONFIG.photos = drivePhotosToConfig(data.photos);
    }
  } catch (err) {
    console.error('Error al cargar fotos de Google Drive:', err);
  }
}

async function initPage() {
  const days = getDays();
  animateDaysCounter('days-count', days);
  animateDaysCounter('days-count-2', days);
  createPetals();
  createNotes();
  createCierreSparkles();
  if (typeof initSectionDecos === 'function') initSectionDecos('carta');
  await loadTimeline();
  showView('home');

  await loadPhotosFromDrive();

  createPolaroids();
  buildGallery();
}
