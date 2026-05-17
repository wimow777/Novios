// ============================================================
//  GALERÍA + LIGHTBOX
// ============================================================

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
    item.addEventListener('click', () => openLightbox(photo.src, photo.caption));
    grid.appendChild(item);
  });
}

function openLightbox(src, caption) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-caption').textContent = caption || '';
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
