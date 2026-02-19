'use client';

import { FileUpload } from '@/components/ui/file-upload';
import { MediaLibrary } from '@/components/media/media-library';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function MediaTestPage() {
  const [uploadedMedia, setUploadedMedia] = useState<{ id: string; url: string }[]>([]);

  const handleUploadComplete = (mediaId: string, url: string) => {
    setUploadedMedia((prev) => [...prev, { id: mediaId, url }]);
    console.log('Uploaded:', mediaId, url);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Media Upload Test</h1>
        <p className="text-gray-600">Test upload dan manajemen media</p>
      </div>

      {/* Upload Tests */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Gambar</h2>
          <FileUpload
            mediaType="IMAGE"
            onUploadComplete={handleUploadComplete}
            folder="lessons"
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
          <FileUpload
            mediaType="VIDEO"
            onUploadComplete={handleUploadComplete}
            folder="tasks"
          />
        </Card>
      </div>

      {/* Recently Uploaded */}
      {uploadedMedia.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Baru Diupload ({uploadedMedia.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedMedia.map((media) => (
              <div key={media.id} className="border rounded-lg overflow-hidden">
                <img
                  src={media.url}
                  alt="Uploaded"
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 text-xs truncate" title={media.id}>
                  {media.id}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Media Library */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Media Library</h2>
        <MediaLibrary />
      </Card>
    </div>
  );
}
