import { FileInfo } from './fileInfo';

export interface UploadResponse {
  message: string;
  files: FileInfo[];
}