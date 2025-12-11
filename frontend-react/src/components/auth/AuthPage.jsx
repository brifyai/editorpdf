import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AccessibleButton from '../AccessibleButton';
import AccessibleInput from '../AccessibleInput';
import '../../styles/auth.css';
import '../../styles/styles.css';
import '../../styles/ui-improvements.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success('¡Bienvenido de vuelta!');
        navigate('/');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        
        // Preparar datos para registro
        const userData = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          avatarUrl: formData.avatarUrl
        };
        
        await signUp(userData);
        toast.success('¡Cuenta creada exitosamente!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      username: '',
      phone: '',
      avatarUrl: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="auth-branding">
          <div className="auth-logo">
          </div>
          <h1>PDF AI Analyzer</h1>
          <p>Transforma tus documentos con inteligencia artificial avanzada</p>
          <div className="auth-features">
            <div className="auth-feature">
              <div>
                <h3>Análisis con IA</h3>
                <p>Procesamiento inteligente de documentos</p>
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">🔍</span>
              <div>
                <h3>OCR Avanzado</h3>
                <p>Reconocimiento de texto en imágenes</p>
              </div>
            </div>
            <div className="auth-feature">
              <div>
                <h3>Estadísticas</h3>
                <p>Insights y métricas detalladas</p>
              </div>
            </div>
            <div className="auth-feature">
              <div>
                <h3>Procesamiento Rápido</h3>
                <p>Análisis en tiempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-right-panel">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <span>{isLogin ? '🔐' : '👤'}</span>
            </div>
            <h1>{isLogin ? 'Bienvenido de Nuevo' : 'Crear Cuenta'}</h1>
            <p>{isLogin ? 'Accede a tu cuenta para continuar' : 'Comienza tu experiencia con PDF AI Analyzer'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="form-group">
                  <AccessibleInput
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Nombre"
                    required
                    label="Nombre"
                  />
                </div>

                <div className="form-group">
                  <AccessibleInput
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Apellido"
                    required
                    label="Apellido"
                  />
                </div>

                <div className="form-group">
                  <AccessibleInput
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nombre de usuario"
                    required
                    label="Nombre de usuario"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <AccessibleInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
                required
                label="Correo electrónico"
              />
            </div>

            <div className="form-group">
              <AccessibleInput
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
                required
                label="Contraseña"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <AccessibleInput
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmar contraseña"
                  required
                  label="Confirmar contraseña"
                />
              </div>
            )}

            {!isLogin && (
              <>
                <div className="form-group">
                  <AccessibleInput
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Teléfono (opcional)"
                    label="Teléfono"
                  />
                </div>

                <div className="form-group">
                  <AccessibleInput
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="URL de avatar (opcional)"
                    label="URL de Avatar"
                  />
                </div>
              </>
            )}

            <AccessibleButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </AccessibleButton>
          </form>

          <div className="auth-footer">
            <p className="auth-toggle">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-toggle-btn"
              >
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
