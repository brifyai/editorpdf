import React, { useState, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./PDFToWord.css";

const PDFToWord = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState("docx");
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(false);
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

  const processPDFToWord = async () => {
    if (files.length === 0) {
      alert("Por favor selecciona al menos un archivo PDF");
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of files) {
        await convertPDFToWord(file);
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

  const convertPDFToWord = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulación de conversión de PDF a Word
          // En una implementación real, necesitarías una biblioteca específica como pdf-parse
          // o un servicio backend que pueda extraer texto del PDF
          
          const fileName = file.name.replace(/\.pdf$/i, "");
          
          // Crear un documento Word simulado (en formato de texto simple)
          let wordContent = `Documento Convertido desde PDF\n`;
          wordContent += `=====================================\n\n`;
          wordContent += `Archivo original: ${file.name}\n`;
          wordContent += `Fecha de conversión: ${new Date().toLocaleString()}\n`;
          wordContent += `Formato de salida: ${outputFormat.toUpperCase()}\n\n`;
          wordContent += `Configuraciones:\n`;
          wordContent += `- Preservar formato: ${preserveFormatting ? 'Sí' : 'No'}\n`;
          wordContent += `- Incluir imágenes: ${includeImages ? 'Sí' : 'No'}\n`;
          wordContent += `- OCR habilitado: ${ocrEnabled ? 'Sí' : 'No'}\n\n`;
          wordContent += `-------------------------------------\n\n`;
          wordContent += `CONTENIDO EXTRAÍDO (SIMULADO)\n\n`;
          wordContent += `Este es un ejemplo del contenido que se extraería del PDF.\n`;
          wordContent += `En una implementación real, aquí aparecería el texto real\n`;
          wordContent += `extraído del documento PDF "${fileName}".\n\n`;
          wordContent += `La conversión preservaría:\n`;
          wordContent += `- Párrafos y estructura del texto\n`;
          wordContent += `- Títulos y subtítulos\n`;
          wordContent += `- Listas y enumeraciones\n`;
          wordContent += `- Tablas (si están presentes)\n`;
          wordContent += `- Imágenes (si la opción está habilitada)\n\n`;
          
          if (preserveFormatting) {
            wordContent += `El formato original como negritas, cursivas y\n`;
            wordContent += `tipos de letra se intentarían preservar.\n\n`;
          }
          
          if (includeImages) {
            wordContent += `[IMÁGENES INCLUIDAS]\n`;
            wordContent += `Las imágenes del PDF se incluirían en el documento\n`;
            wordContent += `de Word en sus posiciones originales.\n\n`;
          }
          
          if (ocrEnabled) {
            wordContent += `[PROCESAMIENTO OCR]\n`;
            wordContent += `Se aplicaría reconocimiento óptico de caracteres\n`;
            wordContent += `para extraer texto de imágenes escaneadas.\n\n`;
          }
          
          wordContent += `-------------------------------------\n`;
          wordContent += `Fin del documento convertido\n`;

          // Crear y descargar el archivo
          const blob = new Blob([wordContent], { 
            type: outputFormat === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/msword"
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName}_convertido.${outputFormat}`;
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
        action: "pdf_to_word",
        fileCount: files.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  };

  return (
    <div className="pdf-to-word-container">
      {/* Header */}
      <div className="pdf-to-word-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>PDF a Word</h1>
          <p>Convierte documentos PDF a archivos Word editables</p>
        </div>
      </div>

      <div className="pdf-to-word-content">
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
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
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
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
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
              <label>Formato de salida:</label>
              <select 
                value={outputFormat} 
                onChange={(e) => setOutputFormat(e.target.value)}
              >
                <option value="docx">Word (.docx)</option>
                <option value="doc">Word (.doc)</option>
              </select>
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
                  id="ocr-enabled"
                  checked={ocrEnabled}
                  onChange={(e) => setOcrEnabled(e.target.checked)}
                />
                <label htmlFor="ocr-enabled">Habilitar OCR para PDFs escaneados</label>
              </div>
            </div>
          </div>

          <div className="conversion-info">
            <div className="info-item">
              <strong>Archivos a convertir:</strong>
              <span>{files.length}</span>
            </div>
            <div className="info-item">
              <strong>Formato de salida:</strong>
              <span>{outputFormat.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <strong>Preservar formato:</strong>
              <span>{preserveFormatting ? "Sí" : "No"}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="convert-actions">
          <button
            className="convert-btn"
            onClick={processPDFToWord}
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
                Convertir a Word
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFToWord;