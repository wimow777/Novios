// ============================================================
//  TIMELINE + EDICIÓN DESDE LA PÁGINA
// ============================================================

let _editingMomentoIndex = null;

async function loadTimeline() {
  if (CONFIG.timelineUrl) {
    try {
      const res = await fetch(CONFIG.timelineUrl);
      const text = await res.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        const data = JSON.parse(jsonStr);
        if (data.table && data.table.rows) {
          const parsedMoments = [];
          data.table.rows.forEach(row => {
            if (!row.c || row.c.length === 0) return;
            const date  = row.c[0] ? row.c[0].v : '';
            const event = row.c[1] ? row.c[1].v : '';
            const desc  = row.c[2] ? row.c[2].v : '';
            if (!date || date === 'Fecha' || date === 'A') return;
            parsedMoments.push({
              date:  date.toString(),
              event: event ? event.toString() : '',
              desc:  desc  ? desc.toString()  : ''
            });
          });
          CONFIG.moments = parsedMoments;
        }
      }
    } catch (err) {
      console.error('Error al cargar la línea de tiempo de Google Sheets:', err);
    }
  }
  buildTimeline();
}

function buildTimeline() {
  const container = document.getElementById('timeline-items');
  if (!container) return;
  container.innerHTML = '';

  const canEdit = !!CONFIG.sheetsUpdateUrl;

  CONFIG.moments.forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'timeline-item reveal';
    if (m.isTemp) {
      item.classList.add('is-temp');
    }

    const actions = canEdit && !m.isTemp ? `
      <div class="timeline-actions">
        <button class="timeline-action-btn edit" onclick="openEditMomentoModal(${i})">✏️ editar</button>
        <button class="timeline-action-btn delete" onclick="deleteMomento(${i})">✕ eliminar</button>
      </div>` : '';

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${m.date}</div>
        <div class="timeline-event">${m.event}</div>
        ${m.desc ? `<div class="timeline-desc">${m.desc}</div>` : ''}
        ${actions}
      </div>
    `;
    container.appendChild(item);
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .timeline-item, .gusto-card').forEach(el => observer.observe(el));

  document.querySelectorAll('.section-inner').forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      observer.observe(el);
    }
  });
}

// ── Añadir momento ────────────────────────────────────────────

function openAddMomentoModal() {
  _editingMomentoIndex = null;
  document.getElementById('momento-modal-title').textContent = 'Nuevo momento ✨';
  document.getElementById('momento-date-input').value  = '';
  document.getElementById('momento-event-input').value = '';
  document.getElementById('momento-desc-input').value  = '';
  document.getElementById('add-momento-error').textContent = '';
  document.getElementById('add-momento-submit').disabled = false;
  document.getElementById('add-momento-submit').textContent = 'Guardar 💜';
  document.getElementById('add-momento-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('momento-date-input').focus(), 100);
}

function closeAddMomentoModal() {
  document.getElementById('add-momento-modal').classList.add('hidden');
  document.body.style.overflow = '';
  _editingMomentoIndex = null;
}

// ── Editar momento ────────────────────────────────────────────

function openEditMomentoModal(index) {
  const m = CONFIG.moments[index];
  if (!m) return;
  _editingMomentoIndex = index;
  document.getElementById('momento-modal-title').textContent = 'Editar momento ✏️';
  document.getElementById('momento-date-input').value  = m.date;
  document.getElementById('momento-event-input').value = m.event;
  document.getElementById('momento-desc-input').value  = m.desc || '';
  document.getElementById('add-momento-error').textContent = '';
  document.getElementById('add-momento-submit').disabled = false;
  document.getElementById('add-momento-submit').textContent = 'Guardar 💜';
  document.getElementById('add-momento-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

async function submitMomento() {
  const date  = document.getElementById('momento-date-input').value.trim();
  const event = document.getElementById('momento-event-input').value.trim();
  const desc  = document.getElementById('momento-desc-input').value.trim();
  const errEl = document.getElementById('add-momento-error');
  const btn   = document.getElementById('add-momento-submit');

  if (!date || !event) { errEl.textContent = 'La fecha y el evento son obligatorios.'; return; }

  const tempId = 'temp_' + Date.now();
  const isEdit = _editingMomentoIndex !== null;
  const originalMoments = [...CONFIG.moments];

  // 1. UI Optimista: Aplicar cambio en memoria de inmediato
  const tempMomento = { date, event, desc, id: tempId, isTemp: true };

  if (isEdit) {
    CONFIG.moments[_editingMomentoIndex] = { date, event, desc, isTemp: true };
  } else {
    CONFIG.moments.push(tempMomento);
  }

  // 2. Re-renderizar línea de tiempo al instante
  buildTimeline();
  document.getElementById('timeline-items').querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('visible');
  });

  closeAddMomentoModal();

  if (typeof showToast === 'function') {
    showToast(isEdit ? '¡Actualizando momento en Sheets! ⏳' : '¡Momento guardado! Sincronizando con Google Sheets... ⏳', 'success');
  }

  const payload = {
    action: isEdit ? 'editMomento' : 'addMomento',
    date, event, desc
  };
  if (isEdit) payload.originalDate = originalMoments[_editingMomentoIndex].date;

  try {
    await fetch(CONFIG.sheetsUpdateUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    // 3. Esperar 4.5 segundos e iniciar sincronización silenciosa
    setTimeout(async () => {
      try {
        await loadTimeline();
        if (typeof showToast === 'function') {
          showToast('¡Línea de tiempo sincronizada con éxito! 💜', 'success');
        }
      } catch (err) {
        console.error('Error al sincronizar timeline tras acción:', err);
      }
    }, 4500);

  } catch (err) {
    console.error('Error al enviar momento:', err);
    // Rollback en caso de fallo total de red
    CONFIG.moments = originalMoments;
    buildTimeline();
    
    if (typeof showToast === 'function') {
      showToast('Error de conexión. Se han restaurado los datos anteriores.', 'error');
    }
  }
}

// ── Eliminar momento ──────────────────────────────────────────

function deleteMomento(index) {
  const m = CONFIG.moments[index];
  if (!m) return;

  showConfirm(`¿De verdad quieres eliminar el momento "${m.event}"? 😢`, async () => {
    const originalMoments = [...CONFIG.moments];

    // 1. Actualización Optimista de la UI
    CONFIG.moments.splice(index, 1);
    buildTimeline();
    
    document.getElementById('timeline-items').querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('visible');
    });

    if (typeof showToast === 'function') {
      showToast('¡Momento eliminado! Sincronizando en background... 🗑️', 'success');
    }

    try {
      await fetch(CONFIG.sheetsUpdateUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'deleteMomento', date: m.date, event: m.event })
      });

      // 2. Silenciosa sincronización tras 4 segundos
      setTimeout(async () => {
        try {
          await loadTimeline();
        } catch (err) {
          console.error('Error al resincronizar timeline tras borrar:', err);
        }
      }, 4000);

    } catch (err) {
      console.error('Error en delete fetch:', err);
      // Rollback optimista
      CONFIG.moments = originalMoments;
      buildTimeline();
      
      showAlert('Error de conexión al eliminar. Inténtalo de nuevo.');
    }
  });
}
