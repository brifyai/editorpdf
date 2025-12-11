import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook personalizado para manejo de subida de archivos
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Métodos y estado para subida de archivos
 */
export const useFileUpload = (options = {}) => {
  const {
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
    onUpload = () => {},
  } = options;

  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const validateFile = (file) => {
    // Validar tipo de archivo
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      throw new Error(`Tipo de archivo no válido: ${fileExtension}`);
    }

    // Validar tamaño
    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    return true;
  };

  const addFiles = useCallback((newFiles) => {
    try {
      const fileArray = Array.from(newFiles);
      
      // Validar número máximo de archivos
      if (files.length + fileArray.length > maxFiles) {
        throw new Error(`Máximo ${maxFiles} archivos permitidos`);
      }

      // Validar cada archivo
      fileArray.forEach(validateFile);

      // Agregar archivos con ID único
      const filesWithId = fileArray.map(file => ({
        ...file,
        id: Date.now() + Math.random(),
        uploadProgress: 0,
      }));

      setFiles(prev => [...prev, ...filesWithId]);
      toast.success(`${fileArray.length} archivo(s) agregado(s)`);
    } catch (error) {
      toast.error(error.message);
    }
  }, [files, maxFiles, maxSize, acceptedTypes]);

  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('Archivo eliminado');
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    toast.success('Archivos limpiados');
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('No hay archivos para subir');
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    try {
      // Simular subida de archivos (aquí iría la lógica real)
      for (const file of files) {
        // Simular progreso
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: progress,
          }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      await onUpload(files);
      toast.success('Archivos subidos exitosamente');
      clearFiles();
    } catch (error) {
      toast.error('Error al subir archivos: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [files, onUpload, clearFiles]);

  return {
    files,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    hasFiles: files.length > 0,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
  };
};

export default useFileUpload;