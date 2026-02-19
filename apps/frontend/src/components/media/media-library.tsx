'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { FileUpload, MediaType as MediaTypeEnum } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Image, Video, File, Music, Trash2, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'AUDIO';
  url: string;
  uploadedById: string;
  createdAt: string;
}

const MEDIA_QUERIES = {
  ALL_MEDIA: `
    query Media($type: MediaType) {
      media(type: $type, limit: 50) {
        id
        filename
        originalName
        mimeType
        size
        type
        url
        uploadedById
        createdAt
      }
    }
  `,
  DELETE_MEDIA: `
    mutation DeleteMedia($id: ID!) {
      deleteMedia(id: $id)
    }
  `,
};

interface MediaLibraryProps {
  onSelect?: (mediaId: string, url: string) => void;
  selectMode?: boolean;
}

export function MediaLibrary({ onSelect, selectMode = false }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mediaType = activeTab === 'all' ? undefined : activeTab.toUpperCase();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['media', mediaType],
    queryFn: async () => {
      const result = await graphqlClient.request(MEDIA_QUERIES.ALL_MEDIA, {
        type: mediaType,
      });
      return result.media as Media[];
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: string) => {
      await graphqlClient.request(MEDIA_QUERIES.DELETE_MEDIA, { id });
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleUploadComplete = () => {
    refetch();
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus media ini?')) {
      await deleteMediaMutation.mutateAsync(id);
    }
  };

  const handleSelect = (mediaId: string, url: string) => {
    if (onSelect) {
      onSelect(mediaId, url);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-5 h-5" />;
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'PDF':
        return <File className="w-5 h-5" />;
      case 'AUDIO':
        return <Music className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="image">
            <Image className="w-4 h-4 mr-2" />
            Gambar
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-4 h-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="pdf">
            <File className="w-4 h-4 mr-2" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Music className="w-4 h-4 mr-2" />
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Upload section */}
          {!selectMode && activeTab !== 'all' && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Upload {activeTab}</h3>
              <FileUpload
                mediaType={activeTab.toUpperCase() as MediaTypeEnum}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}

          {/* Media grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((media) => (
                <div
                  key={media.id}
                  className={cn(
                    'group border rounded-lg overflow-hidden hover:shadow-md transition-all',
                    selectMode && 'cursor-pointer hover:border-primary',
                  )}
                  onClick={() => selectMode && handleSelect(media.id, media.url)}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                    {media.type === 'IMAGE' ? (
                      <img
                        src={media.url}
                        alt={media.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getIcon(media.type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-medium truncate" title={media.originalName}>
                      {media.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(media.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(media.url, media.id);
                        }}
                      >
                        {copiedId === media.id ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>

                      {!selectMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(media.id);
                          }}
                          disabled={deleteMediaMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada media</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dialog wrapper for media library
export function MediaLibraryDialog({
  onSelect,
  trigger,
}: {
  onSelect: (mediaId: string, url: string) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (mediaId: string, url: string) => {
    onSelect(mediaId, url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Pilih dari Library</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Pilih media dari library atau upload baru
          </DialogDescription>
        </DialogHeader>
        <MediaLibrary onSelect={handleSelect} selectMode />
      </DialogContent>
    </Dialog>
  );
}
