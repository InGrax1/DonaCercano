// ── Página de inicio ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  loadStats();
  loadRecent();
});

async function loadStats() {
  try {
    const s = await API.getStats();
    animateNumber('stat-total',       s.total);
    animateNumber('stat-disponibles', s.disponibles);
    animateNumber('stat-entregadas',  s.entregadas);
    animateNumber('stat-ciudades',    s.ciudades);
  } catch {
    ['stat-total','stat-disponibles','stat-entregadas','stat-ciudades']
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '0'; });
  }
}

async function loadRecent() {
  const grid = document.getElementById('recent-grid');
  try {
    const donaciones = await API.getDonaciones();
    const recientes  = donaciones.slice(0, 6);

    if (!recientes.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.7 4.5 7.7-4.5"/><path d="m7.5 4.27 9 5.15"/></svg></div>
          <h3 class="empty-title">Aún no hay donaciones</h3>
          <p class="empty-desc">¡Sé el primero en publicar algo para tu comunidad!</p>
          <a href="donar.html" class="btn btn-primary">Publicar donación</a>
        </div>`;
      return;
    }

    grid.innerHTML = recientes.map(buildCard).join('');
  } catch {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <h3 class="empty-title">No se pudieron cargar las donaciones</h3>
        <p class="empty-desc">Asegurate de que el servidor esté en funcionamiento.</p>
      </div>`;
  }
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el || !target) { if (el) el.textContent = target || 0; return; }
  const duration = 1200;
  const start    = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
