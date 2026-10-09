const $ = (s) => document.querySelector(s);
const colones = (n) => '₡' + n.toLocaleString('es-CR');
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  kids.forEach((k) => e.append(k));
  return e;
};
const STATUSES = ['nuevo', 'preparando', 'listo', 'entregado', 'cancelado'];
let token = sessionStorage.getItem('adminToken') || '';

async function api(path, method = 'GET', body) {
  const res = await fetch('/api/admin/' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); throw new Error('No autorizado'); }
  const data = await res.json();
  if (!res.ok) { alert(data.error || 'Error'); throw new Error(data.error); }
  return data;
}

function logout() {
  token = '';
  sessionStorage.removeItem('adminToken');
  $('#panel').hidden = true;
  $('#login').hidden = false;
}

$('#login').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: new FormData(e.target).get('password') }),
  });
  const data = await res.json();
  if (!res.ok) { $('#loginMsg').textContent = data.error; return; }
  token = data.token;
  sessionStorage.setItem('adminToken', token);
  e.target.reset();
  start();
};

async function start() {
  if (!token) return;
  try {
    await Promise.all([loadOrders(), loadMenu()]);
    $('#login').hidden = true;
    $('#panel').hidden = false;
  } catch { /* logout ya se encargó */ }
}

async function loadOrders() {
  const orders = await api('orders');
  const box = $('#orders');
  box.replaceChildren();
  if (!orders.length) box.append(el('p', { className: 'note', textContent: 'Sin pedidos todavía.' }));
  for (const o of orders) {
    const sel = el('select');
    STATUSES.forEach((s) => sel.append(el('option', { value: s, textContent: s, selected: s === o.status })));
    sel.onchange = () => api('orders/' + o.id, 'PUT', { status: sel.value });
    const ul = el('ul');
    o.items.forEach((i) => ul.append(el('li', { textContent: `${i.qty} x ${i.name} — ${colones(i.price * i.qty)}` })));
    box.append(el('div', { className: 'order' },
      el('h3', { textContent: `#${o.id} · ${o.customer} · ${o.phone}` }),
      el('span', { className: 'note small', textContent: o.created_at + ' UTC' }),
      ul,
      el('p', { textContent: 'Total: ' + colones(o.total) + (o.notes ? ' · Notas: ' + o.notes : '') }),
      sel));
  }
}

async function loadMenu() {
  const cats = await api('menu');
  const box = $('#menuEdit');
  box.replaceChildren();
  for (const cat of cats) {
    box.append(el('h3', { textContent: cat.name }));
    for (const it of cat.items) {
      const name = el('input', { value: it.name });
      const price = el('input', { type: 'number', min: 0, step: 100, value: it.price });
      const avail = el('input', { type: 'checkbox', checked: !!it.available, title: 'Disponible' });
      const save = el('button', { className: 'btn sm', textContent: 'Guardar' });
      const del = el('button', { className: 'btn sm', textContent: 'Borrar' });
      save.onclick = async () => {
        await api('items/' + it.id, 'PUT', {
          name: name.value, description: it.description, price: parseInt(price.value, 10), available: avail.checked,
        });
        save.textContent = '✓';
        setTimeout(() => (save.textContent = 'Guardar'), 1200);
      };
      del.onclick = async () => {
        if (confirm(`¿Borrar "${it.name}"?`)) { await api('items/' + it.id, 'DELETE'); loadMenu(); }
      };
      const row = el('div', { className: 'row' }, name, price, el('label', {}, avail), save);
      row.append(del);
      box.append(row);
    }
    const nn = el('input', { placeholder: 'Nuevo platillo' });
    const np = el('input', { type: 'number', min: 0, step: 100, placeholder: 'Precio' });
    const add = el('button', { className: 'btn sm', textContent: 'Agregar' });
    add.onclick = async () => {
      await api('items', 'POST', { category_id: cat.id, name: nn.value, price: parseInt(np.value, 10) });
      loadMenu();
    };
    box.append(el('div', { className: 'row' }, nn, np, add));
  }
}

start();
