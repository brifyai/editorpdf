import React, { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';

// Estado inicial para las estadísticas
const initialState = {
  documentsCount: 0,
  successRate: 0,
  activeModels: 0,
  averageResponseTime: 0,
  loading: true,
  lastUpdate: null,
  error: null
};

// Reducer para manejar el estado de las estadísticas
const statisticsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STATISTICS':
      return { 
        ...state, 
        ...action.payload, 
        loading: false, 
        error: null,
        lastUpdate: new Date().toISOString()
      };
    case 'UPDATE_STATISTICS':
      return { 
        ...state, 
        ...action.payload, 
        loading: false,
        lastUpdate: new Date().toISOString()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET_STATISTICS':
      return initialState;
    default:
      return state;
  }
};

// Crear el contexto
const StatisticsContext = createContext();

// Provider component
export const StatisticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(statisticsReducer, initialState);
  const [wsConnection, setWsConnection] = useState(null);

  // Función para cargar estadísticas desde el servidor
  const fetchStatistics = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/metrics`);
      const data = await response.json();
      
      if (data.success && data.data) {
        dispatch({ 
          type: 'SET_STATISTICS', 
          payload: {
            documentsCount: data.data.totalRequests || 0,
            successRate: data.data.successRate || 0,
            activeModels: data.data.activeModels || 0,
            averageResponseTime: data.data.averageResponseTime || 0
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Error al cargar estadísticas' });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Función para actualizar estadísticas en tiempo real
  const updateStatistics = useCallback((newData) => {
    dispatch({ type: 'UPDATE_STATISTICS', payload: newData });
  }, []);

  // Establecer conexión WebSocket
  useEffect(() => {
    // Verificar si estamos en un entorno que no soporta WebSockets (como Netlify)
    const isNetlify = window.location.hostname.includes('netlify.app') ||
                     window.location.hostname.includes('editorpdf.brifyai.com');
    
    // Si estamos en Netlify, no intentar conexión WebSocket y usar solo polling
    if (isNetlify) {
      console.log('🌐 Entorno Netlify detectado, usando solo polling para estadísticas');
      fetchStatistics();
      
      // Configurar polling para Netlify
      const pollingInterval = setInterval(() => {
        fetchStatistics();
      }, 30000); // Cada 30 segundos en Netlify
      
      return () => {
        clearInterval(pollingInterval);
      };
    }
    
    // Para entornos locales, intentar conexión WebSocket
    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'}/ws`;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('🔌 Conectado a WebSocket para estadísticas en tiempo real');
          setWsConnection(ws);
          reconnectAttempts = 0; // Resetear contador de reconexiones
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'STATISTICS_UPDATE') {
              updateStatistics(data.statistics);
            }
          } catch (error) {
            console.error('Error procesando mensaje WebSocket:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('🔌 WebSocket desconectado');
          setWsConnection(null);
          
          // Intentar reconectar solo si no hemos excedido el máximo de intentos
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`🔄 Intentando reconectar (${reconnectAttempts}/${maxReconnectAttempts})...`);
            setTimeout(connectWebSocket, 10000); // Esperar 10 segundos antes de reconectar
          } else {
            console.log('⚠️ Máximo de intentos de reconexión alcanzado, usando solo polling');
          }
        };
        
        ws.onerror = (error) => {
          console.error('❌ Error en WebSocket:', error);
          // No mostrar errores detallados en Netlify para evitar ruido en la consola
          if (!isNetlify) {
            console.error('Detalles del error:', error);
          }
        };
        
        return ws;
      } catch (error) {
        console.error('❌ Error creando conexión WebSocket:', error);
        return null;
      }
    };

    const ws = connectWebSocket();
    
    // Cargar estadísticas iniciales
    fetchStatistics();
    
    // Configurar polling como fallback
    const pollingInterval = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        fetchStatistics();
      }
    }, 15000); // Cada 15 segundos
    
    return () => {
      if (ws) {
        ws.close();
      }
      clearInterval(pollingInterval);
    };
  }, [fetchStatistics, updateStatistics]);

  // Función para refrescar manualmente las estadísticas
  const refreshStatistics = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const value = {
    ...state,
    fetchStatistics,
    updateStatistics,
    refreshStatistics,
    isConnected: wsConnection?.readyState === WebSocket.OPEN
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};

// Hook para usar el contexto
export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics debe ser usado dentro de un StatisticsProvider');
  }
  return context;
};

export default StatisticsContext;