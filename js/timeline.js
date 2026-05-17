// ============================================================
//  TIMELINE + SCROLL REVEAL
// ============================================================

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
