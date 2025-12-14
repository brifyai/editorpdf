import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../../services/supabase';
import { supabaseRealHelpers } from '../../../services/supabase-real';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './AIMetrics.css';

const AIMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  // Función para ver detalles de las métricas
  const handleViewDetails = (metric) => {
    console.log('Ver detalles de métricas:', metric);
    
    Swal.fire({
      title: '📊 Detalles de Métricas',
      html: `
        <div style="text-align: left; font-size: 16px;">
          <p><strong>📋 Solicitudes:</strong> ${metric.totalRequests}</p>
          <p><strong>💰 Costo:</strong> $${metric.totalCost}</p>
          <p><strong>⏱️ Tiempo Promedio:</strong> ${metric.averageResponseTime}s</p>
          <p><strong>🎯 Tasa de Éxito:</strong> ${metric.successRate}%</p>
          <p><strong>🤖 Modelo Principal:</strong> ${metric.topModel}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-html'
      }
    });
  };

  // Cargar métricas reales
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando métricas reales...');
      
      // Obtener métricas reales del backend
      const response = await fetch('http://localhost:8080/api/metrics');
      const data = await response.json();
      
      if (data.success) {
        console.log('Métricas reales recibidas:', data.data);
        
        // Transformar los datos al formato esperado
        const transformedMetrics = [{
          id: 'metrics-1',
          totalRequests: data.data.totalRequests || 0,
          totalTokens: data.data.totalTokens || 0,
          totalCost: data.data.totalCost || 0,
          averageResponseTime: data.data.averageResponseTime || 0,
          successRate: data.data.successRate || 0,
          activeModels: data.data.activeModels || 0,
          topModel: data.data.topModel || 'Desconocido',
          mostUsedProvider: data.data.mostUsedProvider || 'Desconocido',
          date: new Date().toISOString(),
          type: 'MÉTRICAS',
          size: '0 B',
          pages: 0,
          confidence: Math.round(data.data.successRate),
          aiModel: data.data.topModel || 'Desconocido',
          status: 'completed'
        }];
        
        setMetrics(transformedMetrics);
      } else {
        console.error('Error al obtener métricas:', data.error);
        setError('Error al cargar las métricas');
      }
    } catch (err) {
      console.error('Error inesperado en loadMetrics:', err);
      setError(`Error inesperado al cargar las métricas: ${err.message || 'Error desconocido'}`);
      
      // Si falla, mostrar métricas de demostración
      const demoMetrics = [{
        id: 'metrics-demo',
        totalRequests: 15,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 2.01,
        successRate: 100,
        activeModels: 1,
        topModel: 'Procesamiento Básico',
        mostUsedProvider: 'Desconocido',
        date: new Date().toISOString(),
        type: 'MÉTRICAS',
        size: '0 B',
        pages: 0,
        confidence: 100,
        aiModel: 'Procesamiento Básico',
        status: 'completed'
      }];
      
      setMetrics(demoMetrics);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (type) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
      </svg>
    );
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

  const filteredMetrics = metrics
    .filter(metric => {
      // Filtro por estado
      if (filter !== 'all' && metric.status !== filter) return false;
      
      // Filtro por término de búsqueda
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        const modelMatch = metric.topModel && metric.topModel.toLowerCase().includes(searchLower);
        const providerMatch = metric.mostUsedProvider && metric.mostUsedProvider.toLowerCase().includes(searchLower);
        
        if (!modelMatch && !providerMatch) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'requests':
          return b.totalRequests - a.totalRequests;
        case 'cost':
          return b.totalCost - a.totalCost;
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="analysis-history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando métricas de IA...</p>
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
          <h3>Error al cargar las métricas</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={loadMetrics}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-history-container">
      <div className="analysis-history-header">
        <div className="header-icon">📊</div>
        <h1>Métricas de IA</h1>
        <p>Analiza el rendimiento y uso de tus modelos de inteligencia artificial</p>
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
              placeholder="Buscar por modelo o proveedor..."
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
              <option value="requests">Ordenar por solicitudes</option>
              <option value="cost">Ordenar por costo</option>
            </select>
          </div>
        </div>

        {/* Lista de métricas */}
        {filteredMetrics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <h3>No hay métricas que mostrar</h3>
            <p>Cuando realices análisis con IA aparecerán las métricas aquí</p>
            <button
              className="action-btn primary"
              onClick={() => window.location.href = '/inteligencia-artificial'}
              title="Ir a configuración de IA"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Configurar IA
            </button>
          </div>
        ) : (
          <div className="analyses-list">
            <h3>Métricas de IA ({filteredMetrics.length})</h3>
            <div className="analyses-container">
              {filteredMetrics.map((metric) => (
                <div key={metric.id} className="analysis-item">
                  {/* File Information */}
                  <div className="file-info">
                    <div className="file-icon">
                      {getMetricIcon(metric.type)}
                    </div>
                    <div className="file-details">
                      <h3 className="file-name">Métricas de IA</h3>
                      <div className="file-meta">
                        <span className="file-type">{metric.type}</span>
                        <span className="file-size">{metric.size}</span>
                        <span className="file-pages">{metric.activeModels} modelos</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Analysis Details */}
                  <div className="analysis-details">
                    <div className="analysis-detail">
                      <span className="detail-label">Fecha</span>
                      <span className="detail-value">{formatDate(metric.date)}</span>
                    </div>
                    
                    <div className="analysis-detail">
                      <span className="detail-label">Solicitudes</span>
                      <span className="detail-value">{formatNumber(metric.totalRequests)}</span>
                    </div>
                    
                    <div className="analysis-detail">
                      <span className="detail-label">Costo</span>
                      <span className="detail-value">${metric.totalCost.toFixed(2)}</span>
                    </div>
                    
                    <div className="analysis-detail">
                      <span className="detail-label">Estado</span>
                      <span className={`detail-value status-${metric.status}`}>
                        {metric.status === 'completed' ? 'Completado' :
                         metric.status === 'processing' ? 'Procesando' : 'Fallido'}
                      </span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="status-actions">
                    <div className="status-badge" style={{ color: getStatusColor(metric.status) }}>
                      {getStatusIcon(metric.status)}
                      <span className="status-text">
                        {metric.status === 'completed' ? 'Completado' :
                         metric.status === 'processing' ? 'Procesando' : 'Fallido'}
                      </span>
                    </div>
                    
                    <div className="analysis-actions">
                      <button
                        className="action-btn primary"
                        onClick={() => handleViewDetails(metric)}
                        title="Ver detalles de métricas"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Ver detalles
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={loadMetrics}
                        title="Actualizar métricas"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 4v6h6"/>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        Actualizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción principales */}
        {filteredMetrics.length > 0 && (
          <div className="main-actions">
            <button
              className="action-btn primary"
              onClick={() => window.location.href = '/inteligencia-artificial'}
              title="Ir a configuración de IA"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Configurar IA
            </button>
            <button
              className="action-btn secondary"
              onClick={() => window.location.href = '/historial-analisis'}
              title="Ver historial de análisis"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMetrics;
