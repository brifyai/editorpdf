import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessibleButton from '../AccessibleButton';

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
            <div className="time-display-premium">
              <div className="time-text-premium">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
