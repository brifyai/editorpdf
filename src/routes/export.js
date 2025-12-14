const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { setUserContext } = require('../utils/database');
const { supabaseClient } = require('../database/supabaseClient');
const { optionalAuth, authenticate } = require('../middleware/auth');
const {
  optimizePaginatedQuery,
  optimizeFilteredQuery,
  optimizeRelationQuery,
  optimizeCountQuery
} = require('../utils/queryOptimizer');

// Configuración de multer para manejar archivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB límite
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

// Exportar documento a PDF
router.post('/pdf', authenticate, setUserContextMiddleware, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId, options = {} } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'ID de documento es requerido'
      });
    }

    // Crear registro de exportación
    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('document_conversions')
      .insert({
        user_int_id: userId,
        document_id: documentId,
        conversion_type: 'pdf_editable',
        output_format: 'pdf',
        conversion_config: options,
        processing_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error creating export record:', exportError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear registro de exportación'
      });
    }

    // Simular procesamiento asíncrono
    processExportAsync(exportRecord.id, documentId, 'pdf', userId, options);

    res.json({
      success: true,
      data: {
        exportId: exportRecord.id,
        status: 'processing',
        message: 'Exportación a PDF iniciada'
      }
    });

  } catch (error) {
    console.error('Error in POST /api/export/pdf:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Exportar documento a DOCX
router.post('/docx', authenticate, setUserContextMiddleware, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId, options = {} } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'ID de documento es requerido'
      });
    }

    // Crear registro de exportación
    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('document_conversions')
      .insert({
        user_int_id: userId,
        document_id: documentId,
        conversion_type: 'docx',
        output_format: 'docx',
        conversion_config: options,
        processing_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error creating export record:', exportError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear registro de exportación'
      });
    }

    // Simular procesamiento asíncrono
    processExportAsync(exportRecord.id, documentId, 'docx', userId, options);

    res.json({
      success: true,
      data: {
        exportId: exportRecord.id,
        status: 'processing',
        message: 'Exportación a DOCX iniciada'
      }
    });

  } catch (error) {
    console.error('Error in POST /api/export/docx:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Exportar documento a TXT
router.post('/txt', authenticate, setUserContextMiddleware, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId, options = {} } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'ID de documento es requerido'
      });
    }

    // Crear registro de exportación
    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('document_conversions')
      .insert({
        user_int_id: userId,
        document_id: documentId,
        conversion_type: 'txt',
        output_format: 'txt',
        conversion_config: options,
        processing_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error creating export record:', exportError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear registro de exportación'
      });
    }

    // Simular procesamiento asíncrono
    processExportAsync(exportRecord.id, documentId, 'txt', userId, options);

    res.json({
      success: true,
      data: {
        exportId: exportRecord.id,
        status: 'processing',
        message: 'Exportación a TXT iniciada'
      }
    });

  } catch (error) {
    console.error('Error in POST /api/export/txt:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Verificar estado de exportación
router.get('/status/:id', optionalAuth, setUserContextMiddleware, async (req, res) => {
  try {
    const exportId = req.params.id;
    const userId = req.user?.id;

    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('document_conversions')
      .select('*')
      .eq('id', exportId)
      .single();

    if (exportError) {
      console.error('Error fetching export status:', exportError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estado de exportación'
      });
    }

    // Verificar que el usuario tenga acceso a esta exportación
    if (userId && exportRecord.user_int_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para acceder a esta exportación'
      });
    }

    res.json({
      success: true,
      data: {
        id: exportRecord.id,
        status: exportRecord.processing_status,
        output_file_url: exportRecord.output_file_url,
        output_file_size: exportRecord.output_file_size,
        processing_time_ms: exportRecord.processing_time_ms,
        error_message: exportRecord.error_message,
        created_at: exportRecord.created_at,
        completed_at: exportRecord.completed_at
      }
    });

  } catch (error) {
    console.error('Error in GET /api/export/status/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Descargar archivo exportado
router.get('/download/:id', optionalAuth, setUserContextMiddleware, async (req, res) => {
  try {
    const exportId = req.params.id;
    const userId = req.user?.id;

    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('document_conversions')
      .select('*')
      .eq('id', exportId)
      .single();

    if (exportError) {
      console.error('Error fetching export record:', exportError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener registro de exportación'
      });
    }

    // Verificar que el usuario tenga acceso a esta exportación
    if (userId && exportRecord.user_int_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permiso para descargar este archivo'
      });
    }

    // Verificar que la exportación esté completada
    if (exportRecord.processing_status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'La exportación aún no ha sido completada'
      });
    }

    if (!exportRecord.output_file_url) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado'
      });
    }

    // Aquí se implementaría la lógica para descargar el archivo desde el almacenamiento
    // Por ahora, redirigimos a la URL del archivo
    res.redirect(exportRecord.output_file_url);

  } catch (error) {
    console.error('Error in GET /api/export/download/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Función asíncrona para procesar exportaciones (simulada)
async function processExportAsync(exportId, documentId, format, userId, options) {
  try {
    // Actualizar estado a procesando
    await supabaseClient
      .from('document_conversions')
      .update({ processing_status: 'processing' })
      .eq('id', exportId);

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Obtener información del documento
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('original_filename, file_type')
      .eq('id', documentId)
      .single();

    if (docError) {
      throw new Error('Error al obtener información del documento');
    }

    // Generar nombre de archivo de salida
    const baseName = path.parse(document.original_filename).name;
    const outputFileName = `${baseName}_exported.${format}`;
    const outputFilePath = `/exports/${userId}/${outputFileName}`;

    // Simular generación de archivo
    // En una implementación real, aquí se haría la conversión real del documento
    const processingTimeMs = Math.floor(Math.random() * 5000) + 1000; // 1-6 segundos
    const outputFileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB-1MB

    // Actualizar registro con resultados
    await supabaseClient
      .from('document_conversions')
      .update({
        processing_status: 'completed',
        output_file_path: outputFilePath,
        output_file_url: `https://example.com${outputFilePath}`,
        output_file_size: outputFileSize,
        processing_time_ms: processingTimeMs,
        completed_at: new Date().toISOString()
      })
      .eq('id', exportId);

    console.log(`Exportación ${exportId} completada: ${outputFileName}`);

  } catch (error) {
    console.error('Error processing export:', error);
    
    // Actualizar registro con error
    await supabaseClient
      .from('document_conversions')
      .update({
        processing_status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', exportId);
  }
}

module.exports = router;