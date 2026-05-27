// ── Página explorar donaciones ────────────────────────────────────
let filtros = { q: '', categoria: '', ciudad: '', estado: '' };

document.addEventListener('DOMContentLoaded', () => {
  // Leer parámetros de URL
  const params = new URLSearchParams(location.search);
  if (params.get('categoria')) filtros.categoria = params.get('categoria');
  if (params.get('q'))         filtros.q         = params.get('q');
  if (params.get('ciudad'))    filtros.ciudad    = params.get('ciudad');

  // Sincronizar controles con filtros iniciales
  const selCat    = document.getElementById('filter-categoria');
  const selEst    = document.getElementById('filter-estado');
  const inputCiud = document.getElementById('filter-ciudad');
  const searchIn  = document.getElementById('search-input');

  if (filtros.categoria && selCat) selCat.value = filtros.categoria;
  if (filtros.ciudad    && inputCiud) inputCiud.value = filtros.ciudad;
  if (filtros.q         && searchIn)  searchIn.value  = filtros.q;

  // Eventos de filtro (con debounce en texto)
  const searchBtn  = document.getElementById('search-btn');
  const clearBtn   = document.getElementById('clear-filters');

  if (searchBtn) searchBtn.addEventListener('click', () => {
    filtros.q = searchIn?.value.trim() || '';
    cargar();
  });
  if (searchIn) searchIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') { filtros.q = searchIn.value.trim(); cargar(); }
  });
  if (selCat)    selCat.addEventListener('change',   () => { filtros.categoria = selCat.value;    cargar(); });
  if (selEst)    selEst.addEventListener('change',   () => { filtros.estado    = selEst.value;    cargar(); });
  if (inputCiud) {
    let debounce;
    inputCiud.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { filtros.ciudad = inputCiud.value.trim(); cargar(); }, 400);
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', limpiarFiltros);

  cargar();
});

function limpiarFiltros() {
  filtros = { q: '', categoria: '', ciudad: '', estado: '' };
  const ids = ['filter-categoria','filter-estado','filter-ciudad','search-input'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  history.replaceState({}, '', location.pathname);
  cargar();
}

async function cargar() {
  const grid  = document.getElementById('results-grid');
  const count = document.getElementById('results-count');

  grid.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';

  try {
    const params = {};
    if (filtros.q)         params.q         = filtros.q;
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.ciudad)    params.ciudad    = filtros.ciudad;
    if (filtros.estado)    params.estado    = filtros.estado;

    const donaciones = await API.getDonaciones(params);

    if (count) {
      count.textContent = donaciones.length === 0
        ? 'Sin resultados'
        : `${donaciones.length} donación${donaciones.length !== 1 ? 'es' : ''} encontrada${donaciones.length !== 1 ? 's' : ''}`;
    }

    if (!donaciones.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
          <h3 class="empty-title">No hay donaciones con esos filtros</h3>
          <p class="empty-desc">Intentá cambiar la búsqueda o los filtros. ¿Quizás podés donar tú?</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
            <button class="btn btn-ghost" onclick="limpiarFiltros()">Limpiar filtros</button>
            <a href="donar.html" class="btn btn-primary">Publicar donación</a>
          </div>
        </div>`;
      return;
    }

    grid.innerHTML = donaciones.map(buildCard).join('');
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <h3 class="empty-title">Error al cargar donaciones</h3>
        <p class="empty-desc">Asegurate de que el servidor esté corriendo.</p>
        <button class="btn btn-ghost" onclick="cargar()">Reintentar</button>
      </div>`;
  }
}
