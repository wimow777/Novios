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

    renderPlanes(items);
    _planesLoaded = true;

  } catch (err) {
    container.innerHTML = `
      <div class="planes-empty">
        <p>No se pudieron cargar los planes. Revisa que el Sheet sea público.</p>
      </div>`;
    console.error('Planes fetch error:', err);
  }
}

function renderPlanes(items) {
  const container = document.getElementById('planes-list');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="planes-empty">
        <p>Aún no hay planes. ¡Agrégalos con el botón +!</p>
      </div>`;
    return;
  }

  const hasUpdateUrl = !!CONFIG.sheetsUpdateUrl;

  container.innerHTML = '';
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

    const deleteBtn = hasUpdateUrl ? `
      <button class="plan-delete-btn" title="Eliminar plan" onclick="deletePlan(event, '${item.plan.replace(/'/g, "\\'")}')">✕</button>
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
        ${deleteBtn}
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 80 + i * 90);
  });

  // Mostrar FAB solo si está configurado
  const fab = document.getElementById('fab-add-plan');
  if (fab && hasUpdateUrl) fab.classList.add('visible');
}

// ── Añadir plan ──────────────────────────────────────────────

function openAddPlanModal() {
  document.getElementById('plan-emoji-input').value = '';
  document.getElementById('plan-name-input').value = '';
  document.getElementById('plan-desc-input').value = '';
  document.getElementById('add-plan-error').textContent = '';
  document.getElementById('add-plan-submit').disabled = false;
  document.getElementById('add-plan-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('plan-name-input').focus(), 100);
}

function closeAddPlanModal() {
  document.getElementById('add-plan-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

async function submitNewPlan() {
  const emoji  = document.getElementById('plan-emoji-input').value.trim() || '🌟';
  const name   = document.getElementById('plan-name-input').value.trim();
  const desc   = document.getElementById('plan-desc-input').value.trim();
  const errEl  = document.getElementById('add-plan-error');
  const btn    = document.getElementById('add-plan-submit');

  if (!name) { errEl.textContent = 'El nombre del plan es obligatorio.'; return; }

  btn.disabled = true;
  btn.textContent = 'Guardando...';
  errEl.textContent = '';

  try {
    await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addPlan', emoji, plan: name, desc, estado: 'Pendiente' })
    });

    closeAddPlanModal();
    _planesLoaded = false;
    await new Promise(r => setTimeout(r, 1200));
    await buildPlanes();

  } catch (err) {
    errEl.textContent = 'Error de conexión. Inténtalo de nuevo.';
    btn.disabled = false;
    btn.textContent = 'Agregar 💜';
  }
}

// ── Eliminar plan ─────────────────────────────────────────────

async function deletePlan(event, planName) {
  event.stopPropagation();
  if (!confirm(`¿Eliminar el plan "${planName}"?`)) return;

  try {
    await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'deletePlan', plan: planName })
    });

    _planesLoaded = false;
    await new Promise(r => setTimeout(r, 1000));
    await buildPlanes();

  } catch (err) {
    alert('Error al eliminar. Inténtalo de nuevo.');
  }
}

// ── Toggle estado ─────────────────────────────────────────────

async function togglePlanStatus(event, btnEl, planName, currentEstado) {
  event.stopPropagation();
  const card = btnEl.closest('.plan-card');
  if (!card || card.classList.contains('is-updating')) return;

  const badge = card.querySelector('.plan-badge');

  let nextEstado = 'Hecho';
  const currentNormalized = currentEstado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (currentNormalized === 'hecho' || currentNormalized === 'listo') {
    nextEstado = 'Pendiente';
  }

  const nextEstadoKey = nextEstado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  const prevEstadoKey = currentEstado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

  card.classList.add('is-updating');
  card.classList.remove(`estado-${prevEstadoKey}`);
  card.classList.add(`estado-${nextEstadoKey}`);
  if (badge) badge.textContent = nextEstado;

  try {
    await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ plan: planName, estado: nextEstado })
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    card.classList.remove('is-updating');
    card.classList.add('update-success');
    setTimeout(() => card.classList.remove('update-success'), 1200);

    btnEl.setAttribute('onclick', `togglePlanStatus(event, this, '${planName.replace(/'/g, "\\'")}', '${nextEstado}')`);

  } catch (err) {
    console.error('Error al actualizar el plan:', err);
    card.classList.remove('is-updating');
    card.classList.remove(`estado-${nextEstadoKey}`);
    card.classList.add(`estado-${prevEstadoKey}`);
    if (badge) badge.textContent = currentEstado;
    card.classList.add('update-error');
    setTimeout(() => card.classList.remove('update-error'), 2000);
  }
}
