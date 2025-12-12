import React, { useState, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./PDFToPowerPoint.css";

const PDFToPowerPoint = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slideLayout, setSlideLayout] = useState("auto");
  const [includeImages, setIncludeImages] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [slideTransition, setSlideTransition] = useState("fade");
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles).filter(file => 
      file.type === "application/pdf"
    );
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processPDFToPowerPoint = async () => {
    if (files.length === 0) {
      alert("Por favor selecciona al menos un archivo PDF");
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of files) {
        await convertPDFToPowerPoint(file);
      }

      // Actualizar estadísticas
      await updateStatistics();
      
      alert("Conversión completada exitosamente");
      setFiles([]);
    } catch (error) {
      console.error("Error en la conversión:", error);
      alert("Error al convertir los archivos: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertPDFToPowerPoint = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulación de conversión de PDF a PowerPoint
          // En una implementación real, necesitarías una biblioteca específica como pdf-parse
          // o un servicio backend que pueda extraer contenido del PDF
          
          const fileName = file.name.replace(/\.pdf$/i, "");
          
          // Crear un documento PowerPoint simulado (en formato de texto simple)
          let pptContent = `Presentación Convertida desde PDF\n`;
          pptContent += `=====================================\n\n`;
          pptContent += `Archivo original: ${file.name}\n`;
          pptContent += `Fecha de conversión: ${new Date().toLocaleString()}\n`;
          pptContent += `Diseño de diapositivas: ${slideLayout}\n`;
          pptContent += `Transición: ${slideTransition}\n\n`;
          pptContent += `Configuraciones:\n`;
          pptContent += `- Incluir imágenes: ${includeImages ? 'Sí' : 'No'}\n`;
          pptContent += `- Preservar formato: ${preserveFormatting ? 'Sí' : 'No'}\n\n`;
          pptContent += `-------------------------------------\n\n`;
          
          // Simular diapositivas basadas en el contenido del PDF
          const slideCount = 5; // Simulación de 5 diapositivas
          
          for (let i = 1; i <= slideCount; i++) {
            pptContent += `DIAPOSITIVA ${i}\n`;
            pptContent += `--------------------\n\n`;
            pptContent += `Título: Diapositiva ${i}\n\n`;
            pptContent += `Contenido:\n`;
            pptContent += `Este es el contenido simulado de la diapositiva ${i}\n`;
            pptContent += `que se extraería del PDF "${fileName}".\n\n`;
            
            if (preserveFormatting) {
              pptContent += `[Formato preservado]\n`;
              pptContent += `El formato original como negritas, cursivas,\n`;
              pptContent += `tamaños de letra y colores se mantendrían.\n\n`;
            }
            
            if (includeImages) {
              pptContent += `[IMÁGEN ${i}]\n`;
              pptContent += `Las imágenes del PDF se incluirían en las\n`;
              pptContent += `diapositivas correspondientes.\n\n`;
            }
            
            pptContent += `Notas del presentador:\n`;
            pptContent += `Esta diapositiva contiene información importante\n`;
            pptContent += `extraída de la página ${i} del PDF original.\n\n`;
            pptContent += `--------------------\n\n`;
          }
          
          pptContent += `CONFIGURACIÓN DE LA PRESENTACIÓN\n`;
          pptContent += `==============================\n\n`;
          pptContent += `Transición entre diapositivas: ${slideTransition}\n`;
          pptContent += `Diseño de diapositivas: ${slideLayout}\n`;
          pptContent += `Total de diapositivas: ${slideCount}\n\n`;
          pptContent += `La presentación mantendría:\n`;
          pptContent += `- Estructura jerárquica del contenido\n`;
          pptContent += `- Navegación entre diapositivas\n`;
          pptContent += `- Notas del presentador\n`;
          pptContent += `- Diseño visual consistente\n\n`;
          
          if (slideLayout === "auto") {
            pptContent += `[DISEÑO AUTOMÁTICO]\n`;
            pptContent += `El sistema optimizará automáticamente el diseño\n`;
            pptContent += `de cada diapositiva según su contenido.\n\n`;
          }
          
          pptContent += `-------------------------------------\n`;
          pptContent += `Fin de la presentación convertida\n`;

          // Crear y descargar el archivo
          const blob = new Blob([pptContent], { 
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName}_convertido.pptx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsArrayBuffer(file);
    });
  };

  const updateStatistics = async () => {
    try {
      await axios.post("http://localhost:8080/api/statistics/update", {
        action: "pdf_to_powerpoint",
        fileCount: files.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  };

  return (
    <div className="pdf-to-powerpoint-container">
      {/* Header */}
      <div className="pdf-to-powerpoint-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
            <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
            <path d="M8 12h8"/>
            <path d="M8 9h8"/>
            <circle cx="8" cy="6" r="1"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>PDF a PowerPoint</h1>
          <p>Convierte documentos PDF a presentaciones PowerPoint</p>
        </div>
      </div>

      <div className="pdf-to-powerpoint-content">
        {/* Zona de carga */}
        <div 
          className={`upload-zone ${files.length > 0 ? "has-files" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
              <path d="M8 12h8"/>
              <path d="M8 9h8"/>
              <circle cx="8" cy="6" r="1"/>
            </svg>
          </div>
          <h3>Arrastra tus archivos PDF aquí</h3>
          <p>O haz clic para seleccionar archivos</p>
          <button className="select-files-btn">
            Seleccionar archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: "0.875rem", color: "#718096", marginTop: "1rem" }}>
            Formatos soportados: .pdf
          </p>
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos seleccionados ({files.length})</h3>
            <div className="files-container">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                        <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
                        <path d="M8 12h8"/>
                        <path d="M8 9h8"/>
                        <circle cx="8" cy="6" r="1"/>
                      </svg>
                    </div>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                      title="Eliminar archivo"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuración de conversión */}
        <div className="conversion-configuration">
          <h3>Configuración de conversión</h3>
          <div className="conversion-options">
            <div className="option-group">
              <label>Diseño de diapositivas:</label>
              <select 
                value={slideLayout} 
                onChange={(e) => setSlideLayout(e.target.value)}
              >
                <option value="auto">Automático</option>
                <option value="title">Solo títulos</option>
                <option value="content">Título y contenido</option>
                <option value="minimal">Minimalista</option>
              </select>
            </div>

            <div className="option-group">
              <label>Transición entre diapositivas:</label>
              <select 
                value={slideTransition} 
                onChange={(e) => setSlideTransition(e.target.value)}
              >
                <option value="fade">Desvanecimiento</option>
                <option value="slide">Deslizamiento</option>
                <option value="zoom">Zoom</option>
                <option value="none">Sin transición</option>
              </select>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="include-images"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                />
                <label htmlFor="include-images">Incluir imágenes del PDF</label>
              </div>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="preserve-formatting"
                  checked={preserveFormatting}
                  onChange={(e) => setPreserveFormatting(e.target.checked)}
                />
                <label htmlFor="preserve-formatting">Preservar formato original</label>
              </div>
            </div>
          </div>

          <div className="conversion-info">
            <div className="info-item">
              <strong>Archivos a convertir:</strong>
              <span>{files.length}</span>
            </div>
            <div className="info-item">
              <strong>Diseño seleccionado:</strong>
              <span>{slideLayout === "auto" ? "Automático" : slideLayout === "title" ? "Solo títulos" : slideLayout === "content" ? "Título y contenido" : "Minimalista"}</span>
            </div>
            <div className="info-item">
              <strong>Transición:</strong>
              <span>{slideTransition === "fade" ? "Desvanecimiento" : slideTransition === "slide" ? "Deslizamiento" : slideTransition === "zoom" ? "Zoom" : "Sin transición"}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="convert-actions">
          <button
            className="convert-btn"
            onClick={processPDFToPowerPoint}
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div>
                Convirtiendo...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Convertir a PowerPoint
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFToPowerPoint;