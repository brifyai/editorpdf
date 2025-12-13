import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon,
  DocumentIcon,
  PhotoIcon,
  SparklesIcon,
  Bars3Icon,
  CogIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentIcon as DocumentIconSolid,
  PhotoIcon as PhotoIconSolid,
  SparklesIcon as SparklesIconSolid,
  CogIcon as CogIconSolid,
  FolderIcon as FolderIconSolid
} from '@heroicons/react/24/solid';

const EnhancedMobileBottomNav = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      label: 'Inicio',
      path: '/dashboard'
    },
    {
      icon: DocumentIcon,
      activeIcon: DocumentIconSolid,
      label: 'PDF',
      path: '/pdf'
    },
    {
      icon: PhotoIcon,
      activeIcon: PhotoIconSolid,
      label: 'OCR',
      path: '/ocr'
    },
    {
      icon: SparklesIcon,
      activeIcon: SparklesIconSolid,
      label: 'IA',
      path: '/ai'
    },
    {
      icon: FolderIcon,
      activeIcon: FolderIconSolid,
      label: 'Docs',
      path: '/documents'
    },
    {
      icon: CogIcon,
      activeIcon: CogIconSolid,
      label: 'Más',
      path: '/settings',
      isMenu: true
    }
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleClick = (item) => {
    if (item.isMenu) {
      onMenuClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          const IconComponent = active ? item.activeIcon : item.icon;
          
          return (
            <button
              key={index}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedMobileBottomNav;