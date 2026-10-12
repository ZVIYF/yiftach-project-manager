import { OperationResult } from '../types/common.types';

export interface UploadOptions {
  folder?: string;
  authToken?: string;
}

export interface UploadResponse {
  url: string;
  path: string;
  name: string;
  size: number;
}

/**
 * Storage Service abstracting file uploads to Cloudflare R2 via Edge Functions.
 */
export class StorageService {
  private readonly uploadEndpoint = '/api/upload';

  /**
   * Uploads a file securely to Cloudflare R2 with JWT authentication.
   *
   * @param {File} file - Browser File instance to upload.
   * @param {UploadOptions} options - Additional options including bearer token and folder.
   * @returns {Promise<OperationResult<UploadResponse>>} Result containing public URL or error message.
   */
  public async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<OperationResult<UploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.folder) {
        formData.append('folder', options.folder);
      }

      const headers: Record<string, string> = {};
      if (options.authToken) {
        headers['Authorization'] = `Bearer ${options.authToken}`;
      }

      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: (errorData as { error?: string }).error || `Upload failed with status ${response.status}`,
        };
      }

      const data: UploadResponse = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error occurred',
      };
    }
  }
}

export const storageService = new StorageService();

