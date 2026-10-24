-- El dueño ya definió los tres menús reales: el que ya existía (Pollo, Hamburguesas,
-- Especiales, etc.) se queda como "Menú Principal"; "Casados" y "Desayunos" quedan creados
-- pero sin categorías todavía, a la espera de que el dueño entregue esos platillos.
-- Se les da slug para que el sitio público los pueda mostrar como pestañas separadas en
-- /menu (antes los 3 menús sin página propia se mezclaban en una sola lista, ver MenuService).

UPDATE menus SET name = 'Menú Principal', slug = 'principal' WHERE position = 0;
UPDATE menus SET name = 'Casados',        slug = 'casados'   WHERE position = 1;
UPDATE menus SET name = 'Desayunos',      slug = 'desayunos' WHERE position = 2;
