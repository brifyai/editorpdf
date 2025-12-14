# Guía de Preparación para Producción

## Introducción

Esta guía proporciona los pasos necesarios para preparar la aplicación para un entorno de producción, asegurando estabilidad, seguridad y rendimiento óptimo.

## Requisitos Previos

### 1. Infraestructura
- Servidor con Node.js 18+ instalado
- Base de datos Supabase configurada
- Almacenamiento para archivos (Supabase Storage o S3)
- Dominio configurado con SSL/TLS

### 2. Variables de Entorno
Crear archivo `.env.production` con:
```bash
# Base de datos
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# APIs de IA
GROQ_API_KEY=tu_groq_api_key
CHUTES_API_KEY=tu_chutes_api_key

# Servidor
PORT=8080
NODE_ENV=production

# JWT
JWT_SECRET=tu_jwt_secreto_muy_seguro
JWT_EXPIRES_IN=7d

# Almacenamiento
STORAGE_TYPE=supabase  # o s3
AWS_ACCESS_KEY_ID=tu_access_key  # solo si storage_type=s3
AWS_SECRET_ACCESS_KEY=tu_secret_key  # solo si storage_type=s3
AWS_REGION=us-east-1  # solo si storage_type=s3
AWS_S3_BUCKET=tu_bucket  # solo si storage_type=s3
```

## Configuración de Producción

### 1. Optimización del Servidor

#### Configuración de PM2
Instalar PM2 globalmente:
```bash
npm install -g pm2
```

Crear archivo `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'app-pdf-processor',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### Configuración de Nginx
Ejemplo de configuración para Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
    }
    
    # Configuración para archivos estáticos
    location /static/ {
        alias /path/to/frontend-react/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Configuración de Base de Datos

#### Optimización de Supabase
1. **Habilitar Row Level Security (RLS)**
   ```sql
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
   ```

2. **Crear Políticas de Seguridad**
   ```sql
   -- Política para documentos
   CREATE POLICY "Users can view own documents" ON documents
     FOR SELECT USING (auth.uid()::text = user_id);
   
   CREATE POLICY "Users can insert own documents" ON documents
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);
   
   CREATE POLICY "Users can update own documents" ON documents
     FOR UPDATE USING (auth.uid()::text = user_id);
   
   CREATE POLICY "Users can delete own documents" ON documents
     FOR DELETE USING (auth.uid()::text = user_id);
   ```

3. **Crear Índices Recomendados**
   ```sql
   -- Índices para documentos
   CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
   CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
   CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
   
   -- Índices para análisis
   CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON analyses(document_id);
   CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
   
   -- Índices para trabajos batch
   CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_id ON batch_jobs(user_id);
   CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
   CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON batch_jobs(created_at);
   ```

### 3. Configuración de Frontend

#### Build de Producción
```bash
cd frontend-react
npm run build
```

#### Variables de Entorno para Frontend
Crear `.env.production`:
```bash
VITE_API_URL=https://tu-dominio.com/api
VITE_APP_TITLE=App PDF Processor
VITE_APP_VERSION=1.0.0
```

### 4. Configuración de Seguridad

#### Headers de Seguridad
Agregar middleware para headers de seguridad:
```javascript
// En server.js
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
```

#### Rate Limiting
Configurar rate limiting para producción:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde'
  }
});

app.use('/api/', limiter);
```

### 5. Monitoreo y Logging

#### Configuración de Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'app-pdf-processor' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

#### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'connected', // Verificar conexión real
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
  
  res.json(healthCheck);
});
```

## Despliegue

### 1. Script de Despliegue
Crear `deploy.sh`:
```bash
#!/bin/bash

echo "Iniciando despliegue..."

# Detener aplicación actual
pm2 stop app-pdf-processor

# Actualizar código
git pull origin main

# Instalar dependencias
npm install --production

# Build de frontend
cd frontend-react
npm install
npm run build
cd ..

# Migraciones de base de datos
# Ejecutar scripts de migración si es necesario

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar estado de PM2
pm2 save

# Verificar estado
pm2 status

echo "Despliegue completado!"
```

### 2. Comandos Útiles de PM2
```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs app-pdf-processor

# Reiniciar aplicación
pm2 restart app-pdf-processor

# Actualizar aplicación
pm2 reload app-pdf-processor

# Monitorear
pm2 monit
```

## Monitoreo Post-Despliegue

### 1. Métricas a Monitorear
- Uso de CPU y memoria
- Tiempos de respuesta de API
- Tasa de errores
- Conexiones a base de datos
- Espacio en disco

### 2. Alertas Recomendadas
- Alta tasa de errores (> 5%)
- Uso de CPU (> 80%)
- Uso de memoria (> 90%)
- Espacio en disco bajo (< 20%)
- Base de datos no disponible

### 3. Herramientas de Monitoreo
- **PM2**: Para monitoreo de procesos
- **Supabase Dashboard**: Para métricas de base de datos
- **New Relic/DataDog**: Para monitoreo avanzado (opcional)
- **Grafana**: Para visualización de métricas (opcional)

## Mantenimiento

### 1. Actualizaciones
- Mantener Node.js y dependencias actualizadas
- Aplicar parches de seguridad regularmente
- Actualizar frontend y backend de forma coordinada

### 2. Backups
- Configurar backups automáticos de base de datos
- Respaldar archivos de configuración
- Probar restauración de backups periódicamente

### 3. Escalado
- Monitorear métricas de rendimiento
- Aumentar instancias según carga
- Considerar balanceo de carga si es necesario

## Solución de Problemas Comunes

### 1. Problemas de Memoria
```bash
# Ver uso de memoria
pm2 monit

# Aumentar memoria límite en ecosystem.config.js
max_memory_restart: '1G'
```

### 2. Problemas de Conexión a Base de Datos
- Verificar cadenas de conexión
- Revisar límites de conexiones en Supabase
- Implementar reintentos con exponential backoff

### 3. Problemas de Rendimiento
- Habilitar compresión gzip
- Optimizar consultas a base de datos
- Implementar caché adicional si es necesario

## Conclusión

Esta guía proporciona los pasos esenciales para preparar y desplegar la aplicación en un entorno de producción. Es importante adaptar estas configuraciones según las necesidades específicas de tu infraestructura y requisitos de negocio.

El monitoreo continuo y el mantenimiento regular son clave para asegurar la estabilidad y rendimiento de la aplicación en producción.