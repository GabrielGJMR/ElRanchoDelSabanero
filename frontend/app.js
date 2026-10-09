const $ = (s) => document.querySelector(s);
const colones = (n) => '₡' + n.toLocaleString('es-CR');
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  kids.forEach((k) => e.append(k));
  return e;
};

let menu = [];
let whatsapp = '';
const cart = new Map(); // id -> { item, qty }

async function init() {
  const [m, c] = await Promise.all([
    fetch('/api/menu').then((r) => r.json()),
    fetch('/api/config').then((r) => r.json()),
  ]);
  menu = m;
  whatsapp = c.whatsapp;
  render();
}

function render() {
  const tabs = $('#tabs');
  const sections = $('#sections');
  tabs.replaceChildren();
  sections.replaceChildren();
  for (const cat of menu) {
    if (!cat.items.length) continue;
    tabs.append(el('a', { href: '#cat' + cat.id, textContent: cat.name }));
    const sec = el('section', { className: 'cat', id: 'cat' + cat.id }, el('h2', { textContent: cat.name }));
    if (cat.note) sec.append(el('p', { className: 'catnote', textContent: cat.note }));
    for (const it of cat.items) {
      const name = el('span', { className: 'name', textContent: it.name });
      if (it.description) name.append(el('span', { className: 'desc', textContent: it.description }));
      const add = el('button', { className: 'add', textContent: '+', title: 'Agregar', ariaLabel: 'Agregar ' + it.name });
      add.onclick = () => change(it, 1);
      sec.append(el('div', { className: 'item' }, name, el('span', { className: 'price', textContent: colones(it.price) }), add));
    }
    sections.append(sec);
  }
}

function change(item, delta) {
  const cur = cart.get(item.id) || { item, qty: 0 };
  cur.qty += delta;
  if (cur.qty <= 0) cart.delete(item.id);
  else cart.set(item.id, cur);
  updateCart();
}

const total = () => [...cart.values()].reduce((s, l) => s + l.item.price * l.qty, 0);

function updateCart() {
  const count = [...cart.values()].reduce((s, l) => s + l.qty, 0);
  $('#cartBtn').hidden = count === 0;
  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = colones(total());
  $('#cartSum').textContent = colones(total());
  const list = $('#cartList');
  list.replaceChildren();
  for (const { item, qty } of cart.values()) {
    const minus = el('button', { textContent: '−', ariaLabel: 'Quitar uno' });
    const plus = el('button', { textContent: '+', ariaLabel: 'Agregar uno' });
    minus.onclick = () => change(item, -1);
    plus.onclick = () => change(item, 1);
    list.append(el('li', {}, minus, el('span', { textContent: qty }), plus,
      el('span', { className: 'n', textContent: item.name }),
      el('span', { className: 'price', textContent: colones(item.price * qty) })));
  }
  if (!count && $('#cartDlg').open) $('#cartDlg').close();
}

$('#cartBtn').onclick = () => $('#cartDlg').showModal();

$('#orderForm').onsubmit = async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = {
    customer: f.get('customer'),
    phone: f.get('phone'),
    notes: f.get('notes'),
    items: [...cart.values()].map((l) => ({ id: l.item.id, qty: l.qty })),
  };
  const msg = $('#orderMsg');
  msg.textContent = 'Enviando...';
  // Abrir la ventana antes del await para que el navegador no la bloquee
  const win = window.open('', '_blank');
  const res = await fetch('/api/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) { win?.close(); msg.textContent = data.error || 'Error al enviar'; return; }

  const lines = [...cart.values()].map((l) => `• ${l.qty} x ${l.item.name} (${colones(l.item.price * l.qty)})`);
  const text = [
    `Hola, quiero hacer el pedido #${data.id}:`, ...lines,
    `Total (sin I.V.A.): ${colones(data.total)}`,
    body.notes ? `Notas: ${body.notes}` : '',
    `Nombre: ${body.customer}`, `Tel: ${body.phone}`,
  ].filter(Boolean).join('\n');
  const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  if (win) win.location.href = url; else location.href = url;

  cart.clear();
  updateCart();
  e.target.reset();
  msg.textContent = '';
  $('#cartDlg').close();
};

init();
