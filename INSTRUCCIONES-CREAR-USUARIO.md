# Instrucciones para Crear el Usuario Camilo Alegria

## Problema Actual
La tabla `users` no existe en la base de datos de Supabase, por lo que no se pueden registrar usuarios.

## Solución: Ejecutar SQL Manualmente

### Paso 1: Acceder al Dashboard de Supabase
1. Abre tu navegador y ve a: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm
2. Inicia sesión en tu cuenta de Supabase

### Paso 2: Abrir el Editor SQL
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"** para crear una nueva consulta

### Paso 3: Ejecutar el SQL
Copia y pega el siguiente SQL en el editor:

```sql
-- Tabla de usuarios personalizada para login con ID numérico
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

-- Índices para la tabla users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (RLS)
-- Política para permitir inserción durante registro
CREATE POLICY IF NOT EXISTS "Enable insert for authentication" ON public.users
    FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan ver sus propios datos
CREATE POLICY IF NOT EXISTS "Users can view own user record" ON public.users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::BIGINT);

-- Política para que los usuarios puedan actualizar sus propios datos
CREATE POLICY IF NOT EXISTS "Users can update own user record" ON public.users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::BIGINT);

-- Política adicional para permitir lectura basada en autenticación
CREATE POLICY IF NOT EXISTS "Enable select for authenticated users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

4. Haz clic en el botón **"Run"** (o "Ejecutar")
5. Espera a que se complete la ejecución (debería mostrar "Success" o similar)

### Paso 4: Verificar que la tabla se creó
Opcionalmente, puedes verificar que la tabla se creó ejecutando:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';
```

Debería mostrar `users` en los resultados.

### Paso 5: Crear el Usuario Camilo Alegria
Una vez que la tabla esté creada, regresa a la terminal y ejecuta:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "camiloalegriabarra@gmail.com",
    "username": "camiloalegria",
    "password": "Antonito26$",
    "firstName": "Camilo",
    "lastName": "Alegria"
  }'
```

### Paso 6: Verificar el Usuario
Si el registro es exitoso, deberías recibir una respuesta como:

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "camiloalegriabarra@gmail.com",
    "username": "camiloalegria",
    "firstName": "Camilo",
    "lastName": "Alegria",
    "role": "user"
  },
  "token": "1"
}
```

### Paso 7: Probar Login
Para probar que el usuario funciona correctamente:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "camiloalegriabarra@gmail.com",
    "password": "Antonito26$"
  }'
```

## Archivos Útiles

- **SQL Completo**: `scripts/create-users-complete.sql`
- **Script Automático**: `scripts/auto-create-users.js`
- **Verificación**: `node scripts/auto-create-users.js`

## Troubleshooting

### Si el SQL no ejecuta:
1. Asegúrate de tener permisos de administrador en el proyecto Supabase
2. Verifica que estés en el proyecto correcto: `zolffzfbxkgiozfbbjnm`
3. Intenta ejecutar el SQL por partes (primero el CREATE TABLE, luego los índices, etc.)

### Si el registro falla:
1. Verifica que el servidor esté corriendo: `npm start`
2. Asegúrate de que la tabla users existe ejecutando el script de verificación
3. Revisa el log del servidor para ver errores detallados

### Si hay errores de permisos:
1. Verifica que las políticas RLS se crearon correctamente
2. Ejecuta el SQL completo de nuevo para asegurar que todas las políticas estén creadas

## Resumen

1. **Ejecutar SQL en Supabase Dashboard** ✅
2. **Verificar tabla creada** ✅  
3. **Crear usuario Camilo Alegria** ✅
4. **Probar login** ✅

Una vez completados estos pasos, el usuario "Camilo Alegria" estará disponible para usar en la aplicación Editor PDF.