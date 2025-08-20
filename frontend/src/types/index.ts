export interface SearchResult {
  text: string;
  document_name: string;
  score: number;
}

export interface AskResponse {
  answer: string;
  citations: string[];
}

export interface FileInfo {
  name: string;
  id: string;
  chunks: number;
}

export interface UploadResponse {
  message: string;
  files: FileInfo[];
}