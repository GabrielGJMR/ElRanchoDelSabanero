const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  kids.forEach((k) => e.append(k));
  return e;
};

// Las credenciales viven solo en esta pestaña (sessionStorage) y se envían como HTTP Basic.
let auth = sessionStorage.getItem('adminAuth') || '';

const basic = (user, pass) => 'Basic ' + btoa(String.fromCharCode(...new TextEncoder().encode(`${user}:${pass}`)));

async function api(path, method = 'GET', body) {
  const res = await fetch('/api/admin/' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); throw new Error('No autorizado'); }
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) { alert(data?.error || 'Error'); throw new Error(data?.error); }
  return data;
}

function logout() {
  auth = '';
  sessionStorage.removeItem('adminAuth');
  $('#panel').hidden = true;
  $('#login').hidden = false;
}

$('#logout').onclick = logout;

$('#login').onsubmit = async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  auth = basic(f.get('username'), f.get('password'));
  const res = await fetch('/api/admin/menu', { headers: { Authorization: auth } });
  if (!res.ok) { auth = ''; $('#loginMsg').textContent = 'Usuario o clave incorrectos'; return; }
  sessionStorage.setItem('adminAuth', auth);
  e.target.reset();
  $('#loginMsg').textContent = '';
  start();
};

async function start() {
  if (!auth) return;
  try {
    await loadMenu();
    $('#login').hidden = true;
    $('#panel').hidden = false;
  } catch { /* logout ya se encargó */ }
}

const flash = (btn, text = '✓') => {
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => (btn.textContent = old), 1200);
};

async function loadMenu() {
  const cats = await api('menu');
  const box = $('#menuEdit');
  box.replaceChildren();
  for (const cat of cats) {
    // Cabecera de categoría: renombrar / borrar
    const cName = el('input', { value: cat.name, ariaLabel: 'Nombre de la categoría' });
    const cNote = el('input', { value: cat.note || '', placeholder: 'Nota (opcional)' });
    const cSave = el('button', { className: 'btn sm', textContent: 'Guardar' });
    const cDel = el('button', { className: 'btn sm', textContent: 'Borrar' });
    cSave.onclick = async () => {
      await api('categories/' + cat.id, 'PUT', { name: cName.value, note: cNote.value });
      flash(cSave);
    };
    cDel.onclick = async () => {
      if (confirm(`¿Borrar la categoría "${cat.name}" y todos sus platillos?`)) {
        await api('categories/' + cat.id, 'DELETE');
        loadMenu();
      }
    };
    box.append(el('div', { className: 'row cat-row' }, cName, cNote, cSave, cDel));

    for (const it of cat.items) {
      const name = el('input', { value: it.name, ariaLabel: 'Nombre del platillo' });
      const desc = el('input', { value: it.description || '', placeholder: 'Descripción (opcional)' });
      const price = el('input', { type: 'number', min: 0, step: 100, value: it.price, ariaLabel: 'Precio' });
      const avail = el('input', { type: 'checkbox', checked: it.available, title: 'Visible en el menú' });
      const save = el('button', { className: 'btn sm', textContent: 'Guardar' });
      const del = el('button', { className: 'btn sm', textContent: 'Borrar' });
      save.onclick = async () => {
        await api('items/' + it.id, 'PUT', {
          name: name.value, description: desc.value, price: parseInt(price.value, 10), available: avail.checked,
        });
        flash(save);
      };
      del.onclick = async () => {
        if (confirm(`¿Borrar "${it.name}"?`)) { await api('items/' + it.id, 'DELETE'); loadMenu(); }
      };
      box.append(el('div', { className: 'row item-row' }, name, desc, price, el('label', {}, avail, ' visible'), save, del));
    }

    // Nuevo platillo
    const nn = el('input', { placeholder: 'Nuevo platillo' });
    const nd = el('input', { placeholder: 'Descripción (opcional)' });
    const np = el('input', { type: 'number', min: 0, step: 100, placeholder: 'Precio' });
    const add = el('button', { className: 'btn sm', textContent: 'Agregar' });
    add.onclick = async () => {
      await api('items', 'POST', {
        categoryId: cat.id, name: nn.value, description: nd.value, price: parseInt(np.value, 10),
      });
      loadMenu();
    };
    box.append(el('div', { className: 'row item-row new' }, nn, nd, np, add));
  }
}

$('#newCatBtn').onclick = async () => {
  await api('categories', 'POST', { name: $('#newCatName').value, note: $('#newCatNote').value });
  $('#newCatName').value = '';
  $('#newCatNote').value = '';
  loadMenu();
};

start();
