import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../../contexts/StatisticsContext';
import '../../styles/auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { documentsCount, successRate, activeModels, averageResponseTime } = useStatistics();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      // Aquí iría la lógica de registro con Supabase
      console.log('Register attempt:', formData);
      
      // Simular delay de registro
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navegar al dashboard después del registro exitoso
      navigate('/');
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ submit: 'Error al crear la cuenta. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background Effects */}
      <div className="register-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      <div className="register-container">
        {/* Left Panel - Branding & Features */}
        <div className="register-left-panel">
          <div className="register-branding">
            <div className="register-logo">
              <div className="logo-icon">📄</div>
              <div className="logo-pulse"></div>
              <div className="logo-glow"></div>
            </div>
            
            <h1 className="register-brand-title">
              EditorPDF Pro
              <span className="brand-subtitle">Camilo Alegria</span>
            </h1>
            
            <p className="register-brand-description">
              Únete a miles de usuarios que confían en nuestra plataforma para el análisis inteligente de documentos PDF.
            </p>

            {/* Live Stats */}
            <div className="register-live-stats">
              <div className="stat-item">
                <div className="stat-value">{documentsCount.toLocaleString()}</div>
                <div className="stat-label">Documentos Analizados</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{successRate.toFixed(1)}%</div>
                <div className="stat-label">Precisión</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{activeModels}</div>
                <div className="stat-label">Modelos IA Activos</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{averageResponseTime.toFixed(1)}s</div>
                <div className="stat-label">Tiempo Promedio</div>
              </div>
            </div>

            {/* Features */}
            <div className="register-features">
              <div className="feature-item">
                <div className="feature-icon">🧠</div>
                <div className="feature-content">
                  <h3>IA Avanzada</h3>
                  <p>Análisis inteligente con modelos de última generación</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-content">
                  <h3>Procesamiento Rápido</h3>
                  <p>Resultados en segundos, no en minutos</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-content">
                  <h3>100% Seguro</h3>
                  <p>Tus documentos están protegidos y encriptados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="register-right-panel">
          <div className="register-form-card">
            <div className="form-header">
              <div className="form-icon">👤</div>
              <h2 className="form-title">Crear Cuenta</h2>
              <p className="form-subtitle">Comienza tu experiencia con EditorPDF Pro</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {errors.submit && (
                <div className="form-error-message">
                  {errors.submit}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Tu nombre completo"
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

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
                  placeholder="tu@email.com"
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

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  required
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="register-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta Gratuita'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="footer-link"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;