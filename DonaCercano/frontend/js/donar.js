// ── Página publicar donación ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupUpload();
  setupForm();
  prefillUserData();
});

function prefillUserData() {
  if (typeof AUTH === 'undefined') return;
  const user = AUTH.getUser();
  if (!user) return;
  // Auto-completar nombre si el usuario está logueado
  const nombreInput = document.getElementById('nombre_donante');
  if (nombreInput && !nombreInput.value) nombreInput.value = user.nombre || '';
}

function setupUpload() {
  const area     = document.getElementById('upload-area');
  const input    = document.getElementById('file-input');
  const preview  = document.getElementById('upload-preview');
  const placeholder = document.getElementById('upload-placeholder');

  input.addEventListener('change', () => {
    if (input.files[0]) mostrarPreview(input.files[0]);
  });

  area.addEventListener('dragover', e => {
    e.preventDefault();
    area.classList.add('dragover');
  });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      input.files = e.dataTransfer.files;
      mostrarPreview(file);
    }
  });

  function mostrarPreview(file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen supera los 5 MB permitidos.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

function setupForm() {
  const form = document.getElementById('donar-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validar()) return;

    const btn  = document.getElementById('submit-btn');
    const text = document.getElementById('submit-text');
    btn.disabled = true;
    text.textContent = 'Publicando...';

    try {
      const fd = new FormData();
      fd.append('titulo',         document.getElementById('titulo').value.trim());
      fd.append('descripcion',    document.getElementById('descripcion').value.trim());
      fd.append('categoria',      document.querySelector('input[name="categoria"]:checked').value);
      fd.append('ciudad',         document.getElementById('ciudad').value.trim());
      fd.append('zona',           document.getElementById('zona').value.trim());
      fd.append('nombre_donante', document.getElementById('nombre_donante').value.trim());
      fd.append('contacto',       document.getElementById('contacto').value.trim());

      const fileInput = document.getElementById('file-input');
      if (fileInput.files[0]) fd.append('imagen', fileInput.files[0]);

      const donacion = await API.crearDonacion(fd);
      showToast('¡Donación publicada con éxito!', 'success');
      setTimeout(() => {
        location.href = `detalle.html?id=${donacion.id}`;
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Error al publicar. Intentá de nuevo.', 'error');
      btn.disabled = false;
      text.textContent = 'Publicar donación';
    }
  });
}

function validar() {
  let ok = true;

  function campo(id, errId, condicion) {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!condicion(el.value)) {
      el.classList.add('error');
      if (err) err.classList.add('visible');
      ok = false;
    } else {
      el.classList.remove('error');
      if (err) err.classList.remove('visible');
    }
  }

  // Categoría
  const catErr = document.getElementById('err-categoria');
  if (!document.querySelector('input[name="categoria"]:checked')) {
    if (catErr) catErr.classList.add('visible');
    ok = false;
  } else {
    if (catErr) catErr.classList.remove('visible');
  }

  campo('titulo',         'err-titulo',       v => v.trim().length >= 4);
  campo('descripcion',    'err-descripcion',  v => v.trim().length >= 10);
  campo('ciudad',         'err-ciudad',       v => v.trim().length >= 2);
  campo('nombre_donante', 'err-nombre',       v => v.trim().length >= 2);
  campo('contacto',       'err-contacto',     v => v.trim().length >= 5);

  // Limpiar error on input
  ['titulo','descripcion','ciudad','nombre_donante','contacto'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function() {
      this.classList.remove('error');
      const err = document.getElementById('err-' + id.replace('nombre_donante','nombre'));
      if (err) err.classList.remove('visible');
    }, { once: true });
  });

  if (!ok) showToast('Completá los campos obligatorios.', 'warning');
  return ok;
}
