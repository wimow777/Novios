// ============================================================
//  TIMELINE + SCROLL REVEAL
// ============================================================

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
            const date = row.c[0] ? row.c[0].v : '';
            const event = row.c[1] ? row.c[1].v : '';
            const desc = row.c[2] ? row.c[2].v : '';
            
            if (!date || date === 'Fecha' || date === 'A') return;
            
            parsedMoments.push({
              date: date.toString(),
              event: event ? event.toString() : '',
              desc: desc ? desc.toString() : ''
            });
          });
          if (parsedMoments.length > 0) {
            CONFIG.moments = parsedMoments;
          }
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
  CONFIG.moments.forEach(m => {
    const item = document.createElement('div');
    item.className = 'timeline-item reveal';
    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${m.date}</div>
        <div class="timeline-event">${m.event}</div>
        ${m.desc ? `<div class="timeline-desc">${m.desc}</div>` : ''}
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
