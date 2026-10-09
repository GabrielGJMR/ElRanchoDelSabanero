const $ = (s) => document.querySelector(s);
const colones = (n) => '₡' + n.toLocaleString('es-CR');
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  kids.forEach((k) => e.append(k));
  return e;
};

async function init() {
  const sections = $('#sections');
  let menu;
  try {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error();
    menu = await res.json();
  } catch {
    sections.replaceChildren(el('p', { className: 'note', textContent: 'No se pudo cargar el menú. Intente de nuevo en unos minutos.' }));
    return;
  }

  const tabs = $('#tabs');
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
      sec.append(el('div', { className: 'item' }, name, el('span', { className: 'price', textContent: colones(it.price) })));
    }
    sections.append(sec);
  }
}

init();
