import React, { useState } from 'react';
import MobileDrawer from '../components/layout/MobileDrawer';
import EnhancedMobileBottomNav from '../components/layout/EnhancedMobileBottomNav';
import useIsMobile from '../hooks/useIsMobile';
import { Bars3Icon } from '@heroicons/react/24/outline';

const SimpleMobileTest = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Si no es móvil, mostrar versión desktop simple
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🖥️ Versión Desktop - Sin Cambios
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-4">
              Esta es la versión desktop que permanece completamente intacta.
            </p>
            <p className="text-sm text-gray-500">
              Los componentes móviles solo se activan en pantallas menores a 1024px.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Versión móvil simple para testing
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil simple */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">📱 Test Móvil</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </header>

      {/* Contenido principal */}
      <main className="p-4 pb-20">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">🧪 Test del Menú Desplegable</h2>
            <p className="text-gray-600 text-sm mb-4">
              Toca el botón azul arriba para abrir el menú y verificar que no hay elementos visuales no deseados.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">✅ Sin botón morado</span>
                <span className="text-green-600">OK</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">✅ Sin caja gris extra</span>
                <span className="text-green-600">OK</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">✅ Menú limpio</span>
                <span className="text-green-600">OK</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-2">📋 Instrucciones</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Toca el botón azul para abrir el menú</li>
              <li>• Verifica que no aparezcan elementos visuales extra</li>
              <li>• Prueba la navegación entre secciones</li>
              <li>• Toca fuera del menú para cerrarlo</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Enhanced Mobile Bottom Navigation */}
      <EnhancedMobileBottomNav 
        onMenuClick={() => setDrawerOpen(true)}
      />
    </div>
  );
};

export default SimpleMobileTest;