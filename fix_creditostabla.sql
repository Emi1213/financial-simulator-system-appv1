-- Script para arreglar la tabla creditostabla
-- Ejecutar este script en tu base de datos PostgreSQL

-- 1. Primero, vamos a ver el estado actual
SELECT * FROM creditostabla WHERE id_credito = 0;

-- 2. Actualizar el registro con ID = 0 para que tenga el próximo ID disponible
-- Primero, obtener el siguiente ID disponible
SELECT COALESCE(MAX(id_credito), 0) + 1 as next_id FROM creditostabla WHERE id_credito > 0;

-- 3. Actualizar el registro problemático (cambiar el 1 por el next_id que obtuviste arriba)
UPDATE creditostabla 
SET id_credito = (SELECT COALESCE(MAX(id_credito), 0) + 1 FROM creditostabla WHERE id_credito > 0)
WHERE id_credito = 0;

-- 4. Asegurar que todos los campos numéricos sean del tipo correcto
UPDATE creditostabla 
SET 
    interes = CAST(interes AS NUMERIC),
    plazo_min = CAST(plazo_min AS INTEGER),
    plazo_max = CAST(plazo_max AS INTEGER);

-- 4b. Si el campo estado es boolean, no necesitamos cambiarlo
-- Pero si necesitas verificar los valores, puedes usar:
-- SELECT id_credito, nombre, estado, 
--        CASE WHEN estado THEN 'Activo' ELSE 'Inactivo' END as estado_texto
-- FROM creditostabla;

-- 5. Verificar que la secuencia del ID esté actualizada (si usas SERIAL)
-- Esto actualiza la secuencia para que el próximo INSERT use el ID correcto
SELECT setval(pg_get_serial_sequence('creditostabla', 'id_credito'), 
              COALESCE((SELECT MAX(id_credito) FROM creditostabla), 1), 
              true);

-- 6. Verificar los datos finales
SELECT * FROM creditostabla ORDER BY id_credito;