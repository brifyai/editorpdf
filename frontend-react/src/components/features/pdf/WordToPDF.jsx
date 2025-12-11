import React from 'react';
import PDFToolBase from './PDFToolBase';

const WordToPDF = () => {
  const toolConfig = {
    accept: 'docx',
    minFiles: 1,
    maxFiles: 10,
    actionButton: 'Convertir a PDF',
    successMessage: 'El documento ha sido convertido a PDF correctamente',
    errorMessage: 'No se pudo convertir el documento',
    options: [
      {
        key: 'quality',
        label: 'Calidad de conversión:',
        type: 'select',
        default: 'high',
        values: [
          { value: 'standard', label: 'Estándar (más rápido)' },
          { value: 'high', label: 'Alta (mejor calidad)' },
          { value: 'maximum', label: 'Máxima (mejor resultado)' }
        ]
      },
      {
        key: 'preserveFormatting',
        label: 'Preservar formato original',
        type: 'checkbox',
        default: true
      },
      {
        key: 'includeImages',
        label: 'Incluir imágenes',
        type: 'checkbox',
        default: true
      }
    ]
  };

  const handleProcess = async (files, config) => {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    for (const file of files) {
      const fileName = file.name.replace('.docx', '');
      const convertedPdf = new Blob([`PDF convertido simulado - ${fileName}`], { type: 'application/pdf' });
      const url = URL.createObjectURL(convertedPdf);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <PDFToolBase
      title="Word a PDF"
      subtitle="Convierte documentos DOCX a PDF manteniendo formato y calidad"
      icon="📄"
      gradient="linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)"
      toolConfig={toolConfig}
      onProcess={handleProcess}
    />
  );
};

export default WordToPDF;