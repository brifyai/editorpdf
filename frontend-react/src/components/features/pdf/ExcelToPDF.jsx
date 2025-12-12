import React, { useState, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./ExcelToPDF.css";

const ExcelToPDF = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [worksheetSelection, setWorksheetSelection] = useState("all");
  const [includeGridlines, setIncludeGridlines] = useState(true);
  const [fitToPage, setFitToPage] = useState(true);
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
      file.type === "application/vnd.ms-excel" || 
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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

  const processExcelToPDF = async () => {
    if (files.length === 0) {
      alert("Por favor selecciona al menos un archivo Excel");
      return;
    }

    setIsProcessing(true);

    try {
      for (const file of files) {
        await convertSingleExcelToPDF(file);
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

  const convertSingleExcelToPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulación de conversión de Excel a PDF
          // En una implementación real, necesitarías una biblioteca específica para Excel
          // como xlsx, exceljs o un servicio backend
          
          const pdf = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: pageSize
          });

          // Simular contenido del Excel
          const fileName = file.name.replace(/\.(xls|xlsx)$/i, "");
          
          // Página de título
          pdf.setFontSize(20);
          pdf.text(fileName, 105, 30, { align: "center" });
          
          pdf.setFontSize(14);
          pdf.text("Convertido desde Excel", 105, 45, { align: "center" });
          pdf.text(`Hojas: ${worksheetSelection === "all" ? "Todas" : "Seleccionadas"}`, 105, 55, { align: "center" });
          
          // Simular hojas de cálculo
          const sheetCount = 3; // Simulación de 3 hojas
          for (let sheet = 1; sheet <= sheetCount; sheet++) {
            pdf.addPage();
            
            // Título de la hoja
            pdf.setFontSize(16);
            pdf.text(`Hoja ${sheet}`, 20, 25);
            
            // Simular tabla de datos
            if (includeGridlines) {
              // Dibujar líneas de cuadrícula
              pdf.setDrawColor(200);
              for (let i = 0; i <= 10; i++) {
                pdf.line(20, 35 + (i * 8), 190, 35 + (i * 8)); // Líneas horizontales
                pdf.line(20 + (i * 17), 35, 20 + (i * 17), 115); // Líneas verticales
              }
            }
            
            // Simular datos de celda
            pdf.setFontSize(10);
            const sampleData = [
              ["A1", "B1", "C1", "D1", "E1", "F1"],
              ["A2", "B2", "C2", "D2", "E2", "F2"],
              ["A3", "B3", "C3", "D3", "E3", "F3"],
              ["A4", "B4", "C4", "D4", "E4", "F4"],
              ["A5", "B5", "C5", "D5", "E5", "F5"]
            ];
            
            sampleData.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                pdf.text(cell, 25 + (colIndex * 17), 40 + (rowIndex * 8));
              });
            });
            
            // Información adicional
            pdf.setFontSize(8);
            pdf.text(`Cuadrícula: ${includeGridlines ? "Incluida" : "Omitida"}`, 20, 125);
            pdf.text(`Ajuste a página: ${fitToPage ? "Activado" : "Desactivado"}`, 20, 132);
            
            if (fitToPage) {
              pdf.text("(Contenido ajustado al tamaño de página)", 20, 139);
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
        action: "excel_to_pdf",
        fileCount: files.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  };

  return (
    <div className="excel-to-pdf-container">
      {/* Header */}
      <div className="excel-to-pdf-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
            <path d="M9 9h6v6H9z"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>Excel a PDF</h1>
          <p>Convierte hojas de cálculo de Excel a documentos PDF profesionales</p>
        </div>
      </div>

      <div className="excel-to-pdf-content">
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
          <h3>Arrastra tus archivos Excel aquí</h3>
          <p>O haz clic para seleccionar archivos</p>
          <button className="select-files-btn">
            Seleccionar archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xls,.xlsx"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: "0.875rem", color: "#718096", marginTop: "1rem" }}>
            Formatos soportados: .xls, .xlsx
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
                        <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
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
              <label>Selección de hojas:</label>
              <select 
                value={worksheetSelection} 
                onChange={(e) => setWorksheetSelection(e.target.value)}
              >
                <option value="all">Todas las hojas</option>
                <option value="active">Solo hoja activa</option>
                <option value="selected">Hojas seleccionadas</option>
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
                  id="include-gridlines"
                  checked={includeGridlines}
                  onChange={(e) => setIncludeGridlines(e.target.checked)}
                />
                <label htmlFor="include-gridlines">Incluir líneas de cuadrícula</label>
              </div>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="fit-to-page"
                  checked={fitToPage}
                  onChange={(e) => setFitToPage(e.target.checked)}
                />
                <label htmlFor="fit-to-page">Ajustar contenido a la página</label>
              </div>
            </div>
          </div>

          <div className="conversion-info">
            <div className="info-item">
              <strong>Archivos a convertir:</strong>
              <span>{files.length}</span>
            </div>
            <div className="info-item">
              <strong>Hojas seleccionadas:</strong>
              <span>{worksheetSelection === "all" ? "Todas" : worksheetSelection === "active" ? "Activa" : "Seleccionadas"}</span>
            </div>
            <div className="info-item">
              <strong>Cuadrícula:</strong>
              <span>{includeGridlines ? "Incluida" : "Omitida"}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="convert-actions">
          <button
            className="convert-btn"
            onClick={processExcelToPDF}
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

export default ExcelToPDF;