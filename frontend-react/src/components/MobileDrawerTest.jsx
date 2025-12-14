import React, { useState } from 'react';
import MobileDrawer from './layout/MobileDrawer';
import { Bars3Icon } from '@heroicons/react/24/outline';

const MobileDrawerTest = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test MobileDrawer</h1>
        
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Bars3Icon className="w-5 h-5" />
          Abrir Menú
        </button>

        <p className="mt-4 text-gray-600">
          Haz clic en el botón para abrir el menú móvil con las herramientas PDF organizadas en 2 columnas.
        </p>
      </div>

      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default MobileDrawerTest;