// ============================================================
//  GALERÍA + LIGHTBOX + ELIMINAR FOTOS
// ============================================================

let currentPhotoId = null;

function buildGallery() {
  if (!CONFIG.photos || CONFIG.photos.length === 0) return;
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';
  CONFIG.photos.forEach(photo => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption || ''}" loading="lazy" />
      ${photo.caption ? `<div class="caption-overlay">${photo.caption}</div>` : ''}
    `;
    item.addEventListener('click', () => openLightbox(photo.src, photo.caption, photo.id));
    grid.appendChild(item);
  });
}

function openLightbox(src, caption, id) {
  currentPhotoId = id || null;
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-caption').textContent = caption || '';
  
  const delBtn = document.getElementById('lightbox-delete-btn');
  if (delBtn) {
    if (currentPhotoId && CONFIG.sheetsUpdateUrl) {
      delBtn.style.display = 'inline-flex';
    } else {
      delBtn.style.display = 'none';
    }
  }

  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

async function deleteCurrentPhoto() {
  if (!currentPhotoId) return;
  
  const confirmDelete = confirm('¿De verdad quieres eliminar esta foto permanentemente de tu Google Drive? 😢');
  if (!confirmDelete) return;

  const delBtn = document.getElementById('lightbox-delete-btn');
  delBtn.disabled = true;
  delBtn.innerHTML = '<span>Eliminando... ⌛</span>';

  try {
    await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        action: 'deletePhoto',
        fileId: currentPhotoId
      })
    });

    // Esperar un breve momento (1.8s) para que Drive borre el archivo y recargar
    setTimeout(async () => {
      try {
        const res = await fetch(`${CONFIG.sheetsUpdateUrl}?action=getPhotos&folderId=${CONFIG.googleDriveFolderId}`);
        const data = await res.json();
        if (data && data.photos) {
          CONFIG.photos = drivePhotosToConfig(data.photos);
          buildGallery();
        }
      } catch (err) {
        console.error('Error al refrescar fotos:', err);
      }
      
      delBtn.disabled = false;
      delBtn.innerHTML = '<span>Eliminar Foto 🗑️</span>';
      closeLightbox();
      alert('¡Foto eliminada con éxito! 🗑️');
    }, 1800);

  } catch (err) {
    console.error('Error al borrar la foto:', err);
    alert('Hubo un error al eliminar la foto. Inténtalo de nuevo.');
    delBtn.disabled = false;
    delBtn.innerHTML = '<span>Eliminar Foto 🗑️</span>';
  }
}

document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
