## Day 9 Summary: Media Upload & Management

### Features Implemented ✅

#### Backend (NestJS + GraphQL)

1. **R2 Service** (`apps/backend/src/r2/`)
   - S3-compatible upload to Cloudflare R2
   - File validation (size, type)
   - Signed URL generation
   - File deletion

2. **Media Module** (`apps/backend/src/media/`)
   - GraphQL `uploadMedia` mutation with `Upload` scalar
   - Queries: `media`, `myMedia`, `mediaById`
   - Delete mutation: `deleteMedia`
   - File type support: IMAGE, VIDEO, PDF, AUDIO
   - File size limits:
     - Images: 5MB
     - Videos: 20MB
     - PDF/Audio: 10MB

#### Frontend (Next.js + React)

1. **FileUpload Component** (`components/ui/file-upload.tsx`)
   - Drag-and-drop style upload
   - File preview (for images)
   - Auto-validation (size, type)
   - Upload progress feedback
   - Success/error states

2. **Media Library** (`components/media/media-library.tsx`)
   - Tabbed interface (All, Image, Video, PDF, Audio)
   - Grid display with thumbnails
   - Copy URL functionality
   - Delete media
   - Select mode for integration
   - `MediaLibraryDialog` wrapper component

3. **Test Page** (`/dashboard/media-test`)
   - Upload testing interface
   - Recently uploaded preview
   - Full media library view

### File Structure

```
apps/
├── backend/src/
│   ├── r2/
│   │   ├── r2.module.ts
│   │   └── r2.service.ts
│   ├── media/
│   │   ├── media.module.ts
│   │   ├── media.service.ts
│   │   ├── media.resolver.ts
│   │   └── dto/
│   │       └── upload-media.input.ts
│   ├── main.ts (added graphqlUploadExpress middleware)
│   └── app.module.ts (added Media & R2 modules)
│
└── frontend/src/
    ├── components/
    │   ├── ui/
    │   │   ├── file-upload.tsx (new)
    │   │   └── dialog.tsx (new)
    │   └── media/
    │       └── media-library.tsx (new)
    ├── lib/
    │   └── graphql-client.ts (added graphqlClient export)
    └── app/dashboard/
        └── media-test/
            └── page.tsx (demo page)
```

### Dependencies Added

Backend:
- `@aws-sdk/client-s3` - S3 client for R2
- `@aws-sdk/s3-request-presigner` - Signed URLs
- `graphql-upload` - GraphQL file upload scalar
- `multer` - File upload handling
- `@types/graphql-upload` (dev)
- `@types/multer` (dev)

Frontend:
- `@radix-ui/react-dialog` - Dialog component primitive

### Environment Variables

```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="lms-abk-storage"
R2_PUBLIC_URL="https://your-bucket.r2.dev"
```

**Note**: R2 is optional. If not configured, uploads will be disabled gracefully.

### GraphQL API Examples

#### Upload Media

```graphql
mutation UploadMedia($file: Upload!, $type: MediaType!, $folder: String) {
  uploadMedia(file: $file, type: $type, folder: $folder) {
    id
    url
    originalName
    size
    type
  }
}
```

#### Get All Media

```graphql
query Media($type: MediaType) {
  media(type: $type, limit: 50) {
    id
    filename
    originalName
    mimeType
    size
    type
    url
    createdAt
  }
}
```

#### Delete Media

```graphql
mutation DeleteMedia($id: ID!) {
  deleteMedia(id: $id)
}
```

### Integration Points

The media system can be integrated with:

1. **Lesson Images** - Attach visual aids to lessons
2. **Task Steps** - Upload videos for task demonstrations
3. **Student Avatars** - Profile pictures
4. **Assignment Submissions** - Student work uploads (already implemented in Day 6)

### Usage Example

```tsx
import { FileUpload } from '@/components/ui/file-upload';
import { MediaLibraryDialog } from '@/components/media/media-library';

// Upload component
<FileUpload
  mediaType="IMAGE"
  onUploadComplete={(id, url) => {
    console.log('Uploaded:', id, url);
    // Save to form state
  }}
  folder="lessons"
/>

// Media selector
<MediaLibraryDialog
  onSelect={(id, url) => {
    setFieldValue('imageUrl', url);
  }}
  trigger={<Button>Select from Library</Button>}
/>
```

### Testing

1. **Frontend**: Navigate to `/dashboard/media-test`
2. **Upload**: Test image and video uploads
3. **Library**: View uploaded media in tabs
4. **Delete**: Remove media from library

### Next Steps (Future Enhancements)

- [ ] Integrate with Lesson form (add image field)
- [ ] Integrate with Task steps (video instructions)
- [ ] Integrate with User profile (avatar upload)
- [ ] Add image cropping/resizing
- [ ] Add video thumbnail generation
- [ ] Add bulk upload
- [ ] Add search/filter in media library

### Known Limitations

- R2 credentials required for production uploads
- File upload size enforced by both backend and frontend
- No automatic image optimization (raw upload)
- No CDN caching (direct R2 URLs)

---

**Day 9 Complete!** 🎉  
Media upload system ready for teacher content creation and student submissions.
