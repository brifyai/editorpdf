
            -- Crear tabla users si no existe
            CREATE TABLE IF NOT EXISTS public.users (
                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                avatar_url TEXT,
                phone VARCHAR(20),
                role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'enterprise')),
                subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
                api_usage_limit INTEGER DEFAULT 100,
                monthly_api_count INTEGER DEFAULT 0,
                storage_quota_mb INTEGER DEFAULT 100,
                storage_used_mb INTEGER DEFAULT 0,
                preferences JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                last_login TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
            
            -- Crear índices
            CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
            CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
            CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
            
            -- Habilitar RLS
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            
            -- Crear políticas básicas
            CREATE POLICY IF NOT EXISTS "Enable insert for authentication" ON public.users
                FOR INSERT WITH CHECK (true);
                
            CREATE POLICY IF NOT EXISTS "Enable select for users based on id" ON public.users
                FOR SELECT USING (auth.uid()::text = id::text);
                
            CREATE POLICY IF NOT EXISTS "Enable update for users based on id" ON public.users
                FOR UPDATE USING (auth.uid()::text = id::text);
        