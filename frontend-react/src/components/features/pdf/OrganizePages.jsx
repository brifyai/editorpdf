import React from 'react';
import PDFToolBase from './PDFToolBase';

const OrganizePages = () => {
  const toolConfig = {
    accept: 'pdf',
    minFiles: 1,
    maxFiles: 1,
    actionButton: 'Organizar Páginas',
    successMessage: 'Las páginas han sido organizadas correctamente',
    errorMessage: 'No se pudieron organizar las páginas',
    options: [
      {
        key: 'order',
        label: 'Orden de páginas:',
        type: 'select',
        default: 'ascending',
        values: [
          { value: 'ascending', label: 'Ascendente (1, 2, 3...)' },
          { value: 'descending', label: 'Descendente (última a primera)' },
          { value: 'reverse', label: 'Invertir orden actual' }
        ]
      },
      {
        key: 'removeBlank',
        label: 'Eliminar páginas en blanco',
        type: 'checkbox',
        default: false
      }
    ]
  };

  const handleProcess = async (files, config) => {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const fileName = files[0].name.replace('.pdf', '');
    const organizedPdf = new Blob([`PDF organizado simulado - ${config.order}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(organizedPdf);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_organizado.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PDFToolBase
      title="Organizar Páginas PDF"
      subtitle="Reordena, elimina o añade páginas según tus necesidades"
      icon="📋"
      gradient="linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)"
      toolConfig={toolConfig}
      onProcess={handleProcess}
    />
  );
};

export default OrganizePages;