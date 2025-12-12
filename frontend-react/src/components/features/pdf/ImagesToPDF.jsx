import React, { useState, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./ImagesToPDF.css";

const ImagesToPDF = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [imageQuality, setImageQuality] = useState("high");
  const [imageLayout, setImageLayout] = useState("fit");
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFiles) => {
    const imageFiles = Array.from(selectedFiles).filter(file => 
      file.type.startsWith("image/")
    );
    setFiles(prev => [...prev, ...imageFiles]);
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

  const processImagesToPDF = async () => {
    if (files.length === 0) {
      alert("Por favor selecciona al menos una imagen");
      return;
    }

    setIsProcessing(true);

    try {
      await convertImagesToPDF();
      
      // Actualizar estadísticas
      await updateStatistics();
      
      alert("Conversión completada exitosamente");
      setFiles([]);
    } catch (error) {
      console.error("Error en la conversión:", error);
      alert("Error al convertir las imágenes: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertImagesToPDF = async () => {
    return new Promise((resolve, reject) => {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: pageSize
      });

      let processedImages = 0;
      const totalImages = files.length;

      const processNextImage = (index) => {
        if (index >= totalImages) {
          // Descargar el PDF
          const pdfBlob = pdf.output("blob");
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "imagenes_convertidas.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
          return;
        }

        const file = files[index];
        const reader = new FileReader();

        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            if (index > 0) {
              pdf.addPage();
            }

            // Calcular dimensiones según el layout
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let imgWidth, imgHeight, x, y;

            if (imageLayout === "fit") {
              // Ajustar imagen a la página manteniendo proporción
              const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
              imgWidth = img.width * ratio;
              imgHeight = img.height * ratio;
              x = (pageWidth - imgWidth) / 2;
              y = (pageHeight - imgHeight) / 2;
            } else if (imageLayout === "fill") {
              // Llenar toda la página
              imgWidth = pageWidth;
              imgHeight = pageHeight;
              x = 0;
              y = 0;
            } else {
              // Tamaño original
              imgWidth = Math.min(img.width * 0.264583, pageWidth); // px to mm
              imgHeight = Math.min(img.height * 0.264583, pageHeight);
              x = (pageWidth - imgWidth) / 2;
              y = (pageHeight - imgHeight) / 2;
            }

            try {
              pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight, undefined, imageQuality === "high" ? "MEDIUM" : "FAST");
              processedImages++;
              processNextImage(index + 1);
            } catch (error) {
              console.error("Error adding image to PDF:", error);
              // Continuar con la siguiente imagen
              processNextImage(index + 1);
            }
          };
          img.onerror = () => {
            console.error("Error loading image:", file.name);
            processNextImage(index + 1);
          };
          img.src = e.target.result;
        };

        reader.onerror = () => {
          console.error("Error reading file:", file.name);
          processNextImage(index + 1);
        };

        reader.readAsDataURL(file);
      };

      processNextImage(0);
    });
  };

  const updateStatistics = async () => {
    try {
      await axios.post("http://localhost:8080/api/statistics/update", {
        action: "images_to_pdf",
        fileCount: files.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  };

  return (
    <div className="images-to-pdf-container">
      {/* Header */}
      <div className="images-to-pdf-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>Imágenes a PDF</h1>
          <p>Convierte múltiples imágenes a un documento PDF profesional</p>
        </div>
      </div>

      <div className="images-to-pdf-content">
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h3>Arrastra tus imágenes aquí</h3>
          <p>O haz clic para seleccionar archivos</p>
          <button className="select-files-btn">
            Seleccionar imágenes
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: "0.875rem", color: "#718096", marginTop: "1rem" }}>
            Formatos soportados: JPG, PNG, GIF, BMP, WebP
          </p>
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Imágenes seleccionadas ({files.length})</h3>
            <div className="files-container">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
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
                      title="Eliminar imagen"
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
                <option value="portrait">Vertical</option>
                <option value="landscape">Horizontal</option>
              </select>
            </div>

            <div className="option-group">
              <label>Calidad de imagen:</label>
              <select 
                value={imageQuality} 
                onChange={(e) => setImageQuality(e.target.value)}
              >
                <option value="high">Alta (mejor calidad)</option>
                <option value="medium">Media (balance)</option>
                <option value="low">Baja (tamaño reducido)</option>
              </select>
            </div>

            <div className="option-group">
              <label>Disposición de imágenes:</label>
              <select 
                value={imageLayout} 
                onChange={(e) => setImageLayout(e.target.value)}
              >
                <option value="fit">Ajustar a página</option>
                <option value="fill">Llenar página</option>
                <option value="original">Tamaño original</option>
              </select>
            </div>
          </div>

          <div className="conversion-info">
            <div className="info-item">
              <strong>Imágenes a convertir:</strong>
              <span>{files.length}</span>
            </div>
            <div className="info-item">
              <strong>Calidad seleccionada:</strong>
              <span>{imageQuality === "high" ? "Alta" : imageQuality === "medium" ? "Media" : "Baja"}</span>
            </div>
            <div className="info-item">
              <strong>Disposición:</strong>
              <span>{imageLayout === "fit" ? "Ajustar" : imageLayout === "fill" ? "Llenar" : "Original"}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="convert-actions">
          <button
            className="convert-btn"
            onClick={processImagesToPDF}
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

export default ImagesToPDF;