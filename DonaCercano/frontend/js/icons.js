// ── DonaCercano — Sistema de iconos SVG (Lucide-style, 24px) ─────
// Uso: renderIcon('shirt', 'icon-xl')
// Uso en JS dinámico: catIcon('ropa', 'icon-2xl')

const ICON_PATHS = {
  // ── Categorías ────────────────────────────────────────────────
  shirt:       `<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>`,

  armchair:    `<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>`,

  basket:      `<path d="m6 2 3 6"/><path d="m18 2-3 6"/><path d="M8 12h.01"/><path d="M16 12h.01"/><path d="M2 9h20l-3 9H5L2 9z"/>`,

  bookOpen:    `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,

  blocks:      `<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>`,

  monitor:     `<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>`,

  gift:        `<rect width="18" height="13" x="3" y="9" rx="1"/><path d="M12 9V3"/><path d="m9 3 3 6 3-6"/><path d="M3 13h18"/>`,

  // ── Acciones / UI ─────────────────────────────────────────────
  package:     `<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.7 4.5 7.7-4.5"/><path d="m7.5 4.27 9 5.15"/>`,

  search:      `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>`,

  users:       `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,

  mapPin:      `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,

  clock:       `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,

  user:        `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,

  camera:      `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`,

  uploadCloud: `<polyline points="16 16 12 12 8 16"/><line x1="12" x2="12" y1="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>`,

  checkCircle: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>`,

  arrowRight:  `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,

  heart:       `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,

  check:       `<path d="M20 6 9 17l-5-5"/>`,

  star:        `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,

  info:        `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,

  shieldCheck: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`,

  zap:         `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,

  mapGrid:     `<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>`,

  layers:      `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>`,

  truck:       `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11v12"/><path d="M9 17h8m3.5.5H21l-3.5-7H10"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>`,

  checkSquare: `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
};

// ── Helpers ───────────────────────────────────────────────────────
function renderIcon(name, extraClass = '') {
  const paths = ICON_PATHS[name] || ICON_PATHS.gift;
  const cls   = ['icon', extraClass].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const CAT_ICON_MAP = {
  ropa:        'shirt',
  muebles:     'armchair',
  alimentos:   'basket',
  libros:      'bookOpen',
  juguetes:    'blocks',
  electronica: 'monitor',
  otro:        'gift',
};

function catIcon(categoria, extraClass = '') {
  return renderIcon(CAT_ICON_MAP[categoria] || 'gift', extraClass);
}
