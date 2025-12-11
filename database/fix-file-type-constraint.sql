-- Script para corregir la restricción CHECK en la tabla documents
-- Problema: La restricción actual no incluye todos los tipos de archivo que el código permite

-- 1. Eliminar la restricción CHECK existente
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_file_type_check;

-- 2. Crear nueva restricción CHECK que incluya todos los tipos soportados
-- Tipos permitidos según src/routes/analysis.js línea 53:
-- ['.pdf', '.pptx', '.txt', '.doc', '.docx', '.jpg', 'jpeg', 'png', 'bmp', 'tiff', '.tif', '.webp']
ALTER TABLE documents 
ADD CONSTRAINT documents_file_type_check 
CHECK (file_type IN (
    'pdf', 
    'pptx', 
    'txt', 
    'doc', 
    'docx', 
    'jpg', 
    'jpeg', 
    'png', 
    'bmp', 
    'tiff', 
    'webp'
));

-- 3. Verificar que la restricción se aplicó correctamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'documents' 
    AND n.nspname = 'public'
    AND c.contype = 'c';

-- 4. Mostrar los tipos de archivo actualmente en la tabla (para verificación)
SELECT DISTINCT file_type, COUNT(*) as count
FROM documents 
GROUP BY file_type
ORDER BY file_type;