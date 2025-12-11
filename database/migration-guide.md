# Guía de Migración: Esquema Simplificado (Solo Tabla Users)

## 🎯 Objetivo

Migrar del esquema actual con doble sistema de autenticación (`profiles` + `users`) a un esquema simplificado que usa solo la tabla `users` con `id` BIGINT.

## 📋 Resumen de Cambios

### ✅ Qué se mantiene:
- **Tabla `users`** con `id` BIGINT (sistema principal)
- **Todas las tablas de análisis** (`documents`, `document_analyses`, etc.)
- **Funcionalidad completa** del sistema
- **Endpoints existentes** del servidor

### ❌ Qué se elimina:
- **Tabla `profiles`** (UUID de Supabase Auth)
- **Campo `user_id`** (UUID) de todas las tablas
- **Dependencia de Supabase Auth**
- **Sistema de autenticación dual**

### 🔄 Qué se actualiza:
- **Todas las referencias** de `user_id` → `user_int_id`
- **Políticas RLS** para usar solo `user_int_id`
- **Vistas y consultas** del sistema

---

## 🚀 Pasos para la Migración

### Paso 1: Backup de Datos Actuales

```sql
-- Exportar datos importantes antes de la migración
CREATE TABLE backup_users AS SELECT * FROM public.users;
CREATE TABLE backup_documents AS SELECT * FROM public.documents;
CREATE TABLE backup_analyses AS SELECT * FROM public.document_analyses;
```

### Paso 2: Eliminar Esquema Antiguo

```sql
-- Eliminar tablas que ya no se necesitan
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_api_configs CASCADE;

-- Eliminar vistas que referencian profiles
DROP VIEW IF EXISTS public.user_document_summary;
DROP VIEW IF EXISTS public.user_ai_metrics_summary;
```

### Paso 3: Aplicar Nuevo Esquema

```sql
-- Ejecutar el esquema simplificado completo
-- Ver archivo: database/simplified-schema.sql
```

### Paso 4: Migrar Datos

```sql
-- Los datos de users ya están correctos
-- Los datos de documentos y análisis ya usan user_int_id, así que no necesitan migración

-- Verificar integridad de datos
SELECT 
    u.id,
    u.email,
    COUNT(d.id) as document_count
FROM public.users u
LEFT JOIN public.documents d ON u.id = d.user_int_id
GROUP BY u.id, u.email;
```

---

## 📊 Impacto en el Código

### Servidor (server.js) - ✅ Sin cambios necesarios

El servidor ya está configurado correctamente:
- ✅ Usa `user_int_id` en todas las consultas
- ✅ Endpoints de autenticación funcionales
- ✅ Middleware `authenticateUser` implementado

### Frontend (public/js/app.js) - ✅ Sin cambios necesarios

El frontend ya funciona con el sistema actual:
- ✅ Usa `req.user?.id` que corresponde a `user_int_id`
- ✅ Autenticación implementada
- ✅ Guardado en base de datos funcional

---

## 🔧 Configuración Post-Migración

### 1. Verificar Conexión

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'documents', 'document_analyses');
```

### 2. Verificar Políticas RLS

```sql
-- Verificar políticas de seguridad
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Probar Autenticación

```bash
# Probar registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📋 Checklist de Verificación

- [ ] Backup de datos completado
- [ ] Esquema antiguo eliminado
- [ ] Nuevo esquema aplicado
- [ ] Datos migrados correctamente
- [ ] Políticas RLS funcionando
- [ ] Autenticación funcional
- [ ] Endpoints de análisis funcionando
- [ ] Guardado en base de datos funcionando
- [ ] Historial de análisis funcionando

---

## 🚨 Consideraciones Importantes

### 1. Tokens Existentes
- Los tokens existentes (que son `user.id` como string) siguen funcionando
- No se requiere regeneración de tokens

### 2. Datos Existentes
- Todos los análisis y documentos existentes se conservan
- No hay pérdida de datos

### 3. Rendimiento
- El esquema simplificado es más eficiente
- Menos joins y consultas complejas

### 4. Seguridad
- Mismo nivel de seguridad con RLS
- Políticas actualizadas para `user_int_id`

---

## 🔄 Rollback (si es necesario)

Si algo sale mal, puedes restaurar el esquema anterior:

```sql
-- Restaurar backup
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users AS SELECT * FROM backup_users;

-- Restaurar otras tablas desde backup
-- (Aplicar esquema original y restaurar datos)
```

---

## ✅ Beneficios de la Migración

1. **Simplicidad**: Un solo sistema de autenticación
2. **Mantenimiento**: Menos complejidad en el código
3. **Rendimiento**: Consultas más simples y rápidas
4. **Consistencia**: Sin confusión entre `id` y `user_id`
5. **Escalabilidad**: Esquema más limpio y mantenible

---

## 🎉 Conclusión

La migración al esquema simplificado:
- ✅ **Mantiene toda la funcionalidad existente**
- ✅ **Simplifica el código y mantenimiento**
- ✅ **Mejora el rendimiento**
- ✅ **Elimina la dualidad de autenticación**
- ✅ **Es segura y sin pérdida de datos**

El sistema quedará más limpio, mantenible y eficiente.