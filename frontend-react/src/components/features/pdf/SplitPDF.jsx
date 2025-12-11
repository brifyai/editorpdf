import React, { useState } from 'react';
import { Upload, FileText, Download, X, Scissors, Settings, Plus, Minus, Crown } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import './SplitPDF.css';

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

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    setFile({
      id: Date.now(),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size
    });
  };

  const removeFile = () => {
    setFile(null);
    setPageRanges([]);
    setCustomRanges([]);
    setFixedRanges([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    let rangesToProcess = [];
    
    switch (splitMode) {
      case 'rango':
        rangesToProcess = fixedRanges;
        break;
      case 'paginas':
        rangesToProcess = [`1-${pagesPerFile}`];
        break;
      case 'tamano':
        rangesToProcess = ['1-999']; // Por tamaño
        break;
      default:
        showError('Error', 'Selecciona un modo de separación');
        return;
    }

    if (rangesToProcess.length === 0) {
      showError('Error', 'Define los rangos de páginas');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const fileName = file.name.replace('.pdf', '');
      const splitCount = rangesToProcess.length;
      
      for (let i = 0; i < splitCount; i++) {
        const splitPdf = new Blob([`PDF separado ${rangesToProcess[i]} simulado`], { type: 'application/pdf' });
        const url = URL.createObjectURL(splitPdf);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_rango_${rangesToProcess[i]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      showSuccess('¡Éxito!', `El documento ha sido separado en ${splitCount} archivos`);
      removeFile();
      
    } catch (error) {
      showError('Error', 'No se pudo separar el documento');
    } finally {
      setIsProcessing(false);
    }
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
                <label htmlFor="pages-per-file">Páginas por archivo:</label>
                <select
                  id="pages-per-file"
                  value={pagesPerFile}
                  onChange={(e) => setPagesPerFile(parseInt(e.target.value))}
                >
                  <option value={1}>1 página por archivo</option>
                  <option value={2}>2 páginas por archivo</option>
                  <option value={3}>3 páginas por archivo</option>
                  <option value={5}>5 páginas por archivo</option>
                  <option value={10}>10 páginas por archivo</option>
                </select>
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
    </div>
  );
};

export default SplitPDF;