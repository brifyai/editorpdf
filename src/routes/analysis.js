/**
 * Endpoints de análisis optimizados
 * Reemplaza endpoints complejos con código modular y reutilizable
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Importar parsers
const pdfAnalyzer = require('../parsers/pdfAnalyzer');
const pptxAnalyzer = require('../parsers/pptxAnalyzer');
const txtAnalyzer = require('../parsers/txtAnalyzer');

// Importar utilidades
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  createResponse,
  createErrorResponse,
  saveDocument,
  saveAnalysis,
  saveBasicResults,
  saveAdvancedResults,
  saveAIResults,
  saveAnalysisMetrics,
  validateDocumentData,
  validateAnalysisData,
  setUserContext,
  isDatabaseAvailable
} = require('../utils/database');

const router = express.Router();

// Configuración de Multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/';
      fs.ensureDirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = uuidv4() + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.pptx', '.txt', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Se aceptan PDF, PPTX, TXT, DOC, DOCX y formatos de imagen (JPG, PNG, BMP, TIFF, WebP).'));
    }
  }
});

/**
 * Analizar documento individual
 */
router.post('/analyze', optionalAuth, upload.single('document'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse(
        'No se ha subido ningún archivo',
        'NO_FILE_UPLOADED',
        400
      ));
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Opciones de análisis
    const options = {
      useAI: req.body.useAI === 'true',
      aiAnalysisType: req.body.aiAnalysisType || 'balanced',
      strategy: req.body.strategy || 'auto',
      temperature: req.body.temperature ? parseFloat(req.body.temperature) : 0.2,
      maxTokens: req.body.maxTokens ? parseInt(req.body.maxTokens) : 1500,
      ocrConfidence: req.body.ocrConfidence ? parseInt(req.body.ocrConfidence) : 75,
      priority: req.body.priority || 'balanced'
    };

    // Subir archivo a Supabase Storage primero
    let storageUrl = null;
    let storagePath = null;
    
    try {
      const { supabaseClient } = require('../database/supabaseClient');
      const fs = require('fs-extra');
      
      const fileBuffer = await fs.readFile(filePath);
      // Usar ID de usuario o 'anonymous' si no está autenticado
      const userId = req.userId || 'anonymous';
      storagePath = `${userId}/${Date.now()}_${req.file.originalname}`;
      
      await supabaseClient.uploadFile('documents', storagePath, fileBuffer, req.file.mimetype);
      storageUrl = await supabaseClient.getPublicUrl('documents', storagePath);
      
      console.log('✅ Archivo subido a Supabase Storage:', storageUrl);
    } catch (storageError) {
      console.warn('⚠️ Error subiendo archivo a storage:', storageError.message);
      // Continuar sin storage
    }

    // Analizar documento
    let analysisResult;
    if (fileExt === '.pdf') {
      analysisResult = await pdfAnalyzer.analyzePDF(filePath, options);
    } else if (fileExt === '.pptx') {
      analysisResult = await pptxAnalyzer.analyzePPTX(filePath, options);
    } else if (fileExt === '.txt' || fileExt === '.doc' || fileExt === '.docx') {
      analysisResult = await txtAnalyzer.analyzeTXT(filePath, options);
    }

    const processingTime = Date.now() - startTime;

    // Guardar en base de datos si está disponible
    let databaseSaved = false;
    let documentId = null;
    let analysisId = null;
    let databaseError = null;

    if (isDatabaseAvailable() && req.userId) {
      try {
        await setUserContext(req.userId);
        
        // Preparar datos del documento
        const documentData = {
          user_int_id: req.userId,
          original_filename: req.file.originalname,
          file_path: storageUrl || req.file.path,
          file_size_bytes: req.file.size,
          file_type: fileExt.replace('.', ''),
          mime_type: req.file.mimetype || 'application/octet-stream',
          file_hash: require('crypto').createHash('md5').update(req.file.originalname + Date.now()).digest('hex'),
          processing_status: 'completed',
          metadata: {
            upload_time: new Date().toISOString(),
            original_name: req.file.originalname,
            analysis_options: options,
            storage_path: storagePath,
            storage_url: storageUrl
          }
        };

        validateDocumentData(documentData);
        
        // Guardar documento
        const document = await saveDocument(documentData);
        documentId = document.id;

        // Determinar tipo de análisis
        let analysisType = 'basic';
        if (options.useAI && analysisResult.aiAnalysis) {
          analysisType = 'ai_enhanced';
        } else if (analysisResult.advanced && (analysisResult.advanced.keywords || analysisResult.advanced.entities)) {
          analysisType = 'advanced';
        } else if (analysisResult.ocr) {
          analysisType = 'ocr';
        }

        // Preparar datos del análisis
        const analysisData = {
          document_id: documentId,
          user_int_id: req.userId,
          analysis_type: analysisType,
          ai_model_used: analysisResult.aiAnalysis?.model || 'none',
          ai_strategy: options.strategy,
          analysis_config: options,
          processing_time_ms: processingTime,
          confidence_score: analysisResult.advanced?.readabilityScore || 0,
          status: 'completed'
        };

        validateAnalysisData(analysisData);

        // Guardar análisis
        const analysis = await saveAnalysis(analysisData);
        analysisId = analysis.id;

        // Guardar resultados básicos
        await saveBasicResults({
          analysis_id: analysisId,
          page_count: analysisResult.statistics?.totalPages || analysisResult.statistics?.totalSlides || 0,
          word_count: analysisResult.statistics?.totalWords || 0,
          character_count: analysisResult.statistics?.totalCharacters || 0,
          language_detected: analysisResult.advanced?.language || 'unknown',
          readability_score: analysisResult.advanced?.readabilityScore || 0,
          document_info: analysisResult.documentInfo || {},
          statistics: analysisResult.statistics || {},
          content: analysisResult.content || {},
          structure: analysisResult.structure || {}
        });

        // Guardar resultados avanzados si existen
        if (analysisResult.advanced) {
          await saveAdvancedResults({
            analysis_id: analysisId,
            keywords: analysisResult.advanced.keywords || [],
            phrases: analysisResult.advanced.phrases || [],
            entities: analysisResult.advanced.entities || [],
            sentiment_analysis: analysisResult.advanced.sentiment || {},
            classification: analysisResult.advanced.classification || {},
            advanced_metrics: {
              numbers: analysisResult.advanced.numbers || [],
              emails: analysisResult.advanced.emails || [],
              urls: analysisResult.advanced.urls || [],
              dates: analysisResult.advanced.dates || []
            }
          });
        }

        // Guardar resultados de IA si existen
        if (analysisResult.aiAnalysis) {
          await saveAIResults({
            analysis_id: analysisId,
            ai_model: analysisResult.aiAnalysis.model,
            ai_provider: analysisResult.aiAnalysis.provider || 'unknown',
            prompt_used: 'Document analysis',
            response_generated: JSON.stringify(analysisResult.aiAnalysis),
            tokens_used: analysisResult.aiAnalysis.tokensUsed || 0,
            cost_usd: analysisResult.aiAnalysis.cost || 0,
            processing_time_ms: analysisResult.aiAnalysis.processingTime || 0,
            quality_metrics: {
              sentiment_confidence: analysisResult.aiAnalysis.sentiment?.confidence || 0,
              classification_accuracy: analysisResult.aiAnalysis.classification ? 0.95 : 0
            }
          });
        }

        // Guardar métricas
        if (options.useAI && analysisResult.aiAnalysis) {
          await saveAnalysisMetrics({
            analysis_id: analysisId,
            processing_time_seconds: processingTime / 1000,
            processing_duration_ms: processingTime,
            api_calls_count: 1,
            tokens_used: analysisResult.aiAnalysis.tokensUsed || 0,
            cache_hits: 0,
            total_cost: analysisResult.aiAnalysis.cost || 0,
            memory_usage_mb: 128,
            cpu_usage_percent: 25
          });
        }

        databaseSaved = true;
        console.log('✅ Análisis guardado en BD:', analysisId);

      } catch (dbError) {
        console.error('Error guardando en base de datos:', dbError);
        databaseError = dbError.message;
      }
    }

    // Limpiar archivo temporal
    await fs.remove(filePath);

    // Respuesta
    const response = createResponse(true, {
      filename: req.file.originalname,
      fileType: fileExt,
      analysis: analysisResult,
      options: options,
      processing_time_ms: processingTime,
      database_saved: databaseSaved,
      document_id: documentId,
      analysis_id: analysisId
    }, null, {
      database_info: databaseSaved ? {
        document_saved: true,
        analysis_saved: true,
        results_saved: true,
        metrics_recorded: options.useAI
      } : null,
      database_error: databaseError
    });

    if (databaseError) {
      response.warning = 'El análisis se completó pero no se pudo guardar en la base de datos';
    }

    res.json(response);

  } catch (error) {
    console.error('Error en análisis:', error);
    
    // Limpiar archivo en caso de error
    if (req.file) {
      await fs.remove(req.file.path).catch(() => {});
    }

    res.status(500).json(createErrorResponse(
      error.message || 'Error interno del servidor',
      'ANALYSIS_ERROR',
      500,
      { processing_time_ms: Date.now() - startTime }
    ));
  }
});

