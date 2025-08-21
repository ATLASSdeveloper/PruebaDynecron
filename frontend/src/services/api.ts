import { AskResponse,  } from '../types/askResponse';
import { SearchResult } from '../types/searchResult';
import { UploadResponse } from '../types/uploadResponse';
import { rateLimitInterceptor } from '../utils/fetchInterceptor';

const API_BASE = 'http://localhost:8000/api';

export const apiService = {
  uploadFiles: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return rateLimitInterceptor.intercept<UploadResponse>(
      fetch(`${API_BASE}/ingest`, {
        method: 'POST',
        body: formData,
      })
    );
  },

  search: async (query: string): Promise<SearchResult[]> => {
    return rateLimitInterceptor.intercept<SearchResult[]>(
      fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
    );
  },

  ask: async (question: string): Promise<AskResponse> => {
    return rateLimitInterceptor.intercept<AskResponse>(
      fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })
    );
  },
};