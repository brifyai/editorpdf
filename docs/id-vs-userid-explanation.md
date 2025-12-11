# 📋 Diferencia entre `id` y `user_id` en la Base de Datos

## 🎯 Respuesta Rápida

**No, `id` y `user_id` no son lo mismo** en el esquema actual. El sistema tiene doble autenticación, lo que causa confusión.

---

## 🔍 Análisis Detallado

### Esquema Actual (Con Dualidad)

```sql
-- Tabla 1: users (login personalizado)
CREATE TABLE public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,  -- ← ID numérico (1, 2, 3...)
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    -- ... otros campos
);

-- Tabla 2: profiles (Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,  -- ← UUID de Supabase
    email TEXT UNIQUE NOT NULL,
    -- ... otros campos
);

-- Tabla con ambos sistemas
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,           -- ← ID del documento
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,    -- ← Referencia a profiles (UUID)
    user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE, -- ← Referencia a users (BIGINT)
    -- ... otros campos
);
```

### 📊 Tabla Comparativa

| Campo | Tipo | Tabla | Sistema | Uso Actual |
|-------|------|-------|---------|------------|
| `users.id` | BIGINT | users | Login personalizado | ✅ **Usado en servidor** |
| `profiles.id` | UUID | profiles | Supabase Auth | ❌ No usado |
| `documents.user_id` | UUID | documents | Supabase Auth | ❌ No usado |
| `documents.user_int_id` | BIGINT | documents | Login personalizado | ✅ **Usado en servidor** |

---

## 🚨 Problema Actual

### 1. **Doble Referencia**
Las tablas tienen ambos campos:
- `user_id` (UUID) → Para Supabase Auth
- `user_int_id` (BIGINT) → Para login personalizado

### 2. **Confusión en el Código**
```javascript
// ¿Cuál se usa?
const userId = req.user?.id;  // ← Este es BIGINT de users
const user_id = result.user_id; // ← Este sería UUID de profiles
```

### 3. **Complejidad Innecesaria**
- Dos sistemas de autenticación
- Políticas RLS duplicadas
- Consultas más complejas

---

## ✅ Solución: Esquema Simplificado

### Nuevo Esquema (Solo users)

```sql
-- Solo una tabla de usuarios
CREATE TABLE public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,  -- ← Único ID del usuario
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    -- ... otros campos
);

-- Tablas simplificadas
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,           -- ← ID del documento
    user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE, -- ← Única referencia
    -- ... otros campos
);
```

### Beneficios:
1. **Un solo `id` por usuario** (BIGINT)
2. **Sin confusión** entre `id` y `user_id`
3. **Código más simple**
4. **Mejor rendimiento**

---

## 🔄 En el Servidor Actual

### ✅ Lo que ya funciona bien:
```javascript
// server.js - Líneas 171, 200, 298
user_int_id: req.user?.id || 1  // ← Usa BIGINT correctamente

// Endpoints de autenticación - Líneas 2278-2545
// Ya implementados con tabla users
```

### ❌ Lo que causa confusión:
```javascript
// En algunas partes del código podría haber:
user_id: someValue  // ← Este campo ya no se usa
user_int_id: someValue  // ← Este es el correcto
```

---

## 📋 Recomendación

### **Opción 1: Migrar a Esquema Simplificado** (Recomendado)
- Eliminar `profiles` y `user_id` (UUID)
- Usar solo `users.id` (BIGINT) como `user_int_id`
- Simplificar todo el código

### **Opción 2: Mantener Actual pero Aclarar**
- Documentar claramente qué campo usar
- Usar siempre `user_int_id` en nuevo código
- Ignorar `user_id` y `profiles`

---

## 🎯 Conclusión

**En resumen:**
- ❌ `id` y `user_id` **no son lo mismo**
- ✅ El servidor ya usa `user_int_id` (BIGINT) correctamente  
- 🔄 Recomiendo migrar al esquema simplificado para eliminar confusión
- 📁 Ver archivos: `database/simplified-schema.sql` y `database/migration-guide.md`

**La respuesta corta: Usa siempre `user_int_id` que corresponde al `id` BIGINT de la tabla `users`.**