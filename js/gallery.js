// ============================================================
//  GALERÍA + LIGHTBOX + ELIMINAR FOTOS
// ============================================================

let currentPhotoId = null;

// ============================================================
//  NOTIFICACIÓN TOAST GLOBAL
// ============================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'error' ? '❌' : '💜';
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Remueve el toast automáticamente al terminar su animación
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 400);
  }, 4200);
}

function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!CONFIG.photos || CONFIG.photos.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; color: rgba(200, 180, 240, 0.65); font-family: 'Inter', sans-serif; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(168,85,247,0.25);">
        <p style="font-size: 0.95rem; margin: 0 0 0.5rem; font-weight: 500;">Aún no hay fotos en tu Google Drive 😢</p>
        <p style="font-size: 0.8rem; margin: 0; opacity: 0.85;">¡Añade la primera con el botón de subir! 💜</p>
      </div>`;
    return;
  }

  CONFIG.photos.forEach(photo => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    if (photo.isTemp) {
      item.classList.add('is-temp');
    }
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
    // Solo permitir borrar si es una foto real y ya guardada en Drive
    if (currentPhotoId && !currentPhotoId.toString().startsWith('temp_') && CONFIG.sheetsUpdateUrl) {
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

function deleteCurrentPhoto() {
  if (!currentPhotoId) return;
  
  showConfirm('¿De verdad quieres eliminar esta foto permanentemente de tu Google Drive? 😢', async () => {
    const originalPhotos = [...CONFIG.photos];
    const targetId = currentPhotoId;

    // 1. Actualización Optimista e Inmediata de la UI
    CONFIG.photos = CONFIG.photos.filter(p => p.id !== targetId);
    buildGallery();
    
    if (typeof createPolaroids === 'function') {
      createPolaroids();
    }

    closeLightbox();
    showToast('¡Foto eliminada! Sincronizando con Google Drive... 🗑️', 'success');

    // 2. Ejecutar petición en segundo plano sin interrumpir al usuario
    try {
      await fetch(CONFIG.sheetsUpdateUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          action: 'deletePhoto',
          fileId: targetId,
          token: CONFIG.apiToken
        })
      });

      // 3. Sincronización silenciosa en background tras 4 segundos
      setTimeout(async () => {
        try {
          const res = await fetch(`${CONFIG.sheetsUpdateUrl}?action=getPhotos&folderId=${CONFIG.googleDriveFolderId}&token=${encodeURIComponent(CONFIG.apiToken)}`);
          const data = await res.json();
          if (data && data.photos) {
            CONFIG.photos = drivePhotosToConfig(data.photos);
            buildGallery();
            if (typeof createPolaroids === 'function') {
              createPolaroids();
            }
          }
        } catch (err) {
          console.error('Error al resincronizar fotos tras eliminación:', err);
        }
      }, 4000);

    } catch (err) {
      console.error('Error al borrar la foto en Drive:', err);
      // Rollback optimista en caso de error
      CONFIG.photos = originalPhotos;
      buildGallery();
      if (typeof createPolaroids === 'function') {
        createPolaroids();
      }
      showToast('Error de conexión al eliminar. Se ha restaurado la foto en pantalla.', 'error');
    }
  });
}

document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
