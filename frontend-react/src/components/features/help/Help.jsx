import React, { useState, useCallback } from 'react';
import './Help.css';

const Help = () => {
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  const categories = [
    {
      id: 'getting-started',
      name: 'Primeros Pasos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
        </svg>
      ),
      color: '#10b981'
    },
    {
      id: 'documents',
      name: 'Análisis de Documentos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
        </svg>
      ),
      color: '#3b82f6'
    },
    {
      id: 'ocr',
      name: 'OCR y Conversión',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      color: '#8b5cf6'
    },
    {
      id: 'ai',
      name: 'Inteligencia Artificial',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
        </svg>
      ),
      color: '#f59e0b'
    },
    {
      id: 'batch',
      name: 'Procesamiento por Lotes',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
      color: '#06b6d4'
    },
    {
      id: 'api',
      name: 'API y Integraciones',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      ),
      color: '#ef4444'
    },
    {
      id: 'troubleshooting',
      name: 'Solución de Problemas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      color: '#84cc16'
    },
    {
      id: 'faq',
      name: 'Preguntas Frecuentes',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      color: '#6366f1'
    }
  ];

  const helpContent = {
    'getting-started': [
      {
        title: 'Bienvenido a la Plataforma',
        content: 'Esta plataforma te permite analizar documentos, procesar imágenes con OCR y utilizar inteligencia artificial para extraer información valiosa.',
        tags: ['introducción', 'primeros pasos']
      },
      {
        title: 'Cómo subir tu primer documento',
        content: 'Ve a la sección "Análisis de Documentos" y arrastra tu archivo o haz clic en "Seleccionar archivo". Soportamos PDF, DOCX, TXT y más.',
        tags: ['subir', 'documentos', 'archivos']
      },
      {
        title: 'Configurar tu cuenta',
        content: 'Accede a Configuración para personalizar tu perfil, preferencias de notificación y configuración de IA.',
        tags: ['configuración', 'perfil', 'cuenta']
      }
    ],
    'documents': [
      {
        title: 'Formatos soportados',
        content: 'Soportamos PDF, DOCX, DOC, TXT, RTF, ODT y más. Para imágenes: JPG, PNG, WebP, TIFF.',
        tags: ['formatos', 'soporte', 'archivos']
      },
      {
        title: 'Tipos de análisis disponibles',
        content: 'Ofrecemos análisis completo, solo texto, extracción de tablas, metadatos y análisis personalizado con IA.',
        tags: ['análisis', 'tipos', 'ia']
      },
      {
        title: 'Interpretar resultados',
        content: 'Los resultados incluyen texto extraído, tablas estructuradas, metadatos y análisis de IA con puntuación de confianza.',
        tags: ['resultados', 'interpretación', 'confianza']
      }
    ],
    'ocr': [
      {
        title: '¿Qué es OCR?',
        content: 'OCR (Reconocimiento Óptico de Caracteres) convierte imágenes con texto en texto editable y buscable.',
        tags: ['ocr', 'conceptos', 'básico']
      },
      {
        title: 'Idiomas soportados',
        content: 'Soporte para más de 50 idiomas incluyendo español, inglés, francés, alemán, portugués y más.',
        tags: ['idiomas', 'soporte', 'internacional']
      },
      {
        title: 'Mejorar precisión de OCR',
        content: 'Usa imágenes de alta resolución, buen contraste y texto claro. Evita imágenes borrosas o con distorsión.',
        tags: ['precisión', 'calidad', 'imágenes']
      }
    ],
    'ai': [
      {
        title: 'Modelos de IA disponibles',
        content: 'Ofrecemos GPT-4, Claude 3, Llama 2 y modelos locales. Cada uno tiene fortalezas específicas.',
        tags: ['modelos', 'ia', 'gpt', 'claude']
      },
      {
        title: 'Configurar modelos de IA',
        content: 'Ve a Configuración > IA para configurar tu proveedor preferido y ajustar parámetros como temperatura.',
        tags: ['configuración', 'parámetros', 'temperatura']
      },
      {
        title: 'Casos de uso de IA',
        content: 'Resumen de documentos, extracción de datos, análisis de sentimientos, clasificación y más.',
        tags: ['casos de uso', 'resumen', 'extracción']
      }
    ],
    'batch': [
      {
        title: 'Procesamiento por lotes',
        content: 'Analiza múltiples documentos simultáneamente para mayor eficiencia. Ideal para grandes volúmenes.',
        tags: ['lotes', 'múltiples', 'eficiencia']
      },
      {
        title: 'Programar tareas',
        content: 'Configura tareas automáticas para procesar documentos en horarios específicos.',
        tags: ['programar', 'automatización', 'horarios']
      },
      {
        title: 'Monitorear progreso',
        content: 'Visualiza el estado de tus lotes en tiempo real y recibe notificaciones al completar.',
        tags: ['monitoreo', 'progreso', 'notificaciones']
      }
    ],
    'api': [
      {
        title: 'Obtener clave de API',
        content: 'Ve a Configuración > API para generar y gestionar tus claves de acceso.',
        tags: ['api', 'clave', 'acceso']
      },
      {
        title: 'Endpoints disponibles',
        content: 'API REST para análisis de documentos, OCR, IA y gestión de archivos con documentación completa.',
        tags: ['endpoints', 'rest', 'documentación']
      },
      {
        title: 'Límites de uso',
        content: '1000 solicitudes por día para cuentas gratuitas. Contacta para límites personalizados.',
        tags: ['límites', 'uso', 'restricciones']
      }
    ],
    'troubleshooting': [
      {
        title: 'Archivo no se procesa',
        content: 'Verifica el formato, tamaño (máx 10MB) y que el archivo no esté corrupto. Prueba con otro archivo.',
        tags: ['error', 'archivo', 'formato']
      },
      {
        title: 'OCR con baja precisión',
        content: 'Mejora la calidad de imagen, aumenta el contraste y asegúrate de que el texto sea legible.',
        tags: ['ocr', 'precisión', 'calidad']
      },
      {
        title: 'Error de conexión con IA',
        content: 'Verifica tu clave de API en Configuración y tu conexión a internet.',
        tags: ['ia', 'conexión', 'api']
      }
    ],
    'faq': [
      {
        title: '¿Es gratuito?',
        content: 'Sí, ofrecemos un plan gratuito con límites. Planes premium disponibles para uso intensivo.',
        tags: ['gratuito', 'precios', 'planes']
      },
      {
        title: '¿Mis datos están seguros?',
        content: 'Sí, usamos cifrado end-to-end y no almacenamos tus documentos permanentemente.',
        tags: ['seguridad', 'privacidad', 'cifrado']
      },
      {
        title: '¿Puedo cancelar mi suscripción?',
        content: 'Sí, puedes cancelar en cualquier momento desde Configuración > Facturación.',
        tags: ['cancelar', 'suscripción', 'facturación']
      }
    ]
  };

  const simulateSearch = useCallback(() => {
    setIsSearching(true);
    setSearchProgress(0);

    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSearching(false);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setSearchProgress(100);
      setIsSearching(false);
    }, 1500);
  }, []);

  const getCurrentContent = () => {
    return helpContent[selectedCategory] || [];
  };

  const filteredContent = getCurrentContent().filter(item =>
    searchQuery === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const quickActions = [
    {
      title: 'Contactar Soporte',
      description: 'Habla con nuestro equipo de soporte',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      action: 'contact',
      color: '#10b981'
    },
    {
      title: 'Enviar Feedback',
      description: 'Ayúdanos a mejorar la plataforma',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      action: 'feedback',
      color: '#3b82f6'
    },
    {
      title: 'Ver Tutoriales',
      description: 'Aprende con videos paso a paso',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      ),
      action: 'tutorials',
      color: '#8b5cf6'
    },
    {
      title: 'Estado del Sistema',
      description: 'Verifica el estado de los servicios',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      action: 'status',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="help-container">
      <div className="help-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Centro de Ayuda</h1>
            <p>Encuentra respuestas, tutoriales y soporte para usar la plataforma</p>
          </div>
        </div>
      </div>

      <div className="help-search">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar en la ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && simulateSearch()}
            />
            <button 
              className="search-button" 
              onClick={simulateSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      <div className="help-content">
        <div className="help-sidebar">
          <div className="sidebar-header">
            <h3>Categorías</h3>
          </div>
          <nav className="category-nav">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="help-main">
          <div className="content-header">
            <h2>{categories.find(cat => cat.id === selectedCategory)?.name}</h2>
            <p>
              {searchQuery 
                ? `${filteredContent.length} resultado(s) para "${searchQuery}"`
                : `Artículos en esta categoría`
              }
            </p>
          </div>

          <div className="content-body">
            {filteredContent.length > 0 ? (
              <div className="articles-grid">
                {filteredContent.map((article, index) => (
                  <div key={index} className="article-card">
                    <div className="article-header">
                      <h3>{article.title}</h3>
                    </div>
                    <div className="article-content">
                      <p>{article.content}</p>
                    </div>
                    <div className="article-tags">
                      {article.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </div>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otros términos de búsqueda o explora las categorías</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="section-header">
          <h2>Acciones Rápidas</h2>
          <p>¿Necesitas ayuda inmediata? Estas opciones te conectarán con soporte</p>
        </div>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={() => console.log(`Action: ${action.action}`)}>
              <div className="action-icon" style={{ backgroundColor: `${action.color}20`, color: action.color }}>
                {action.icon}
              </div>
              <div className="action-content">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contact-section">
        <div className="contact-card">
          <div className="contact-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className="contact-content">
            <h3>¿No encuentras lo que buscas?</h3>
            <p>Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos rápidamente.</p>
            <div className="contact-methods">
              <div className="contact-method">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>soporte@plataforma.com</span>
              </div>
              <div className="contact-method">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+56 9 1234 5678</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="search-overlay">
          <div className="search-content">
            <div className="progress-circle">
              <svg width="80" height="80" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - searchProgress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                  className="progress-circle-animated"
                />
              </svg>
              <span className="progress-text">{Math.round(searchProgress)}%</span>
            </div>
            <p className="progress-message">Buscando en la documentación...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
