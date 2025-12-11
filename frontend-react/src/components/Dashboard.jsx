import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSweetAlert } from '../hooks/useSweetAlert';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showInfo } = useSweetAlert();

  const toolCategories = [
    {
      title: "Combinar y Organizar",
      description: "Gestiona múltiples documentos PDF de forma eficiente",
      icon: "📚",
      tools: [
        {
          id: 'merge-pdf',
          name: 'Unir Documentos',
          description: 'Combina varios PDFs en un solo archivo manteniendo el orden deseado',
          icon: '🔗',
          color: 'from-blue-500 to-blue-600'
        },
        {
          id: 'split-pdf',
          name: 'Separar Documentos',
          description: 'Extrae páginas específicas o divide cada página en archivos independientes',
          icon: '✂️',
          color: 'from-green-500 to-green-600'
        },
        {
          id: 'organize-pages',
          name: 'Organizar Páginas',
          description: 'Reordena, elimina o añade páginas según tus necesidades',
          icon: '📋',
          color: 'from-purple-500 to-purple-600'
        }
      ]
    },
    {
      title: "Optimizar y Comprimir",
      description: "Mejora la calidad y reduce el tamaño de tus documentos",
      icon: "⚡",
      tools: [
        {
          id: 'compress-pdf',
          name: 'Optimizar Tamaño',
          description: 'Reduce el peso del documento manteniendo la máxima calidad posible',
          icon: '🗜️',
          color: 'from-orange-500 to-orange-600'
        },
        {
          id: 'repair-pdf',
          name: 'Restaurar Documento',
          description: 'Repara archivos PDF dañados y recupera datos perdidos',
          icon: '🔧',
          color: 'from-red-500 to-red-600'
        }
      ]
    },
    {
      title: "Convertir a PDF",
      description: "Transforma otros formatos al estándar PDF",
      icon: "➡️",
      tools: [
        {
          id: 'word-to-pdf',
          name: 'Word a PDF',
          description: 'Convierte documentos DOCX a PDF manteniendo formato y calidad',
          icon: '📄',
          color: 'from-indigo-500 to-indigo-600'
        },
        {
          id: 'ppt-to-pdf',
          name: 'PowerPoint a PDF',
          description: 'Transforma presentaciones PPTX a PDF de alta calidad',
          icon: '📊',
          color: 'from-pink-500 to-pink-600'
        },
        {
          id: 'excel-to-pdf',
          name: 'Excel a PDF',
          description: 'Convierte hojas de cálculo a PDF con columnas ajustadas',
          icon: '📈',
          color: 'from-teal-500 to-teal-600'
        },
        {
          id: 'html-to-pdf',
          name: 'Web a PDF',
          description: 'Convierte páginas web HTML a PDF copiando la URL',
          icon: '🌐',
          color: 'from-cyan-500 to-cyan-600'
        },
        {
          id: 'image-to-pdf',
          name: 'Imágenes a PDF',
          description: 'Convierte imágenes JPG a PDF con orientación personalizable',
          icon: '🖼️',
          color: 'from-yellow-500 to-yellow-600'
        }
      ]
    },
    {
      title: "Convertir desde PDF",
      description: "Extrae y convierte contenido de documentos PDF",
      icon: "⬅️",
      tools: [
        {
          id: 'pdf-to-word',
          name: 'PDF a Word',
          description: 'Convierte PDFs a documentos DOCX completamente editables',
          icon: '📝',
          color: 'from-blue-600 to-blue-700'
        },
        {
          id: 'pdf-to-ppt',
          name: 'PDF a PowerPoint',
          description: 'Transforma PDFs a presentaciones PPTX editables',
          icon: '🎯',
          color: 'from-purple-600 to-purple-700'
        },
        {
          id: 'pdf-to-excel',
          name: 'PDF a Excel',
          description: 'Extrae datos tabulares de PDF a hojas de cálculo Excel',
          icon: '📊',
          color: 'from-green-600 to-green-700'
        },
        {
          id: 'pdf-to-images',
          name: 'PDF a Imágenes',
          description: 'Extrae todas las imágenes o convierte cada página a JPG',
          icon: '🖼️',
          color: 'from-orange-600 to-orange-700'
        }
      ]
    },
    {
      title: "Editar y Personalizar",
      description: "Modifica y personaliza tus documentos PDF",
      icon: "✏️",
      tools: [
        {
          id: 'edit-pdf',
          name: 'Editor Avanzado',
          description: 'Añade texto, imágenes, formas y anotaciones personalizadas',
          icon: '🎨',
          color: 'from-pink-600 to-pink-700'
        },
        {
          id: 'sign-pdf',
          name: 'Firmar Documento',
          description: 'Aplica firmas electrónicas propias o solicita firmas de terceros',
          icon: '✍️',
          color: 'from-indigo-600 to-indigo-700'
        },
        {
          id: 'watermark',
          name: 'Marca de Agua',
          description: 'Inserta imágenes o texto con posición y transparencia personalizables',
          icon: '💧',
          color: 'from-teal-600 to-teal-700'
        },
        {
          id: 'rotate-pdf',
          name: 'Rotar Páginas',
          description: 'Rota documentos individuales o múltiples archivos simultáneamente',
          icon: '🔄',
          color: 'from-cyan-600 to-cyan-700'
        }
      ]
    },
    {
      title: "Gestión y Seguridad",
      description: "Controla el acceso y protección de tus documentos",
      icon: "🔒",
      tools: [
        {
          id: 'protect-pdf',
          name: 'Proteger con Contraseña',
          description: 'Encripta archivos PDF para evitar accesos no autorizados',
          icon: '🔐',
          color: 'from-red-600 to-red-700'
        },
        {
          id: 'unlock-pdf',
          name: 'Desbloquear PDF',
          description: 'Elimina contraseñas de PDF protegidos para uso libre',
          icon: '🔓',
          color: 'from-yellow-600 to-yellow-700'
        },
        {
          id: 'page-numbers',
          name: 'Numeración de Páginas',
          description: 'Añade números de página con posición y formato personalizable',
          icon: '#️⃣',
          color: 'from-purple-600 to-purple-700'
        },
        {
          id: 'crop-pdf',
          name: 'Recortar Documento',
          description: 'Elimina márgenes o selecciona áreas específicas para modificar',
          icon: '✂️',
          color: 'from-green-600 to-green-700'
        }
      ]
    },
    {
      title: "Procesamiento Especializado",
      description: "Herramientas avanzadas para necesidades específicas",
      icon: "🔬",
      tools: [
        {
          id: 'ocr-pdf',
          name: 'Reconocimiento de Texto',
          description: 'Convierte PDF escaneados en documentos con texto seleccionable',
          icon: '👁️',
          color: 'from-blue-700 to-blue-800'
        },
        {
          id: 'scan-to-pdf',
          name: 'Escáner Móvil',
          description: 'Captura documentos desde móvil y los envía instantáneamente',
          icon: '📱',
          color: 'from-pink-700 to-pink-800'
        },
        {
          id: 'compare-pdf',
          name: 'Comparar Documentos',
          description: 'Compara dos archivos simultáneamente para identificar diferencias',
          icon: '⚖️',
          color: 'from-orange-700 to-orange-800'
        },
        {
          id: 'censor-pdf',
          name: 'Censurar Información',
          description: 'Elimina permanentemente texto y gráficos sensibles',
          icon: '🚫',
          color: 'from-red-700 to-red-800'
        }
      ]
    },
    {
      title: "Análisis con Inteligencia Artificial",
      description: "Procesamiento inteligente de documentos con IA",
      icon: "🤖",
      tools: [
        {
          id: 'ai-analysis',
          name: 'Análisis Inteligente',
          description: 'Analiza documentos con IA para extraer insights y métricas avanzadas',
          icon: '🧠',
          color: 'from-violet-500 to-violet-600'
        },
        {
          id: 'ai-ocr',
          name: 'OCR Inteligente',
          description: 'Reconocimiento óptico con IA para máxima precisión en texto',
          icon: '🔍',
          color: 'from-emerald-500 to-emerald-600'
        },
        {
          id: 'ai-extract',
          name: 'Extracción Inteligente',
          description: 'Extrae datos específicos usando inteligencia artificial',
          icon: '🎯',
          color: 'from-amber-500 to-amber-600'
        }
      ]
    }
  ];

  const handleToolClick = (toolId) => {
    console.log('Herramienta seleccionada:', toolId);
    showInfo(
      'Funcionalidad en Desarrollo',
      `La herramienta "${toolId}" estará disponible próximamente. Esta es una vista previa del nuevo dashboard de EditorPDF.`
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              ¡Bienvenido a EditorPDF Pro! 
              <span className="title-highlight"> {user?.name || 'Usuario'}</span>
            </h1>
            <p className="dashboard-subtitle">
              Tu plataforma completa para el manejo profesional de documentos PDF
            </p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">25+</div>
                <div className="stat-label">Herramientas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <div className="stat-number">100%</div>
                <div className="stat-label">Gratuito</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <div className="stat-number">Seguro</div>
                <div className="stat-label">Privacidad</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Categorías */}
      <div className="dashboard-content">
        {toolCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="category-section">
            <div className="category-header">
              <div className="category-icon">{category.icon}</div>
              <div className="category-info">
                <h2 className="category-title">{category.title}</h2>
                <p className="category-description">{category.description}</p>
              </div>
            </div>
            
            <div className="tools-grid">
              {category.tools.map((tool, toolIndex) => (
                <div
                  key={toolIndex}
                  className="tool-card"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <div className={`tool-card-bg ${tool.color}`}></div>
                  <div className="tool-card-content">
                    <div className="tool-icon">{tool.icon}</div>
                    <h3 className="tool-name">{tool.name}</h3>
                    <p className="tool-description">{tool.description}</p>
                    <div className="tool-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer del Dashboard */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>EditorPDF Pro</h3>
            <p>La solución completa para el manejo profesional de documentos PDF</p>
          </div>
          <div className="footer-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Procesamiento Local</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Sin Límites de Tamaño</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Privacidad Garantizada</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Inteligencia Artificial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;