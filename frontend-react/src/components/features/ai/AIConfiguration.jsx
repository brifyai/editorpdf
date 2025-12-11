import React, { useState, useCallback, useEffect } from 'react';
import './AIConfiguration.css';
import { useAuth } from '../../../hooks/useAuth';
import { supabaseHelpers } from '../../../services/supabase';

const AIConfiguration = () => {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
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

  const testConnection = useCallback(() => {
    simulateProcessing();
  }, [simulateProcessing]);

  const saveConfiguration = useCallback(async () => {
    if (!user?.id) {
      console.error('Usuario no autenticado');
      showError('Error', 'Error: Usuario no autenticado');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Preparar configuración para enviar al backend
      const config = {
        user_id: user.id,
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

      // Enviar al backend - USAR PUERTO CORRECTO 8080
      const response = await fetch(`http://localhost:8080/api/save-ai-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      // Verificar si la respuesta es exitosa antes de parsear JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de respuesta:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Intentar parsear JSON
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        // Si no puede parsear JSON, asumir éxito si el status es 200
        result = { message: 'Configuración guardada exitosamente' };
      }
      
      // Validar que el resultado tenga la estructura esperada
      if (result && result.success === false) {
        throw new Error(result.error || 'Error al guardar configuración');
      }

      console.log('✅ Configuración guardada exitosamente');
      alert('Configuración guardada correctamente');
      
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert(`Error al guardar la configuración: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [user, configuration]);

  const getCurrentProvider = () => {
    return providers.find(p => p.id === selectedProvider);
  };

  const getCurrentConfig = () => {
    return configuration[selectedProvider];
  };

  // Cargar configuración al montar el componente - CORREGIDO PARA USAR BACKEND
  useEffect(() => {
    const loadConfiguration = async () => {
      if (!user?.id) return;

      try {
        console.log('📂 Cargando configuración guardada para usuario:', user.id);
        
        // Intentar obtener configuración desde el backend - USAR PUERTO CORRECTO 8080
        const response = await fetch(`http://localhost:8080/api/get-ai-config/${user.id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('⚠️ No se pudo cargar configuración del backend:', response.status, errorText);
          return;
        }

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Error parseando JSON de configuración:', parseError);
          console.log('Respuesta completa:', await response.text());
          return;
        }
        
        if (result.success && result.data?.configuration) {
          const config = result.data.configuration;
          console.log('✅ Configuración cargada exitosamente:', config);
          
          setConfiguration(prev => ({
            ...prev,
            groq: {
              ...prev.groq,
              apiKey: config.groq_api_key || '',
              model: config.groq_model || prev.groq.model,
              temperature: config.groq_temperature || prev.groq.temperature,
              maxTokens: config.groq_max_tokens || prev.groq.maxTokens,
              stream: config.groq_stream !== undefined ? config.groq_stream : prev.groq.stream
            },
            chutes: {
              ...prev.chutes,
              apiKey: config.chutes_api_key || '',
              model: config.chutes_model || prev.chutes.model,
              temperature: config.chutes_temperature || prev.chutes.temperature,
              maxTokens: config.chutes_max_tokens || prev.chutes.maxTokens,
              stream: config.chutes_stream !== undefined ? config.chutes_stream : prev.chutes.stream
            }
          }));
        } else {
          console.log('ℹ️ No hay configuración guardada o está vacía');
        }
      } catch (error) {
        console.error('❌ Error cargando configuración:', error);
      }
    };

    loadConfiguration();
  }, [user]);

  return (
    <div className="ai-configuration-container">
      <div className="ai-configuration-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Configuración de IA</h1>
            <p>Gestiona tus modelos de inteligencia artificial y configuraciones</p>
          </div>
        </div>
      </div>

      <div className="providers-section">
        <div className="section-header">
          <h2>Proveedores de IA</h2>
          <p>Selecciona y configura tu proveedor de IA preferido</p>
        </div>

        <div className="providers-grid">
          {providers.map(provider => (
            <div 
              key={provider.id}
              className={`provider-card ${selectedProvider === provider.id ? 'selected' : ''}`}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <div className="provider-icon" style={{ backgroundColor: `${provider.color}20`, color: provider.color }}>
                {provider.icon}
              </div>
              <div className="provider-info">
                <h3>{provider.name}</h3>
                <p>{provider.description}</p>
              </div>
              <div className="provider-status">
                <div className={`status-indicator ${configuration[provider.id].apiKey ? 'connected' : 'disconnected'}`}>
                  <div className="status-dot"></div>
                  <span>{configuration[provider.id].apiKey ? 'Conectado' : 'Desconectado'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="configuration-section">
        <div className="config-header">
          <h2>Configuración de {getCurrentProvider()?.name}</h2>
          <p>Personaliza los parámetros para optimizar el rendimiento</p>
        </div>

        <div className="config-content">
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
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke="white"
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

      <div className="recommendations-section">
        <div className="section-header">
          <h2>Recomendaciones de Configuración</h2>
          <p>Configuraciones optimizadas para diferentes casos de uso</p>
        </div>

        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="rec-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h4>Análisis de Documentos</h4>
            <p>Temperatura baja (0.1-0.3) para respuestas precisas y consistentes</p>
            <div className="rec-config">
              <span>Temperatura: 0.2</span>
              <span>Max Tokens: 2000</span>
              <span>Top P: 0.9</span>
            </div>
          </div>

          <div className="recommendation-card">
            <div className="rec-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h4>Generación Creativa</h4>
            <p>Temperatura alta (0.7-1.0) para respuestas más creativas y diversas</p>
            <div className="rec-config">
              <span>Temperatura: 0.8</span>
              <span>Max Tokens: 1500</span>
              <span>Top P: 1.0</span>
            </div>
          </div>

          <div className="recommendation-card">
            <div className="rec-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h4>Extracción de Datos</h4>
            <p>Configuración precisa para extracción estructurada de información</p>
            <div className="rec-config">
              <span>Temperatura: 0.1</span>
              <span>Max Tokens: 1000</span>
              <span>Top P: 0.8</span>
            </div>
          </div>

          <div className="recommendation-card">
            <div className="rec-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h4>Conversación</h4>
            <p>Equilibrio entre creatividad y coherencia para chat natural</p>
            <div className="rec-config">
              <span>Temperatura: 0.6</span>
              <span>Max Tokens: 1500</span>
              <span>Top P: 0.95</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfiguration;
