// Google Drive PDF & Document Upload Client
// Supports both Google Apps Script Web App (Personal Gmail) and Cloudflare Worker

export interface GDriveUploadResult {
  success: boolean;
  fileId?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  viewUrl?: string;
  downloadUrl?: string;
  embedUrl?: string;
  directUrl?: string;
  folderId?: string;
  error?: string;
}

const GDRIVE_WORKER_URL =
  process.env.NEXT_PUBLIC_GDRIVE_WORKER_URL ||
  'https://gdrive-upload-worker.dennismathenge20.workers.dev';

const DEFAULT_FOLDER_ID =
  process.env.NEXT_PUBLIC_GDRIVE_FOLDER_ID || '1KQn8MkvEZiw1gttAGvHnjU0SQRUrqTUo';

/**
 * Upload a PDF or document directly to Google Drive
 * Compatible with Google Apps Script Web App (zero quota limits) & Cloudflare Worker
 * @param file The File object (PDF, DOCX, ZIP, etc.)
 * @param folderId Optional Google Drive destination folder ID (falls back to NEXT_PUBLIC_GDRIVE_FOLDER_ID)
 */
export async function uploadToGoogleDrive(
  file: File,
  folderId?: string
): Promise<GDriveUploadResult> {
  if (!file) {
    return { success: false, error: 'No file selected for upload.' };
  }

  const targetFolder = folderId || DEFAULT_FOLDER_ID;
  const isGoogleAppsScript = GDRIVE_WORKER_URL.includes('script.google.com');

  try {
    let res: Response;

    if (isGoogleAppsScript) {
      // Convert file to Base64 for Google Apps Script Web App
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Simple POST request avoids CORS OPTIONS preflight issues with Google Apps Script
      res = await fetch(GDRIVE_WORKER_URL, {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileBase64: base64Data,
          folderId: targetFolder,
        }),
      });
    } else {
      // Standard multipart/form-data for Cloudflare Worker
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('makePublic', 'true');
      if (targetFolder) {
        formData.append('folderId', targetFolder);
      }

      const uploadEndpoint = `${GDRIVE_WORKER_URL.replace(/\/+$/, '')}/upload`;
      res = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Upload failed with HTTP status ${res.status}`,
      };
    }

    return {
      success: true,
      fileId: data.fileId,
      name: data.name,
      mimeType: data.mimeType,
      size: data.size,
      viewUrl: data.viewUrl,
      downloadUrl: data.downloadUrl,
      embedUrl: data.embedUrl,
      directUrl: data.directUrl,
      folderId: data.folderId,
    };
  } catch (err: any) {
    console.error('Google Drive upload error:', err);
    return {
      success: false,
      error: err.message || 'Failed to upload document to Google Drive.',
    };
  }
}
