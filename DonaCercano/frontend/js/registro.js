// ── Página de registro ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Si ya está logueado, redirigir
  if (typeof AUTH !== 'undefined' && AUTH.isLoggedIn()) {
    location.href = 'index.html';
    return;
  }

  const form       = document.getElementById('registro-form');
  const nombreIn   = document.getElementById('reg-nombre');
  const emailIn    = document.getElementById('reg-email');
  const passIn     = document.getElementById('reg-password');
  const pass2In    = document.getElementById('reg-password2');
  const toggleBtn  = document.getElementById('toggle-password');
  const toggle2Btn = document.getElementById('toggle-password2');
  const submitBtn  = document.getElementById('reg-submit');
  const submitTxt  = document.getElementById('reg-submit-text');

  function togglePass(input, btn) {
    if (!input || !btn) return;
    btn.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.innerHTML = isText
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    });
  }
  togglePass(passIn, toggleBtn);
  togglePass(pass2In, toggle2Btn);

  // Limpiar errores al escribir
  [nombreIn, emailIn, passIn, pass2In].forEach(el => {
    if (el) el.addEventListener('input', () => {
      el.classList.remove('error');
      clearFormError();
    });
  });

  // Indicador de fortaleza de contraseña
  if (passIn) {
    passIn.addEventListener('input', () => updateStrength(passIn.value));
  }

  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();

    const nombre   = nombreIn?.value.trim()  || '';
    const email    = emailIn?.value.trim()   || '';
    const password = passIn?.value           || '';
    const password2 = pass2In?.value         || '';
    let ok = true;

    if (nombre.length < 2)   { nombreIn?.classList.add('error');  showFieldError('err-nombre',   'Ingresá tu nombre completo.'); ok = false; }
    else clearFieldError('err-nombre');

    if (!email.includes('@')) { emailIn?.classList.add('error');   showFieldError('err-email',    'Ingresá un email válido.'); ok = false; }
    else clearFieldError('err-email');

    if (password.length < 6) { passIn?.classList.add('error');    showFieldError('err-password', 'Mínimo 6 caracteres.'); ok = false; }
    else clearFieldError('err-password');

    if (password !== password2) { pass2In?.classList.add('error'); showFieldError('err-password2', 'Las contraseñas no coinciden.'); ok = false; }
    else clearFieldError('err-password2');

    if (!ok) return;

    submitBtn.disabled = true;
    submitTxt.textContent = 'Creando cuenta...';

    try {
      const { token, usuario } = await API.registro({ nombre, email, password });
      AUTH.setSession(token, usuario);
      showToast('¡Cuenta creada! Bienvenido a DonaCercano.', 'success');
      setTimeout(() => { location.href = 'index.html'; }, 1000);
    } catch (err) {
      showFormError(err.message || 'No se pudo crear la cuenta.');
      submitBtn.disabled = false;
      submitTxt.textContent = 'Crear cuenta';
    }
  });
});

function updateStrength(password) {
  const bar  = document.getElementById('strength-bar');
  const text = document.getElementById('strength-text');
  if (!bar || !text) return;

  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: '',         color: 'transparent', width: '0%'   },
    { label: 'Muy débil',color: '#EF4444',      width: '20%'  },
    { label: 'Débil',    color: '#F97316',      width: '40%'  },
    { label: 'Regular',  color: '#F5C030',      width: '60%'  },
    { label: 'Buena',    color: '#22C55E',      width: '80%'  },
    { label: 'Fuerte',   color: '#16A34A',      width: '100%' },
  ];
  const lvl = levels[Math.min(score, 5)];
  bar.style.width      = password ? lvl.width : '0%';
  bar.style.background = lvl.color;
  text.textContent     = password ? lvl.label : '';
  text.style.color     = lvl.color;
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  if (el) { el.textContent = msg; el.style.display = 'flex'; }
}
function clearFormError() {
  const el = document.getElementById('form-error');
  if (el) el.style.display = 'none';
}
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('visible'); }
}
function clearFieldError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('visible');
}
