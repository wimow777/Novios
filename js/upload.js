// ============================================================
//  FOTO UPLOADER (GOOGLE DRIVE SYNC)
// ============================================================

let selectedFile = {
  base64Data: '',
  mimeType: '',
  fileName: '',
  originalName: ''
};

// Mostrar botón de subir foto solo si está configurada la integración de Google
document.addEventListener('DOMContentLoaded', () => {
  if (CONFIG.googleDriveFolderId && CONFIG.sheetsUpdateUrl) {
    const btn = document.getElementById('upload-trigger-btn');
    if (btn) btn.style.display = 'inline-flex';
  }
});

function openUploadModal() {
  const modal = document.getElementById('upload-modal');
  if (!modal) return;

  // Resetear estados
  selectedFile = { base64Data: '', mimeType: '', fileName: '', originalName: '' };
  document.getElementById('upload-file-input').value = '';
  document.getElementById('upload-caption-input').value = '';
  document.getElementById('upload-error-msg').textContent = '';
  
  // Resetear área de arrastre
  const dragArea = document.getElementById('upload-drag-area');
  dragArea.classList.remove('has-preview');
  
  const existingImg = dragArea.querySelector('img');
  if (existingImg) existingImg.remove();

  const submitBtn = document.getElementById('upload-submit-btn');
  submitBtn.disabled = true;
  submitBtn.classList.remove('is-uploading');

  // Mostrar modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  const modal = document.getElementById('upload-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function triggerFileSelect() {
  document.getElementById('upload-file-input').click();
}

// Compresión de imagen en el cliente usando HTML5 Canvas
function compressAndLoadImage(file) {
  const reader = new FileReader();
  const errorMsg = document.getElementById('upload-error-msg');
  const submitBtn = document.getElementById('upload-submit-btn');
  const dragArea = document.getElementById('upload-drag-area');
  
  errorMsg.textContent = '';
  submitBtn.disabled = true;

  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Configurar tamaño máximo de 1200px para carga móvil rápida
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      // Dibujar en un canvas para redimensionar y comprimir
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Exportar como JPEG al 82% de calidad (excelente balance visual/peso)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      const base64Data = compressedDataUrl.split(',')[1];

      selectedFile = {
        base64Data: base64Data,
        mimeType: 'image/jpeg',
        originalName: file.name,
        fileName: file.name.replace(/\.[^/.]+$/, "") + '.jpg' // Reemplaza extensión a jpg
      };

      // Crear previsualización visual premium en el área de arrastre
      dragArea.classList.add('has-preview');
      const existingImg = dragArea.querySelector('img');
      if (existingImg) existingImg.remove();

      const previewImg = document.createElement('img');
      previewImg.src = compressedDataUrl;
      dragArea.appendChild(previewImg);

      // Activar botón de subir
      submitBtn.disabled = false;
    };
    img.onerror = function() {
      errorMsg.textContent = 'El archivo seleccionado no es una imagen válida.';
    };
    img.src = e.target.result;
  };
  
  reader.readAsDataURL(file);
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    compressAndLoadImage(files[0]);
  }
}

// Drag & Drop
const dragArea = document.getElementById('upload-drag-area');
if (dragArea) {
  ['dragenter', 'dragover'].forEach(eventName => {
    dragArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragArea.style.borderColor = 'var(--lila-lt)';
      dragArea.style.background = 'rgba(168, 85, 247, 0.08)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dragArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dragArea.style.borderColor = '';
      dragArea.style.background = '';
    }, false);
  });

  dragArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      compressAndLoadImage(files[0]);
    }
  }, false);
}

// Subir Foto a Google Drive a través del Apps Script Web App
async function submitPhoto() {
  if (!selectedFile.base64Data) return;

  const submitBtn = document.getElementById('upload-submit-btn');
  const errorMsg = document.getElementById('upload-error-msg');
  const captionInput = document.getElementById('upload-caption-input');
  
  errorMsg.textContent = '';
  submitBtn.disabled = true;
  submitBtn.classList.add('is-uploading');

  let uploadFileName = selectedFile.fileName;
  const userCaption = captionInput.value.trim();
  if (userCaption) {
    // Sanitizar nombre de archivo básico
    const sanitizedCaption = userCaption.replace(/[\\\/:*?"<>|]/g, '');
    if (sanitizedCaption) {
      uploadFileName = sanitizedCaption + '.jpg';
    }
  }

  const tempId = 'temp_' + Date.now();
  
  // 1. Crear foto optimista local y agregarla al inicio de CONFIG.photos
  const optimisticPhoto = {
    id: tempId,
    src: `data:image/jpeg;base64,${selectedFile.base64Data}`, // base64 temporal
    caption: userCaption || '',
    isTemp: true // Activa shimmer y latido de corazón en CSS
  };

  CONFIG.photos = CONFIG.photos || [];
  CONFIG.photos.unshift(optimisticPhoto);
  
  // 2. Re-renderizar Galería y Polaroids al instante
  buildGallery();
  if (typeof createPolaroids === 'function') {
    createPolaroids();
  }

  // 3. Desplazar vista de la galería al inicio de forma suave para ver la nueva foto
  const viewGaleria = document.getElementById('view-galeria');
  if (viewGaleria) {
    viewGaleria.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 4. Cerrar el modal de carga y restaurar botones de inmediato
  closeUploadModal();
  submitBtn.disabled = false;
  submitBtn.classList.remove('is-uploading');
  
  if (typeof showToast === 'function') {
    showToast('¡Subiendo foto! Se mostrará en la galería mientras se guarda... 💜', 'success');
  }

  const payload = {
    action: 'uploadPhoto',
    folderId: CONFIG.googleDriveFolderId,
    base64Data: selectedFile.base64Data,
    mimeType: selectedFile.mimeType,
    fileName: uploadFileName,
    token: CONFIG.apiToken
  };

  try {
    // Ejecutar la petición en segundo plano
    await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    });

    // 5. Esperar 4.5s e iniciar sincronización silenciosa
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
          if (typeof showToast === 'function') {
            showToast('¡Foto sincronizada con Google Drive con éxito! 💜', 'success');
          }
        }
      } catch (err) {
        console.error('Error al sincronizar fotos tras subida:', err);
      }
    }, 4500);

  } catch (err) {
    console.error('Error en la carga en Drive:', err);
    // Quitar la foto temporal de la vista si falló totalmente la red
    CONFIG.photos = CONFIG.photos.filter(p => p.id !== tempId);
    buildGallery();
    if (typeof createPolaroids === 'function') {
      createPolaroids();
    }
    if (typeof showToast === 'function') {
      showToast('Error de conexión al subir la foto a Google Drive 😢', 'error');
    }
  }
}
