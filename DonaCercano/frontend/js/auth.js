// ── Módulo de autenticación ───────────────────────────────────────
const AUTH = {
  TOKEN_KEY: 'dc_token',
  USER_KEY:  'dc_user',

  getToken() { return localStorage.getItem(this.TOKEN_KEY); },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  isLoggedIn() { return !!this.getToken(); },

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.getToken()}` }
      });
    } catch { /* ignorar error de red */ }
    this.clearSession();
    location.href = 'index.html';
  }
};

// ── Inyectar zona de autenticación en el navbar ───────────────────
function initAuthNav() {
  const desktopSlot = document.getElementById('nav-auth-desktop');
  const mobileSlot  = document.getElementById('nav-auth-mobile');
  if (!desktopSlot && !mobileSlot) return;

  const user = AUTH.getUser();

  if (user) {
    const initial  = user.nombre ? user.nombre.trim()[0].toUpperCase() : '?';
    const firstName = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';

    if (desktopSlot) {
      desktopSlot.innerHTML = `
        <div class="nav-user-menu">
          <button class="nav-avatar-btn" id="nav-avatar-btn" aria-label="Menú de usuario" aria-expanded="false" aria-haspopup="true">
            <div class="nav-avatar-circle">${initial}</div>
            <span class="nav-user-name">${firstName}</span>
            <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="nav-dropdown" id="nav-dropdown" role="menu">
            <a href="perfil.html" class="nav-dropdown-item" role="menuitem">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
              Mi perfil
            </a>
            <a href="donar.html" class="nav-dropdown-item" role="menuitem">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Publicar donación
            </a>
            <div class="nav-dropdown-divider" role="separator"></div>
            <button class="nav-dropdown-item nav-dropdown-logout" role="menuitem" onclick="AUTH.logout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        </div>`;

      // Toggle dropdown
      const btn = document.getElementById('nav-avatar-btn');
      const dd  = document.getElementById('nav-dropdown');
      if (btn && dd) {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const open = dd.classList.toggle('open');
          btn.setAttribute('aria-expanded', open);
        });
        document.addEventListener('click', () => {
          dd.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
        // Cerrar con Escape
        document.addEventListener('keydown', e => {
          if (e.key === 'Escape') { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
        });
      }
    }

    if (mobileSlot) {
      mobileSlot.innerHTML = `
        <a href="perfil.html">
          <div class="nav-avatar-circle" style="display:inline-flex;width:28px;height:28px;font-size:.8rem;margin-right:8px;vertical-align:middle;">${initial}</div>
          Mi perfil
        </a>
        <button class="mobile-nav-logout-btn" onclick="AUTH.logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesión
        </button>`;
    }

  } else {
    if (desktopSlot) {
      desktopSlot.innerHTML = `
        <div class="nav-auth-btns">
          <a href="login.html" class="btn btn-ghost btn-sm">Ingresar</a>
          <a href="registro.html" class="btn btn-primary btn-sm">Registrarse</a>
        </div>`;
    }
    if (mobileSlot) {
      mobileSlot.innerHTML = `
        <a href="login.html">Ingresar</a>
        <a href="registro.html" class="btn btn-primary">Registrarse</a>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', initAuthNav);
