// ── API client compartido ─────────────────────────────────────────
const API = {
  base: '/api',

  // Cabeceras con token de autenticación si está disponible
  _headers(extra = {}) {
    const h = { ...extra };
    if (typeof AUTH !== 'undefined') {
      const tok = AUTH.getToken();
      if (tok) h['Authorization'] = `Bearer ${tok}`;
    }
    return h;
  },

  async get(endpoint) {
    const res = await fetch(`${this.base}${endpoint}`, { headers: this._headers() });
    if (!res.ok) throw new Error((await res.json()).error || 'Error de red');
    return res.json();
  },

  async post(endpoint, formData) {
    const res  = await fetch(`${this.base}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: this._headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');
    return data;
  },

  async postJSON(endpoint, body) {
    const res = await fetch(`${this.base}${endpoint}`, {
      method: 'POST',
      headers: this._headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');
    return data;
  },

  async put(endpoint) {
    const res  = await fetch(`${this.base}${endpoint}`, {
      method: 'PUT',
      headers: this._headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar');
    return data;
  },

  getDonaciones: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v));
    return API.get(`/donaciones${q.toString() ? '?' + q : ''}`);
  },
  getDonacion:      (id)   => API.get(`/donaciones/${id}`),
  crearDonacion:    (fd)   => API.post('/donaciones', fd),
  reservar:         (id)   => API.put(`/donaciones/${id}/reservar`),
  liberar:          (id)   => API.put(`/donaciones/${id}/liberar`),
  entregar:         (id)   => API.put(`/donaciones/${id}/entregar`),
  getStats:         ()     => API.get('/stats'),

  // Auth
  registro:         (body) => API.postJSON('/auth/registro', body),
  login:            (body) => API.postJSON('/auth/login',    body),
  logout:           ()     => API.postJSON('/auth/logout',   {}),
  getMe:            ()     => API.get('/auth/me'),
  getMisDonaciones: (uid)  => API.get(`/usuarios/${uid}/donaciones`),
};

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, type = 'default', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const iconSVG = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M20 6 9 17l-5-5"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${iconSVG[type] || iconSVG.default}<span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toast-in .3s ease reverse';
    setTimeout(() => t.remove(), 280);
  }, duration);
}

// ── Helpers ───────────────────────────────────────────────────────
const CATEGORIAS = {
  ropa:        { label: 'Ropa y calzado',    iconName: 'shirt'     },
  muebles:     { label: 'Muebles y hogar',   iconName: 'armchair'  },
  alimentos:   { label: 'Alimentos',         iconName: 'basket'    },
  libros:      { label: 'Libros',            iconName: 'bookOpen'  },
  juguetes:    { label: 'Juguetes',          iconName: 'blocks'    },
  electronica: { label: 'Electrónica',       iconName: 'monitor'   },
  otro:        { label: 'Otros',             iconName: 'gift'      },
};

const ESTADOS = {
  disponible: { label: 'Disponible', cls: 'badge-disponible' },
  reservado:  { label: 'Reservado',  cls: 'badge-reservado'  },
  entregado:  { label: 'Entregado',  cls: 'badge-entregado'  },
};

function catInfo(cat)    { return CATEGORIAS[cat] || CATEGORIAS.otro; }
function estadoInfo(est) { return ESTADOS[est]     || ESTADOS.disponible; }

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)     return 'Hace un momento';
  if (diff < 3600)   return `Hace ${Math.floor(diff/60)} min`;
  if (diff < 86400)  return `Hace ${Math.floor(diff/3600)} h`;
  if (diff < 604800) return `Hace ${Math.floor(diff/86400)} días`;
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

// Icono inline pequeño para badges y cards
function inlineIcon(name, w = 14, h = 14) {
  if (typeof ICON_PATHS === 'undefined') return '';
  const paths = ICON_PATHS[name] || ICON_PATHS.gift;
  return `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function buildCard(d) {
  const cat = catInfo(d.categoria);
  const est = estadoInfo(d.estado);

  // Placeholder con icono SVG si no hay imagen
  const imgHtml = d.imagen_url
    ? `<img class="card-img" src="${d.imagen_url}" alt="${d.titulo}" loading="lazy">`
    : `<div class="card-img-placeholder">
         <div class="icon-box icon-box-lg icon-box-${d.categoria}" style="width:64px;height:64px;border-radius:18px;">
           ${inlineIcon(cat.iconName, 32, 32)}
         </div>
         <small>${cat.label}</small>
       </div>`;

  return `
    <article class="donation-card" onclick="location.href='/detalle.html?id=${d.id}'" role="button" tabindex="0" aria-label="${d.titulo}">
      ${imgHtml}
      <div class="card-body">
        <div class="card-meta">
          <span class="badge badge-${d.categoria}">${cat.label}</span>
          <span class="badge ${est.cls}">${est.label}</span>
        </div>
        <h3 class="card-title">${d.titulo}</h3>
        <p class="card-desc">${d.descripcion}</p>
        <div class="card-footer">
          <span class="card-location">
            ${inlineIcon('mapPin', 13, 13)}
            ${d.ciudad}${d.zona ? ` · ${d.zona}` : ''}
          </span>
          <span class="card-date">${timeAgo(d.fecha_creacion)}</span>
        </div>
      </div>
    </article>`;
}

// ── Hamburger menu ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }
  // Marcar enlace activo
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
});
