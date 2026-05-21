const CLOUD_NAME = 'damr6r9op';
const UPLOAD_PRESET = 'org-resources';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export async function uploadToCloudinary(
  file: File | Blob,
  fileName?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'acadex');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_URL);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.send(formData);
  });
}

export async function uploadFileToCloudinary(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryResponse> {
  return uploadToCloudinary(file, file.name, onProgress);
}

export function getOptimizedImageUrl(url: string, width = 800): string {
  if (!url.includes('cloudinary')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
  return '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
