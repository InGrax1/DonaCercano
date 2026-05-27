// ── Página de inicio de sesión ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Si ya está logueado, redirigir
  if (typeof AUTH !== 'undefined' && AUTH.isLoggedIn()) {
    const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
    location.href = redirect;
    return;
  }

  const form      = document.getElementById('login-form');
  const emailIn   = document.getElementById('login-email');
  const passIn    = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('login-submit');
  const submitTxt = document.getElementById('login-submit-text');

  // Mostrar/ocultar contraseña
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isText = passIn.type === 'text';
      passIn.type = isText ? 'password' : 'text';
      toggleBtn.innerHTML = isText
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    });
  }

  // Limpiar error al escribir
  [emailIn, passIn].forEach(el => {
    if (el) el.addEventListener('input', () => {
      el.classList.remove('error');
      clearFormError();
    });
  });

  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();

    const email    = emailIn?.value.trim() || '';
    const password = passIn?.value || '';
    let ok = true;

    if (!email) { emailIn?.classList.add('error'); ok = false; }
    if (!password) { passIn?.classList.add('error'); ok = false; }
    if (!ok) { showFormError('Completá email y contraseña.'); return; }

    submitBtn.disabled = true;
    submitTxt.textContent = 'Ingresando...';

    try {
      const { token, usuario } = await API.login({ email, password });
      AUTH.setSession(token, usuario);
      showToast('¡Bienvenido de vuelta, ' + usuario.nombre.split(' ')[0] + '!', 'success');
      const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
      setTimeout(() => { location.href = redirect; }, 900);
    } catch (err) {
      showFormError(err.message || 'No se pudo iniciar sesión.');
      submitBtn.disabled = false;
      submitTxt.textContent = 'Ingresar';
    }
  });
});

function showFormError(msg) {
  const el = document.getElementById('form-error');
  if (el) { el.textContent = msg; el.style.display = 'flex'; }
}
function clearFormError() {
  const el = document.getElementById('form-error');
  if (el) el.style.display = 'none';
}
