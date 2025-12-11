import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Scissors, Settings, Plus, Minus, Crown } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import EnhancedPDFPreview from './EnhancedPDFPreview';
import ProfessionalPDFViewer from './ProfessionalPDFViewer';
import PDFMarqueeCapture from './PDFMarqueeCapture';
import './SplitPDF.css';
import './SplitPDFEnhanced.css';

// Variables globales para el sistema de vistas previas
let useNativePreview = true;
let pdfObjectUrl = null;
let previewIframe = null;

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState('rango'); // 'rango', 'paginas', 'tamano'
  const [pageRanges, setPageRanges] = useState([]);
  const [customRanges, setCustomRanges] = useState([]);
  const [fixedRanges, setFixedRanges] = useState([]);
  const [pagesPerFile, setPagesPerFile] = useState(1);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [selectedPages, setSelectedPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [pagePreviews, setPagePreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [viewMode, setViewMode] = useState('previews'); // 'previews' | 'viewer'
  const [capturedAreas, setCapturedAreas] = useState([]);
  const [showProfessionalViewer, setShowProfessionalViewer] = useState(false);
  const { showSuccess, showError } = useSweetAlert();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');
    
    if (!pdfFile) {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    setFile({
      id: Date.now(),
      file: pdfFile,
      name: pdfFile.name,
      size: pdfFile.size
    });
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    const fileData = {
      id: Date.now(),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size
    };
    
    setFile(fileData);
    setLoadingPreviews(true);
    
    // Crear URL del archivo para vista previa nativa
    const objectUrl = URL.createObjectURL(selectedFile);
    pdfObjectUrl = objectUrl;
    useNativePreview = true; // Forzar uso de vista previa nativa
    
    try {
      console.log('🚀 Iniciando procesamiento RÁPIDO...');
      
      // Probar PDF.js para conteo de páginas
      const total = await getTotalPages(selectedFile);
      setTotalPages(total);
      
      // Inicializar selección
      const allPages = Array.from({ length: total }, (_, i) => i + 1);
      setSelectedPages(allPages);
      
      // NO generar vistas previas automáticamente - solo bajo demanda
      console.log('⚡ Listo para vistas previas bajo demanda...');
      setPagePreviews({}); // Empezar con vistas previas vacías
      
      const message = `Archivo cargado: ${total} páginas detectadas (vistas previas bajo demanda)`;
      showSuccess('Éxito', message);
      
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      showError('Error', 'Error procesando el archivo PDF');
    } finally {
      setLoadingPreviews(false);
    }
  };

  // 🚀 FUNCIÓN PRINCIPAL: Generar vistas previas REALES con EmbedPDF
  const generateNativePreviews = async (file, totalPages, previews, objectUrl) => {
    const maxPreviews = totalPages; // Generar vistas previas para TODAS las páginas
    
    console.log(`🎯 Generando ${maxPreviews} vistas previas REALES con EmbedPDF...`);
    
    // Para cada página, intentar primero con EmbedPDF
    for (let i = 1; i <= maxPreviews; i++) {
      try {
        console.log(`📄 Creando vista previa REAL para página ${i}...`);
        
        let previewData = null;
        
        // MÉTODO 0: Intentar con EmbedPDF primero
        try {
          previewData = await generateEmbedPDFPreview(file, i);
        } catch (embedError) {
          console.warn(`⚠️ EmbedPDF falló para página ${i}:`, embedError);
          
          // MÉTODO 1: Intentar con html2canvas + embed
          try {
            previewData = await captureWithHtml2CanvasEmbed(objectUrl, i);
          } catch (embedError) {
            console.warn(`⚠️ html2canvas + embed falló para página ${i}:`, embedError);
            
            // MÉTODO 2: Intentar con html2canvas + iframe
            try {
              previewData = await captureWithHtml2CanvasIframe(objectUrl, i);
            } catch (iframeError) {
              console.warn(`⚠️ html2canvas + iframe falló para página ${i}:`, iframeError);
              
              // MÉTODO 3: Intentar con visor nativo + html2canvas
              try {
                previewData = await captureWithNativeViewer(objectUrl, i);
              } catch (nativeError) {
                console.warn(`⚠️ Visor nativo + html2canvas falló para página ${i}:`, nativeError);
                
                // MÉTODO 4: Canvas directo como último recurso
                try {
                  previewData = await captureWithDirectCanvas(objectUrl, i);
                } catch (canvasError) {
                  console.warn(`⚠️ Canvas directo falló para página ${i}:`, canvasError);
                }
              }
            }
          }
        }
        
        if (previewData) {
          previews[i] = previewData;
          console.log(`✅ Vista previa REAL creada para página ${i}`);
        } else {
          console.warn(`⚠️ Todos los métodos fallaron para página ${i}, usando fallback...`);
          // Fallback a vista previa mejorada
          const fallbackPreview = await createEnhancedFallbackPreview(i, file.name);
          if (fallbackPreview) {
            previews[i] = fallbackPreview;
          }
        }
        
        // Pausa optimizada según el tamaño del documento
        const pauseTime = totalPages > 100 ? 200 : 400;
        await new Promise(resolve => setTimeout(resolve, pauseTime));
        
      } catch (error) {
        console.error(`❌ Error en vista previa REAL página ${i}:`, error);
        // Fallback a vista previa mejorada
        const fallbackPreview = await createEnhancedFallbackPreview(i, file.name);
        if (fallbackPreview) {
          previews[i] = fallbackPreview;
        }
      }
    }
    
    console.log(`🎉 Generación REAL completada: ${Object.keys(previews).length}/${maxPreviews} exitosas`);
  };

  // 🎯 FUNCIÓN EMBEDPDF: Generar vista previa usando EmbedPDF
  const generateEmbedPDFPreview = async (file, pageNumber) => {
    return new Promise((resolve) => {
      try {
        console.log(`🎯 Generando vista previa EmbedPDF página ${pageNumber}`);
        
        // Crear un contenedor temporal para EmbedPDF
        const tempContainer = document.createElement('div');
        tempContainer.id = `embedpdf-temp-${pageNumber}`;
        tempContainer.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 600px;
          height: 800px;
          z-index: -9999;
          background: white;
          overflow: hidden;
        `;
        document.body.appendChild(tempContainer);
        
        // Crear el componente EmbedPDFPreview de forma imperativa
        const embedComponent = React.createElement(EmbedPDFPreview, {
          file: file,
          pageNumber: pageNumber,
          onPreviewGenerated: (pageNum, previewUrl) => {
            console.log(`✅ EmbedPDF generó vista previa para página ${pageNum}`);
            document.body.removeChild(tempContainer);
            resolve(previewUrl);
          },
          width: 200,
          height: 280
        });
        
        // Renderizar el componente usando React DOM
        import('react-dom/client').then(({ createRoot }) => {
          const root = createRoot(tempContainer);
          root.render(embedComponent);
        }).catch(error => {
          console.error('Error cargando React DOM:', error);
          document.body.removeChild(tempContainer);
          resolve(null);
        });
        
        // Timeout por si no se genera la vista previa
        setTimeout(() => {
          if (document.body.contains(tempContainer)) {
            console.warn(`⏰ Timeout EmbedPDF para página ${pageNumber}`);
            document.body.removeChild(tempContainer);
            resolve(null);
          }
        }, 15000);
        
      } catch (error) {
        console.error(`❌ Error general EmbedPDF página ${pageNumber}:`, error);
        resolve(null);
      }
    });
  };

  // 🎯 MÉTODO 1: Capturar con html2canvas + embed mejorado
  const captureWithHtml2CanvasEmbed = async (objectUrl, pageNumber) => {
    console.log(`🎯 Método 1: html2canvas + embed mejorado para página ${pageNumber}`);
    
    return new Promise(async (resolve, reject) => {
      try {
        // Crear contenedor visible pero fuera de pantalla
        const container = document.createElement('div');
        container.id = `pdf-embed-container-${pageNumber}`;
        container.style.cssText = `
          position: fixed;
          top: -2000px;
          left: -2000px;
          width: 800px;
          height: 1000px;
          z-index: -9999;
          background: white;
          overflow: hidden;
          border: 1px solid #ddd;
          visibility: visible;
        `;
        document.body.appendChild(container);

        // Crear embed para el PDF con configuración mejorada
        const embed = document.createElement('embed');
        embed.src = `${objectUrl}#page=${pageNumber}&zoom=150&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;
        embed.type = 'application/pdf';
        embed.style.cssText = `
          width: 100%;
          height: 100%;
          background: white;
          border: none;
          display: block;
          visibility: visible;
        `;
        
        container.appendChild(embed);

        // Esperar más tiempo y verificar que el contenido se cargue
        await new Promise(resolve => {
          const checkLoad = () => {
            if (embed && embed.parentNode) {
              // Verificar que el embed tenga dimensiones
              const rect = embed.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                setTimeout(resolve, 3000); // 3 segundos adicionales después de cargar
              } else {
                setTimeout(checkLoad, 500);
              }
            } else {
              resolve();
            }
          };
          
          embed.onload = () => {
            console.log(`Embed cargado para página ${pageNumber}`);
            checkLoad();
          };
          
          embed.onerror = () => {
            console.warn(`Error cargando embed página ${pageNumber}`);
            resolve();
          };
          
          // Timeout máximo
          setTimeout(resolve, 8000);
        });

        // Capturar con html2canvas con configuración mejorada
        try {
          console.log(`Iniciando captura html2canvas para página ${pageNumber}`);
          
          const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 0.3, // Escala más pequeña para evitar problemas
            useCORS: true,
            allowTaint: false, // Cambiado a false para evitar problemas de seguridad
            foreignObjectRendering: false, // Deshabilitado para mayor compatibilidad
            logging: false,
            width: 800,
            height: 1000,
            windowWidth: 800,
            windowHeight: 1000,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc, element) => {
              console.log(`Clonando documento para página ${pageNumber}`);
              // Forzar visibilidad de todos los elementos
              const allElements = clonedDoc.querySelectorAll('*');
              allElements.forEach(el => {
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                el.style.display = el.style.display || 'block';
              });
              
              const clonedEmbed = clonedDoc.querySelector('embed');
              if (clonedEmbed) {
                clonedEmbed.style.visibility = 'visible';
                clonedEmbed.style.opacity = '1';
                clonedEmbed.style.display = 'block';
                clonedEmbed.style.width = '100%';
                clonedEmbed.style.height = '100%';
              }
            }
          });

          // Verificar que el canvas no esté vacío o negro
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Verificar si hay contenido (no todo negro o blanco)
          let hasContent = false;
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            // Si no es ni blanco puro ni negro puro, hay contenido
            if (!((r === 255 && g === 255 && b === 255) || (r === 0 && g === 0 && b === 0))) {
              hasContent = true;
              break;
            }
          }

          if (!hasContent) {
            console.warn(`Canvas vacío o negro para página ${pageNumber}`);
            document.body.removeChild(container);
            throw new Error('Canvas vacío o negro');
          }

          const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // Limpiar
          document.body.removeChild(container);
          
          console.log(`✅ html2canvas + embed exitoso para página ${pageNumber}`);
          resolve(previewUrl);

        } catch (canvasError) {
          console.warn(`Error en html2canvas para página ${pageNumber}:`, canvasError);
          if (container.parentNode) {
            document.body.removeChild(container);
          }
          reject(canvasError);
        }

      } catch (error) {
        console.error(`Error general en método embed para página ${pageNumber}:`, error);
        reject(error);
      }
    });
  };

  // 🎯 MÉTODO 2: Capturar con html2canvas + iframe mejorado
  const captureWithHtml2CanvasIframe = async (objectUrl, pageNumber) => {
    console.log(`🎯 Método 2: html2canvas + iframe mejorado para página ${pageNumber}`);
    
    return new Promise(async (resolve, reject) => {
      try {
        // Crear contenedor visible pero fuera de pantalla
        const container = document.createElement('div');
        container.id = `pdf-iframe-container-${pageNumber}`;
        container.style.cssText = `
          position: fixed;
          top: -2000px;
          left: -2000px;
          width: 800px;
          height: 1000px;
          z-index: -9999;
          background: white;
          overflow: hidden;
          border: 1px solid #ddd;
          visibility: visible;
        `;
        document.body.appendChild(container);

        // Crear iframe con configuración mejorada
        const iframe = document.createElement('iframe');
        iframe.src = `${objectUrl}#page=${pageNumber}&zoom=150&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;
        iframe.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
          background: white;
          visibility: visible;
        `;
        
        container.appendChild(iframe);

        // Esperar a que el iframe y su contenido carguen completamente
        await new Promise(resolve => {
          const checkIframeLoad = () => {
            try {
              if (iframe.contentDocument && iframe.contentDocument.body) {
                const body = iframe.contentDocument.body;
                const rect = body.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  setTimeout(resolve, 3000); // 3 segundos adicionales
                } else {
                  setTimeout(checkIframeLoad, 500);
                }
              } else {
                setTimeout(checkIframeLoad, 500);
              }
            } catch (e) {
              // Si no podemos acceder al contenido por seguridad, esperamos tiempo fijo
              setTimeout(resolve, 6000);
            }
          };
          
          iframe.onload = () => {
            console.log(`Iframe cargado para página ${pageNumber}`);
            checkIframeLoad();
          };
          
          iframe.onerror = () => {
            console.warn(`Error cargando iframe página ${pageNumber}`);
            resolve();
          };
          
          // Timeout máximo
          setTimeout(resolve, 10000);
        });

        // Intentar capturar el contenido del iframe
        try {
          console.log(`Intentando capturar iframe para página ${pageNumber}`);
          
          let canvas = null;
          let previewUrl = null;
          
          try {
            // Intentar acceder al contenido del iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            if (iframeDoc && iframeDoc.body) {
              console.log(`Accediendo al contenido del iframe para página ${pageNumber}`);
              
              // Capturar el body del iframe
              canvas = await html2canvas(iframeDoc.body, {
                backgroundColor: '#ffffff',
                scale: 0.3,
                useCORS: true,
                allowTaint: false,
                foreignObjectRendering: false,
                logging: false,
                width: 800,
                height: 1000,
                windowWidth: 800,
                windowHeight: 1000,
                onclone: (clonedDoc) => {
                  // Forzar visibilidad de todos los elementos
                  const allElements = clonedDoc.querySelectorAll('*');
                  allElements.forEach(el => {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                  });
                }
              });
            }
          } catch (securityError) {
            console.warn(`No se puede acceder al contenido del iframe por seguridad: ${securityError.message}`);
            
            // Capturar el iframe mismo como fallback
            canvas = await html2canvas(iframe, {
              backgroundColor: '#ffffff',
              scale: 0.3,
              useCORS: true,
              allowTaint: false,
              foreignObjectRendering: false,
              logging: false,
              width: 800,
              height: 1000
            });
          }

          if (canvas) {
            // Verificar que el canvas no esté vacío
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            let hasContent = false;
            for (let i = 0; i < pixels.length; i += 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              
              if (!((r === 255 && g === 255 && b === 255) || (r === 0 && g === 0 && b === 0))) {
                hasContent = true;
                break;
              }
            }

            if (!hasContent) {
              throw new Error('Canvas vacío o negro');
            }

            previewUrl = canvas.toDataURL('image/jpeg', 0.9);
          }
          
          // Limpiar
          document.body.removeChild(container);
          
          if (previewUrl) {
            console.log(`✅ html2canvas + iframe exitoso para página ${pageNumber}`);
            resolve(previewUrl);
          } else {
            throw new Error('No se generó preview');
          }

        } catch (captureError) {
          console.warn(`Error capturando iframe para página ${pageNumber}:`, captureError);
          if (container.parentNode) {
            document.body.removeChild(container);
          }
          reject(captureError);
        }

      } catch (error) {
        console.error(`Error general en método iframe para página ${pageNumber}:`, error);
        reject(error);
      }
    });
  };

  // 🎯 MÉTODO 3: Capturar con visor nativo + html2canvas
  const captureWithNativeViewer = async (objectUrl, pageNumber) => {
    console.log(`🎯 Método 3: Visor nativo + html2canvas para página ${pageNumber}`);
    
    return new Promise(async (resolve, reject) => {
      try {
        // Crear contenedor que simule un visor profesional
        const viewerContainer = document.createElement('div');
        viewerContainer.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 600px;
          height: 800px;
          z-index: -9999;
          background: white;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        `;
        
        // Header del visor
        const header = document.createElement('div');
        header.style.cssText = `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `;
        header.innerHTML = `
          <span>📄 Visor PDF</span>
          <span>Página ${pageNumber}</span>
        `;
        
        // Contenedor del PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.style.cssText = `
          flex: 1;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        `;
        
        // Embed del PDF
        const embed = document.createElement('embed');
        embed.src = `${objectUrl}#page=${pageNumber}&zoom=150&view=FitV`;
        embed.type = 'application/pdf';
        embed.style.cssText = `
          width: 100%;
          height: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        pdfContainer.appendChild(embed);
        viewerContainer.appendChild(header);
        viewerContainer.appendChild(pdfContainer);
        document.body.appendChild(viewerContainer);

        // Esperar a que todo se cargue
        await new Promise(resolve => {
          embed.onload = () => {
            setTimeout(resolve, 6000); // 6 segundos para visor nativo completo
          };
          embed.onerror = () => {
            console.warn(`Error cargando visor nativo página ${pageNumber}`);
            resolve();
          };
        });

        // Capturar con html2canvas
        try {
          const canvas = await html2canvas(viewerContainer, {
            backgroundColor: '#ffffff',
            scale: 0.5,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            logging: false,
            width: 600,
            height: 800,
            windowWidth: 600,
            windowHeight: 800,
            onclone: (clonedDoc) => {
              // Optimizar el documento clonado
              const clonedEmbed = clonedDoc.querySelector('embed');
              if (clonedEmbed) {
                clonedEmbed.style.visibility = 'visible';
                clonedEmbed.style.opacity = '1';
              }
            }
          });

          const previewUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Limpiar
          document.body.removeChild(viewerContainer);
          
          console.log(`✅ Visor nativo + html2canvas exitoso para página ${pageNumber}`);
          resolve(previewUrl);

        } catch (canvasError) {
          document.body.removeChild(viewerContainer);
          reject(canvasError);
        }

      } catch (error) {
        reject(error);
      }
    });
  };

  // 🎯 MÉTODO 4: Capturar con canvas directo
  const captureWithDirectCanvas = async (objectUrl, pageNumber) => {
    console.log(`🎯 Método 4: Canvas directo para página ${pageNumber}`);
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 280;
      const ctx = canvas.getContext('2d');
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 280);
      
      // Borde
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 200, 280);
      
      // Header rojo tipo documento
      ctx.fillStyle = '#dc3545';
      ctx.fillRect(0, 0, 200, 40);
      
      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DOCUMENTO PDF', 100, 25);
      
      // Contenido simulado
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(10, 50, 180, 200);
      
      // Líneas de texto simuladas
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const y = 70 + i * 20;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(180, y);
        ctx.stroke();
      }
      
      // Número de página
      ctx.fillStyle = '#6c757d';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Página ${pageNumber}`, 100, 265);
      
      const previewUrl = canvas.toDataURL('image/png');
      resolve(previewUrl);
    });
  };

  // 🖼️ Fallback mejorado con Canvas
  const createEnhancedFallbackPreview = async (pageNumber, fileName) => {
    console.log(`🎨 Creando fallback mejorado para página ${pageNumber}`);
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Dimensiones profesionales
      canvas.width = 300;
      canvas.height = 400;
      
      // Fondo blanco con gradiente sutil
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8f9fa');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Borde profesional
      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Header profesional con gradiente
      const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      headerGradient.addColorStop(0, '#dc3545');
      headerGradient.addColorStop(1, '#c82333');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, canvas.width, 45);
      
      // Icono y texto del header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📄', 15, 28);
      
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Página ${pageNumber}`, canvas.width / 2, 28);
      
      // Información del archivo
      ctx.fillStyle = '#6c757d';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      const truncatedName = fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;
      ctx.fillText(truncatedName, canvas.width - 10, 38);
      
      // Contenido del documento simulado
      ctx.fillStyle = '#495057';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      
      // Líneas de texto simuladas con variación
      const lineHeight = 16;
      const startY = 70;
      const lines = 12;
      
      for (let i = 0; i < lines; i++) {
        const y = startY + (i * lineHeight);
        const lineWidth = Math.random() * 0.5 + 0.4; // Ancho variable entre 40% y 90%
        
        // Primera línea más ancha y oscura (título)
        if (i === 0) {
          ctx.fillStyle = '#212529';
          ctx.font = 'bold 13px Arial';
          ctx.fillRect(20, y - 1, canvas.width * 0.85, 2);
        } else if (i === 1) {
          // Segunda línea (subtítulo)
          ctx.fillStyle = '#495057';
          ctx.font = '11px Arial';
          ctx.fillRect(20, y - 1, canvas.width * 0.7, 1);
        } else {
          // Resto de líneas (contenido)
          ctx.fillStyle = '#6c757d';
          ctx.font = '10px Arial';
          ctx.fillRect(20, y - 1, canvas.width * lineWidth, 1);
        }
      }
      
      // Elementos gráficos simulados
      ctx.fillStyle = '#e9ecef';
      ctx.fillRect(20, 270, 80, 60); // Rectángulo simulando imagen
      ctx.fillStyle = '#adb5bd';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🖼️', 60, 305);
      
      // Footer profesional
      const footerGradient = ctx.createLinearGradient(0, canvas.height - 35, 0, canvas.height);
      footerGradient.addColorStop(0, '#f8f9fa');
      footerGradient.addColorStop(1, '#e9ecef');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
      
      // Información del footer
      ctx.fillStyle = '#6c757d';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Documento PDF • ${totalPages} páginas totales`, canvas.width / 2, canvas.height - 15);
      
      // Efecto de sombra sutil
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
      ctx.globalAlpha = 1.0;
      
      const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(previewUrl);
    });
  };



  const removeFile = () => {
    setFile(null);
    setPageRanges([]);
    setCustomRanges([]);
    setFixedRanges([]);
    setSelectedPages([]);
    setTotalPages(0);
    setPagePreviews({});
    setLoadingPreviews(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 🚀 FUNCIÓN CORREGIDA: Obtener páginas del PDF de forma conservadora
  const getTotalPages = async (file) => {
    console.log('🔍 Iniciando detección CONSERVADORA de páginas...');
    
    // Método 0: Intentar usar PDF.js primero (el más confiable)
    try {
      console.log('📄 Método 0: Intentando con PDF.js...');
      
      // Cargar PDF.js dinámicamente
      if (typeof window.pdfjsLib === 'undefined') {
        console.log('📦 Cargando PDF.js...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Configurar worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      
      console.log(`✅ PDF.js detectó ${pageCount} páginas (MÉTODO MÁS CONFIABLE)`);
      return pageCount;
      
    } catch (pdfjsError) {
      console.warn('❌ PDF.js no disponible o falló:', pdfjsError);
    }
    
    // Método 1: Búsqueda SIMPLE y DIRECTA del Count
    try {
      console.log('📄 Método 1: Búsqueda simple de Count...');
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('latin1').decode(uint8Array);
      
      // Buscar SOLO el patrón más confiable
      const countMatch = text.match(/\/Count\s+(\d+)/);
      if (countMatch) {
        const pageCount = parseInt(countMatch[1]);
        if (pageCount > 0 && pageCount < 1000) { // Límite muy conservador
          console.log(`✅ Método 1 detectó ${pageCount} páginas (patrón Count)`);
          return pageCount;
        }
      }
      
    } catch (error) {
      console.warn('❌ Método 1 falló:', error);
    }
    
    // Método 2: Estimación ULTRA conservadora
    console.log('📊 Método 2: Estimación ULTRA conservadora...');
    
    const fileSizeMB = file.size / (1024 * 1024);
    const fileName = file.name.toLowerCase();
    
    // Estimación basada en tamaño REALISTA
    let estimatedPages;
    
    if (fileSizeMB > 50) {
      estimatedPages = Math.min(100, Math.ceil(file.size / 100000)); // Máximo 100 páginas, ~100KB por página
    } else if (fileSizeMB > 20) {
      estimatedPages = Math.min(80, Math.ceil(file.size / 80000)); // Máximo 80 páginas
    } else if (fileSizeMB > 10) {
      estimatedPages = Math.min(60, Math.ceil(file.size / 70000)); // Máximo 60 páginas
    } else if (fileSizeMB > 5) {
      estimatedPages = Math.min(40, Math.ceil(file.size / 60000)); // Máximo 40 páginas
    } else if (fileSizeMB > 1) {
      estimatedPages = Math.min(25, Math.ceil(file.size / 50000)); // Máximo 25 páginas
    } else {
      estimatedPages = Math.min(10, Math.ceil(file.size / 30000)); // Máximo 10 páginas para docs pequeños
    }
    
    // Ajustes específicos muy conservadores
    if (fileName.includes('factura') || fileName.includes('invoice')) {
      estimatedPages = Math.min(estimatedPages, 5); // Las facturas rara vez superan 5 páginas
    } else if (fileName.includes('contrato') || fileName.includes('contract')) {
      estimatedPages = Math.min(estimatedPages, 20); // Los contratos suelen ser cortos
    } else if (fileName.includes('informe') || fileName.includes('report')) {
      estimatedPages = Math.min(estimatedPages, 30); // Informes moderados
    } else if (fileName.includes('libro') || fileName.includes('book')) {
      estimatedPages = Math.min(estimatedPages, 50); // Límite para libros
    }
    
    // Límite absoluto muy estricto
    const maxAbsolutePages = Math.max(5, Math.ceil(fileSizeMB * 5)); // Máximo 5 páginas por MB
    estimatedPages = Math.max(1, Math.min(estimatedPages, maxAbsolutePages));
    
    console.log(`📊 Estimación ULTRA conservadora: ${estimatedPages} páginas para ${fileSizeMB.toFixed(2)}MB`);
    console.log(`📝 Límite absoluto: ${maxAbsolutePages} páginas`);
    
    return estimatedPages;
  };


  // ⚡ Función ULTRA RÁPIDA para generar vista previa bajo demanda
  const generatePreviewOnDemand = async (pageNumber) => {
    if (!file || pagePreviews[pageNumber]) {
      console.log(`Vista previa ya existe o no hay archivo para página ${pageNumber}`);
      return;
    }
    
    console.log(`⚡ Generando vista previa ULTRA RÁPIDA para página ${pageNumber}...`);
    
    try {
      let preview = null;
      
      // MÉTODO ULTRA RÁPIDO: Canvas directo optimizado (como iLovePDF)
      try {
        preview = await generateFastCanvasPreview(pageNumber);
      } catch (canvasError) {
        console.warn(`⚠️ Canvas rápido falló para página ${pageNumber}:`, canvasError);
        
        // Fallback: Canvas mejorado
        try {
          preview = await createEnhancedFallbackPreview(pageNumber, file.name);
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback falló para página ${pageNumber}:`, fallbackError);
        }
      }
      
      if (preview) {
        console.log(`✅ Vista previa ultra rápida generada para página ${pageNumber}`);
        setPagePreviews(prev => ({
          ...prev,
          [pageNumber]: preview
        }));
      } else {
        console.warn(`⚠️ No se pudo generar vista previa para página ${pageNumber}`);
      }
      
    } catch (error) {
      console.error(`❌ Error generando vista previa ultra rápida para página ${pageNumber}:`, error);
    }
  };

  // 🚀 Función de canvas ULTRA RÁPIDA (estilo iLovePDF)
  const generateFastCanvasPreview = async (pageNumber) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Dimensiones optimizadas como iLovePDF
      canvas.width = 180;
      canvas.height = 240;
      
      // Fondo blanco limpio
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Borde sutil
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Header profesional (estilo iLovePDF)
      const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      headerGradient.addColorStop(0, '#4285f4');
      headerGradient.addColorStop(1, '#1967d2');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, canvas.width, 35);
      
      // Icono de página
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📄', canvas.width / 2, 23);
      
      // Número de página destacado
      ctx.fillStyle = '#1967d2';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${pageNumber}`, canvas.width / 2, 60);
      
      // Contenido simulado (líneas de texto)
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 1;
      
      // Líneas de contenido
      for (let i = 0; i < 6; i++) {
        const y = 85 + (i * 18);
        const width = Math.random() * 0.4 + 0.5; // 50-90% de ancho
        
        ctx.beginPath();
        ctx.moveTo(15, y);
        ctx.lineTo(canvas.width - 15, y);
        ctx.stroke();
      }
      
      // Footer con información
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      
      ctx.fillStyle = '#666666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Página ${pageNumber} de ${totalPages}`, canvas.width / 2, canvas.height - 10);
      
      // Sombra sutil para profundidad
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
      ctx.globalAlpha = 1.0;
      
      const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(previewUrl);
    });
  };

  // Función para forzar generación de vistas previas
  const forceGeneratePreviews = async () => {
    if (!file) {
      showError('Error', 'No hay archivo PDF seleccionado');
      return;
    }
    
    setLoadingPreviews(true);
    
    try {
      console.log('🚀 Iniciando generación forzada de vistas previas...');
      
      const newPreviews = { ...pagePreviews };
      const pagesToGenerate = [];
      
      // Generar para páginas que no tienen vista previa
      for (let i = 1; i <= totalPages; i++) {
        if (!newPreviews[i]) {
          pagesToGenerate.push(i);
        }
      }
      
      if (pagesToGenerate.length === 0) {
        showSuccess('Info', 'Todas las páginas ya tienen vista previa');
        return;
      }
      
      console.log(`🎯 Generando vistas previas para páginas: ${pagesToGenerate.join(', ')}`);
      
      // Procesar en lotes optimizados según el tamaño del documento
      const batchSize = totalPages > 100 ? 5 : 3;
      for (let i = 0; i < pagesToGenerate.length; i += batchSize) {
        const batch = pagesToGenerate.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (pageNum) => {
          try {
            let preview = null;
            
            // MÉTODO 0: Intentar con EmbedPDF primero
            try {
              preview = await generateEmbedPDFPreview(file.file, pageNum);
            } catch (embedError) {
              console.warn(`⚠️ EmbedPDF falló para página ${pageNum}:`, embedError);
              
              // Usar el objectUrl existente o crear uno nuevo
              const objectUrl = pdfObjectUrl || URL.createObjectURL(file.file);
              
              // Método 1: embed + html2canvas
              try {
                preview = await captureWithHtml2CanvasEmbed(objectUrl, pageNum);
              } catch (embedError) {
                console.warn(`⚠️ embed + html2canvas falló para página ${pageNum}`);
                
                // Método 2: iframe + html2canvas
                try {
                  preview = await captureWithHtml2CanvasIframe(objectUrl, pageNum);
                } catch (iframeError) {
                  console.warn(`⚠️ iframe + html2canvas falló para página ${pageNum}`);
                  
                  // Método 3: visor nativo + html2canvas
                  try {
                    preview = await captureWithNativeViewer(objectUrl, pageNum);
                  } catch (nativeError) {
                    console.warn(`⚠️ visor nativo + html2canvas falló para página ${pageNum}`);
                  }
                }
              }
            }
            
            // Fallback mejorado si todo falla
            if (!preview) {
              preview = await createEnhancedFallbackPreview(pageNum, file.name);
            }
            
            return { page: pageNum, preview };
            
          } catch (error) {
            console.error(`❌ Error generando vista previa para página ${pageNum}:`, error);
            return { page: pageNum, preview: null, error };
          }
        });
        
        const results = await Promise.all(batchPromises);
        
        results.forEach(result => {
          if (result.preview) {
            newPreviews[result.page] = result.preview;
          }
        });
        
        setPagePreviews({ ...newPreviews });
        
        // Pausa optimizada entre lotes
        const pauseTime = totalPages > 100 ? 200 : 500;
        if (i + batchSize < pagesToGenerate.length) {
          await new Promise(resolve => setTimeout(resolve, pauseTime));
        }
      }
      
      const successCount = Object.keys(newPreviews).length - Object.keys(pagePreviews).length;
      showSuccess('Éxito', `Se generaron ${successCount} vistas previas adicionales`);
      
    } catch (error) {
      console.error('❌ Error en generación forzada:', error);
      showError('Error', 'Error generando vistas previas');
    } finally {
      setLoadingPreviews(false);
    }
  };

  // 🔄 Función para generar vista previa bajo demanda con EmbedPDF
  const generatePreviewOnDemandWithHtml2Canvas = async (pageNumber) => {
    if (!file || pagePreviews[pageNumber]) {
      console.log(`Vista previa ya existe o no hay archivo para página ${pageNumber}`);
      return;
    }
    
    console.log(`🔄 Generando vista previa bajo demanda con EmbedPDF para página ${pageNumber}...`);
    
    try {
      let preview = null;
      
      // MÉTODO 0: Intentar con EmbedPDF primero
      try {
        preview = await generateEmbedPDFPreview(file.file, pageNumber);
      } catch (embedError) {
        console.warn(`⚠️ EmbedPDF falló para página ${pageNumber}:`, embedError);
        
        // Usar el objectUrl existente o crear uno nuevo
        const objectUrl = pdfObjectUrl || URL.createObjectURL(file.file);
        
        // MÉTODO 1: Intentar con html2canvas + embed
        try {
          preview = await captureWithHtml2CanvasEmbed(objectUrl, pageNumber);
        } catch (embedError) {
          console.warn(`⚠️ embed + html2canvas falló para página ${pageNumber}`);
          
          try {
            preview = await captureWithHtml2CanvasIframe(objectUrl, pageNumber);
          } catch (iframeError) {
            console.warn(`⚠️ iframe + html2canvas falló para página ${pageNumber}`);
            
            try {
              preview = await captureWithNativeViewer(objectUrl, pageNumber);
            } catch (nativeError) {
              console.warn(`⚠️ visor nativo + html2canvas falló para página ${pageNumber}`);
              
              // MÉTODO 4: Canvas directo como último recurso
              try {
                preview = await captureWithDirectCanvas(objectUrl, pageNumber);
              } catch (canvasError) {
                console.warn(`⚠️ Canvas directo falló para página ${pageNumber}`);
              }
            }
          }
        }
      }
      
      // Fallback mejorado si todo falla
      if (!preview) {
        preview = await createEnhancedFallbackPreview(pageNumber, file.name);
      }
      
      if (preview) {
        console.log(`✅ Vista previa generada exitosamente para página ${pageNumber}`);
        setPagePreviews(prev => ({
          ...prev,
          [pageNumber]: preview
        }));
      } else {
        console.warn(`⚠️ No se pudo generar vista previa para página ${pageNumber}`);
      }
      
    } catch (error) {
      console.error(`❌ Error generando vista previa bajo demanda para página ${pageNumber}:`, error);
    }
  };

  // Función para manejar la selección de páginas individuales
  const togglePageSelection = (pageNumber) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  // Función para seleccionar todas las páginas
  const selectAllPages = () => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(allPages);
  };

  // Función para deseleccionar todas las páginas
  const deselectAllPages = () => {
    setSelectedPages([]);
  };

  const addCustomRange = () => {
    if (!rangeStart || !rangeEnd) {
      showError('Error', 'Ingresa el rango de páginas');
      return;
    }
    
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (start >= end || start < 1) {
      showError('Error', 'Rango inválido. La página inicial debe ser menor que la final');
      return;
    }
    
    const newRange = `${start}-${end}`;
    setCustomRanges([...customRanges, newRange]);
    setRangeStart('');
    setRangeEnd('');
  };

  const removeCustomRange = (index) => {
    setCustomRanges(customRanges.filter((_, i) => i !== index));
  };

  const addFixedRange = () => {
    if (!rangeStart || !rangeEnd) {
      showError('Error', 'Ingresa el rango de páginas');
      return;
    }
    
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (start >= end || start < 1) {
      showError('Error', 'Rango inválido. La página inicial debe ser menor que la final');
      return;
    }
    
    const newRange = `${start}-${end}`;
    setFixedRanges([...fixedRanges, newRange]);
    setRangeStart('');
    setRangeEnd('');
  };

  const removeFixedRange = (index) => {
    setFixedRanges(fixedRanges.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (!file) {
      showError('Error', 'Selecciona un archivo PDF');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando procesamiento SIMPLIFICADO de PDF...');
      console.log('📁 Archivo:', file.name, 'Tamaño:', file.size);
      
      // Intentar primero con PDF-lib
      try {
        await processWithPdfLib();
      } catch (pdfLibError) {
        console.warn('⚠️ PDF-lib falló, intentando con jsPDF:', pdfLibError.message);
        await processWithJsPDF();
      }
      
    } catch (error) {
      console.error('❌ Error procesando PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudo procesar el documento: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para procesar con PDF-lib
  const processWithPdfLib = async () => {
    console.log('📚 Intentando con PDF-lib...');
    
    // Cargar el PDF original
    const existingPdfBytes = await file.file.arrayBuffer();
    console.log('📦 ArrayBuffer creado, tamaño:', existingPdfBytes.byteLength);
    
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log(`📄 PDF cargado: ${pdfDoc.getPageCount()} páginas`);
    
    const fileName = file.name.replace('.pdf', '');
    
    // VERSIÓN SIMPLIFICADA: Solo extraer la primera página para probar
    console.log('📋 Creando PDF con solo la primera página (prueba)...');
    
    // Crear un nuevo PDF
    const newPdfDoc = await PDFDocument.create();
    console.log('📝 Nuevo PDF creado');
    
    // Copiar solo la primera página (índice 0)
    if (pdfDoc.getPageCount() > 0) {
      console.log('📄 Copiando primera página (índice 0)');
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
      newPdfDoc.addPage(copiedPage);
      console.log('✅ Primera página copiada y agregada');
    } else {
      throw new Error('El PDF no tiene páginas');
    }
    
    // Guardar el nuevo PDF
    console.log('💾 Guardando nuevo PDF...');
    const newPdfBytes = await newPdfDoc.save();
    console.log('📦 PDF guardado, tamaño:', newPdfBytes.byteLength, 'bytes');
    
    // Verificar que el PDF no esté vacío
    if (newPdfBytes.byteLength < 1000) {
      console.warn('⚠️ El PDF generado parece muy pequeño, posible error');
      console.warn('📊 Primeros 100 bytes:', Array.from(new Uint8Array(newPdfBytes.slice(0, 100))));
    }
    
    // Crear blob y descargar
    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL creada:', url);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_primera_pagina_pdflib.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF de prueba procesado y descargado con PDF-lib');
    showSuccess('¡Éxito!', `Se ha creado un PDF con la primera página (PDF-lib)`);
    removeFile();
  };

  // Función para procesar con jsPDF (fallback)
  const processWithJsPDF = async () => {
    console.log('📝 Intentando con jsPDF como fallback...');
    
    const fileName = file.name.replace('.pdf', '');
    
    // Crear un nuevo PDF con jsPDF
    const pdf = new jsPDF();
    
    // Agregar contenido de prueba
    pdf.setFontSize(20);
    pdf.text('PDF de Prueba Creado con jsPDF', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Archivo original: ${file.name}`, 20, 40);
    pdf.text(`Tamaño original: ${formatFileSize(file.size)}`, 20, 50);
    pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 60);
    pdf.text('Este es un PDF de prueba generado con jsPDF', 20, 80);
    pdf.text('como fallback cuando PDF-lib falla.', 20, 90);
    
    // Guardar el PDF
    const pdfBytes = pdf.output('arraybuffer');
    console.log('📦 PDF jsPDF creado, tamaño:', pdfBytes.byteLength, 'bytes');
    
    // Crear blob y descargar
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob jsPDF creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL jsPDF creada:', url);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_fallback_jspdf.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF de prueba procesado y descargado con jsPDF');
    showSuccess('¡Éxito!', `Se ha creado un PDF de prueba con jsPDF (fallback)`);
    removeFile();
  };

  return (
    <div className="split-pdf-container">
      <div className="split-pdf-header">
        <div className="header-icon">✂️</div>
        <div className="header-content">
          <h1>Separar Documentos PDF</h1>
          <p>Extrae páginas específicas o divide cada página en archivos independientes</p>
        </div>
      </div>

      <div className="split-pdf-content">
        {/* Zona de carga */}
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra tu archivo PDF aquí</h3>
          <p>o haz clic para seleccionar archivo</p>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button className="select-files-btn">
            Seleccionar Archivo PDF
          </button>
        </div>

        {/* Archivo seleccionado */}
        {file && (
          <div className="file-info">
            <div className="file-details">
              <FileText className="file-icon" size={24} />
              <div className="file-text">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <button className="remove-btn" onClick={removeFile}>
              <X size={20} />
            </button>
          </div>
        )}

        {/* Configuración de separación */}
        {file && (
          <div className="split-configuration">
            <h3>Configuración de Separación</h3>
            
            {/* Modos de separación */}
            <div className="split-modes">
              <div className="mode-option">
                <input
                  type="radio"
                  id="mode-rango"
                  name="splitMode"
                  value="rango"
                  checked={splitMode === 'rango'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <label htmlFor="mode-rango">
                  <Settings size={20} />
                  <div>
                    <strong>Rango</strong>
                    <p>Separar por rangos específicos de páginas</p>
                  </div>
                </label>
              </div>

              <div className="mode-option">
                <input
                  type="radio"
                  id="mode-paginas"
                  name="splitMode"
                  value="paginas"
                  checked={splitMode === 'paginas'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <label htmlFor="mode-paginas">
                  <FileText size={20} />
                  <div>
                    <strong>Páginas</strong>
                    <p>Separar cada N páginas</p>
                  </div>
                </label>
              </div>

              <div className="mode-option">
                <input
                  type="radio"
                  id="mode-tamano"
                  name="splitMode"
                  value="tamano"
                  checked={splitMode === 'tamano'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <label htmlFor="mode-tamano">
                  <Download size={20} />
                  <div>
                    <strong>Tamaño</strong>
                    <p>Separar por tamaño de archivo</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Configuración de Rango */}
            {splitMode === 'rango' && (
              <div className="range-configuration">
                <div className="range-mode">
                  <h4>Rangos de páginas</h4>
                  <div className="range-input-group">
                    <input
                      type="number"
                      placeholder="Página inicial"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      min="1"
                    />
                    <span>a</span>
                    <input
                      type="number"
                      placeholder="Página final"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      min="1"
                    />
                    <button
                      className="add-range-btn"
                      onClick={addFixedRange}
                    >
                      <Plus size={16} />
                      Añadir Rango
                    </button>
                  </div>
                  <div className="ranges-list">
                    {fixedRanges.map((range, index) => (
                      <div key={index} className="range-item">
                        <span>Páginas {range}</span>
                        <button
                          className="remove-range-btn"
                          onClick={() => removeFixedRange(index)}
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="merge-option">
                  <label className="merge-label">
                    <input type="checkbox" />
                    <span>Unir todos los rangos en un único PDF</span>
                  </label>
                </div>
              </div>
            )}

            {/* Configuración de Páginas */}
            {splitMode === 'paginas' && (
              <div className="pages-configuration">
                <div className="pages-header">
                  <h4>Seleccionar Páginas</h4>
                  <div className="pages-actions">
                    <button
                      type="button"
                      className="select-all-btn"
                      onClick={selectAllPages}
                    >
                      Seleccionar Todas
                    </button>
                    <button
                      type="button"
                      className="deselect-all-btn"
                      onClick={deselectAllPages}
                    >
                      Deseleccionar Todas
                    </button>
                  </div>
                </div>
                
                <div className="pages-info">
                  <p>Total de páginas: {totalPages}</p>
                  <p>Páginas seleccionadas: {selectedPages.length}</p>
                  
                </div>

                <div className="pages-grid">
                  {loadingPreviews ? (
                    <div className="loading-previews">
                      <div className="spinner"></div>
                      <p>Cargando vistas previas...</p>
                    </div>
                  ) : (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                      <div
                        key={pageNumber}
                        className={`page-item ${selectedPages.includes(pageNumber) ? 'selected' : ''}`}
                        onClick={() => {
                          togglePageSelection(pageNumber);
                          // Generar vista previa bajo demanda para páginas sin preview
                          if (!pagePreviews[pageNumber]) {
                            generatePreviewOnDemand(pageNumber);
                          }
                        }}
                      >
                        <div className="page-preview-container">
                          {pagePreviews[pageNumber] ? (
                            <img
                              src={pagePreviews[pageNumber]}
                              alt={`Página ${pageNumber}`}
                              className="page-preview-image"
                            />
                          ) : (
                            <div
                              className="page-preview-placeholder"
                              onClick={(e) => {
                                e.stopPropagation();
                                generatePreviewOnDemand(pageNumber);
                              }}
                              title="Clic para vista previa instantánea"
                            >
                              <FileText size={24} />
                            </div>
                          )}
                        </div>
                        <div className="page-selection-overlay">
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(pageNumber)}
                            onChange={() => togglePageSelection(pageNumber)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="page-number-label">Página {pageNumber}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Configuración de Tamaño */}
            {splitMode === 'tamano' && (
              <div className="size-configuration">
                <p>Esta función estará disponible próximamente</p>
              </div>
            )}
          </div>
        )}

        {/* Botón de acción */}
        {file && (
          <div className="split-actions">
            <button 
              className="split-btn"
              onClick={handleSplit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Separando documento...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Separar Documento PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal del Visor Profesional Completo */}
      {showProfessionalViewer && (
        <div className="professional-viewer-modal">
          <div className="modal-overlay" onClick={() => setShowProfessionalViewer(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2>📖 Visor PDF Profesional</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowProfessionalViewer(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ProfessionalPDFViewer
                file={file.file}
                onPageChange={(page) => console.log('Página cambiada:', page)}
                onDocumentLoad={(docInfo) => {
                  showSuccess('Documento Cargado', `${docInfo.numPages} páginas detectadas`);
                }}
                enableAnnotations={true}
                enableSelection={true}
                enableZoom={true}
                enablePan={true}
                enableFullscreen={true}
                initialPage={1}
                style={{ height: '70vh' }}
              />
            </div>
            <div className="modal-footer">
              <div className="viewer-info">
                <p>📄 {file.name}</p>
                <p>📊 {totalPages} páginas • {formatFileSize(file.size)}</p>
              </div>
              <div className="modal-actions">
                <PDFMarqueeCapture
                  pdfContainer={document.querySelector('.pdf-page-canvas')}
                  onAreaCaptured={handleAreaCaptured}
                  enabled={true}
                  minSize={30}
                />
                <button
                  className="modal-btn secondary"
                  onClick={() => setShowProfessionalViewer(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitPDF;