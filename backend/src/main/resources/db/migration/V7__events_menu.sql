-- "Eventos" es un menú más (igual que los otros 3) pero con su propia página pública:
-- paquetes de cumpleaños, inflables, etc. El slug es el identificador estable que usa
-- la página pública para encontrarlo; el nombre visible lo puede cambiar el admin.

ALTER TABLE menus ADD COLUMN slug VARCHAR(50) UNIQUE;

INSERT INTO menus (name, slug, position) VALUES ('Eventos', 'eventos', 3);
