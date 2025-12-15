import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../../services/supabase';
import { supabaseRealHelpers } from '../../../services/supabase-real';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './AnalysisHistory.css';
import { useClearCacheOnResize } from '../../../utils/cacheManager';
import CacheClearButton from '../../common/CacheClearButton';

// Hook personalizado para detectar si estamos en un dispositivo móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar en el montaje inicial
    checkIsMobile();
    
    // Añadir listener para cambios de tamaño
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  return isMobile;
};

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const isMobile = useIsMobile();
  
  // Limpiar caché cuando cambia el tamaño de la pantalla
  useClearCacheOnResize();

  // Función para ver detalles del análisis
  const handleViewDetails = (analysis) => {
    console.log('Ver detalles del análisis:', analysis);
    
    const statusText = analysis.status === 'completed' ? 'Completado' :
                      analysis.status === 'processing' ? 'Procesando' : 'Fallido';
    
    const isMobile = window.innerWidth < 768;
    
    Swal.fire({
      title: '📄 Detalles del Análisis',
      html: `
        <div style="text-align: left; font-size: ${isMobile ? '14px' : '16px'};">
          <p><strong>📄 Archivo:</strong> ${analysis.filename}</p>
          <p><strong>📋 Tipo:</strong> ${analysis.type}</p>
          <p><strong>📊 Estado:</strong> ${statusText}</p>
          <p><strong>🎯 Confianza:</strong> ${analysis.confidence || 0}%</p>
          <p><strong>🤖 Modelo IA:</strong> ${analysis.aiModel || 'No especificado'}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      width: isMobile ? '95%' : 'auto',
      customClass: {
        popup: isMobile ? 'swal2-mobile-popup' : 'swal2-custom-popup',
        title: isMobile ? 'swal2-mobile-title' : 'swal2-custom-title',
        htmlContainer: isMobile ? 'swal2-mobile-html' : 'swal2-custom-html',
        confirmButton: isMobile ? 'swal2-mobile-confirm' : 'swal2-custom-confirm'
      }
    });
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
      
      const isMobile = window.innerWidth < 768;
      
      Swal.fire({
        title: '✅ Descarga iniciada',
        text: `Descargando: ${analysis.filename}`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#10b981',
        background: '#ffffff',
        width: isMobile ? '95%' : 'auto',
        customClass: {
          popup: isMobile ? 'swal2-mobile-popup' : 'swal2-custom-popup',
          title: isMobile ? 'swal2-mobile-title' : 'swal2-custom-title',
          confirmButton: isMobile ? 'swal2-mobile-confirm' : 'swal2-custom-confirm'
        }
      });
    } else {
      const isMobile = window.innerWidth < 768;
      
      Swal.fire({
        title: '❌ Descarga no disponible',
        text: `No se pudo obtener la URL de descarga para: ${analysis.filename}. El archivo puede haber sido eliminado o no estar disponible.`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        background: '#ffffff',
        width: isMobile ? '95%' : 'auto',
        customClass: {
          popup: isMobile ? 'swal2-mobile-popup' : 'swal2-custom-popup',
          title: isMobile ? 'swal2-mobile-title' : 'swal2-custom-title',
          confirmButton: isMobile ? 'swal2-mobile-confirm' : 'swal2-custom-confirm'
        }
      });
    }
  };

  // Verificar autenticación del usuario
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Cargar historial real de análisis solo si el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAnalysisHistory();
    } else {
      setLoading(false);
      setError('Debes iniciar sesión para ver tu historial de análisis');
    }
  }, [isAuthenticated, user]);

  // Función para verificar si el usuario está autenticado
  const checkAuthentication = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay un usuario autenticado usando Supabase
      const { data: { user }, error } = await supabaseReal.auth.getUser();
      
      if (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        console.log('Usuario autenticado:', user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('No hay usuario autenticado');
      }
    } catch (err) {
      console.error('Error en checkAuthentication:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar que el usuario esté autenticado
      if (!isAuthenticated || !user) {
        console.log('Usuario no autenticado, no se puede cargar el historial');
        setError('Debes iniciar sesión para ver tu historial de análisis');
        setLoading(false);
        return;
      }
      
      console.log('Cargando historial para usuario autenticado:', user.id);
      
      // PRIMERO: Intentar obtener datos reales de Supabase
      let data, fetchError;
      
      try {
        // Solo usar el ID del usuario autenticado, sin fallback
        const userId = user.id;
        console.log('Cargando historial para usuario:', userId);
        const result = await supabaseRealHelpers.getAnalysisHistory(userId, 50);
        data = result.data;
        fetchError = result.error;
        
        if (fetchError || !data) {
          console.log('No se pudieron obtener datos reales, intentando con método alternativo...');
          // Si falla, intentar con el método original usando el ID del usuario autenticado
          const fallbackResult = await supabaseHelpers.getAnalysisHistory(userId, 50);
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
          const userId = user.id; // Solo usar ID del usuario autenticado
          const testData = await supabaseRealHelpers.generateTestData(userId);
          if (testData.success) {
            // Intentar obtener los datos generados
            const result = await supabaseRealHelpers.getAnalysisHistory(userId, 50);
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
        const userId = user.id; // Solo usar ID del usuario autenticado
        const testData = await supabaseRealHelpers.generateTestData(userId);
        if (testData.success) {
          // Intentar obtener los datos generados
          const result = await supabaseRealHelpers.getAnalysisHistory(userId, 50);
          data = result.data;
        } else {
          setAnalyses([]);
          setLoading(false);
          return;
        }
      }

      // Transformar datos reales de la base de datos al formato esperado por el componente
      const transformedAnalyses = (data || []).map(analysis => {
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
    // Para otros tipos de archivo, simplemente devolvemos null para ocultar el icono
    return null;
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

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredAnalyses.length / pageSize);
  
  // Obtener los análisis para la página actual
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  if (!isAuthenticated) {
    return (
      <div className="analysis-history-container">
        <div className="auth-required-state">
          <div className="auth-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 15v3m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3>Inicio de sesión requerido</h3>
          <p>Debes iniciar sesión para ver tu historial de análisis.</p>
          <div className="auth-actions">
            <button
              className="action-btn primary"
              onClick={() => window.location.href = '/auth'}
            >
              Iniciar sesión
            </button>
            <button
              className="action-btn secondary"
              onClick={() => window.location.href = '/'}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-history-container">
      <style jsx>{`
        .auth-required-state {
          text-align: center;
          padding: 3rem 1rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .auth-required-state .auth-icon {
          margin-bottom: 1.5rem;
        }

        .auth-required-state .auth-icon svg {
          width: 64px;
          height: 64px;
          color: var(--warning-color, #f39c12);
        }

        .auth-required-state h3 {
          margin: 1rem 0 0.5rem;
          color: var(--warning-color, #f39c12);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .auth-required-state p {
          margin: 0 0 1.5rem;
          color: var(--text-secondary, #666);
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .auth-required-state .auth-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .auth-required-state .action-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
          display: inline-block;
        }

        .auth-required-state .action-btn.primary {
          background-color: var(--primary-color, #3498db);
          color: white;
        }

        .auth-required-state .action-btn.primary:hover {
          background-color: var(--primary-hover, #2980b9);
          transform: translateY(-1px);
        }

        .auth-required-state .action-btn.secondary {
          background-color: transparent;
          color: var(--text-secondary, #666);
          border: 2px solid var(--border-color, #ddd);
        }

        .auth-required-state .action-btn.secondary:hover {
          background-color: var(--background-hover, #f8f9fa);
          border-color: var(--text-secondary, #666);
        }
      `}</style>
      <div className="analysis-history-header">
        <div className="header-icon">📋</div>
        <h1>Historial de Análisis</h1>
        <p>Revisa todos tus análisis anteriores y su estado</p>
      </div>

      <div className="analysis-history-content">
        {/* Controles de búsqueda y filtros */}
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
            
            {/* Botón para limpiar caché */}
            <CacheClearButton
              buttonText="Limpiar Caché"
              buttonClassName="cache-clear-btn"
              showConfirmation={true}
              confirmationMessage="¿Estás seguro de que quieres limpiar toda la caché? Esto recargará la página."
              onSuccess={() => {
                console.log('Caché limpiado correctamente');
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'La caché ha sido limpiada correctamente. La página se recargará.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#3b82f6',
                  background: '#ffffff'
                });
              }}
              onError={(error) => {
                console.error('Error al limpiar la caché:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'Hubo un problema al limpiar la caché. Por favor, intenta recargar la página manualmente.',
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#ef4444',
                  background: '#ffffff'
                });
              }}
            />
          </div>
        </div>

        {/* Lista de análisis */}
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
          </div>
        ) : (
          <div className="analyses-list">
            <h3>Análisis Realizados ({filteredAnalyses.length})</h3>
            <div className="analyses-container">
              {paginatedAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="analysis-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    margin: '0 0 1rem 0',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    background: '#ffffff',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {/* File Information */}
                  <div
                    className="file-info"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #e2e8f0',
                      gap: '0.75rem'
                    }}
                  >
                    {/* Solo mostrar el icono si existe */}
                    {getFileIcon(analysis.type) && (
                      <div className="file-icon">
                        {getFileIcon(analysis.type)}
                      </div>
                    )}
                    <div
                      className="file-details"
                      style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <h3
                        className="file-name"
                        style={{
                          display: 'block',
                          width: '100%',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          marginBottom: '0.5rem',
                          wordBreak: 'break-word',
                          color: '#1e293b'
                        }}
                      >
                        {analysis.filename}
                      </h3>
                      <div
                        className="file-meta"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          gap: '0.5rem'
                        }}
                      >
                        <span
                          className="file-type"
                          style={{
                            display: 'inline-block',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {analysis.type}
                        </span>
                        <span
                          className="file-size"
                          style={{
                            display: 'inline-block',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {analysis.size}
                        </span>
                        {analysis.pages && analysis.pages > 0 && (
                          <span
                            className="file-pages"
                            style={{
                              display: 'inline-block',
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              borderRadius: '20px',
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              color: '#475569',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {analysis.pages} páginas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Analysis Details */}
                  <div
                    className="analysis-details"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div
                      className="analysis-detail"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        gap: '0.5rem',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <span
                        className="detail-label"
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Fecha
                      </span>
                      <span
                        className="detail-value"
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#1e293b',
                          textAlign: 'right',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatDate(analysis.date)}
                      </span>
                    </div>
                    
                    {analysis.confidence && (
                      <div
                        className="analysis-detail"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          gap: '0.5rem',
                          padding: '0.5rem 0',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <span
                          className="detail-label"
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Confianza
                        </span>
                        <span
                          className="detail-value confidence"
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#059669',
                            textAlign: 'right',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {analysis.confidence}%
                        </span>
                      </div>
                    )}
                    
                    {analysis.aiModel && (
                      <div
                        className="analysis-detail"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          gap: '0.5rem',
                          padding: '0.5rem 0',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <span
                          className="detail-label"
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Modelo IA
                        </span>
                        <span
                          className="detail-value"
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            textAlign: 'right',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {analysis.aiModel === 'Desconocido' ?
                            (analysis.hasAI ? 'IA Básica' : 'Análisis Básico') :
                            analysis.aiModel
                          }
                        </span>
                      </div>
                    )}
                    
                    <div
                      className="analysis-detail"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        gap: '0.5rem',
                        padding: '0.5rem 0',
                        borderBottom: 'none'
                      }}
                    >
                      <span
                        className="detail-label"
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Estado
                      </span>
                      <span
                        className={`detail-value status-${analysis.status}`}
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: analysis.status === 'completed' ? '#059669' :
                                 analysis.status === 'processing' ? '#d97706' : '#dc2626',
                          textAlign: 'right',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {analysis.status === 'completed' ? 'Completado' :
                         analysis.status === 'processing' ? 'Procesando' : 'Fallido'}
                      </span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div
                    className="status-actions"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      gap: '1rem',
                      alignItems: 'stretch',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0'
                    }}
                  >
                    <div
                      className="status-badge"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        gap: '0.5rem',
                        padding: '0.875rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        borderRadius: '25px',
                        border: '2px solid #e2e8f0',
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        textAlign: 'center',
                        color: getStatusColor(analysis.status)
                      }}
                    >
                      {getStatusIcon(analysis.status)}
                      <span className="status-text">
                        {analysis.status === 'completed' ? 'Completado' :
                         analysis.status === 'processing' ? 'Procesando' : 'Fallido'}
                      </span>
                    </div>
                    
                    <div
                      className="analysis-actions"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        gap: '0.75rem'
                      }}
                    >
                      <button
                        className="action-btn primary"
                        onClick={() => handleViewDetails(analysis)}
                        title="Ver detalles del análisis"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          gap: '0.5rem',
                          padding: '0.875rem 1rem',
                          fontSize: '0.9rem',
                          borderRadius: '8px',
                          minHeight: '48px',
                          fontWeight: '600',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          border: 'none',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: '#ffffff',
                          transition: 'all 0.2s ease',
                          textAlign: 'center'
                        }}
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          gap: '0.5rem',
                          padding: '0.875rem 1rem',
                          fontSize: '0.9rem',
                          borderRadius: '8px',
                          minHeight: '48px',
                          fontWeight: '600',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e5e7eb',
                          background: '#ffffff',
                          color: '#374151',
                          transition: 'all 0.2s ease',
                          textAlign: 'center'
                        }}
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
                </div>
              ))}
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div
                className="pagination-container"
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  gap: isMobile ? '0.5rem' : '1rem',
                  marginTop: '2rem',
                  padding: isMobile ? '1rem' : '1.5rem',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  alignItems: isMobile ? 'center' : 'stretch',
                  justifyContent: isMobile ? 'space-between' : 'flex-start'
                }}
              >
                <div
                  className="pagination-info"
                  style={{
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    color: '#64748b',
                    textAlign: isMobile ? 'left' : 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: isMobile ? '1' : 'auto'
                  }}
                >
                  Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredAnalyses.length)} de {filteredAnalyses.length} análisis
                </div>
                <div
                  className="pagination-controls"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Página anterior"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      height: '36px',
                      padding: '0 0.75rem',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#374151',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: currentPage === 1 ? '0.5' : '1',
                      flexShrink: '0'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  
                  {/* Números de página */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      title={`Página ${page}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '36px',
                        height: '36px',
                        padding: '0 0.75rem',
                        border: '1px solid #e2e8f0',
                        background: currentPage === page ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#ffffff',
                        color: currentPage === page ? '#ffffff' : '#374151',
                        fontSize: '0.9rem',
                        fontWeight: currentPage === page ? '600' : '500',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: '0',
                        margin: '0 2px'
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Página siguiente"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      height: '36px',
                      padding: '0 0.75rem',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#374151',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: currentPage === totalPages ? '0.5' : '1',
                      flexShrink: '0'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones de acción principales */}
        {filteredAnalyses.length > 0 && (
          <div className="main-actions">
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
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;
