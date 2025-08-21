import React, { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { FileInfo } from '../types';

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'text/plain' || file.name.endsWith('.pdf')
    );
    
    if (validFiles.length < 3) {
      setMessage('Debes seleccionar al menos 3 archivos');
      return;
    }

    if (validFiles.length > 10) {
      setMessage('Máximo 10 archivos permitidos');
      return;
    }

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

    setIsUploading(true);
    setMessage('');

    try {
      const result = await apiService.uploadFiles(files);
      setMessage(result.message);
      setUploadedFiles(result.files);
      setFiles([]);
    } catch (error) {
      setMessage('Error al subir archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
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
          <h3>Archivos seleccionados:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button 
                  className="remove-button"
                  onClick={() => removeFile(index)}
                  title="Eliminar archivo"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
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

      {files.length > 0 && (
        <button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="upload-button"
        >
          {isUploading ? '⏳ Subiendo...' : `🚀 Subir ${files.length} archivos`}
        </button>
      )}

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;