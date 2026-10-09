import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';

mkdirSync('data', { recursive: true });
export const db = new DatabaseSync('data/rancho.db');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  note TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'nuevo',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
`);

const seed = [
  ['Pollo', 'Incluye 2 acompañamientos a elegir', [
    ['Gordon Blue', null, 7500],
    ['Filete de pollo', 'Al ajillo, al grill o a la plancha', 7000],
    ['Fajitas de pollo', 'Clásicas o jalapeñas', 6500],
  ]],
  ['Menú de niños', null, [
    ['Hamburguesa con queso', null, 4000],
    ['Dedos de pollo', null, 4000],
    ['Dedos de pescado', null, 4000],
  ]],
  ['Hamburguesas', null, [
    ['Hamburguesa Criolla', null, 6000],
    ['Hamburguesa Juanita', null, 6500],
    ['Smash Burger Tajona', null, 6500],
    ['Hamburguesa Carreta sin Bueyes', null, 8500],
  ]],
  ['Especiales', null, [
    ['Patacones La Burrita', null, 8000],
    ['Papas Especiales', null, 7500],
    ['Ensalada La Patrona', null, 7000],
    ['Tayuya', null, 7500],
    ['Surtido El Gamonal', 'Para 8 personas', 45000],
    ['Surtido El Peón', 'Para 5 personas', 35000],
  ]],
  ['Bebidas', null, [
    ['En agua', null, 1800],
    ['En leche', null, 2000],
    ['Gaseosas', null, 1500],
    ['Tropicales', null, 1500],
  ]],
];

if (db.prepare('SELECT COUNT(*) AS n FROM categories').get().n === 0) {
  const insCat = db.prepare('INSERT INTO categories (name, note, position) VALUES (?, ?, ?)');
  const insItem = db.prepare('INSERT INTO items (category_id, name, description, price, position) VALUES (?, ?, ?, ?, ?)');
  seed.forEach(([name, note, items], ci) => {
    const { lastInsertRowid } = insCat.run(name, note, ci);
    items.forEach(([n, d, p], ii) => insItem.run(lastInsertRowid, n, d, p, ii));
  });
}
