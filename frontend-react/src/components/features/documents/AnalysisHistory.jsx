import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../../services/supabase';
import { supabaseRealHelpers } from '../../../services/supabase-real';
import './AnalysisHistory.css';

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para ver detalles del análisis
  const handleViewDetails = (analysis) => {
    console.log('Ver detalles del análisis:', analysis);
    alert(`📄 Detalles del Análisis\n\n📄 Archivo: ${analysis.filename}\n📋 Tipo: ${analysis.type}\n📊 Estado: ${analysis.status === 'completed' ? 'Completado' : analysis.status === 'processing' ? 'Procesando' : 'Fallido'}\n🎯 Confianza: ${analysis.confidence || 0}%\n🤖 Modelo IA: ${analysis.aiModel || 'No especificado'}`);
  };

  // Función para descargar análisis
  const handleDownload = (analysis) => {
    console.log('Descargar análisis:', analysis);
    
    // Intentar obtener la URL de descarga desde diferentes fuentes
    let downloadUrl = null;
    
    // 1. URL directa en storageUrl
    if (analysis.storageUrl) {
      downloadUrl = analysis.storageUrl;
    }
    // 2. URL en metadata.storage_url
    else if (analysis.metadata?.storage_url) {
      downloadUrl = analysis.metadata.storage_url;
    }
    // 3. URL en documents.storage_url (estructura original)
    else if (analysis.documents?.storage_url) {
      downloadUrl = analysis.documents.storage_url;
    }
    
    if (downloadUrl) {
      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = analysis.filename || 'documento';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`✅ Descarga iniciada\n\nDescargando: ${analysis.filename}`);
    } else {
      alert(`❌ Descarga no disponible\n\nNo se pudo obtener la URL de descarga para: ${analysis.filename}. El archivo puede haber sido eliminado o no estar disponible.`);
    }
  };

  // Cargar historial real de análisis
  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando historial público...');
      
      // PRIMERO: Intentar obtener datos reales de Supabase
      let data, fetchError;
      
      try {
        // Intentar con el cliente real de Supabase usando un ID por defecto
        const result = await supabaseRealHelpers.getAnalysisHistory(1, 50);
        data = result.data;
        fetchError = result.error;
        
        if (fetchError || !data) {
          console.log('No se pudieron obtener datos reales, intentando con método alternativo...');
          // Si falla, intentar con el método original
          const fallbackResult = await supabaseHelpers.getAnalysisHistory(1, 50);
          data = fallbackResult.data;
          fetchError = fallbackResult.error;
        }
      } catch (networkError) {
        console.error('Error de red al obtener historial:', networkError);
        setError('Error de conexión al cargar el historial');
        setLoading(false);
        return;
      }
      
      if (fetchError) {
        console.error('Error al obtener historial:', fetchError);
        // Si el error es por tabla no encontrada, generar datos de prueba reales
        if (fetchError.code === 'PGRST116') {
          console.log('Generando datos de prueba reales...');
          const testData = await supabaseRealHelpers.generateTestData(1);
          if (testData.success) {
            // Intentar obtener los datos generados
            const result = await supabaseRealHelpers.getAnalysisHistory(1, 50);
            data = result.data;
          } else {
            setError('La base de datos aún no está configurada. Los análisis aparecerán aquí cuando realices tu primer análisis.');
            setAnalyses([]);
            setLoading(false);
            return;
          }
        } else {
          setError(`Error al cargar el historial: ${fetchError.message}`);
          setLoading(false);
          return;
        }
      }

      console.log('Datos de historial REALES recibidos:', data);

      // Si no hay datos, generar datos de prueba para demostración
      if (!data || data.length === 0) {
        console.log('No se encontraron análisis reales, generando datos de demostración...');
        const testData = await supabaseRealHelpers.generateTestData(1);
        if (testData.success) {
          // Intentar obtener los datos generados
          const result = await supabaseRealHelpers.getAnalysisHistory(1, 50);
          data = result.data;
        } else {
          setAnalyses([]);
          setLoading(false);
          return;
        }
      }

      // Transformar datos reales de la base de datos al formato esperado por el componente
      const transformedAnalyses = data.map(analysis => {
        console.log('Procesando análisis REAL:', analysis);
        
        return {
          id: analysis.id || 'unknown',
          filename: analysis.documents?.original_filename || analysis.filename || 'Documento sin nombre',
          type: analysis.documents?.file_type?.toUpperCase() || analysis.file_type || 'UNKNOWN',
          date: analysis.created_at || analysis.date || new Date().toISOString(),
          status: analysis.status || 'completed',
          size: formatFileSize(analysis.documents?.file_size_bytes || analysis.file_size_bytes || 0),
          pages: analysis.analysis_results_basic?.page_count || analysis.pages || 0,
          confidence: analysis.confidence_score || analysis.confidence || 0,
          documentId: analysis.document_id || analysis.id,
          analysisType: analysis.analysis_type || 'document',
          processingTime: analysis.processing_time_ms || 0,
          aiModel: analysis.ai_model_used || 'Desconocido',
          // URLs de descarga desde diferentes fuentes
          storageUrl: analysis.storageUrl || analysis.documents?.file_path || analysis.file_path || analysis.metadata?.storage_url,
          // Información adicional para mejor UX
          processingType: analysis.analysis_type || 'document',
          hasAI: analysis.ai_model_used && analysis.ai_model_used !== 'none',
          // Información adicional para debugging
          _rawData: analysis // Mantener datos originales para debugging
        };
      });

      console.log('Análisis reales transformados:', transformedAnalyses);
      setAnalyses(transformedAnalyses);
    } catch (err) {
      console.error('Error inesperado en loadAnalysisHistory:', err);
      setError(`Error inesperado al cargar el historial: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
          </svg>
        );
      case 'processing':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        );
      case 'failed':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'processing':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getFileIcon = (type) => {
    if (type === 'PDF') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2V8H20"/>
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    );
  };

  const filteredAnalyses = analyses
    .filter(analysis => {
      // Filtro por estado
      if (filter !== 'all' && analysis.status !== filter) return false;
      
      // Filtro por término de búsqueda
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        const filenameMatch = analysis.filename.toLowerCase().includes(searchLower);
        const typeMatch = analysis.type.toLowerCase().includes(searchLower);
        const aiModelMatch = analysis.aiModel && analysis.aiModel.toLowerCase().includes(searchLower);
        
        if (!filenameMatch && !typeMatch && !aiModelMatch) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          // Extraer número del tamaño para comparación
          const sizeA = parseFloat(a.size) || 0;
          const sizeB = parseFloat(b.size) || 0;
          return sizeB - sizeA;
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="analysis-history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando historial de análisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-history-container">
        <div className="error-state">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3>Error al cargar el historial</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={loadAnalysisHistory}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-history-container">
      <div className="analysis-history-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
              <path d="M14 2V8H20"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H9H8"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Historial de Análisis</h1>
            <p>Revisa todos tus análisis anteriores y su estado</p>
            <div className="header-actions">
              <button
                className="action-btn primary"
                onClick={() => window.location.href = '/'}
                title="Ir a análisis de documentos"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Nuevo Análisis
              </button>
              <button
                className="action-btn secondary"
                onClick={() => window.location.href = '/ai-config'}
                title="Configurar IA"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v3m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Configurar IA
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre de archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="processing">Procesando</option>
            <option value="failed">Fallidos</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Ordenar por fecha</option>
            <option value="name">Ordenar por nombre</option>
            <option value="size">Ordenar por tamaño</option>
          </select>
        </div>
      </div>

      {/* Sección de ayuda y orientación */}
      <div className="help-section" style={{
        maxWidth: '1200px',
        margin: '0 auto 2rem auto',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem',
        animation: 'fadeInUp 0.6s ease-out 0.3s both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981' }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
            ¿Qué puedes hacer aquí?
          </h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
            </svg>
            <div>
              <strong style={{ color: 'white' }}>Ver Detalles:</strong> Haz clic en "Ver detalles" para obtener información completa del análisis, incluyendo métricas de confianza y modelo utilizado.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <path d="M7 10l5 5 5-5"/>
              <path d="M12 15V3"/>
            </svg>
            <div>
              <strong style={{ color: 'white' }}>Descargar:</strong> Usa el botón "Descargar" para obtener el archivo original desde Supabase Storage.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <div>
              <strong style={{ color: 'white' }}>Nuevo Análisis:</strong> Haz clic en "Nuevo Análisis" para subir y analizar más documentos con IA.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>
              <path d="M12 15v3m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <div>
              <strong style={{ color: 'white' }}>Configurar IA:</strong> Ve a "Configurar IA" para ajustar modelos, API keys y parámetros de análisis.
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981' }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <strong style={{ color: 'white', fontSize: '0.9rem' }}>Tipos de Análisis:</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            <span style={{ color: '#10b981' }}>• Análisis Básico:</span> Extracción de texto y estadísticas simples<br/>
            <span style={{ color: '#10b981' }}>• IA Avanzada:</span> Análisis con modelos de IA (Llama, Mixtral) para insights profundos<br/>
            <span style={{ color: '#10b981' }}>• OCR:</span> Reconocimiento óptico de caracteres para imágenes
          </div>
        </div>
      </div>

      <div className="history-content">
        {filteredAnalyses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                <path d="M14 2V8H20"/>
              </svg>
            </div>
            <h3>No hay análisis que mostrar</h3>
            <p>Cuando realices análisis de documentos aparecerán aquí</p>
          </div>
        ) : (
          <div className="analyses-grid">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="analysis-card">
                <div className="card-header">
                  <div className="file-info">
                    <div className="file-icon">
                      {getFileIcon(analysis.type)}
                    </div>
                    <div className="file-details">
                      <h4 className="file-name">{analysis.filename}</h4>
                      <div className="file-meta">
                        <span className="file-type">{analysis.type}</span>
                        <span className="file-size">{analysis.size}</span>
                        {analysis.pages && <span className="file-pages">{analysis.pages} páginas</span>}
                      </div>
                    </div>
                  </div>
                  <div className="status-badge" style={{ color: getStatusColor(analysis.status) }}>
                    {getStatusIcon(analysis.status)}
                    <span className="status-text">
                      {analysis.status === 'completed' ? 'Completado' :
                       analysis.status === 'processing' ? 'Procesando' : 'Fallido'}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="analysis-info">
                    <div className="info-item">
                      <span className="info-label">Fecha:</span>
                      <span className="info-value">{formatDate(analysis.date)}</span>
                    </div>
                    {analysis.confidence && (
                      <div className="info-item">
                        <span className="info-label">Confianza:</span>
                        <span className="info-value confidence">{analysis.confidence}%</span>
                      </div>
                    )}
                    {analysis.aiModel && (
                      <div className="info-item">
                        <span className="info-label">Modelo IA:</span>
                        <span className="info-value">
                          {analysis.aiModel === 'Desconocido' ?
                            (analysis.hasAI ? 'IA Básica' : 'Análisis Básico') :
                            analysis.aiModel
                          }
                        </span>
                      </div>
                    )}
                    {analysis.processingType && (
                      <div className="info-item">
                        <span className="info-label">Tipo:</span>
                        <span className="info-value">
                          {analysis.processingType === 'ai_enhanced' ? 'IA Avanzada' :
                           analysis.processingType === 'advanced' ? 'Análisis Avanzado' :
                           analysis.processingType === 'ocr' ? 'OCR' :
                           'Análisis Básico'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleViewDetails(analysis)}
                    title="Ver detalles del análisis"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Ver detalles
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => handleDownload(analysis)}
                    title="Descargar análisis"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <path d="M7 10l5 5 5-5"/>
                      <path d="M12 15V3"/>
                    </svg>
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;