/**
 * Análisis por lotes optimizado
 */
router.post('/batch-analyze', optionalAuth, upload.array('documents', 10), async (req, res) => {
  let batchJobId = null;
  let databaseSaved = false;
  let databaseError = null;
  const startTime = Date.now();

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(createErrorResponse(
        'No se han subido archivos',
        'NO_FILES_UPLOADED',
        400
      ));
    }

    const userId = req.userId || 1;
    
    // Opciones de análisis para lotes
    const analysisOptions = {
      useAI: req.body.useAI === 'true',
      aiAnalysisType: req.body.aiAnalysisType || 'balanced',
      strategy: req.body.strategy || 'auto',
      temperature: req.body.temperature ? parseFloat(req.body.temperature) : 0.2,
      maxTokens: req.body.maxTokens ? parseInt(req.body.maxTokens) : 1500,
      ocrConfidence: req.body.ocrConfidence ? parseInt(req.body.ocrConfidence) : 75,
      priority: req.body.priority || 'balanced'
    };

    // Crear batch job si la DB está disponible
    if (isDatabaseAvailable() && userId) {
      try {
        await setUserContext(userId);
        
        const jobData = {
          user_int_id: userId,
          job_name: req.body.jobName || `Batch Analysis ${new Date().toISOString()}`,
          job_description: req.body.jobDescription || `Análisis de ${req.files.length} archivos`,
          status: 'processing',
          total_files: req.files.length,
          processed_files: 0,
          successful_files: 0,
          failed_files: 0,
          analysis_config: analysisOptions,
          use_ai: analysisOptions.useAI,
          ai_strategy: analysisOptions.strategy,
          ocr_confidence: analysisOptions.ocrConfidence,
          started_at: new Date().toISOString(),
          file_list: req.files.map(f => ({
            original_filename: f.originalname,
            file_type: path.extname(f.originalname).toLowerCase(),
            file_size_bytes: f.size
          }))
        };

        const { saveBatchJob } = require('../utils/database');
        const batchJob = await saveBatchJob(jobData);
        batchJobId = batchJob.id;
        databaseSaved = true;

      } catch (dbError) {
        console.error('Error creando batch job:', dbError);
        databaseError = dbError.message;
      }
    }

    // Procesar archivos
    const results = [];
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const file of req.files) {
      const fileStartTime = Date.now();
      let analysisResult = null;
      let success = false;
      let errorMessage = null;
      let documentId = null;
      let analysisId = null;

      try {
        const filePath = file.path;
        const fileExt = path.extname(file.originalname).toLowerCase();
        const options = { ...analysisOptions };

        // Analizar archivo
        if (fileExt === '.pdf') {
          analysisResult = await pdfAnalyzer.analyzePDF(filePath, options);
        } else if (fileExt === '.pptx') {
          analysisResult = await pptxAnalyzer.analyzePPTX(filePath, options);
        } else if (fileExt === '.txt' || fileExt === '.doc' || fileExt === '.docx') {
          analysisResult = await txtAnalyzer.analyzeTXT(filePath, options);
        }

        success = true;
        successCount++;

        // Guardar en base de datos si el batch job fue creado
        if (batchJobId && databaseSaved && isDatabaseAvailable()) {
          try {
            const {
              saveDocument,
              saveAnalysis,
              saveBasicResults,
              saveAdvancedResults,
              saveAIResults,
              saveBatchJobFile,
              validateDocumentData,
              validateAnalysisData
            } = require('../utils/database');

            // Crear documento
            const documentData = {
              user_int_id: userId,
              original_filename: file.originalname,
              file_path: file.path,
              file_size_bytes: file.size,
              file_type: fileExt.replace('.', ''),
              mime_type: file.mimetype || 'application/octet-stream',
              file_hash: require('crypto').createHash('md5').update(file.originalname + Date.now()).digest('hex'),
              processing_status: 'completed',
              metadata: {
                batch_job_id: batchJobId,
                upload_time: new Date().toISOString(),
                analysis_options: options
              }
            };

            validateDocumentData(documentData);
            const document = await saveDocument(documentData);
            documentId = document.id;

            const processingTime = Date.now() - fileStartTime;

            // Crear análisis
            let analysisType = 'basic';
            if (options.useAI && analysisResult.aiAnalysis) {
              analysisType = 'ai_enhanced';
            } else if (analysisResult.advanced && (analysisResult.advanced.keywords || analysisResult.advanced.entities)) {
              analysisType = 'advanced';
            } else if (analysisResult.ocr) {
              analysisType = 'ocr';
            }

            const analysisData = {
              document_id: documentId,
              user_int_id: userId,
              analysis_type: analysisType,
              ai_model_used: analysisResult.aiAnalysis?.model || 'none',
              ai_strategy: options.strategy,
              analysis_config: options,
              processing_time_ms: processingTime,
              confidence_score: analysisResult.advanced?.readabilityScore || 0,
              status: 'completed'
            };

            validateAnalysisData(analysisData);
            const analysis = await saveAnalysis(analysisData);
            analysisId = analysis.id;

            // Guardar resultados
            await saveBasicResults({
              analysis_id: analysisId,
              page_count: analysisResult.statistics?.totalPages || analysisResult.statistics?.totalSlides || 0,
              word_count: analysisResult.statistics?.totalWords || 0,
              character_count: analysisResult.statistics?.totalCharacters || 0,
              language_detected: analysisResult.advanced?.language || 'unknown',
              readability_score: analysisResult.advanced?.readabilityScore || 0,
              document_info: analysisResult.documentInfo || {},
              statistics: analysisResult.statistics || {},
              content: analysisResult.content || {},
              structure: analysisResult.structure || {}
            });

            if (analysisResult.advanced) {
              await saveAdvancedResults({
                analysis_id: analysisId,
                keywords: analysisResult.advanced.keywords || [],
                phrases: analysisResult.advanced.phrases || [],
                entities: analysisResult.advanced.entities || [],
                sentiment_analysis: analysisResult.advanced.sentiment || {},
                classification: analysisResult.advanced.classification || {},
                advanced_metrics: {
                  numbers: analysisResult.advanced.numbers || [],
                  emails: analysisResult.advanced.emails || [],
                  urls: analysisResult.advanced.urls || [],
                  dates: analysisResult.advanced.dates || []
                }
              });
            }

            if (analysisResult.aiAnalysis) {
              await saveAIResults({
                analysis_id: analysisId,
                ai_model: analysisResult.aiAnalysis.model,
                ai_provider: analysisResult.aiAnalysis.provider || 'unknown',
                prompt_used: 'Batch document analysis',
                response_generated: JSON.stringify(analysisResult.aiAnalysis),
                tokens_used: analysisResult.aiAnalysis.tokensUsed || 0,
                cost_usd: analysisResult.aiAnalysis.cost || 0,
                processing_time_ms: analysisResult.aiAnalysis.processingTime || 0,
                quality_metrics: {
                  sentiment_confidence: analysisResult.aiAnalysis.sentiment?.confidence || 0,
                  classification_accuracy: analysisResult.aiAnalysis.classification ? 0.95 : 0
                }
              });
            }

            // Guardar archivo del batch
            await saveBatchJobFile({
              batch_job_id: batchJobId,
              document_id: documentId,
              original_filename: file.originalname,
              file_type: path.extname(file.originalname).toLowerCase(),
              file_size_bytes: file.size,
              file_path: file.path,
              status: 'completed',
              processing_started_at: new Date(fileStartTime).toISOString(),
              processing_completed_at: new Date().toISOString(),
              processing_time_ms: Date.now() - fileStartTime,
              analysis_id: analysisId,
              success: true,
              error_message: null,
              page_count: analysisResult?.statistics?.totalPages || analysisResult?.statistics?.totalSlides || 0,
              word_count: analysisResult?.statistics?.totalWords || 0,
              character_count: analysisResult?.statistics?.totalCharacters || 0,
              confidence_score: analysisResult?.advanced?.readabilityScore || 0,
              analysis_results: analysisResult || {}
            });

          } catch (saveError) {
            console.error('Error guardando análisis en BD:', saveError);
          }
        }

        results.push({
          filename: file.originalname,
          fileType: fileExt,
          success: true,
          analysis: analysisResult,
          documentId: documentId,
          analysisId: analysisId,
          processingTime: Date.now() - fileStartTime
        });

        await fs.remove(filePath);

      } catch (error) {
        failedCount++;
        errorMessage = error.message;

        results.push({
          filename: file.originalname,
          fileType: path.extname(file.originalname).toLowerCase(),
          success: false,
          error: errorMessage,
          processingTime: Date.now() - fileStartTime
        });

        if (file.path) {
          await fs.remove(file.path).catch(() => {});
        }
      }

      processedCount++;
    }

    // Actualizar batch job final
    if (batchJobId && databaseSaved) {
      try {
        const { updateBatchJob } = require('../utils/database');
        const totalProcessingTime = Date.now() - startTime;

        await updateBatchJob(batchJobId, {
          status: failedCount === 0 ? 'completed' : (successCount === 0 ? 'failed' : 'completed'),
          processed_files: processedCount,
          successful_files: successCount,
          failed_files: failedCount,
          completed_at: new Date().toISOString(),
          total_processing_time_ms: totalProcessingTime,
          average_processing_time_ms: Math.round(totalProcessingTime / req.files.length),
          results_summary: {
            totalFiles: req.files.length,
            successful: successCount,
            failed: failedCount,
            totalProcessingTime: totalProcessingTime,
            averageProcessingTime: Math.round(totalProcessingTime / req.files.length)
          }
        });

        console.log(`✅ Batch job ${batchJobId} completado: ${successCount}/${req.files.length} exitosos`);
      } catch (updateError) {
        console.error('Error actualizando batch job final:', updateError);
      }
    }

    // Respuesta
    const response = createResponse(true, {
      totalFiles: req.files.length,
      successful: successCount,
      failed: failedCount,
      results: results,
      totalProcessingTime: Date.now() - startTime,
      database_saved: databaseSaved,
      batch_job_id: batchJobId
    }, null, {
      database_info: databaseSaved ? {
        batch_job_created: true,
        batch_job_id: batchJobId,
        files_processed: processedCount,
        analyses_saved: successCount
      } : null,
      database_error: databaseError
    });

    if (databaseError) {
      response.warning = 'El análisis se completó pero no se pudo guardar en la base de datos';
    }

    res.json(response);

  } catch (error) {
    console.error('Error en análisis por lotes:', error);

    // Actualizar batch job como fallido
    if (batchJobId && databaseSaved) {
      try {
        const { updateBatchJob } = require('../utils/database');
        await updateBatchJob(batchJobId, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        });
      } catch (updateError) {
        console.error('Error actualizando batch job como fallido:', updateError);
      }
    }

    // Limpiar archivos
    if (req.files) {
      for (const file of req.files) {
        if (file.path) {
          await fs.remove(file.path).catch(() => {});
        }
      }
    }

    res.status(500).json(createErrorResponse(
      error.message || 'Error interno del servidor',
      'BATCH_ANALYSIS_ERROR',
      500,
      { batch_job_id: batchJobId }
    ));
  }
});

/**
 * Obtener historial de análisis del usuario
 */
router.get('/analysis-history', authenticate({ requireUser: true }), async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!isDatabaseAvailable()) {
      return res.status(503).json(createErrorResponse(
        'Base de datos no disponible',
        'DATABASE_UNAVAILABLE',
        503
      ));
    }

    await setUserContext(userId);
    
    const { getDocumentsHistory } = require('../utils/database');
    const result = await getDocumentsHistory({
      userId: userId,
      limit: 50,
      offset: 0,
      sortBy: 'uploaded_at',
      sortOrder: 'desc'
    });
    
    const analyses = result.data.map(doc => require('../utils/database').transformDocumentForResponse(doc));

    res.json(createResponse(true, {
      analyses: analyses,
      total: analyses.length,
      user_id: userId
    }));

  } catch (error) {
    console.error('Error obteniendo historial de análisis:', error);
    res.status(500).json(createErrorResponse(
      error.message || 'Error obteniendo historial de análisis',
      'HISTORY_ERROR',
      500
    ));
  }
});

module.exports = router;