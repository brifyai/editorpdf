import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/mobile-optimizations.css';
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
        { icon: DocumentDuplicateIcon, label: 'Unir PDF', path: '/pdf/merge' },
        { icon: ScissorsIcon, label: 'Separar PDF', path: '/pdf/split' },
        { icon: DocumentTextIcon, label: 'Organizar PDF', path: '/pdf/organize' },
        { icon: ArrowDownTrayIcon, label: 'Optimizar PDF', path: '/pdf/compress' },
        { icon: WrenchScrewdriverIcon, label: 'Restaurar PDF', path: '/pdf/repair' },
        { icon: DocumentArrowUpIcon, label: 'Word a PDF', path: '/pdf/word-to-pdf' },
        { icon: PresentationChartBarIcon, label: 'PowerPoint a PDF', path: '/pdf/powerpoint-to-pdf' },
        { icon: TableCellsIcon, label: 'Excel a PDF', path: '/pdf/excel-to-pdf' },
        { icon: CloudArrowUpIcon, label: 'Web a PDF', path: '/pdf/web-to-pdf' },
        { icon: DocumentArrowDownIcon, label: 'PDF a Word', path: '/pdf/to-word' },
        { icon: PresentationChartBarIcon, label: 'PDF a PowerPoint', path: '/pdf/to-powerpoint' },
        { icon: TableCellsIcon, label: 'PDF a Excel', path: '/pdf/to-excel' },
        { icon: SparklesIcon, label: 'Editor Avanzado', path: '/pdf/advanced-editor' },
        { icon: PencilIcon, label: 'Firmar Documento', path: '/pdf/sign' },
        { icon: DocumentTextIcon, label: 'Marca de Agua', path: '/pdf/watermark' },
        { icon: ArrowDownTrayIcon, label: 'Rotar Páginas', path: '/pdf/rotate' },
        { icon: LockClosedIcon, label: 'Proteger con Contraseña', path: '/pdf/protect' },
        { icon: EyeSlashIcon, label: 'Desbloquear PDF', path: '/pdf/unlock' },
        { icon: DocumentTextIcon, label: 'Numeración de Páginas', path: '/pdf/page-numbers' },
        { icon: ScissorsIcon, label: 'Recortar Documento', path: '/pdf/crop' },
        { icon: PhotoIcon, label: 'Reconocimiento de Texto', path: '/ocr/text' },
        { icon: CloudArrowUpIcon, label: 'Escáner Móvil', path: '/ocr/mobile-scanner' },
        { icon: ChartBarIcon, label: 'Comparar PDF', path: '/pdf/compare' },
        { icon: EyeSlashIcon, label: 'Censurar PDF', path: '/pdf/censor' },
        { icon: SparklesIcon, label: 'Extracción Inteligente', path: '/ai/extraction' }
      ]
    },
    {
      title: 'OCR e Imágenes',
      items: [
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
      <div className="mobile-drawer fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
        
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
              <div className="grid grid-cols-2 gap-2 px-3 md:grid-cols-2">
                {category.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex flex-col items-center justify-center px-2 py-3 text-center transition-all duration-200 rounded-lg border min-h-[85px] ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mb-2 text-gray-500 flex-shrink-0" />
                    <span className="text-xs font-medium leading-tight break-words px-1">{item.label}</span>
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