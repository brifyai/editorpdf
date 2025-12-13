import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
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
      console.log('Register attempt:', formData);
      
      // Usar la función de registro real del contexto
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      
      if (result && result.user) {
        console.log('Registro exitoso:', result.user);
        // Navegar al dashboard después del registro exitoso
        navigate('/');
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrors({
        submit: error.message || 'Error al crear la cuenta. Inténtalo de nuevo.'
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
            <div className="form-icon">👤</div>
            <h2 className="form-title">Crear Cuenta</h2>
            <p className="form-subtitle">Regístrate en nuestra plataforma</p>
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
                placeholder="Ingresa tu nombre completo"
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
                placeholder="Mínimo 6 caracteres"
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
                placeholder="Repite tu contraseña"
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
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="form-footer">
            <p className="footer-text">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/acceso')}
                className="footer-link"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;