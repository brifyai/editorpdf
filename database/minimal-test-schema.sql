-- Schema mínimo para probar la conexión y detectar el error real

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles simplificada
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de documentos simplificada
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de configuraciones de usuario
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

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

-- Índice simple
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON public.documents(uploaded_at);

-- Vista simple
CREATE OR REPLACE VIEW public.test_view AS
SELECT 
    p.id as user_id,
    p.email,
    COUNT(d.id) as total_documents,
    MAX(d.uploaded_at) as last_upload
FROM public.profiles p
LEFT JOIN public.documents d ON p.id = d.user_id
GROUP BY p.id, p.email;