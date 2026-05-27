const express = require('express');
const multer  = require('multer');
const cors    = require('cors');
const { v4: uuidv4 } = require('uuid');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

const app       = express();
const PORT      = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS   = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

// ── Data helpers ─────────────────────────────────────────────────────────────
function readData() {
  if (!fs.existsSync(DATA_FILE))
    fs.writeFileSync(DATA_FILE, JSON.stringify({ donaciones: [], usuarios: [] }, null, 2));
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!data.usuarios) data.usuarios = [];
  return data;
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}
function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}
function safeUser(u) {
  const { hash, salt, token, ...rest } = u;
  return rest;
}
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No autenticado' });
  const tok  = header.slice(7);
  const data = readData();
  const user = data.usuarios.find(u => u.token === tok);
  if (!user) return res.status(401).json({ error: 'Token inválido o expirado' });
  req.user = user;
  next();
}
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    const tok  = header.slice(7);
    const data = readData();
    req.user = data.usuarios.find(u => u.token === tok) || null;
  } else {
    req.user = null;
  }
  next();
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(UPLOADS));

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG, GIF o WEBP'));
  }
});

// ── Rutas Auth ────────────────────────────────────────────────────────────────

// POST /api/auth/registro
app.post('/api/auth/registro', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre?.trim() || !email?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const data = readData();
  if (data.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase().trim()))
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

  const salt  = crypto.randomBytes(16).toString('hex');
  const token = generateToken();
  const user  = {
    id:             uuidv4(),
    nombre:         nombre.trim(),
    email:          email.toLowerCase().trim(),
    salt,
    hash:           hashPassword(password, salt),
    token,
    fecha_registro: new Date().toISOString()
  };

  data.usuarios.push(user);
  writeData(data);
  res.status(201).json({ token, usuario: safeUser(user) });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  const data = readData();
  const user = data.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || hashPassword(password, user.salt) !== user.hash)
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });

  user.token = generateToken();
  writeData(data);
  res.json({ token: user.token, usuario: safeUser(user) });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const data = readData();
  const user = data.usuarios.find(u => u.id === req.user.id);
  if (user) { user.token = null; writeData(data); }
  res.json({ mensaje: 'Sesión cerrada' });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(safeUser(req.user));
});

// GET /api/usuarios/:id/donaciones
app.get('/api/usuarios/:id/donaciones', authMiddleware, (req, res) => {
  if (req.user.id !== req.params.id)
    return res.status(403).json({ error: 'Acceso no autorizado' });
  const { donaciones } = readData();
  const mias = donaciones.filter(d => d.usuario_id === req.params.id);
  mias.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  res.json(mias);
});

// ── Rutas API ─────────────────────────────────────────────────────────────────

// GET /api/donaciones  — listado con filtros
app.get('/api/donaciones', (req, res) => {
  const { categoria, ciudad, estado, q } = req.query;
  let { donaciones } = readData();

  if (categoria) donaciones = donaciones.filter(d => d.categoria === categoria);
  if (ciudad)    donaciones = donaciones.filter(d =>
    d.ciudad.toLowerCase().includes(ciudad.toLowerCase()));
  if (estado)    donaciones = donaciones.filter(d => d.estado === estado);
  else           donaciones = donaciones.filter(d => d.estado !== 'entregado');
  if (q) {
    const lq = q.toLowerCase();
    donaciones = donaciones.filter(d =>
      d.titulo.toLowerCase().includes(lq) ||
      d.descripcion.toLowerCase().includes(lq));
  }

  donaciones.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  res.json(donaciones);
});

// GET /api/donaciones/:id
app.get('/api/donaciones/:id', (req, res) => {
  const { donaciones } = readData();
  const d = donaciones.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Donación no encontrada' });
  res.json(d);
});

// POST /api/donaciones  — crear nueva donación
app.post('/api/donaciones', optionalAuth, upload.single('imagen'), (req, res) => {
  const { titulo, descripcion, categoria, ciudad, zona, nombre_donante, contacto } = req.body;

  if (!titulo?.trim() || !descripcion?.trim() || !categoria ||
      !ciudad?.trim() || !nombre_donante?.trim() || !contacto?.trim()) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const data    = readData();
  const nueva   = {
    id:             uuidv4(),
    titulo:         titulo.trim(),
    descripcion:    descripcion.trim(),
    categoria,
    estado:         'disponible',
    ciudad:         ciudad.trim(),
    zona:           zona?.trim() || '',
    nombre_donante: nombre_donante.trim(),
    contacto:       contacto.trim(),
    imagen_url:     req.file ? `/uploads/${req.file.filename}` : null,
    usuario_id:     req.user ? req.user.id : null,
    fecha_creacion:      new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  };

  data.donaciones.push(nueva);
  writeData(data);
  res.status(201).json(nueva);
});

// PUT /api/donaciones/:id/reservar
app.put('/api/donaciones/:id/reservar', (req, res) => {
  const data = readData();
  const idx  = data.donaciones.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Donación no encontrada' });
  if (data.donaciones[idx].estado !== 'disponible')
    return res.status(400).json({ error: 'Esta donación ya no está disponible' });
  data.donaciones[idx].estado = 'reservado';
  data.donaciones[idx].fecha_actualizacion = new Date().toISOString();
  writeData(data);
  res.json({ mensaje: 'Donación reservada correctamente' });
});

// PUT /api/donaciones/:id/liberar
app.put('/api/donaciones/:id/liberar', (req, res) => {
  const data = readData();
  const idx  = data.donaciones.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Donación no encontrada' });
  data.donaciones[idx].estado = 'disponible';
  data.donaciones[idx].fecha_actualizacion = new Date().toISOString();
  writeData(data);
  res.json({ mensaje: 'Donación liberada correctamente' });
});

// PUT /api/donaciones/:id/entregar  — solo el dueño puede marcarla
app.put('/api/donaciones/:id/entregar', optionalAuth, (req, res) => {
  const data = readData();
  const idx  = data.donaciones.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Donación no encontrada' });

  const don = data.donaciones[idx];
  // Si la donación tiene dueño, solo él puede marcarla como entregada
  if (don.usuario_id) {
    if (!req.user) return res.status(401).json({ error: 'Debés iniciar sesión para realizar esta acción' });
    if (req.user.id !== don.usuario_id) return res.status(403).json({ error: 'Solo el donante puede marcar como entregado' });
  }

  data.donaciones[idx].estado = 'entregado';
  data.donaciones[idx].fecha_actualizacion = new Date().toISOString();
  writeData(data);
  res.json({ mensaje: 'Donación marcada como entregada' });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const { donaciones } = readData();
  res.json({
    total:      donaciones.length,
    disponibles: donaciones.filter(d => d.estado === 'disponible').length,
    entregadas:  donaciones.filter(d => d.estado === 'entregado').length,
    ciudades:   [...new Set(donaciones.map(d => d.ciudad))].length
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n  DonaCercano corriendo en http://localhost:${PORT}\n`);
});
