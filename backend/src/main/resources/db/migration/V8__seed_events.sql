-- Dos paquetes de ejemplo para que "Eventos" no arranque vacío. Son solo un punto de
-- partida: el admin los edita, les cambia el precio/descripción, les sube foto o los
-- borra por completo desde el panel, igual que cualquier categoría/platillo de la carta.

INSERT INTO categories (menu_id, name, note, position)
VALUES ((SELECT id FROM menus WHERE slug = 'eventos'), 'Paquetes de catering', 'Para cumpleaños y celebraciones', 0);

INSERT INTO items (category_id, name, description, price, position)
SELECT c.id, v.name, v.description, v.price, v.position
FROM categories c
JOIN (VALUES
    ('Paquete Catering Básico', 'Inflable, mesa decorada y 2 horas de salón. Hasta 20 personas.', 85000, 0),
    ('Paquete Catering Premium', 'Inflable, animador, torta y 3 horas de salón. Hasta 40 personas.', 150000, 1)
) AS v(name, description, price, position)
  ON c.menu_id = (SELECT id FROM menus WHERE slug = 'eventos') AND c.name = 'Paquetes de catering';
