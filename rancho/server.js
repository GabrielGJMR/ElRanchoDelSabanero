import express from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';

const PORT = process.env.PORT || 3000;
const WHATSAPP = process.env.WHATSAPP || '50663837649';
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  ADMIN_PASSWORD = randomBytes(6).toString('hex');
  console.log(`ADMIN_PASSWORD no definido. Clave temporal de admin: ${ADMIN_PASSWORD}`);
}

const app = express();
app.use(express.json({ limit: '50kb' }));
app.use(express.static('public'));

const tokens = new Set();
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const auth = (req, res, next) =>
  tokens.has((req.headers.authorization || '').replace('Bearer ', '')) ? next() : res.status(401).json({ error: 'No autorizado' });
const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);

// ---- Público ----
app.get('/api/config', (_req, res) => res.json({ whatsapp: WHATSAPP }));

app.get('/api/menu', (_req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY position, id').all();
  const items = db.prepare('SELECT * FROM items WHERE available = 1 ORDER BY position, id').all();
  res.json(cats.map(c => ({ ...c, items: items.filter(i => i.category_id === c.id) })));
});

app.post('/api/orders', (req, res) => {
  const customer = str(req.body.customer, 80);
  const phone = str(req.body.phone, 20);
  const notes = str(req.body.notes, 500);
  const lines = Array.isArray(req.body.items) ? req.body.items : [];
  if (!customer || !phone || !lines.length) return res.status(400).json({ error: 'Faltan datos del pedido' });

  const getItem = db.prepare('SELECT * FROM items WHERE id = ? AND available = 1');
  const resolved = [];
  for (const l of lines.slice(0, 50)) {
    const item = getItem.get(Number(l.id));
    const qty = Math.min(Math.max(parseInt(l.qty, 10) || 0, 0), 50);
    if (item && qty) resolved.push({ item, qty });
  }
  if (!resolved.length) return res.status(400).json({ error: 'Pedido vacío' });

  const total = resolved.reduce((s, r) => s + r.item.price * r.qty, 0);
  db.exec('BEGIN');
  try {
    const { lastInsertRowid: id } = db
      .prepare('INSERT INTO orders (customer, phone, notes, total) VALUES (?, ?, ?, ?)')
      .run(customer, phone, notes, total);
    const ins = db.prepare('INSERT INTO order_items (order_id, item_id, name, price, qty) VALUES (?, ?, ?, ?, ?)');
    resolved.forEach(r => ins.run(id, r.item.id, r.item.name, r.item.price, r.qty));
    db.exec('COMMIT');
    res.status(201).json({ id: Number(id), total });
  } catch (e) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'No se pudo guardar el pedido' });
  }
});

// ---- Admin ----
app.post('/api/admin/login', (req, res) => {
  if (!same(str(req.body.password, 200), ADMIN_PASSWORD)) return res.status(401).json({ error: 'Clave incorrecta' });
  const token = randomBytes(24).toString('hex');
  tokens.add(token);
  res.json({ token });
});

app.get('/api/admin/menu', auth, (_req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY position, id').all();
  const items = db.prepare('SELECT * FROM items ORDER BY position, id').all();
  res.json(cats.map(c => ({ ...c, items: items.filter(i => i.category_id === c.id) })));
});

app.post('/api/admin/items', auth, (req, res) => {
  const { category_id, name, description, price } = req.body;
  if (!str(name) || !Number.isInteger(price) || price < 0) return res.status(400).json({ error: 'Datos inválidos' });
  const { lastInsertRowid } = db
    .prepare('INSERT INTO items (category_id, name, description, price) VALUES (?, ?, ?, ?)')
    .run(Number(category_id), str(name), str(description) || null, price);
  res.status(201).json({ id: Number(lastInsertRowid) });
});

app.put('/api/admin/items/:id', auth, (req, res) => {
  const { name, description, price, available } = req.body;
  if (!str(name) || !Number.isInteger(price) || price < 0) return res.status(400).json({ error: 'Datos inválidos' });
  db.prepare('UPDATE items SET name = ?, description = ?, price = ?, available = ? WHERE id = ?')
    .run(str(name), str(description) || null, price, available ? 1 : 0, Number(req.params.id));
  res.json({ ok: true });
});

app.delete('/api/admin/items/:id', auth, (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.get('/api/admin/orders', auth, (_req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 100').all();
  const lines = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  res.json(orders.map(o => ({ ...o, items: lines.all(o.id) })));
});

app.put('/api/admin/orders/:id', auth, (req, res) => {
  const status = str(req.body.status, 20);
  if (!['nuevo', 'preparando', 'listo', 'entregado', 'cancelado'].includes(status))
    return res.status(400).json({ error: 'Estado inválido' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`El Rancho del Sabanero en http://localhost:${PORT}`));
