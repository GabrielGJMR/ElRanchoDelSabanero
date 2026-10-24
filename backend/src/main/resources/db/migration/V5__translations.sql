-- Traducciones automáticas (inglés, francés, chino) del nombre/nota de categorías
-- y del nombre/descripción de platillos. El español (columnas originales) sigue
-- siendo la fuente que escribe el admin; estas columnas las llena TranslationService
-- al crear o editar, y quedan NULL si el servicio de traducción no está disponible
-- (en ese caso el menú público simplemente muestra el español como respaldo).

ALTER TABLE categories ADD COLUMN name_en VARCHAR(100);
ALTER TABLE categories ADD COLUMN name_fr VARCHAR(100);
ALTER TABLE categories ADD COLUMN name_zh VARCHAR(100);
ALTER TABLE categories ADD COLUMN note_en VARCHAR(300);
ALTER TABLE categories ADD COLUMN note_fr VARCHAR(300);
ALTER TABLE categories ADD COLUMN note_zh VARCHAR(300);

ALTER TABLE items ADD COLUMN name_en VARCHAR(120);
ALTER TABLE items ADD COLUMN name_fr VARCHAR(120);
ALTER TABLE items ADD COLUMN name_zh VARCHAR(120);
ALTER TABLE items ADD COLUMN description_en VARCHAR(300);
ALTER TABLE items ADD COLUMN description_fr VARCHAR(300);
ALTER TABLE items ADD COLUMN description_zh VARCHAR(300);
