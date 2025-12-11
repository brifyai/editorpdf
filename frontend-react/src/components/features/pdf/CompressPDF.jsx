import React from 'react';
import PDFToolBase from './PDFToolBase';

const CompressPDF = () => {
  const toolConfig = {
    accept: 'pdf',
    minFiles: 1,
    maxFiles: 1,
    actionButton: 'Optimizar Tamaño',
    successMessage: 'El documento ha sido optimizado correctamente',
    errorMessage: 'No se pudo optimizar el documento',
    options: [
      {
        key: 'compressionLevel',
        label: 'Nivel de compresión:',
        type: 'select',
        default: 'medium',
        values: [
          { value: 'low', label: 'Baja (mejor calidad, menos compresión)' },
          { value: 'medium', label: 'Media (balance calidad/tamaño)' },
          { value: 'high', label: 'Alta (máxima compresión)' }
        ]
      },
      {
        key: 'removeMetadata',
        label: 'Eliminar metadatos',
        type: 'checkbox',
        default: true
      },
      {
        key: 'optimizeImages',
        label: 'Optimizar imágenes',
        type: 'checkbox',
        default: true
      }
    ]
  };

  const handleProcess = async (files, config) => {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const fileName = files[0].name.replace('.pdf', '');
    const compressedPdf = new Blob([`PDF comprimido simulado - ${config.compressionLevel}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(compressedPdf);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_optimizado.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PDFToolBase
      title="Optimizar Tamaño PDF"
      subtitle="Reduce el peso del documento manteniendo la máxima calidad posible"
      icon="🗜️"
      gradient="linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
      toolConfig={toolConfig}
      onProcess={handleProcess}
    />
  );
};

export default CompressPDF;