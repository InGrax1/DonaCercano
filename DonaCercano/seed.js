// Ejecutar con: node seed.js
// Agrega datos de ejemplo para demostración

const fs   = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data.json');

const semillas = [
  {
    titulo: 'Ropa de niños tallas 4 a 8 años',
    descripcion: 'Varios conjuntos, camisetas, pantalones y vestidos en muy buen estado. Lavados y listos para entregar. Ideal para familia con niños pequeños.',
    categoria: 'ropa',
    ciudad: 'Buenos Aires',
    zona: 'Palermo',
    nombre_donante: 'María González',
    contacto: 'maria.g@email.com'
  },
  {
    titulo: 'Sillón de dos cuerpos color beige',
    descripcion: 'Sillón en buen estado, tela beige sin manchas graves. Hay una pequeña marca en el apoyabrazos derecho. Necesita ser retirado por quien lo lleva.',
    categoria: 'muebles',
    ciudad: 'Córdoba',
    zona: 'Nueva Córdoba',
    nombre_donante: 'Carlos Ruiz',
    contacto: '+54 351 234-5678'
  },
  {
    titulo: 'Caja de libros universitarios de Derecho',
    descripcion: 'Aproximadamente 15 libros de derecho civil, constitucional y procesal. Ediciones 2018-2022. Perfectos para estudiantes que comienzan la carrera.',
    categoria: 'libros',
    ciudad: 'Rosario',
    zona: 'Centro',
    nombre_donante: 'Lucía Fernández',
    contacto: 'luciaf@email.com'
  },
  {
    titulo: 'Notebook Dell Inspiron 15 (2019)',
    descripcion: 'Funciona perfectamente. Core i5, 8GB RAM, 256GB SSD. Cargador incluido. La pantalla tiene un pequeño rasguño en la esquina que no afecta el uso.',
    categoria: 'electronica',
    ciudad: 'Buenos Aires',
    zona: 'Caballito',
    nombre_donante: 'Andrés Medina',
    contacto: '+54 11 5555-1234'
  },
  {
    titulo: 'Ropa de mujer — talla M y L',
    descripcion: 'Más de 20 prendas: blusas, pantalones, vestidos y abrigos. Todas en excelente estado. Vendo? No, regalo todo junto o por lotes.',
    categoria: 'ropa',
    ciudad: 'Mendoza',
    zona: 'Godoy Cruz',
    nombre_donante: 'Sofía Torres',
    contacto: 'sofi.t@email.com'
  },
  {
    titulo: 'Mesa de comedor con 4 sillas',
    descripcion: 'Juego de comedor de madera maciza. Mesa 1.20m x 0.80m, 4 sillas tapizadas en tela gris. Algunos rayones en la mesa pero en buen estado general.',
    categoria: 'muebles',
    ciudad: 'Buenos Aires',
    zona: 'Flores',
    nombre_donante: 'Roberto Sánchez',
    contacto: '+54 11 6666-7890'
  },
  {
    titulo: 'Juguetes para niños de 3 a 8 años',
    descripcion: 'Legos, muñecos, puzzles, juegos de mesa y más. Todo completo y en buen estado. Mis hijos ya crecieron y quiero que hagan felices a otros chicos.',
    categoria: 'juguetes',
    ciudad: 'Córdoba',
    zona: 'Argüello',
    nombre_donante: 'Valeria Pérez',
    contacto: 'vale.p@email.com'
  },
  {
    titulo: 'Alimentos no perecederos — caja completa',
    descripcion: 'Arroz, fideos, lentejas, aceite, harina, azúcar y conservas. Todo dentro de fecha. Ideal para familia que lo necesite. Entrego en mano.',
    categoria: 'alimentos',
    ciudad: 'Rosario',
    zona: 'Arroyito',
    nombre_donante: 'Patricia López',
    contacto: '+54 341 777-4321'
  },
  {
    titulo: 'Televisor Samsung 32 pulgadas',
    descripcion: 'Smart TV en funcionamiento. Con control remoto original. Se puede conectar a WiFi. Actualizaciones de software al día. Se retira por Belgrano.',
    categoria: 'electronica',
    ciudad: 'Buenos Aires',
    zona: 'Belgrano',
    nombre_donante: 'Diego Morales',
    contacto: 'diego.m@email.com'
  },
  {
    titulo: 'Colección de novelas — 30 libros',
    descripcion: 'Novelas latinoamericanas, policiales y de terror. Incluye Cortázar, García Márquez, Borges y varios autores contemporáneos. Todos en perfectas condiciones.',
    categoria: 'libros',
    ciudad: 'Buenos Aires',
    zona: 'San Telmo',
    nombre_donante: 'Elena Castro',
    contacto: 'elena.c@email.com'
  }
];

function seed() {
  const data = { donaciones: [] };
  const ahora = new Date();

  semillas.forEach((s, i) => {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() - i * 2);

    data.donaciones.push({
      id:             uuidv4(),
      ...s,
      estado:         i === 8 ? 'reservado' : 'disponible',
      imagen_url:     null,
      fecha_creacion:      fecha.toISOString(),
      fecha_actualizacion: fecha.toISOString()
    });
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`\n  Seed completado: ${semillas.length} donaciones cargadas\n  Archivo: ${DATA_FILE}\n`);
}

seed();
