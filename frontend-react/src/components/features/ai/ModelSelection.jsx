import React, { useState, useEffect } from 'react';
import AccessibleButton from '../../AccessibleButton';

const ModelSelection = () => {
  const [selectedModel, setSelectedModel] = useState('llama-3.1-70b-versatile');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar modelos reales desde el backend
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        
        // Obtener modelos desde el backend
        const response = await fetch('http://localhost:8080/api/available-models');
        const data = await response.json();
        
        if (data.success) {
          setModels(data.data);
        } else {
          // Fallback a modelos por defecto si falla la API
          setModels(getDefaultModels());
        }
      } catch (error) {
        console.error('Error cargando modelos:', error);
        // Fallback a modelos por defecto
        setModels(getDefaultModels());
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Modelos por defecto si falla la API
  const getDefaultModels = () => [
    {
      id: 'llama-3.1-70b-versatile',
      name: 'Llama 3.1 70B',
      provider: 'Groq',
      description: 'Modelo versátil para análisis de documentos',
      speed: 'Muy Rápido',
      accuracy: 'Alta'
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B',
      provider: 'Groq',
      description: 'Modelo eficiente para procesamiento de texto',
      speed: 'Rápido',
      accuracy: 'Alta'
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B',
      provider: 'Groq',
      description: 'Modelo rápido para tareas simples',
      speed: 'Muy Rápido',
      accuracy: 'Media'
    }
  ];

  if (loading) {
    return (
      <div className="model-selection">
        <div className="page-header">
          <h1 className="page-title">Selección de Modelos</h1>
          <p className="page-description">
            Cargando modelos disponibles...
          </p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando modelos de IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="model-selection">
      <div className="page-header">
        <h1 className="page-title">Selección de Modelos</h1>
        <p className="page-description">
          Elige el modelo de IA más adecuado para tu tarea
        </p>
      </div>

      <div className="models-grid">
        {models.map((model) => (
          <div 
            key={model.id}
            className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => setSelectedModel(model.id)}
          >
            <div className="model-header">
              <h3>{model.name}</h3>
              <span className="model-provider">{model.provider}</span>
            </div>
            <p className="model-description">{model.description}</p>
            <div className="model-stats">
              <span className="stat">Velocidad: {model.speed}</span>
              <span className="stat">Precisión: {model.accuracy}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="selection-actions">
        <AccessibleButton variant="primary">
          Aplicar Modelo Seleccionado
        </AccessibleButton>
      </div>
    </div>
  );
};

export default ModelSelection;
