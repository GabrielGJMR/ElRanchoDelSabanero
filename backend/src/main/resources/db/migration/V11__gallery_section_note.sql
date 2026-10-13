-- Nota opcional por sección (ej. "Así preparamos cada plato a la leña"), para que en Inicio no
-- todas las secciones se vean igual: las que tienen nota salen en un formato editorial con texto.
ALTER TABLE gallery_sections ADD COLUMN note VARCHAR(300);
ALTER TABLE gallery_sections ADD COLUMN note_en VARCHAR(300);
ALTER TABLE gallery_sections ADD COLUMN note_fr VARCHAR(300);
ALTER TABLE gallery_sections ADD COLUMN note_zh VARCHAR(300);
