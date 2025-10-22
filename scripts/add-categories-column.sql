-- Agregar columna categories a la tabla products
ALTER TABLE products ADD COLUMN categories TEXT;

-- Actualizar algunos productos de ejemplo con categorías
UPDATE products SET categories = 'smartphones' WHERE title LIKE '%iPhone%' OR title LIKE '%Samsung%' OR title LIKE '%Xiaomi%';
UPDATE products SET categories = 'laptops' WHERE title LIKE '%MacBook%' OR title LIKE '%Dell%' OR title LIKE '%HP%' OR title LIKE '%Lenovo%';
UPDATE products SET categories = 'audio' WHERE title LIKE '%AirPods%' OR title LIKE '%Headphone%' OR title LIKE '%Speaker%';
UPDATE products SET categories = 'cameras' WHERE title LIKE '%Canon%' OR title LIKE '%Nikon%' OR title LIKE '%Sony%';
UPDATE products SET categories = 'gaming' WHERE title LIKE '%PlayStation%' OR title LIKE '%Xbox%' OR title LIKE '%Nintendo%';
UPDATE products SET categories = 'wearables' WHERE title LIKE '%Watch%' OR title LIKE '%Smartwatch%' OR title LIKE '%Band%';

-- Para productos que no coincidan con ninguna categoría, asignar 'smartphones' por defecto
UPDATE products SET categories = 'smartphones' WHERE categories IS NULL;
