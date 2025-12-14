const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { setUserContext, getSupabaseClient } = require('../utils/database');
const { optionalAuth, authenticate } = require('../middleware/auth');
const {
  optimizePaginatedQuery,
  optimizeFilteredQuery,
  optimizeRelationQuery,
  optimizeCountQuery
} = require('../utils/queryOptimizer');
const {
  invalidateCache,
  CACHE_TYPES
} = require('../utils/cache');

// Configuración de multer para manejar múltiples archivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite por archivo
    files: 100 // Máximo 100 archivos
  }
});

// Middleware para establecer contexto de usuario
const setUserContextMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await setUserContext(req.user.id);
    }
    next();
  } catch (error) {
    console.error('Error setting user context:', error);
    next();
  }
};

// Endpoint de prueba sin autenticación para diagnóstico
router.get('/test', async (req, res) => {
  try {
    console.log('Endpoint /api/batch-jobs/test llamado');
    
    // Probar conexión básica a la base de datos
    const { data, error } = await getSupabaseClient()
      .from('batch_jobs')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error de conexión a la base de datos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error de conexión a la base de datos',
        details: error.message
      });
    }
    
    console.log('Conexión a la base de datos exitosa');
    
    res.json({
      success: true,
      message: 'Endpoint de prueba funcionando correctamente',
      timestamp: new Date().toISOString(),
      count: data
    });
  } catch (error) {
    console.error('Error en endpoint de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Endpoint temporal sin autenticación para diagnóstico
router.get('/debug', async (req, res) => {
  try {
    console.log('Endpoint /api/batch-jobs/debug llamado');
    
    // Probar consulta básica a la tabla batch_jobs
    const { data, error } = await getSupabaseClient()
      .from('batch_jobs')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error consultando batch_jobs:', error);
      return res.status(500).json({
        success: false,
        error: 'Error consultando tabla batch_jobs',
        details: error.message
      });
    }
    
    console.log('Consulta a batch_jobs exitosa, count:', data);
    
    // Probar consulta con datos
    const { data: jobs, error: jobsError } = await getSupabaseClient()
      .from('batch_jobs')
      .select('*')
      .limit(5);
    
    if (jobsError) {
      console.error('Error obteniendo trabajos:', jobsError);
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo trabajos',
        details: jobsError.message
      });
    }
    
    console.log('Trabajos obtenidos:', jobs?.length || 0);
    
    res.json({
      success: true,
      message: 'Endpoint debug funcionando correctamente',
      count: data,
      jobs: jobs || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en endpoint debug:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Obtener todos los trabajos batch del usuario
router.get('/', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      priority,
      limit = 50,
      offset = 0,
      page = 1,
      dateFrom,
      dateTo,
      search
    } = req.query;
    
    // Construir query base con optimización de relaciones
    let query = getSupabaseClient()
      .from('batch_jobs')
      .select(`
        *,
        batch_job_files (
          id,
          file_name,
          file_type,
          file_size,
          processing_status,
          error_message,
          created_at,
          completed_at
        )
      `)
      .eq('user_int_id', userId);
    
    // Aplicar filtros optimizados
    const filters = { status, priority, dateFrom, dateTo };
    query = optimizeFilteredQuery(query, filters);
    
    // Aplicar búsqueda de texto si se proporciona
    if (search) {
      query = query.or(`job_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Aplicar paginación optimizada
    query = optimizePaginatedQuery(query, {
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy: 'created_at',
      ascending: false
    });
    
    const { data: jobs, error, count } = await query;
    
    if (error) {
      console.error('Error fetching batch jobs:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener trabajos batch'
      });
    }
    
    // Obtener conteo total con consulta optimizada
    const totalCount = await optimizeCountQuery(getSupabaseClient(), 'batch_jobs', {
      user_int_id: userId,
      ...filters
    });
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/batch-jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener un trabajo batch específico
router.get('/:id', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    
    const { data: job, error } = await getSupabaseClient()
      .from('batch_jobs')
      .select(`
        *,
        batch_job_files (
          id,
          file_name,
          file_type,
          file_size,
          processing_status,
          error_message,
          created_at,
          completed_at
        )
      `)
      .eq('id', jobId)
      .eq('user_int_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching batch job:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener trabajo batch'
      });
    }
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Trabajo batch no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: job
    });
    
  } catch (error) {
    console.error('Error in GET /api/batch-jobs/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Crear un nuevo trabajo batch
router.post('/', authenticate, setUserContextMiddleware, upload.array('files'), async (req, res) => {
  // Invalidar caché de trabajos batch y métricas
  invalidateCache(CACHE_TYPES.BATCH_JOBS);
  invalidateCache(CACHE_TYPES.METRICS);
  try {
    const userId = req.user.id;
    const { 
      jobName, 
      description, 
      config = {}, 
      priority = 'medium',
      outputFormat = 'pdf' 
    } = req.body;
    
    if (!jobName || !req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nombre del trabajo y archivos son requeridos'
      });
    }
    
    // Parsear la configuración si viene como string
    const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
    
    // Crear el trabajo batch
    const { data: job, error: jobError } = await getSupabaseClient()
      .from('batch_jobs')
      .insert({
        user_int_id: userId,
        job_name: jobName,
        description: description || '',
        job_config: parsedConfig,
        priority,
        output_format: outputFormat,
        job_status: 'pending',
        total_files: req.files.length,
        processed_files: 0,
        failed_files: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (jobError) {
      console.error('Error creating batch job:', jobError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear trabajo batch'
      });
    }
    
    // Crear registros para cada archivo
    const fileRecords = req.files.map((file, index) => ({
      job_id: job.id,
      file_name: file.originalname,
      file_type: path.extname(file.originalname).substring(1),
      file_size: file.size,
      file_order: index + 1,
      processing_status: 'pending',
      created_at: new Date().toISOString()
    }));
    
    const { data: jobFiles, error: filesError } = await getSupabaseClient()
      .from('batch_job_files')
      .insert(fileRecords)
      .select();
    
    if (filesError) {
      console.error('Error creating batch job files:', filesError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear registros de archivos'
      });
    }
    
    // Iniciar procesamiento asíncrono
    processBatchJobAsync(job.id, req.files, parsedConfig);
    
    res.status(201).json({
      success: true,
      data: {
        ...job,
        batch_job_files: jobFiles
      },
      message: 'Trabajo batch creado exitosamente'
    });
    
  } catch (error) {
    console.error('Error in POST /api/batch-jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Actualizar un trabajo batch
router.put('/:id', authenticate, setUserContextMiddleware, async (req, res) => {
  // Invalidar caché de trabajos batch y métricas
  invalidateCache(CACHE_TYPES.BATCH_JOBS);
  invalidateCache(CACHE_TYPES.METRICS);
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    const { jobName, description, config, priority, outputFormat } = req.body;
    
    // Verificar que el trabajo exista y pertenezca al usuario
    const { data: existingJob, error: checkError } = await getSupabaseClient()
      .from('batch_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_int_id', userId)
      .single();
    
    if (checkError || !existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Trabajo batch no encontrado'
      });
    }
    
    // Solo permitir actualizar trabajos en estado 'pending' o 'paused'
    if (!['pending', 'paused'].includes(existingJob.job_status)) {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden actualizar trabajos en estado pendiente o pausado'
      });
    }
    
    // Preparar datos de actualización
    const updateData = {};
    if (jobName) updateData.job_name = jobName;
    if (description !== undefined) updateData.description = description;
    if (config) updateData.job_config = typeof config === 'string' ? JSON.parse(config) : config;
    if (priority) updateData.priority = priority;
    if (outputFormat) updateData.output_format = outputFormat;
    
    const { data: updatedJob, error: updateError } = await getSupabaseClient()
      .from('batch_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating batch job:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar trabajo batch'
      });
    }
    
    res.json({
      success: true,
      data: updatedJob,
      message: 'Trabajo batch actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error in PUT /api/batch-jobs/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Pausar o reanudar un trabajo batch
router.patch('/:id/toggle', authenticate, setUserContextMiddleware, async (req, res) => {
  // Invalidar caché de trabajos batch y métricas
  invalidateCache(CACHE_TYPES.BATCH_JOBS);
  invalidateCache(CACHE_TYPES.METRICS);
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    
    // Verificar que el trabajo exista y pertenezca al usuario
    const { data: existingJob, error: checkError } = await getSupabaseClient()
      .from('batch_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_int_id', userId)
      .single();
    
    if (checkError || !existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Trabajo batch no encontrado'
      });
    }
    
    // Determinar nuevo estado
    let newStatus;
    if (existingJob.job_status === 'running') {
      newStatus = 'paused';
    } else if (existingJob.job_status === 'paused') {
      newStatus = 'running';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden pausar o reanudar trabajos en ejecución o pausados'
      });
    }
    
    const { data: updatedJob, error: updateError } = await getSupabaseClient()
      .from('batch_jobs')
      .update({ job_status: newStatus })
      .eq('id', jobId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error toggling batch job:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error al cambiar estado del trabajo batch'
      });
    }
    
    res.json({
      success: true,
      data: updatedJob,
      message: `Trabajo batch ${newStatus === 'paused' ? 'pausado' : 'reanudado'} exitosamente`
    });
    
  } catch (error) {
    console.error('Error in PATCH /api/batch-jobs/:id/toggle:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Cancelar un trabajo batch
router.delete('/:id', authenticate, setUserContextMiddleware, async (req, res) => {
  // Invalidar caché de trabajos batch y métricas
  invalidateCache(CACHE_TYPES.BATCH_JOBS);
  invalidateCache(CACHE_TYPES.METRICS);
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    
    // Verificar que el trabajo exista y pertenezca al usuario
    const { data: existingJob, error: checkError } = await getSupabaseClient()
      .from('batch_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_int_id', userId)
      .single();
    
    if (checkError || !existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Trabajo batch no encontrado'
      });
    }
    
    // Solo permitir cancelar trabajos que no estén completados
    if (existingJob.job_status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'No se puede cancelar un trabajo ya completado'
      });
    }
    
    // Actualizar estado a cancelado
    const { data: updatedJob, error: updateError } = await getSupabaseClient()
      .from('batch_jobs')
      .update({
        job_status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error cancelling batch job:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error al cancelar trabajo batch'
      });
    }
    
    res.json({
      success: true,
      data: updatedJob,
      message: 'Trabajo batch cancelado exitosamente'
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/batch-jobs/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener estadísticas de trabajos batch
router.get('/stats/summary', authenticate, setUserContextMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Consulta optimizada para obtener estadísticas
    const { data: stats, error } = await getSupabaseClient()
      .from('batch_jobs')
      .select(`
        job_status,
        count,
        total_files,
        processed_files,
        failed_files
      `)
      .eq('user_int_id', userId)
      .group('job_status, total_files, processed_files, failed_files');
    
    if (error) {
      console.error('Error fetching batch job stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de trabajos batch'
      });
    }
    
    // Calcular totales de manera optimizada
    const totalJobs = stats.reduce((sum, stat) => sum + (stat.count || 0), 0);
    const totalFiles = stats.reduce((sum, stat) => sum + (stat.total_files || 0), 0);
    const processedFiles = stats.reduce((sum, stat) => sum + (stat.processed_files || 0), 0);
    const failedFiles = stats.reduce((sum, stat) => sum + (stat.failed_files || 0), 0);
    
    // Formatear conteos por estado
    const statusSummary = {};
    stats.forEach(stat => {
      statusSummary[stat.job_status] = stat.count;
    });
    
    res.json({
      success: true,
      data: {
        totalJobs,
        totalFiles,
        processedFiles,
        failedFiles,
        successRate: totalFiles > 0 ? ((processedFiles - failedFiles) / totalFiles * 100).toFixed(2) : 0,
        statusSummary
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/batch-jobs/stats/summary:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Función asíncrona para procesar trabajos batch (simulada)
async function processBatchJobAsync(jobId, files, config) {
  try {
    // Actualizar estado a procesando
    await getSupabaseClient()
      .from('batch_jobs')
      .update({ job_status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId);
    
    // Obtener archivos del trabajo
    const { data: jobFiles, error: filesError } = await getSupabaseClient()
      .from('batch_job_files')
      .select('*')
      .eq('job_id', jobId)
      .order('file_order', { ascending: true });
    
    if (filesError) {
      throw new Error('Error al obtener archivos del trabajo');
    }
    
    let processedCount = 0;
    let failedCount = 0;
    
    // Procesar cada archivo
    for (const file of jobFiles) {
      try {
        // Actualizar estado del archivo a procesando
        await getSupabaseClient()
          .from('batch_job_files')
          .update({ processing_status: 'processing' })
          .eq('id', file.id);
        
        // Simular procesamiento del archivo
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simular éxito o fallo aleatorio (90% éxito)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          // Actualizar estado del archivo a completado
          await getSupabaseClient()
            .from('batch_job_files')
            .update({
              processing_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', file.id);
          
          processedCount++;
        } else {
          // Actualizar estado del archivo a fallido
          await getSupabaseClient()
            .from('batch_job_files')
            .update({
              processing_status: 'failed',
              error_message: 'Error simulado durante el procesamiento',
              completed_at: new Date().toISOString()
            })
            .eq('id', file.id);
          
          failedCount++;
        }
        
        // Actualizar contador del trabajo
        await getSupabaseClient()
          .from('batch_jobs')
          .update({
            processed_files: processedCount,
            failed_files: failedCount
          })
          .eq('id', jobId);
        
      } catch (fileError) {
        console.error(`Error processing file ${file.id}:`, fileError);
        
        // Actualizar estado del archivo a fallido
        await getSupabaseClient()
          .from('batch_job_files')
          .update({
            processing_status: 'failed',
            error_message: fileError.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', file.id);
        
        failedCount++;
        
        // Actualizar contador del trabajo
        await getSupabaseClient()
          .from('batch_jobs')
          .update({
            processed_files: processedCount,
            failed_files: failedCount
          })
          .eq('id', jobId);
      }
    }
    
    // Determinar estado final del trabajo
    const finalStatus = failedCount === jobFiles.length ? 'failed' : 'completed';
    
    // Actualizar estado final del trabajo
    await getSupabaseClient()
      .from('batch_jobs')
      .update({
        job_status: finalStatus,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    console.log(`Batch job ${jobId} completed with status: ${finalStatus}`);
    
  } catch (error) {
    console.error('Error processing batch job:', error);
    
    // Actualizar estado del trabajo a fallido
    await getSupabaseClient()
      .from('batch_jobs')
      .update({
        job_status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

module.exports = router;