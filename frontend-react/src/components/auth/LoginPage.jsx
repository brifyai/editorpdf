import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessibleButton from '../AccessibleButton';
import '../../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aquí iría la lógica de autenticación con Supabase
      // Por ahora solo simulamos el proceso
      console.log('Login attempt:', formData);
      
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navegar al dashboard después del login exitoso
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Acceso</h1>
            <p className="auth-subtitle">Ingresa a tu cuenta de EditorPDF Pro</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                className="form-input"
                placeholder="tu@email.com"
                required
              />
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
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <AccessibleButton
              type="submit"
              variant="primary"
              size="large"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </AccessibleButton>
          </form>

          <div className="auth-footer">
            <p className="auth-text">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="auth-link"
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