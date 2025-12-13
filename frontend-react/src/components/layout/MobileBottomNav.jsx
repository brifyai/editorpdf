import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: '🏠', label: 'Inicio', exact: true },
    { path: '/acceso', icon: '🔑', label: 'Acceso' },
    { path: '/registro', icon: '📝', label: 'Registro' },
    { path: '/configuracion', icon: '⚙️', label: 'Ajustes' }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`nav-item ${isActive(item) ? 'active' : ''}`}
          aria-label={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;