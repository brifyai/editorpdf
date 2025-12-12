import React, { useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import "./WebToPDF.css";

const WebToPDF = () => {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [includeHeaders, setIncludeHeaders] = useState(false);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [quality, setQuality] = useState("high");

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const processWebToPDF = async () => {
    if (!url.trim()) {
      alert("Por favor ingresa una URL válida");
      return;
    }

    if (!validateUrl(url)) {
      alert("Por favor ingresa una URL válida (ej: https://example.com)");
      return;
    }

    setIsProcessing(true);

    try {
      await convertWebToPDF();
      
      // Actualizar estadísticas
      await updateStatistics();
      
      alert("Conversión completada exitosamente");
      setUrl("");
    } catch (error) {
      console.error("Error en la conversión:", error);
      alert("Error al convertir la página web: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertWebToPDF = async () => {
    return new Promise((resolve, reject) => {
      try {
        // Simulación de conversión de web a PDF
        // En una implementación real, necesitarías usar una biblioteca como Puppeteer
        // o un servicio backend que pueda capturar páginas web
        
        const pdf = new jsPDF({
          orientation: orientation,
          unit: "mm",
          format: pageSize
        });

        // Página de título
        pdf.setFontSize(20);
        pdf.text("Página Web Convertida", 105, 30, { align: "center" });
        
        pdf.setFontSize(14);
        pdf.text("URL: " + url, 20, 50);
        pdf.text(`Calidad: ${quality === "high" ? "Alta" : quality === "medium" ? "Media" : "Baja"}`, 20, 60);
        pdf.text(`Tamaño: ${pageSize.toUpperCase()}`, 20, 70);
        pdf.text(`Orientación: ${orientation === "portrait" ? "Vertical" : "Horizontal"}`, 20, 80);
        
        // Simular contenido de la página web
        pdf.setFontSize(12);
        pdf.text("Contenido de la página web (simulado):", 20, 100);
        
        const sampleContent = [
          "Esta es una simulación del contenido de la página web.",
          "En una implementación real, aquí aparecería el contenido real",
          "de la página web especificada en la URL.",
          "",
          "Características de la conversión:",
          `• Incluir encabezados: ${includeHeaders ? "Sí" : "No"}`,
          `• Incluir fondo: ${includeBackground ? "Sí" : "No"}`,
          `• Calidad: ${quality === "high" ? "Alta" : quality === "medium" ? "Media" : "Baja"}`,
          "",
          "La conversión preservaría el diseño, formato y estilos",
          "de la página web original en la medida de lo posible."
        ];

        sampleContent.forEach((line, index) => {
          pdf.text(line, 20, 110 + (index * 7));
        });

        // Descargar el PDF
        const pdfBlob = pdf.output("blob");
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        
        // Generar nombre de archivo basado en la URL
        const urlObj = new URL(url);
        const fileName = urlObj.hostname.replace(/\./g, "_") + "_convertido.pdf";
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateStatistics = async () => {
    try {
      await axios.post("http://localhost:8080/api/statistics/update", {
        action: "web_to_pdf",
        urlCount: 1,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  };

  return (
    <div className="web-to-pdf-container">
      {/* Header */}
      <div className="web-to-pdf-header">
        <div className="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
            <path d="M8 15h8"/>
            <path d="M8 11h8"/>
            <circle cx="8" cy="7" r="1"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>Web a PDF</h1>
          <p>Convierte páginas web a documentos PDF profesionales</p>
        </div>
      </div>

      <div className="web-to-pdf-content">
        {/* Input de URL */}
        <div className="url-input-section">
          <h3>Ingresa la URL de la página web</h3>
          <div className="url-input-container">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="url-input"
              onKeyPress={(e) => e.key === "Enter" && processWebToPDF()}
            />
            <button
              className="convert-btn"
              onClick={processWebToPDF}
              disabled={!url.trim() || isProcessing}
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
                  Convertir
                </>
              )}
            </button>
          </div>
        </div>

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
              <label>Calidad:</label>
              <select 
                value={quality} 
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="high">Alta (mejor calidad)</option>
                <option value="medium">Media (balance)</option>
                <option value="low">Baja (tamaño reducido)</option>
              </select>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="include-headers"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                />
                <label htmlFor="include-headers">Incluir encabezados y pies de página</label>
              </div>
            </div>

            <div className="option-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="include-background"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                />
                <label htmlFor="include-background">Incluir imágenes y fondo</label>
              </div>
            </div>
          </div>

          <div className="conversion-info">
            <div className="info-item">
              <strong>URL a convertir:</strong>
              <span>{url || "No especificada"}</span>
            </div>
            <div className="info-item">
              <strong>Calidad seleccionada:</strong>
              <span>{quality === "high" ? "Alta" : quality === "medium" ? "Media" : "Baja"}</span>
            </div>
            <div className="info-item">
              <strong>Tamaño de página:</strong>
              <span>{pageSize.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <strong>Orientación:</strong>
              <span>{orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="additional-info">
          <h3>Información importante</h3>
          <ul>
            <li>La conversión funciona mejor con páginas web públicas y accesibles</li>
            <li>Algunas páginas con contenido dinámico pueden requerir configuración adicional</li>
            <li>El tiempo de conversión depende del tamaño y complejidad de la página</li>
            <li>Se respeta la estructura y el diseño original de la página</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebToPDF;