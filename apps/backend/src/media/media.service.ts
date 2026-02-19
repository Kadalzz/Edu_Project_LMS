import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { MediaType } from '../lessons/models/lesson.model';

const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 20 * 1024 * 1024, // 20MB
  PDF: 10 * 1024 * 1024, // 10MB
  AUDIO: 10 * 1024 * 1024, // 10MB
};

const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  PDF: ['application/pdf'],
  AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
};

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private r2Service: R2Service,
  ) {}

  /**
   * Upload media file
   */
  async uploadMedia(
    file: Express.Multer.File,
    type: MediaType,
    userId: string,
    folder: string = 'uploads',
  ) {
    // Validate file type
    if (!ALLOWED_MIME_TYPES[type].includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types for ${type}: ${ALLOWED_MIME_TYPES[type].join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE[type]) {
      const maxSizeMB = MAX_FILE_SIZE[type] / (1024 * 1024);
      throw new BadRequestException(
        `File too large. Maximum size for ${type}: ${maxSizeMB}MB`,
      );
    }

    // Upload to R2
    const { url, key } = await this.r2Service.uploadFile(file, folder);

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        filename: key,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type,
        url,
        uploadedById: userId,
      },
    });

    return media;
  }

  /**
   * Get media by ID
   */
  async getMediaById(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
      },
    });
  }

  /**
   * Get all media (with pagination)
   */
  async getAllMedia(
    type?: MediaType,
    limit: number = 50,
    offset: number = 0,
  ) {
    return this.prisma.media.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        uploadedBy: true,
      },
    });
  }

  /**
   * Get media uploaded by user
   */
  async getMediaByUser(userId: string, type?: MediaType) {
    return this.prisma.media.findMany({
      where: {
        uploadedById: userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: true,
      },
    });
  }

  /**
   * Delete media
   */
  async deleteMedia(id: string, userId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new BadRequestException('Media not found');
    }

    // Only uploader can delete (or admin in future)
    if (media.uploadedById !== userId) {
      throw new BadRequestException('You can only delete your own uploads');
    }

    // Delete from R2
    try {
      await this.r2Service.deleteFile(media.filename);
    } catch (error) {
      console.error('Error deleting from R2:', error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    await this.prisma.media.delete({
      where: { id },
    });

    return { success: true, message: 'Media deleted successfully' };
  }
}
