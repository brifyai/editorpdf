import React from 'react';
import MobileLayout from '../components/layout/MobileLayout';
import MobileDrawer from '../components/layout/MobileDrawer';
import EnhancedMobileBottomNav from '../components/layout/EnhancedMobileBottomNav';
import useIsMobile from '../hooks/useIsMobile';
import '../styles/mobile-optimizations.css';

const MobileExample = () => {
  const isMobile = useIsMobile();

  // Si no es móvil, mostrar versión desktop normal
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Versión Desktop - Sin Cambios
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Esta es la versión desktop que permanece completamente intacta. 
              Los componentes móviles solo se activan en pantallas menores a 1024px.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Versión móvil con todos los componentes optimizados
  return (
    <MobileLayout>
      <div className="space-y-4">
        {/* Header móvil optimizado */}
        <div className="mobile-card">
          <h2 className="mobile-card-title">📱 Versión Móvil Optimizada</h2>
          <p className="mobile-card-description">
            Esta versión se activa automáticamente en dispositivos móviles. 
            Incluye drawer lateral, navegación inferior mejorada y UI optimizada para touch.
          </p>
        </div>

        {/* Funcionalidades principales */}
        <div className="mobile-card">
          <h3 className="mobile-card-title">🔧 Funcionalidades Móviles</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Drawer lateral completo</span>
              <span className="text-green-600 text-sm">✅</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Navegación inferior mejorada</span>
              <span className="text-green-600 text-sm">✅</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">UI optimizada para touch</span>
              <span className="text-green-600 text-sm">✅</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gestos y animaciones</span>
              <span className="text-green-600 text-sm">✅</span>
            </div>
          </div>
        </div>

        {/* Herramientas PDF */}
        <div className="mobile-card">
          <h3 className="mobile-card-title">📄 Herramientas PDF</h3>
          <div className="mobile-grid mobile-grid-2">
            <button className="mobile-button mobile-button-primary">
              Convertir PDF
            </button>
            <button className="mobile-button mobile-button-secondary">
              Comprimir
            </button>
            <button className="mobile-button mobile-button-secondary">
              Dividir
            </button>
            <button className="mobile-button mobile-button-secondary">
              Unir
            </button>
          </div>
        </div>

        {/* OCR e IA */}
        <div className="mobile-card">
          <h3 className="mobile-card-title">🤖 OCR e Inteligencia Artificial</h3>
          <div className="space-y-2">
            <button className="mobile-button mobile-button-primary w-full">
              📷 OCR Texto
            </button>
            <button className="mobile-button mobile-button-secondary w-full">
              ✨ Análisis IA
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mobile-card">
          <h3 className="mobile-card-title">📋 Cómo Usar</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Menú principal:</strong> Toca el botón "Más" en la navegación inferior</p>
            <p>• <strong>Navegación:</strong> Usa los iconos de la barra inferior</p>
            <p>• <strong>Drawer:</strong> Se desliza desde la izquierda con todas las opciones</p>
            <p>• <strong>Desktop:</strong> Permanece sin cambios, usa tu layout actual</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileExample;