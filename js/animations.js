// ============================================================
//  ANIMACIONES DINÁMICAS
// ============================================================

// --- Pétalos flotantes (hero) ---
function createPetals() {
  const container = document.getElementById('hero-petals');
  if (!container) return;
  const colors = ['#c084fc', '#a78bfa', '#ddd6fe', '#e9d5ff', '#f3e8ff', '#d8b4fe', '#fce7f3'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    const size = 12 + Math.random() * 22;
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-70px;
      width:${size}px;
      height:${size * 1.7}px;
      animation:petalFall ${7 + Math.random() * 8}s ${Math.random() * 10}s linear infinite;
      pointer-events:none;
    `;
    el.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 30 50"><use href="#petal" style="color:${color}"/></svg>`;
    container.appendChild(el);
  }
}

// --- Notas musicales (hero) ---
function createNotes() {
  const container = document.getElementById('hero-notes');
  if (!container) return;
  const colors = ['#a855f7', '#d4a843', '#c084fc', '#f59e0b', '#ec4899'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    const size = 16 + Math.random() * 14;
    el.style.cssText = `
      position:absolute;
      left:${5 + Math.random() * 90}%;
      bottom:${10 + Math.random() * 50}%;
      opacity:0;
      animation:noteFloat ${4 + Math.random() * 5}s ${Math.random() * 7}s ease-in-out infinite;
      pointer-events:none;
    `;
    el.innerHTML = `<svg width="${size}" height="${size * 1.3}" viewBox="0 0 24 32" style="color:${colors[i % colors.length]}"><use href="#note"/></svg>`;
    container.appendChild(el);
  }
}

// --- Gotas de lluvia (divisor) ---
function createRain() {
  const container = document.getElementById('rain-drops');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.cssText = `
      left:${Math.random() * 100}%;
      animation-delay:${Math.random() * 2.5}s;
      animation-duration:${0.5 + Math.random() * 0.9}s;
      height:${8 + Math.random() * 16}px;
      opacity:${0.35 + Math.random() * 0.55};
    `;
    container.appendChild(drop);
  }
}

// --- Polaroids flotantes (home hub) ---
function createPolaroids() {
  const container = document.getElementById('float-frames');
  if (!container) return;

  const positions = [
    { left: '6%',  top: '18%', rot: '-6deg',  duration: '5.5s', delay: '0s'   },
    { left: '80%', top: '12%', rot: '5deg',   duration: '6.5s', delay: '1.2s' },
    { left: '75%', top: '62%', rot: '-4deg',  duration: '7s',   delay: '0.5s' },
    { left: '3%',  top: '65%', rot: '7deg',   duration: '5s',   delay: '2s'   },
  ];

  // 4 fotos random de la galería (sin repetir). Si hay menos de 4, el resto muestra tulipán.
  const pool = [...(CONFIG.photos || [])];
  const picked = [];
  while (picked.length < 4 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }

  positions.forEach((pos, i) => {
    const photo = picked[i] || null;
    const src   = photo ? photo.src : '';

    const wrap = document.createElement('div');
    wrap.className = 'polaroid';
    wrap.style.cssText = `
      left:${pos.left}; top:${pos.top};
      --rot:${pos.rot};
      animation-duration:${pos.duration};
      animation-delay:${pos.delay};
    `;

    wrap.innerHTML = `
      <div class="polaroid-img">
        ${src ? `<img src="${src}" alt="" loading="lazy"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
        <svg viewBox="0 0 70 120" style="color:#c084fc;${src ? 'display:none' : ''}">
          <use href="#tulip"/>
        </svg>
      </div>
    `;
    container.appendChild(wrap);
  });
}

// --- Sparkles del cierre ---
function createCierreSparkles() {
  const container = document.getElementById('cierre-sparkles');
  if (!container) return;
  const symbols = ['✦', '✧', '⋆', '·', '✦', '✧'];
  for (let i = 0; i < 28; i++) {
    const el = document.createElement('span');
    el.className = 'sparkle-bg-item';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const size = 9 + Math.random() * 20;
    el.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      font-size:${size}px;
      color:#c084fc;
      opacity:${0.15 + Math.random() * 0.5};
      animation:sparkle-pulse ${2 + Math.random() * 3}s ${Math.random() * 3}s ease-in-out infinite;
      pointer-events:none;
    `;
    container.appendChild(el);
  }
}

// --- Decoraciones por sección (se llaman la primera vez que se visita cada vista) ---
const _sectionInit = {};

function initSectionDecos(viewId) {
  if (_sectionInit[viewId]) return;
  _sectionInit[viewId] = true;

  if (viewId === 'carta') _initCartaDecos();
  if (viewId === 'momentos') _initMomentosDecos();
  if (viewId === 'gustos') _initGustosDecos();
}

function _initCartaDecos() {
  const container = document.getElementById('carta-sparkles');
  if (!container) return;
  const symbols = ['✦', '✧', '⋆', '♡', '✉'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span');
    el.className = 'carta-ink';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const size = 10 + Math.random() * 16;
    el.style.cssText = `
      left:${Math.random() * 100}%;
      top:${20 + Math.random() * 70}%;
      font-size:${size}px;
      animation-duration:${6 + Math.random() * 8}s;
      animation-delay:${Math.random() * 6}s;
    `;
    container.appendChild(el);
  }
}

function _initMomentosDecos() {
  const container = document.getElementById('momentos-petals');
  if (!container) return;
  const colors = ['#ddd6fe', '#c084fc', '#e9d5ff', '#f3e8ff'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    const size = 8 + Math.random() * 12;
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-40px;
      width:${size}px;
      height:${size * 1.7}px;
      animation:petalFall ${9 + Math.random() * 10}s ${Math.random() * 12}s linear infinite;
      pointer-events:none;
      opacity:0.5;
    `;
    el.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 30 50"><use href="#petal" style="color:${color}"/></svg>`;
    container.appendChild(el);
  }
}

function _initGustosDecos() {
  const container = document.getElementById('gustos-floaties');
  if (!container) return;
  const icons = ['🎵', '🌺', '🎭', '✦', '💜', '🎸', '🍣', '✧', '🌷', '⋆'];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('span');
    el.className = 'gustos-float-icon';
    el.textContent = icons[i % icons.length];
    el.style.cssText = `
      left:${Math.random() * 100}%;
      top:${15 + Math.random() * 75}%;
      animation-duration:${7 + Math.random() * 9}s;
      animation-delay:${Math.random() * 7}s;
    `;
    container.appendChild(el);
  }
}

// --- Contador animado ---
function animateDaysCounter(elementId, targetDays) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const duration = 2200;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * targetDays);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
