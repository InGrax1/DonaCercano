// ── Página de perfil de usuario ───────────────────────────────────
let currentTab = 'publicaciones';

document.addEventListener('DOMContentLoaded', async () => {
  // Requerir autenticación
  if (typeof AUTH === 'undefined' || !AUTH.isLoggedIn()) {
    location.href = 'login.html?redirect=perfil.html';
    return;
  }

  try {
    // Verificar token y refrescar datos del usuario
    const user = await API.getMe();
    AUTH.setSession(AUTH.getToken(), user);
    renderProfileHeader(user);
    await cargarMisDonaciones(user.id);
  } catch {
    // Token inválido — limpiar sesión y redirigir
    AUTH.clearSession();
    location.href = 'login.html?redirect=perfil.html';
  }

  // Tabs
  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      document.querySelectorAll('.profile-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTabContent();
    });
  });
});

let allDonaciones = [];

function renderProfileHeader(user) {
  const initial = user.nombre ? user.nombre.trim()[0].toUpperCase() : '?';

  // Avatar
  const av = document.getElementById('profile-avatar');
  if (av) av.textContent = initial;

  // Nombre y email
  setText('profile-nombre', user.nombre);
  setText('profile-email',  user.email);

  // Fecha de registro
  const fechaEl = document.getElementById('profile-fecha');
  if (fechaEl && user.fecha_registro) {
    fechaEl.textContent = 'Miembro desde ' + new Date(user.fecha_registro)
      .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  }
}

async function cargarMisDonaciones(userId) {
  const loading = document.getElementById('profile-loading');
  if (loading) loading.style.display = 'flex';

  try {
    allDonaciones = await API.getMisDonaciones(userId);
    renderStats();
    renderTabContent();
  } catch {
    showToast('No se pudieron cargar tus donaciones.', 'error');
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

function renderStats() {
  const total      = allDonaciones.length;
  const entregadas = allDonaciones.filter(d => d.estado === 'entregado').length;
  const activas    = allDonaciones.filter(d => d.estado === 'disponible' || d.estado === 'reservado').length;

  setText('stat-publicaciones', total);
  setText('stat-entregadas',    entregadas);
  setText('stat-activas',       activas);
}

function renderTabContent() {
  const container = document.getElementById('tab-content');
  if (!container) return;

  let donaciones;
  if (currentTab === 'publicaciones') {
    donaciones = allDonaciones;
  } else if (currentTab === 'entregadas') {
    donaciones = allDonaciones.filter(d => d.estado === 'entregado');
  } else {
    donaciones = allDonaciones.filter(d => d.estado === 'disponible' || d.estado === 'reservado');
  }

  if (!donaciones.length) {
    const msgs = {
      publicaciones: { icon: 'package', title: 'Aún no publicaste donaciones', desc: 'Cuando publiques algo, aparecerá acá.' },
      activas:       { icon: 'checkCircle', title: 'No tenés donaciones activas', desc: 'Las donaciones disponibles o reservadas aparecerán acá.' },
      entregadas:    { icon: 'truck', title: 'Sin donaciones entregadas aún', desc: 'Cuando marques una donación como entregada, se moverá aquí.' },
    };
    const m = msgs[currentTab] || msgs.publicaciones;
    container.innerHTML = `
      <div class="empty-state" style="padding:48px 24px;">
        <div class="empty-icon">${inlineIcon(m.icon, 56, 56)}</div>
        <h3 class="empty-title">${m.title}</h3>
        <p class="empty-desc">${m.desc}</p>
        ${currentTab !== 'entregadas' ? '<a href="donar.html" class="btn btn-primary" style="margin-top:16px;">Publicar donación</a>' : ''}
      </div>`;
    return;
  }

  container.innerHTML = donaciones.map(buildProfileCard).join('');

  // Bind botones de marcar entregado
  container.querySelectorAll('[data-accion="entregar"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('¿Confirmar que esta donación fue entregada? No se puede deshacer.')) return;
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      try {
        await API.entregar(id);
        showToast('¡Donación marcada como entregada!', 'success');
        // Actualizar estado local
        const don = allDonaciones.find(d => d.id === id);
        if (don) don.estado = 'entregado';
        renderStats();
        renderTabContent();
      } catch (err) {
        showToast(err.message || 'No se pudo actualizar.', 'error');
        btn.disabled = false;
        btn.textContent = 'Marcar como entregado';
      }
    });
  });
}

function buildProfileCard(d) {
  const cat = catInfo(d.categoria);
  const est = estadoInfo(d.estado);
  const ago = timeAgo(d.fecha_creacion);

  const imgHtml = d.imagen_url
    ? `<img class="pcard-img" src="${d.imagen_url}" alt="${d.titulo}" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="pcard-img-ph icon-box-${d.categoria}">
         ${inlineIcon(cat.iconName, 28, 28)}
       </div>`;

  const btnEntregar = (d.estado !== 'entregado')
    ? `<button class="btn btn-ghost btn-sm pcard-entregar-btn" data-accion="entregar" data-id="${d.id}" title="Marcar como entregado">
         ${inlineIcon('truck', 14, 14)}
         Marcar entregado
       </button>`
    : '';

  return `
    <div class="profile-card">
      <a href="detalle.html?id=${d.id}" class="pcard-link" tabindex="-1" aria-hidden="true">${imgHtml}</a>
      <div class="pcard-body">
        <div class="pcard-meta">
          <span class="badge badge-${d.categoria}">${cat.label}</span>
          <span class="badge ${est.cls}">${est.label}</span>
        </div>
        <a href="detalle.html?id=${d.id}" class="pcard-title">${d.titulo}</a>
        <div class="pcard-info">
          ${inlineIcon('mapPin', 13, 13)}
          <span>${d.ciudad}${d.zona ? ` · ${d.zona}` : ''}</span>
          <span class="pcard-dot">·</span>
          ${inlineIcon('clock', 13, 13)}
          <span>${ago}</span>
        </div>
        <div class="pcard-actions">
          <a href="detalle.html?id=${d.id}" class="btn btn-ghost btn-sm">
            ${inlineIcon('arrowRight', 14, 14)} Ver detalle
          </a>
          ${btnEntregar}
        </div>
      </div>
    </div>`;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}
