import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <h2 className="footer-title">EditorPDF Pro</h2>
            <p className="footer-subtitle">
              La solución completa para el manejo profesional de documentos PDF
            </p>
          </div>
          
          <div className="footer-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span className="feature-text">Procesamiento Local</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span className="feature-text">Sin Límites de Tamaño</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span className="feature-text">Privacidad Garantizada</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span className="feature-text">Inteligencia Artificial</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>&copy; 2025 EditorPDF Pro. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;