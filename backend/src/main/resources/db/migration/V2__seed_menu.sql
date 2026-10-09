INSERT INTO categories (name, note, position) VALUES ('Pollo', 'Incluye 2 acompañamientos a elegir', 0);
INSERT INTO categories (name, note, position) VALUES ('Menú de niños', NULL, 1);
INSERT INTO categories (name, note, position) VALUES ('Hamburguesas', NULL, 2);
INSERT INTO categories (name, note, position) VALUES ('Especiales', NULL, 3);
INSERT INTO categories (name, note, position) VALUES ('Bebidas', NULL, 4);

INSERT INTO items (category_id, name, description, price, position)
SELECT c.id, v.name, v.description, v.price, v.position
FROM categories c
JOIN (VALUES
    ('Pollo', 'Gordon Blue', CAST(NULL AS VARCHAR(300)), 7500, 0),
    ('Pollo', 'Filete de pollo', 'Al ajillo, al grill o a la plancha', 7000, 1),
    ('Pollo', 'Fajitas de pollo', 'Clásicas o jalapeñas', 6500, 2),

    ('Menú de niños', 'Hamburguesa con queso', NULL, 4000, 0),
    ('Menú de niños', 'Dedos de pollo', NULL, 4000, 1),
    ('Menú de niños', 'Dedos de pescado', NULL, 4000, 2),

    ('Hamburguesas', 'Hamburguesa Criolla', NULL, 6000, 0),
    ('Hamburguesas', 'Hamburguesa Juanita', NULL, 6500, 1),
    ('Hamburguesas', 'Smash Burger Tajona', NULL, 6500, 2),
    ('Hamburguesas', 'Hamburguesa Carreta sin Bueyes', NULL, 8500, 3),

    ('Especiales', 'Patacones La Burrita', NULL, 8000, 0),
    ('Especiales', 'Papas Especiales', NULL, 7500, 1),
    ('Especiales', 'Ensalada La Patrona', NULL, 7000, 2),
    ('Especiales', 'Tayuya', NULL, 7500, 3),
    ('Especiales', 'Surtido El Gamonal', 'Para 8 personas', 45000, 4),
    ('Especiales', 'Surtido El Peón', 'Para 5 personas', 35000, 5),

    ('Bebidas', 'En agua', NULL, 1800, 0),
    ('Bebidas', 'En leche', NULL, 2000, 1),
    ('Bebidas', 'Gaseosas', NULL, 1500, 2),
    ('Bebidas', 'Tropicales', NULL, 1500, 3)
) AS v(category, name, description, price, position) ON v.category = c.name;
