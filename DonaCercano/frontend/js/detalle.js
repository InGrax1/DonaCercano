// ── Página detalle de donación ────────────────────────────────────
let donacion = null;

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return mostrarError();

  try {
    donacion = await API.getDonacion(id);
    renderDetalle(donacion);
    cargarRelacionadas(donacion);
  } catch {
    mostrarError();
  }
});

function renderDetalle(d) {
  const cat = catInfo(d.categoria);
  const est = estadoInfo(d.estado);

  document.title = `${d.titulo} — DonaCercano`;

  // Breadcrumb
  const bc = document.getElementById('breadcrumb-titulo');
  if (bc) bc.textContent = d.titulo.length > 40 ? d.titulo.slice(0, 40) + '...' : d.titulo;

  // Imagen
  const imgWrap = document.getElementById('img-wrap');
  if (d.imagen_url) {
    imgWrap.innerHTML = `<img class="detail-img" src="${d.imagen_url}" alt="${d.titulo}" onerror="this.style.display='none'">`;
  } else {
    const ph = document.getElementById('img-placeholder');
    if (ph) ph.innerHTML = `
      <div class="icon-box icon-box-lg icon-box-${d.categoria}" style="width:80px;height:80px;border-radius:24px;">
        ${inlineIcon(cat.iconName, 40, 40)}
      </div>
      <small style="margin-top:12px;color:var(--text-muted);">${cat.label}</small>`;
  }

  // Badges
  const badgeCat = document.getElementById('badge-categoria');
  const badgeEst = document.getElementById('badge-estado');
  if (badgeCat) { badgeCat.className = `badge badge-${d.categoria}`; badgeCat.textContent = cat.label; }
  if (badgeEst) { badgeEst.className = `badge ${est.cls}`; badgeEst.textContent = est.label; }

  // Texto
  setText('detail-titulo',   d.titulo);
  setText('detail-desc',     d.descripcion);
  setText('detail-donante',  d.nombre_donante);
  setText('detail-contacto', d.contacto);

  // Ubicación
  const ubi = document.getElementById('detail-ubicacion');
  if (ubi) ubi.innerHTML = `<strong>${d.ciudad}</strong>${d.zona ? ` · ${d.zona}` : ''}`;

  // Fecha
  const fecha = document.getElementById('detail-fecha');
  if (fecha) fecha.textContent = `Publicado ${timeAgo(d.fecha_creacion)}`;

  // Mostrar el contenido
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('detail-content').style.display = 'grid';

  // Panel de acciones según estado
  mostrarAcciones(d.estado, d.usuario_id);

  // Botones
  document.getElementById('btn-ver-contacto')?.addEventListener('click', toggleContacto);
  document.getElementById('btn-reservar')?.addEventListener('click', () => accion('reservar'));
  document.getElementById('btn-liberar')?.addEventListener('click', () => accion('liberar'));
  document.getElementById('btn-entregar')?.addEventListener('click', () => accion('entregar'));
}

function mostrarAcciones(estado, usuarioId) {
  const disp = document.getElementById('action-disponible');
  const res  = document.getElementById('action-reservado');
  const ent  = document.getElementById('action-entregado');
  const donA = document.getElementById('donante-actions');

  if (disp) disp.style.display = estado === 'disponible' ? 'block' : 'none';
  if (res)  res.style.display  = estado === 'reservado'  ? 'block' : 'none';
  if (ent)  ent.style.display  = estado === 'entregado'  ? 'block' : 'none';

  // El panel "¿Sos el donante?" solo se muestra si:
  // - La donación no fue entregada aún
  // - Y el usuario logueado es el dueño (o la donación no tiene dueño = datos viejos)
  if (donA) {
    // Solo se muestra si el usuario logueado es el dueño verificado de la donación
    const currentUser = (typeof AUTH !== 'undefined') ? AUTH.getUser() : null;
    const esOwner = usuarioId && currentUser && currentUser.id === usuarioId;
    donA.style.display = (esOwner && estado !== 'entregado') ? 'block' : 'none';
  }
}

function toggleContacto() {
  const box = document.getElementById('contact-box');
  const btn = document.getElementById('btn-ver-contacto');
  if (!box || !btn) return;
  const visible = box.classList.toggle('visible');
  btn.textContent = visible ? 'Ocultar datos de contacto' : 'Ver datos de contacto';
}

async function accion(tipo) {
  if (!donacion) return;

  const confirmaciones = {
    reservar:  '¿Reservar esta donación? Se marcará como reservada.',
    liberar:   '¿Marcar la donación como disponible nuevamente?',
    entregar:  '¿Confirmar que la donación fue entregada? Esta acción no se puede deshacer.',
  };

  if (!confirm(confirmaciones[tipo])) return;

  const botones = {
    reservar: document.getElementById('btn-reservar'),
    liberar:  document.getElementById('btn-liberar'),
    entregar: document.getElementById('btn-entregar'),
  };

  const btn = botones[tipo];
  const textoOriginal = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  try {
    await API[tipo](donacion.id);
    const mensajes = {
      reservar: '¡Donación reservada! Contactate con el donante para coordinar.',
      liberar:  'Donación liberada, vuelve a estar disponible.',
      entregar: '¡Excelente! Donación marcada como entregada. Gracias.',
    };
    showToast(mensajes[tipo], 'success');

    // Actualizar estado local y re-renderizar acciones
    const estados = { reservar: 'reservado', liberar: 'disponible', entregar: 'entregado' };
    donacion.estado = estados[tipo];
    const badgeEst = document.getElementById('badge-estado');
    const est = estadoInfo(donacion.estado);
    if (badgeEst) { badgeEst.className = `badge ${est.cls}`; badgeEst.textContent = est.label; }
    mostrarAcciones(donacion.estado);
  } catch (err) {
    showToast(err.message || 'No se pudo completar la acción.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = textoOriginal; }
  }
}

async function cargarRelacionadas(d) {
  const grid = document.getElementById('related-grid');
  try {
    const todas = await API.getDonaciones({ categoria: d.categoria });
    const otras = todas.filter(x => x.id !== d.id).slice(0, 3);
    if (!otras.length) {
      grid.innerHTML = `<p style="color:var(--text-muted);font-size:.875rem;">No hay otras donaciones en esta categoría por el momento.</p>`;
      return;
    }
    grid.innerHTML = otras.map(buildCard).join('');
  } catch {
    grid.innerHTML = '';
  }
}

function mostrarError() {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display   = 'block';
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}
