import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook personalizado para manejo de llamadas API
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Métodos y estado para llamadas API
 */
export const useApi = (options = {}) => {
  const {
    baseURL = '',
    defaultHeaders = {},
    onError = () => {},
    onSuccess = () => {},
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error en la petición';
      setError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseURL, defaultHeaders, onError, onSuccess]);

  const get = useCallback((endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'GET' });
  }, [request]);

  const post = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [request]);

  const put = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [request]);

  const del = useCallback((endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'DELETE' });
  }, [request]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
    reset,
  };
};

export default useApi;