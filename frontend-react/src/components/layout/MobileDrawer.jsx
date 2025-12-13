import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  DocumentIcon,
  PhotoIcon,
  SparklesIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  ScissorsIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  EyeSlashIcon,
  PencilIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CloudArrowUpIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const MobileDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuCategories = [
    {
      title: 'Principal',
      items: [
        { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
        { icon: DocumentIcon, label: 'Documentos', path: '/documents' },
        { icon: FolderIcon, label: 'Historial', path: '/history' }
      ]
    },
    {
      title: 'Herramientas PDF',
      items: [
        { icon: DocumentArrowUpIcon, label: 'Convertir a PDF', path: '/pdf/convert' },
        { icon: DocumentArrowDownIcon, label: 'PDF a Word', path: '/pdf/to-word' },
        { icon: TableCellsIcon, label: 'PDF a Excel', path: '/pdf/to-excel' },
        { icon: PresentationChartBarIcon, label: 'PDF a PowerPoint', path: '/pdf/to-powerpoint' },
        { icon: ScissorsIcon, label: 'Dividir PDF', path: '/pdf/split' },
        { icon: DocumentDuplicateIcon, label: 'Unir PDFs', path: '/pdf/merge' },
        { icon: ArrowDownTrayIcon, label: 'Comprimir PDF', path: '/pdf/compress' },
        { icon: LockClosedIcon, label: 'Proteger PDF', path: '/pdf/protect' },
        { icon: EyeSlashIcon, label: 'Desbloquear PDF', path: '/pdf/unlock' },
        { icon: PencilIcon, label: 'Firmar PDF', path: '/pdf/sign' },
        { icon: DocumentTextIcon, label: 'Agregar Marca de Agua', path: '/pdf/watermark' },
        { icon: WrenchScrewdriverIcon, label: 'Reparar PDF', path: '/pdf/repair' }
      ]
    },
    {
      title: 'OCR e Imágenes',
      items: [
        { icon: PhotoIcon, label: 'OCR Texto', path: '/ocr/text' },
        { icon: DocumentIcon, label: 'Imagen a PDF', path: '/ocr/image-to-pdf' },
        { icon: DocumentTextIcon, label: 'Imagen a Word', path: '/ocr/image-to-docx' },
        { icon: CloudArrowUpIcon, label: 'Escáner Móvil', path: '/ocr/mobile-scanner' }
      ]
    },
    {
      title: 'Inteligencia Artificial',
      items: [
        { icon: SparklesIcon, label: 'Análisis IA', path: '/ai/analysis' },
        { icon: DocumentTextIcon, label: 'Extracción Inteligente', path: '/ai/extraction' },
        { icon: EyeSlashIcon, label: 'Censurar Información', path: '/ai/censor' },
        { icon: ChartBarIcon, label: 'Métricas IA', path: '/ai/metrics' }
      ]
    },
    {
      title: 'Herramientas Adicionales',
      items: [
        { icon: ScissorsIcon, label: 'Recortar Páginas', path: '/tools/crop' },
        { icon: ArrowDownTrayIcon, label: 'Numerar Páginas', path: '/tools/page-numbers' },
        { icon: DocumentDuplicateIcon, label: 'Organizar Páginas', path: '/tools/organize' },
        { icon: PhotoIcon, label: 'Rotar Páginas', path: '/tools/rotate' },
        { icon: CloudArrowUpIcon, label: 'Comparar Documentos', path: '/tools/compare' }
      ]
    },
    {
      title: 'Configuración',
      items: [
        { icon: CogIcon, label: 'Configuración', path: '/settings' },
        { icon: ChartBarIcon, label: 'Estadísticas', path: '/statistics' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
        
        {/* Header - Sin botón de cerrar para evitar elementos visuales */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Menú Principal</h2>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            PDF Tools Pro v2.1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;