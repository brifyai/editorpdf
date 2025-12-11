-- Agregar columnas faltantes a la tabla user_configurations
-- Estas columnas son necesarias para guardar la configuración completa de las APIs

-- Verificar si la tabla existe
DO $$
BEGIN
    -- Agregar columnas de modelo si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'groq_model') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN groq_model TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'chutes_model') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN chutes_model TEXT;
    END IF;
    
    -- Agregar columnas de temperatura si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'groq_temperature') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN groq_temperature DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'chutes_temperature') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN chutes_temperature DECIMAL(3,2);
    END IF;
    
    -- Agregar columnas de max_tokens si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'groq_max_tokens') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN groq_max_tokens INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'chutes_max_tokens') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN chutes_max_tokens INTEGER;
    END IF;
    
    -- Agregar columnas de stream si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'groq_stream') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN groq_stream BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'chutes_stream') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN chutes_stream BOOLEAN DEFAULT false;
    END IF;
    
    -- Agregar columnas de top_p si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'groq_top_p') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN groq_top_p DECIMAL(3,2) DEFAULT 1.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_configurations' 
                  AND column_name = 'chutes_top_p') THEN
        ALTER TABLE public.user_configurations 
        ADD COLUMN chutes_top_p DECIMAL(3,2) DEFAULT 1.0;
    END IF;
    
    RAISE NOTICE '✅ Columnas agregadas exitosamente a la tabla user_configurations';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Error al agregar columnas: %', SQLERRM;
END $$;

-- Verificar el esquema actual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_configurations' 
ORDER BY ordinal_position;