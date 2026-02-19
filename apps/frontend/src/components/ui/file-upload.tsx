'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

export type MediaType = 'IMAGE' | 'VIDEO' | 'PDF' | 'AUDIO';

interface FileUploadProps {
  onUploadComplete: (mediaId: string, url: string) => void;
  mediaType: MediaType;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZES = {
  IMAGE: 5,
  VIDEO: 20,
  PDF: 10,
  AUDIO: 10,
};

const DEFAULT_ACCEPT = {
  IMAGE: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  VIDEO: 'video/mp4,video/webm,video/quicktime',
  PDF: 'application/pdf',
  AUDIO: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg',
};

export function FileUpload({
  onUploadComplete,
  mediaType,
  folder = 'uploads',
  accept,
  maxSize,
  className,
  disabled = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get token from auth store
  const accessToken = useAuthStore((state) => state.accessToken);

  const maxFileSize = (maxSize || DEFAULT_MAX_SIZES[mediaType]) * 1024 * 1024;
  const acceptedTypes = accept || DEFAULT_ACCEPT[mediaType];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      setError(`File terlalu besar. Maksimum ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsSuccess(false);

    // Generate preview for images and videos
    if (
      (mediaType === 'IMAGE' && selectedFile.type.startsWith('image/')) ||
      (mediaType === 'VIDEO' && selectedFile.type.startsWith('video/'))
    ) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!accessToken) {
        throw new Error('Silakan login terlebih dahulu');
      }

      // Create FormData with GraphQL multipart request
      const formData = new FormData();
      
      // GraphQL operation
      const operations = JSON.stringify({
        query: `
          mutation UploadMedia($file: Upload!, $type: MediaType!, $folder: String) {
            uploadMedia(file: $file, type: $type, folder: $folder) {
              id
              url
              originalName
              size
            }
          }
        `,
        variables: {
          file: null,
          type: mediaType,
          folder,
        },
      });

      // Map for file upload
      const map = JSON.stringify({
        '0': ['variables.file'],
      });

      formData.append('operations', operations);
      formData.append('map', map);
      formData.append('0', file);

      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apollo-require-preflight': 'true',
        },
        body: formData,
      });

      const result = await response.json();

      if (result.errors) {
        const errorMsg = result.errors[0].message;
        if (errorMsg.includes('not configured') || errorMsg.includes('R2')) {
          throw new Error('Storage belum dikonfigurasi. Hubungi administrator.');
        }
        throw new Error(errorMsg);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const uploadedMedia = result.data.uploadMedia;
      setIsSuccess(true);
      onUploadComplete(uploadedMedia.id, uploadedMedia.url);

      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setIsSuccess(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setIsSuccess(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File input */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          id="file-upload"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        {!file ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Klik untuk pilih {mediaType.toLowerCase()}
            </p>
            <p className="text-xs text-gray-400">
              Maksimum {maxFileSize / (1024 * 1024)}MB
            </p>
          </label>
        ) : (
          <div className="space-y-3">
            {/* Preview */}
            {preview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                {mediaType === 'VIDEO' ? (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            )}

            {/* File info */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {!isUploading && !isSuccess && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Upload button */}
            {!isSuccess && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Success message */}
      {isSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Upload berhasil!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
