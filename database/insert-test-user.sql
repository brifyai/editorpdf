-- Script para insertar usuario de prueba
-- Email: camiloalegriabarra@gmail.com
-- Password: password123

INSERT INTO public.users (
  email,
  password_hash,
  first_name,
  last_name,
  role,
  subscription_tier,
  api_usage_limit,
  monthly_api_count,
  storage_quota_mb,
  storage_used_mb,
  preferences,
  is_active,
  email_verified,
  created_at,
  updated_at,
  user_int_id
) VALUES (
  'camiloalegriabarra@gmail.com',
  'password123', -- En producción esto sería un hash
  'Camilo',
  'Alegría',
  'user',
  'free',
  100,
  0,
  100,
  0,
  '{}',
  true,
  false,
  NOW(),
  NOW(),
  1
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Verificar que el usuario se insertó correctamente
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  subscription_tier,
  is_active,
  created_at
FROM public.users 
WHERE email = 'camiloalegriabarra@gmail.com';