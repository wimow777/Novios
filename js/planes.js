// ============================================================
//  PLANES & METAS — lee desde Google Sheets público
// ============================================================

let _planesLoaded = false;

async function buildPlanes() {
  if (_planesLoaded) return;

  const container = document.getElementById('planes-list');
  if (!container) return;

  const url = CONFIG.sheetsUrl;
  if (!url) {
    container.innerHTML = `
      <div class="planes-empty">
        <p>Agrega el link de Google Sheets en <code>js/config.js</code> para ver los planes aquí.</p>
      </div>`;
    return;
  }

  try {
    const res  = await fetch(url);
    const text = await res.text();

    // La respuesta viene envuelta en: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);\s*$/);
    if (!match) throw new Error('Formato inesperado');

    const data = JSON.parse(match[1]);
    const rows = (data.table && data.table.rows) || [];

    const items = rows
      .map(row => ({
        emoji : String(row.c[0]?.v ?? '').trim() || '🌟',
        plan  : String(row.c[1]?.v ?? '').trim(),
        desc  : String(row.c[2]?.v ?? '').trim(),
        estado: String(row.c[3]?.v ?? 'Pendiente').trim(),
      }))
      .filter(item => {
        const planLower = item.plan.toLowerCase();
        const estadoLower = item.estado.toLowerCase();
        return planLower !== '' && 
               planLower !== 'plan' && 
               planLower !== 'b' && 
               estadoLower !== 'estado' &&
               estadoLower !== 'd';
      });

    if (items.length === 0) {
      container.innerHTML = `
        <div class="planes-empty">
          <p>Aún no hay planes. ¡Agrégenlos en el Sheet!</p>
        </div>`;
      return;
    }

    container.innerHTML = '';
    const hasUpdateUrl = !!CONFIG.sheetsUpdateUrl;

    items.forEach((item, i) => {
      const card = document.createElement('div');
      const estadoKey = item.estado.toLowerCase().normalize('NFD')
        .replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
      
      card.className = `plan-card reveal estado-${estadoKey} ${hasUpdateUrl ? 'is-interactive' : ''}`;
      card.style.setProperty('--d', `${i * 0.08}s`);
      
      const toggleBtn = hasUpdateUrl ? `
        <button class="plan-toggle-btn" title="Marcar como hecho/pendiente" onclick="togglePlanStatus(event, this, '${item.plan.replace(/'/g, "\\'")}', '${item.estado.replace(/'/g, "\\'")}')">
          <span class="toggle-icon">✓</span>
          <span class="toggle-spinner"></span>
        </button>
      ` : '';

      card.innerHTML = `
        <span class="plan-emoji">${item.emoji}</span>
        <div class="plan-body">
          <span class="plan-title">${item.plan}</span>
          ${item.desc ? `<span class="plan-desc">${item.desc}</span>` : ''}
        </div>
        <div class="plan-meta-wrap">
          <span class="plan-badge">${item.estado}</span>
          ${toggleBtn}
        </div>
      `;
      container.appendChild(card);
    });

    // Revelar con escalonado (igual que otras secciones fixed)
    container.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 80 + i * 90);
    });

    _planesLoaded = true;

  } catch (err) {
    container.innerHTML = `
      <div class="planes-empty">
        <p>No se pudieron cargar los planes. Revisa que el Sheet sea público.</p>
      </div>`;
    console.error('Planes fetch error:', err);
  }
}

// Función asincrónica para cambiar el estado del plan
async function togglePlanStatus(event, btnEl, planName, currentEstado) {
  event.stopPropagation();
  const card = btnEl.closest('.plan-card');
  if (!card || card.classList.contains('is-updating')) return;

  const badge = card.querySelector('.plan-badge');
  
  // Determinar siguiente estado
  let nextEstado = 'Hecho';
  const currentNormalized = currentEstado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (currentNormalized === 'hecho' || currentNormalized === 'listo') {
    nextEstado = 'Pendiente';
  }

  const nextEstadoKey = nextEstado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  const prevEstadoKey = currentEstado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

  // Actualización optimista de la UI (inmediata y ultra fluida)
  card.classList.add('is-updating');
  card.classList.remove(`estado-${prevEstadoKey}`);
  card.classList.add(`estado-${nextEstadoKey}`);
  if (badge) {
    badge.textContent = nextEstado;
  }

  try {
    const res = await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors', // Evita problemas de CORS en GitHub Pages
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        plan: planName,
        estado: nextEstado
      })
    });

    // Pequeño retardo artificial para una transición visual impecable
    await new Promise(resolve => setTimeout(resolve, 800));

    // Confirmación de éxito
    card.classList.remove('is-updating');
    card.classList.add('update-success');
    setTimeout(() => card.classList.remove('update-success'), 1200);

    // Actualizar el botón para el siguiente clic
    btnEl.setAttribute('onclick', `togglePlanStatus(event, this, '${planName.replace(/'/g, "\\'")}', '${nextEstado}')`);

  } catch (err) {
    console.error('Error al actualizar el plan:', err);
    
    // Revertir si ocurre un error
    card.classList.remove('is-updating');
    card.classList.remove(`estado-${nextEstadoKey}`);
    card.classList.add(`estado-${prevEstadoKey}`);
    if (badge) {
      badge.textContent = currentEstado;
    }
    
    card.classList.add('update-error');
    setTimeout(() => card.classList.remove('update-error'), 2000);
  }
}
