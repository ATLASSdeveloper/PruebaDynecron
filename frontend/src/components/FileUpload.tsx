import React, { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { FileInfo } from '../types/fileInfo';
import { useRateLimit } from '../hooks/useRateLimit';
import RateLimitNotification from './RateLimitNotification';

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { rateLimit, resetRateLimit } = useRateLimit();
  const [error, setError] = useState('');

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
      e.target.value = '';
    }
  };

  const handleFiles = (newFiles: File[]) => {
    if (rateLimit.isLimited) {
      setError(rateLimit.message);
      return;
    }
    
    const validFiles = newFiles.filter(file => {
      const isText = file.type === 'text/plain';
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      return isText || isPDF;
    });
    
    if (validFiles.length < newFiles.length) {
      setMessage('Algunos archivos no son válidos. Solo se aceptan .txt y .pdf');
    }
    
    if (validFiles.length < 3) {
      setMessage('Debes seleccionar al menos 3 archivos');
      return;
    }

    if (validFiles.length > 10) {
      setMessage('Máximo 10 archivos permitidos');
      return;
    }

    setError('');
    setFiles(validFiles);
    setMessage('');
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (files.length < 3) {
      setMessage('Mínimo 3 archivos requeridos');
      return;
    }

    if (rateLimit.isLimited) {
      setError(rateLimit.message);
      return;
    }

    setIsUploading(true);
    setMessage('');
    setError('');

    try {
      const result = await apiService.uploadFiles(files);
      setMessage(result.message);
      setUploadedFiles(result.files);
      setFiles([]);
    } catch (err: any) {
      if (err.response?.status === 429 || err.message === 'RATE_LIMIT_EXCEEDED') {
        setError('Límite de solicitudes excedido. Por favor espere.');
      } else {
        setError('Error en la búsqueda. Intenta nuevamente.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setMessage('');
  };
  
  return (
    <div className="file-upload">
      <h2>📁 Subir Documentos</h2>
      
      <div 
        className="drop-zone"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={triggerFileInput}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📂</div>
          <p>Arrastra y suelta archivos aquí</p>
          <p className="file-requirements">(3-10 archivos .txt o .pdf)</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.pdf"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h3>Archivos seleccionados: {files.length}</h3>
          </div>
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button 
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  title="Eliminar archivo"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="upload-actions">
          <button 
            onClick={handleUpload} 
            disabled={isUploading || rateLimit.isLimited}
            className="upload-button"
          >
            {isUploading ? '⏳ Subiendo...' : `🚀 Subir ${files.length} archivos`}
          </button>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>✅ Archivos procesados:</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <span className="uploaded-file-name">{file.name}</span>
                <span className="chunks-count">{file.chunks} fragmentos indexados</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <RateLimitNotification
              isVisible={rateLimit.isLimited}
              message={rateLimit.message}
              retryAfter={rateLimit.retryAfter}
              onClose={resetRateLimit}
            />
    </div>
  );
};

export default FileUpload;