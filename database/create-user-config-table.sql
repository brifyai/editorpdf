-- Crear tabla de configuraciones de usuario si no existe
CREATE TABLE IF NOT EXISTS public.user_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    groq_api_key TEXT,
    chutes_api_key TEXT,
    groq_model TEXT,
    chutes_model TEXT,
    groq_temperature DECIMAL(3,2),
    chutes_temperature DECIMAL(3,2),
    groq_max_tokens INTEGER,
    chutes_max_tokens INTEGER,
    groq_stream BOOLEAN DEFAULT true,
    chutes_stream BOOLEAN DEFAULT false,
    groq_top_p DECIMAL(3,2) DEFAULT 1.0,
    chutes_top_p DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Habilitar RLS para user_configurations
ALTER TABLE public.user_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas para user_configurations
CREATE POLICY "Users can view own config" ON public.user_configurations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON public.user_configurations
    FOR ALL USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_config_updated_at
    BEFORE UPDATE ON public.user_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar el esquema creado
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_configurations' 
ORDER BY ordinal_position;