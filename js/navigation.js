// ============================================================
//  NAVEGACIÓN ENTRE VISTAS
// ============================================================

let currentView = null;

function showView(id) {
  const next = document.getElementById('view-' + id);
  if (!next || next === currentView) return;

  // Controlar la visibilidad de los botones flotantes (FAB) de acuerdo a la vista activa
  const fabAddPlan = document.getElementById('fab-add-plan');
  const fabAddMomento = document.getElementById('fab-add-momento');
  
  if (fabAddPlan) {
    if (id === 'planes' && !!CONFIG.sheetsUpdateUrl) {
      fabAddPlan.classList.add('visible');
    } else {
      fabAddPlan.classList.remove('visible');
    }
  }
  
  if (fabAddMomento) {
    if (id === 'momentos' && !!CONFIG.sheetsUpdateUrl) {
      fabAddMomento.classList.add('visible');
    } else {
      fabAddMomento.classList.remove('visible');
    }
  }

  if (currentView) {
    currentView.classList.remove('active');
  }

  next.scrollTop = 0;
  next.classList.add('active', 'slide-in');
  currentView = next;

  setTimeout(() => {
    next.scrollTop = 0;
    next.classList.remove('slide-in');

    if (id === 'home') {
      // En el home el IntersectionObserver no dispara bien dentro de fixed.
      // Hacemos visible cada bloque con un pequeño escalonado.
      const revealEls = next.querySelectorAll('.reveal');
      revealEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 110);
      });
    } else {
      initViewReveal(next);
    }

    if (id === 'planes' && typeof buildPlanes === 'function') buildPlanes();
    if (typeof initSectionDecos === 'function') initSectionDecos(id);
  }, 60);
}

function initViewReveal(view) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08, root: view });

  view.querySelectorAll('.reveal, .timeline-item, .gusto-card').forEach(el => {
    observer.observe(el);
  });
}
