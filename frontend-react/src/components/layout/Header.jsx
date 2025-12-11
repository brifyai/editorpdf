import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AccessibleButton from '../AccessibleButton';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState([
    { id: 1, text: 'Análisis completado con éxito', type: 'success', time: '2 min' },
    { id: 2, text: 'Nuevo modelo IA disponible', type: 'info', time: '15 min' },
    { id: 3, text: 'Proceso batch finalizado', type: 'success', time: '1 hora' }
  ]);

  // Efecto para detectar scroll y añadir estilo glass
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para actualizar el tiempo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown-premium')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/auth');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    const fullName = user?.user_metadata?.full_name || user?.email || 'U';
    return fullName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <header className={`premium-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="header-left">
            <button
              className="menu-toggle-premium"
              onClick={toggleMobileMenu}
              aria-label="Toggle sidebar"
            >
              <div className={`hamburger-premium ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
            
            <div className="logo-premium">
              <div className="logo-text-premium">
                <span className="brand-title-premium">PDF Analyzer Pro</span>
                <span className="brand-subtitle-premium">AI-Powered Analysis</span>
              </div>
            </div>
          </div>

          <div className="header-center">
            {/* Espacio vacío para centrar el logo */}
          </div>

          <div className="header-right">
            <div className="user-dropdown-premium">
              <button
                className="user-avatar-premium"
                onClick={toggleUserDropdown}
                aria-label="User menu"
              >
                <div className="avatar-glow-premium">
                  <div className="avatar-circle-premium">
                    {getUserInitials()}
                  </div>
                  <div className="avatar-ring-premium"></div>
                  <div className="avatar-pulse-premium"></div>
                </div>
              </button>
              
              <div className={`dropdown-menu-premium ${isUserDropdownOpen ? 'active' : ''}`}>
                <div className="dropdown-header-premium">
                  <div className="user-avatar-large-premium">
                    {getUserInitials()}
                  </div>
                  <div className="user-info-premium">
                    <div className="user-name-premium">
                      {user?.user_metadata?.full_name || 'Usuario'}
                    </div>
                    <div className="user-email-premium">{user?.email || 'usuario@ejemplo.com'}</div>
                    <div className="user-status-premium">
                      <span className="status-indicator-premium online"></span>
                      <span className="status-text-premium">Activo ahora</span>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-items-premium">
                  <button
                    className="dropdown-item-premium"
                    onClick={() => {
                      navigate('/settings');
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-premium">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="item-content-premium">
                      <span className="item-title-premium">Mi Perfil</span>
                      <span className="item-description-premium">Gestionar información personal</span>
                    </div>
                  </button>
                  
                  <button
                    className="dropdown-item-premium"
                    onClick={() => {
                      navigate('/settings');
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-premium">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m4.22-13.22 4.24 4.24M1.54 8.54l4.24 4.24M20.46 15.46l-4.24 4.24M7.78 7.78 3.54 3.54"></path>
                      </svg>
                    </div>
                    <div className="item-content-premium">
                      <span className="item-title-premium">Configuración</span>
                      <span className="item-description-premium">Preferencias y ajustes</span>
                    </div>
                  </button>
                  
                  <div className="dropdown-divider-premium"></div>
                  
                  <button className="dropdown-item-premium logout-premium" onClick={handleSignOut}>
                    <div className="item-icon-premium">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </div>
                    <div className="item-content-premium">
                      <span className="item-title-premium">Cerrar Sesión</span>
                      <span className="item-description-premium">Salir de la aplicación</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
