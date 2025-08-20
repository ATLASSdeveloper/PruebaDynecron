import { AskResponse, SearchResult, UploadResponse } from '../types';

const API_BASE = 'http://localhost:8000/api';

export const apiService = {
  uploadFiles: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir archivos');
    }

    return response.json();
  },

  search: async (query: string): Promise<SearchResult[]> => {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Error en la búsqueda');
    }

    return response.json();
  },

  ask: async (question: string): Promise<AskResponse> => {
    const response = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Error al procesar la pregunta');
    }

    return response.json();
  },

};