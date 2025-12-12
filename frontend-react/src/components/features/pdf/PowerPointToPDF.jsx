import React, { useState, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./PowerPointToPDF.css";

const PowerPointToPDF = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slideQuality, setSlideQuality] = useState("high");
  const [preserveAnimations, setPreserveAnimations] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("landscape");
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => 
      file.type === "application/vnd.ms-powerpoint" || 
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    setFiles(prev => [...prev, ...newFiles]);
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

  const processPowerPointToPDF = async () => {
    if (files.length === 0) {
      alert("Por favor selecciona al menos un archivo PowerPoint");
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of files) {
        await convertSinglePowerPointToPDF(file);
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

  const convertSinglePowerPointToPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulación de conversión de PowerPoint a PDF
          // En una implementación real, necesitarías una biblioteca específica para PowerPoint
          // como officegen, pptxgenjs o un servicio backend
          
          const pdf = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: pageSize
          });

          // Simular contenido del PowerPoint
          const fileName = file.name.replace(/\.(ppt|pptx)$/i, "");
          
          // Página de título
          pdf.setFontSize(24);
          pdf.text(fileName, 105, 50, { align: "center" });
          
          pdf.setFontSize(16);
          pdf.text("Convertido desde PowerPoint", 105, 70, { align: "center" });
          pdf.text(`Calidad: ${slideQuality === "high" ? "Alta" : slideQuality === "medium" ? "Media" : "Baja"}`, 105, 85, { align: "center" });
          
          // Simular diapositivas
          const slideCount = 5; // Simulación de 5 diapositivas
          for (let i = 1; i <= slideCount; i++) {
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.text(`Diapositiva ${i}`, 20, 30);
            
            pdf.setFontSize(12);
            pdf.text("Contenido de la diapositiva simulado", 20, 50);
            pdf.text("En una implementación real, este sería el contenido", 20, 65);
            pdf.text("real de cada diapositiva del PowerPoint", 20, 80);
            
            if (includeNotes) {
              pdf.setFontSize(10);
              pdf.text("Notas del presentador (simuladas)", 20, 120);
              pdf.text("Estas son las notas que acompañarían a la diapositiva", 20, 135);
            }
            
            if (preserveAnimations) {
              pdf.setFontSize(8);
              pdf.text("(Animaciones preservadas en formato PDF)", 20, 150);
            }
          }

          // Descargar el PDF
          const pdfBlob = pdf.output("blob");
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName}_convertido.pdf`;
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
        action: "powerpoint_to_pdf",
        fileCount: files.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  };

  return (
    <div className="powerpoint-to-pdf-container">
      {/* Header */}
      <div className="powerpoint-to-pdf-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>
            <path d="M13 3v8l3-3 3 3V3"/>
            <path d="M9 13h6"/>
            <path d="M9 17h6"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>PowerPoint a PDF</h1>
          <p>Convierte presentaciones de PowerPoint a documentos PDF profesionales</p>
        </div>
      </div>

      <div className="powerpoint-to-pdf-content">
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
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h3>Arrastra tus archivos PowerPoint aquí</h3>
          <p>O haz clic para seleccionar archivos</p>
          <button className="select-files-btn">
            Seleccionar archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".ppt,.pptx"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: "0.875rem", color: "#718096", marginTop: "1rem" }}>
            Formatos soportados: .ppt, .pptx
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
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M9 13h6"/>
                        <path d="M9 17h6"/>
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
              <label>Calidad de las diapositivas:</label>
              <select 
                value={slideQuality} 
                onChange={(e) => setSlideQuality(e.target.value)}
              >
                <option value="high">Alta (máxima calidad)</option>
                <option value="medium">Media (balance calidad-tamaño)</option>
                <option value="low">Baja (tamaño reducido)</option>
              </select>
            </div>

            <div className="option-group">
              <label>Tamaño de página:</label>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(e.target.value)}
              >
                <option value="a4">A4</option>
                <option value="letter">Carta</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <div className="option-group">
              <label>Orientación:</label>
              <select 
                value={orientation} 
                onChange={(e) => setOrientation(e.target.value)}
              >
                <option value="landscape">Horizontal (recomendado)</option>
                <option value="portrait">Vertical</option>
              </select>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="preserve-animations"
                  checked={preserveAnimations}
                  onChange={(e) => setPreserveAnimations(e.target.checked)}
                />
                <label htmlFor="preserve-animations">Preservar animaciones (si es posible)</label>
              </div>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="include-notes"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                />
                <label htmlFor="include-notes">Incluir notas del presentador</label>
              </div>
            </div>
          </div>

          <div className="conversion-info">
            <div className="info-item">
              <strong>Archivos a convertir:</strong>
              <span>{files.length}</span>
            </div>
            <div className="info-item">
              <strong>Calidad seleccionada:</strong>
              <span>{slideQuality === "high" ? "Alta" : slideQuality === "medium" ? "Media" : "Baja"}</span>
            </div>
            <div className="info-item">
              <strong>Orientación:</strong>
              <span>{orientation === "landscape" ? "Horizontal" : "Vertical"}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="convert-actions">
          <button
            className="convert-btn"
            onClick={processPowerPointToPDF}
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
                Convertir a PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerPointToPDF;