import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentIcon, 
  CogIcon, 
  ChartBarIcon,
  PhotoIcon,
  SparklesIcon,
  FolderIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const OptimizedSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      category: 'Principal',
      items: [
        { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
        { icon: DocumentIcon, label: 'Documentos', path: '/documents' },
        { icon: FolderIcon, label: 'Historial', path: '/history' }
      ]
    },
    {
      category: 'Herramientas PDF',
      items: [
        { icon: DocumentIcon, label: 'Convertir PDF', path: '/pdf/convert' },
        { icon: DocumentIcon, label: 'Comprimir', path: '/pdf/compress' },
        { icon: DocumentIcon, label: 'Dividir', path: '/pdf/split' },
        { icon: DocumentIcon, label: 'Unir', path: '/pdf/merge' },
        { icon: DocumentIcon, label: 'Proteger', path: '/pdf/protect' }
      ]
    },
    {
      category: 'OCR e IA',
      items: [
        { icon: PhotoIcon, label: 'OCR', path: '/ocr' },
        { icon: SparklesIcon, label: 'Análisis IA', path: '/ai' },
        { icon: ChartBarIcon, label: 'Estadísticas', path: '/statistics' }
      ]
    },
    {
      category: 'Configuración',
      items: [
        { icon: CogIcon, label: 'Configuración', path: '/settings' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    } flex flex-col h-screen`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">PDF Tools Pro</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {category.category}
              </h3>
            )}
            <div className="space-y-1">
              {category.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-400 text-center">
            v2.1.0 - PDF Tools Pro
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedSidebar;