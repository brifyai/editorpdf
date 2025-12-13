import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../../contexts/StatisticsContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { documentsCount, successRate, activeModels, averageResponseTime } = useStatistics();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      console.log('Login attempt:', formData);
      
      // Usar la función de autenticación real del contexto
      const result = await signIn(formData.email, formData.password);
      
      if (result && result.user) {
        console.log('Login exitoso:', result.user);
        // Navegar al dashboard después del login exitoso
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: error.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Panel lateral izquierdo - información EditorPDF */}
      <div className="register-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <div className="logo-icon">📄</div>
            <h1 className="logo-text">EditorPDF</h1>
          </div>
          
          <div className="sidebar-main-content">
            <h2 className="sidebar-title">
              Editor de PDFs Inteligente
            </h2>
            <p className="sidebar-description">
              Transforma, edita y optimiza tus documentos PDF con herramientas avanzadas de inteligencia artificial.
            </p>
          </div>

          <div className="sidebar-features">
            <div className="feature-item">
              <div className="feature-icon">✏️</div>
              <div className="feature-text">
                <h3>Edición Avanzada</h3>
                <p>Modifica texto, imágenes y páginas fácilmente</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div className="feature-text">
                <h3>IA Integrada</h3>
                <p>Resumen automático y análisis de contenido</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <div className="feature-text">
                <h3>Conversión Inteligente</h3>
                <p>Convierte PDF a Word, Excel y más formatos</p>
              </div>
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat-item">
              <div className="stat-number">500K+</div>
              <div className="stat-label">PDFs Procesados</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Formatos Soportados</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Precisión IA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho con el formulario */}
      <div className="register-form-container">
        <div className="register-form-card">
          <div className="form-header">
            <div className="form-icon">🔐</div>
            <h2 className="form-title">Iniciar Sesión</h2>
            <p className="form-subtitle">Accede a tu cuenta de EditorPDF</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {errors.submit && (
              <div className="form-error-message">
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="ejemplo@correo.com"
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                required
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="form-footer">
            <p className="footer-text">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/registro')}
                className="footer-link"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;