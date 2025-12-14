import React, { useState, useCallback, useEffect } from 'react';
import { aiConfigurationService } from '../../services/api';
import { showErrorToUser, useErrorHandler } from '../../utils/errorHandler';
import toast from 'react-hot-toast';
import './AIConfiguration.css';

const AIConfiguration = () => {
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [configuration, setConfiguration] = useState({
    groq: {
      apiKey: '',
      model: 'llama-3-3-70b-versatile',
      temperature: 0.2,
      maxTokens: 1500,
      topP: 1,
      stream: true
    },
    chutes: {
      apiKey: '',
      model: 'chutes-ai-ocr',
      temperature: 0.1,
      maxTokens: 1000,
      topP: 1,
      stream: false
    }
  });

  const providers = [
    {
      id: 'groq',
      name: 'Groq',
      description: 'Inferencia ultrarrápida con hardware especializado',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      color: '#f59e0b',
      models: [
        { id: 'llama-3-3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Modelo balanceado con alta precisión para análisis general' },
        { id: 'llama-3-1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Modelo rápido para análisis básico y respuestas rápidas' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Modelo de alta precisión para análisis detallado' }
      ]
    },
    {
      id: 'chutes',
      name: 'Chutes.ai',
      description: 'Modelo especializado en OCR y análisis de documentos',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      color: '#3b82f6',
      models: [
        { id: 'chutes-ai-ocr', name: 'Chutes.ai OCR', description: 'Modelo especializado en OCR y análisis de documentos' }
      ]
    }
  ];

  const simulateProcessing = useCallback(() => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
    }, 3000);
  }, []);

  const handleConfigChange = useCallback((provider, key, value) => {
    setConfiguration(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [key]: value
      }
    }));
  }, []);

  const { handleError } = useErrorHandler();

  const testConnection = useCallback(async () => {
    simulateProcessing();
    
    try {
      // Realizar prueba de conexión real con el backend
      const response = await aiConfigurationService.testConnection();
      
      if (response.success && response.data.apis) {
        const { groq, chutes } = response.data.apis;
        
        // Verificar estado de las APIs
        const groqStatus = groq.status === 'connected';
        const chutesStatus = chutes.status === 'connected';
        
        // Mostrar resultados
        setTimeout(() => {
          if (groqStatus && chutesStatus) {
            toast.success('✅ Ambas APIs (Groq y Chutes.ai) están conectadas correctamente');
          } else if (groqStatus) {
            toast.success('✅ API de Groq conectada. ⚠️ Chutes.ai no disponible');
          } else if (chutesStatus) {
            toast.success('✅ API de Chutes.ai conectada. ⚠️ Groq no disponible');
          } else {
            toast.error('❌ Ninguna API está disponible. Verifica tus credenciales');
          }
        }, 3000);
      }
    } catch (error) {
      handleError(error, { showToast: true });
    }
  }, [simulateProcessing, handleError]);

  const saveConfiguration = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Preparar configuración para el backend
      const config = {
        groq_api_key: configuration.groq.apiKey,
        chutes_api_key: configuration.chutes.apiKey,
        groq_model: configuration.groq.model,
        chutes_model: configuration.chutes.model,
        groq_temperature: configuration.groq.temperature,
        chutes_max_tokens: configuration.groq.maxTokens,
        chutes_temperature: configuration.chutes.temperature,
        chutes_max_tokens: configuration.chutes.maxTokens,
        groq_stream: configuration.groq.stream,
        chutes_stream: configuration.chutes.stream
      };

      // Obtener ID de usuario (por ahora usar un valor fijo, en una implementación real vendría del contexto de autenticación)
      const userId = 1; // Este valor debería venir del contexto de autenticación
      
      // Guardar en el backend
      const response = await aiConfigurationService.saveConfiguration(userId, config);
      
      if (response.success) {
        // También guardar en localStorage como respaldo
        localStorage.setItem('aiConfiguration', JSON.stringify(config));
        
        console.log('✅ Configuración guardada exitosamente en el backend');
        toast.success('Configuración guardada correctamente');
      } else {
        throw new Error(response.message || 'Error al guardar configuración');
      }
      
    } catch (error) {
      handleError(error, { showToast: true });
      
      // Fallback a localStorage si falla el backend
      try {
        const fallbackConfig = {
          groq_api_key: configuration.groq.apiKey,
          chutes_api_key: configuration.chutes.apiKey,
          groq_model: configuration.groq.model,
          chutes_model: configuration.chutes.model,
          groq_temperature: configuration.groq.temperature,
          chutes_temperature: configuration.chutes.temperature,
          groq_max_tokens: configuration.groq.maxTokens,
          chutes_max_tokens: configuration.chutes.maxTokens,
          groq_stream: configuration.groq.stream,
          chutes_stream: configuration.chutes.stream
        };
        
        localStorage.setItem('aiConfiguration', JSON.stringify(fallbackConfig));
        console.log('⚠️ Configuración guardada en localStorage (fallback)');
        toast.success('Configuración guardada localmente (modo offline)');
      } catch (fallbackError) {
        console.error('Error en fallback a localStorage:', fallbackError);
        toast.error('Error al guardar configuración localmente');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [configuration, handleError]);

  const getCurrentProvider = () => {
    return providers.find(p => p.id === selectedProvider);
  };

  const getCurrentConfig = () => {
    return configuration[selectedProvider];
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        // Obtener ID de usuario (por ahora usar un valor fijo, en una implementación real vendría del contexto de autenticación)
        const userId = 1; // Este valor debería venir del contexto de autenticación
        
        // Intentar cargar configuración desde el backend
        try {
          const response = await aiConfigurationService.getConfiguration(userId);
          
          if (response.success && response.data.configuration) {
            const config = response.data.configuration;
            console.log('✅ Configuración cargada exitosamente desde el backend:', config);
            
            setConfiguration(prev => ({
              ...prev,
              groq: {
                ...prev.groq,
                apiKey: config.groq_api_key || '',
                model: config.groq_model || prev.groq.model,
                temperature: config.groq_temperature !== undefined ? config.groq_temperature : prev.groq.temperature,
                maxTokens: config.groq_max_tokens !== undefined ? config.groq_max_tokens : prev.groq.maxTokens,
                stream: config.groq_stream !== undefined ? config.groq_stream : prev.groq.stream
              },
              chutes: {
                ...prev.chutes,
                apiKey: config.chutes_api_key || '',
                model: config.chutes_model || prev.chutes.model,
                temperature: config.chutes_temperature !== undefined ? config.chutes_temperature : prev.chutes.temperature,
                maxTokens: config.chutes_max_tokens !== undefined ? config.chutes_max_tokens : prev.chutes.maxTokens,
                stream: config.chutes_stream !== undefined ? config.chutes_stream : prev.chutes.stream
              }
            }));
            
            return; // Salir si se cargó desde el backend
          }
        } catch (backendError) {
          console.warn('⚠️ No se pudo cargar configuración desde el backend, intentando localStorage:', backendError.message);
          handleError(backendError, { showToast: false });
        }
        
        // Fallback a localStorage si el backend falla
        const savedConfig = localStorage.getItem('aiConfiguration');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          console.log('✅ Configuración cargada exitosamente desde localStorage:', config);
          
          setConfiguration(prev => ({
            ...prev,
            groq: {
              ...prev.groq,
              apiKey: config.groq_api_key || '',
              model: config.groq_model || prev.groq.model,
              temperature: config.groq_temperature !== undefined ? config.groq_temperature : prev.groq.temperature,
              maxTokens: config.groq_max_tokens !== undefined ? config.groq_max_tokens : prev.groq.maxTokens,
              stream: config.groq_stream !== undefined ? config.groq_stream : prev.groq.stream
            },
            chutes: {
              ...prev.chutes,
              apiKey: config.chutes_api_key || '',
              model: config.chutes_model || prev.chutes.model,
              temperature: config.chutes_temperature !== undefined ? config.chutes_temperature : prev.chutes.temperature,
              maxTokens: config.chutes_max_tokens !== undefined ? config.chutes_max_tokens : prev.chutes.maxTokens,
              stream: config.chutes_stream !== undefined ? config.chutes_stream : prev.chutes.stream
            }
          }));
        } else {
          console.log('ℹ️ No hay configuración guardada, usando configuración por defecto');
        }
      } catch (error) {
        handleError(error, { showToast: false });
      }
    };

    loadConfiguration();
  }, [handleError]);

  return (
    <div className="analysis-history-container">
      <div className="analysis-history-header">
        <div className="header-icon">🤖</div>
        <h1>Configuración de IA</h1>
        <p>Gestiona tus modelos de inteligencia artificial y configuraciones</p>
      </div>

      <div className="analysis-history-content">
        {/* Controles de búsqueda y filtros - Adaptado para configuración */}
        <div className="controls-section">
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar proveedor o modelo..."
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
              <option value="all">Todos los proveedores</option>
              <option value="groq">Groq</option>
              <option value="chutes">Chutes.ai</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="status">Ordenar por estado</option>
            </select>
          </div>
        </div>

        {/* Lista de proveedores de IA */}
        <div className="analyses-list">
          <h3>Proveedores de IA ({providers.length})</h3>
          <div className="analyses-container">
            {providers.map((provider) => (
              <div key={provider.id} className="analysis-item">
                {/* Provider Information */}
                <div className="file-info">
                  <div className="file-icon" style={{ backgroundColor: `${provider.color}20`, color: provider.color }}>
                    {provider.icon}
                  </div>
                  <div className="file-details">
                    <h3 className="file-name">{provider.name}</h3>
                    <div className="file-meta">
                      <span className="file-type">{provider.id.toUpperCase()}</span>
                      <span className="file-size">
                        {configuration[provider.id].apiKey ? 'Configurado' : 'No configurado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Provider Details */}
                <div className="analysis-details">
                  <div className="analysis-detail">
                    <span className="detail-label">Estado</span>
                    <span className={`detail-value status-${configuration[provider.id].apiKey ? 'completed' : 'failed'}`}>
                      {configuration[provider.id].apiKey ? 'Configurado' : 'No configurado'}
                    </span>
                  </div>
                  
                  <div className="analysis-detail">
                    <span className="detail-label">Modelo Actual</span>
                    <span className="detail-value">
                      {getCurrentProvider()?.id === provider.id ? getCurrentConfig().model : configuration[provider.id].model}
                    </span>
                  </div>
                  
                  <div className="analysis-detail">
                    <span className="detail-label">Temperatura</span>
                    <span className="detail-value">
                      {getCurrentProvider()?.id === provider.id ? getCurrentConfig().temperature : configuration[provider.id].temperature}
                    </span>
                  </div>
                  
                  <div className="analysis-detail">
                    <span className="detail-label">Max Tokens</span>
                    <span className="detail-value">
                      {getCurrentProvider()?.id === provider.id ? getCurrentConfig().maxTokens : configuration[provider.id].maxTokens}
                    </span>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="status-actions">
                  <div className="status-badge" style={{ color: configuration[provider.id].apiKey ? '#10b981' : '#ef4444' }}>
                    {configuration[provider.id].apiKey ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    )}
                    <span className="status-text">
                      {configuration[provider.id].apiKey ? 'Configurado' : 'No configurado'}
                    </span>
                  </div>
                  
                  <div className="analysis-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => setSelectedProvider(provider.id)}
                      title={`Configurar ${provider.name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      {selectedProvider === provider.id ? 'Configurando' : 'Configurar'}
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        testConnection();
                      }}
                      title="Probar conexión"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                      Probar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuración detallada del proveedor seleccionado */}
        {selectedProvider && (
          <div className="analyses-list">
            <h3>Configuración Detallada - {getCurrentProvider()?.name}</h3>
            <div className="analysis-item">
              <div className="config-form">
                <div className="form-section">
                  <h3>Credenciales</h3>
                  <div className="form-group">
                    <label htmlFor="api-key">API Key</label>
                    <input
                      id="api-key"
                      type="password"
                      value={getCurrentConfig().apiKey || ''}
                      onChange={(e) => handleConfigChange(selectedProvider, 'apiKey', e.target.value)}
                      placeholder="Ingresa tu API key"
                      className="config-input"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Modelo</h3>
                  <div className="form-group">
                    <label htmlFor="model-select">Seleccionar modelo:</label>
                    <select
                      id="model-select"
                      value={getCurrentConfig().model}
                      onChange={(e) => handleConfigChange(selectedProvider, 'model', e.target.value)}
                      className="config-select"
                    >
                      {getCurrentProvider()?.models.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Parámetros de Generación</h3>
                  
                  <div className="parameter-grid">
                    <div className="form-group">
                      <label htmlFor="temperature">Temperatura: {getCurrentConfig().temperature}</label>
                      <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={getCurrentConfig().temperature}
                        onChange={(e) => handleConfigChange(selectedProvider, 'temperature', parseFloat(e.target.value))}
                        className="config-slider"
                      />
                      <div className="slider-labels">
                        <span>Conservador</span>
                        <span>Creativo</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="max-tokens">Máximo de Tokens: {getCurrentConfig().maxTokens}</label>
                      <input
                        id="max-tokens"
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={getCurrentConfig().maxTokens}
                        onChange={(e) => handleConfigChange(selectedProvider, 'maxTokens', parseInt(e.target.value))}
                        className="config-slider"
                      />
                      <div className="slider-labels">
                        <span>100</span>
                        <span>4000</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="top-p">Top P: {getCurrentConfig().topP}</label>
                      <input
                        id="top-p"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={getCurrentConfig().topP}
                        onChange={(e) => handleConfigChange(selectedProvider, 'topP', parseFloat(e.target.value))}
                        className="config-slider"
                      />
                      <div className="slider-labels">
                        <span>Preciso</span>
                        <span>Diverso</span>
                      </div>
                    </div>

                    {selectedProvider === 'groq' && (
                      <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={getCurrentConfig().stream || false}
                            onChange={(e) => handleConfigChange(selectedProvider, 'stream', e.target.checked)}
                          />
                          <span>Streaming de respuesta</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="config-actions">
                <button className="test-button" onClick={testConnection} disabled={isProcessing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                  {isProcessing ? 'Probando...' : 'Probar Conexión'}
                </button>
                
                <button className="save-button" onClick={saveConfiguration} disabled={isProcessing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  {isProcessing ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>

              {isProcessing && (
                <div className="processing-overlay">
                  <div className="processing-content">
                    <div className="progress-circle">
                      <svg width="80" height="80" viewBox="0 0 60 60">
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="rgba(0,0,0,0.2)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 25}`}
                          strokeDashoffset={`${2 * Math.PI * 25 * (1 - processingProgress / 100)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 30 30)"
                          className="progress-circle-animated"
                        />
                      </svg>
                      <span className="progress-text">{Math.round(processingProgress)}%</span>
                    </div>
                    <p className="progress-message">Configurando {getCurrentProvider()?.name}...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recomendaciones de configuración */}
        <div className="analyses-list">
          <h3>Recomendaciones de Configuración</h3>
          <div className="analyses-container">
            <div className="analysis-item">
              <div className="file-info">
                <div className="file-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                  </svg>
                </div>
                <div className="file-details">
                  <h3 className="file-name">Análisis de Documentos</h3>
                  <div className="file-meta">
                    <span className="file-type">RECOMENDACIÓN</span>
                  </div>
                </div>
              </div>
              
              <div className="analysis-details">
                <div className="analysis-detail">
                  <span className="detail-label">Descripción</span>
                  <span className="detail-value">Temperatura baja para respuestas precisas</span>
                </div>
                
                <div className="analysis-detail">
                  <span className="detail-label">Temperatura</span>
                  <span className="detail-value">0.2</span>
                </div>
                
                <div className="analysis-detail">
                  <span className="detail-label">Max Tokens</span>
                  <span className="detail-value">2000</span>
                </div>
                
                <div className="analysis-detail">
                  <span className="detail-label">Top P</span>
                  <span className="detail-value">0.9</span>
                </div>
              </div>

              <div className="status-actions">
                <div className="status-badge" style={{ color: '#10b981' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                  </svg>
                  <span className="status-text">Optimizado</span>
                </div>
                
                <div className="analysis-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => {
                      handleConfigChange(selectedProvider, 'temperature', 0.2);
                      handleConfigChange(selectedProvider, 'maxTokens', 2000);
                      handleConfigChange(selectedProvider, 'topP', 0.9);
                    }}
                    title="Aplicar configuración"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            <div className="analysis-item">
              <div className="file-info">
                <div className="file-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <div className="file-details">
                  <h3 className="file-name">Generación Creativa</h3>
                  <div className="file-meta">
                    <span className="file-type">RECOMENDACIÓN</span>
                  </div>
                </div>
              </div>
              
              <div className="analysis-details">
                <div className="analysis-detail">
                  <span className="detail-label">Descripción</span>
                  <span className="detail-value">Temperatura alta para respuestas creativas</span>
                </div>
                
                <div className="analysis-detail">
                  <span className="detail-label">Temperatura</span>
                  <span className="detail-value">0.8</span>
                </div>
                
                <div className="analysis-detail">
                  <span className="detail-label">Max Tokens</span>
                  <span className="detail-value">1500</span>
                </div>
                
                <div className="analysis-detail">
                  <span className="detail-label">Top P</span>
                  <span className="detail-value">1.0</span>
                </div>
              </div>

              <div className="status-actions">
                <div className="status-badge" style={{ color: '#f59e0b' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <span className="status-text">Creativo</span>
                </div>
                
                <div className="analysis-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => {
                      handleConfigChange(selectedProvider, 'temperature', 0.8);
                      handleConfigChange(selectedProvider, 'maxTokens', 1500);
                      handleConfigChange(selectedProvider, 'topP', 1.0);
                    }}
                    title="Aplicar configuración"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción principales */}
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
            onClick={() => window.location.href = '/historial-analisis'}
            title="Ver historial de análisis"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15v3m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfiguration;
