import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { getUploadsRootDir, UploadEntity } from './multer.config';

@Injectable()
export class UploadService {
  private readonly uploadsRoot = getUploadsRootDir();

  private async ensureEntityDir(entity: UploadEntity): Promise<string> {
    const dir = join(this.uploadsRoot, entity);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  private normalizeRelativePath(pathOrUrl: string): string | null {
    if (!pathOrUrl) return null;

    // Strip base URL if present
    const baseUrl = process.env.BASE_URL;
    let cleaned = pathOrUrl;
    if (baseUrl && cleaned.startsWith(baseUrl)) {
      cleaned = cleaned.substring(baseUrl.length);
    }

    // Strip /uploads/ prefix if present
    if (cleaned.startsWith('/')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('uploads/')) {
      cleaned = cleaned.substring('uploads/'.length);
    }

    return cleaned;
  }

  /**
   * Process an uploaded image:
   * - Resize to a max width (1200px)
   * - Convert to WebP
   * - Save under /uploads/{entity}/{uuid}.webp
   * - Optionally delete the original temp file if present
   * Returns the relative path from the uploads root: `{entity}/{uuid}.webp`
   */
  async processImage(
    file: Express.Multer.File,
    entity: UploadEntity,
  ): Promise<string> {
    if (!file) {
      throw new Error('No file provided for processing');
    }

    const entityDir = await this.ensureEntityDir(entity);
    const outputFilename = `${uuidv4()}.webp`;
    const outputPath = join(entityDir, outputFilename);

    const sharpInstance = file.path ? sharp(file.path) : sharp(file.buffer);

    await sharpInstance
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Delete original temp file if we have a disk path
    if (file.path) {
      try {
        await fs.unlink(file.path);
      } catch {
        // ignore failures deleting temp file
      }
    }

    const relativePath = join(entity, outputFilename).replace(/\\/g, '/');
    return relativePath;
  }

  /**
   * Replace an existing image:
   * - Delete the old image if `oldImagePath` is provided
   * - Process and save the new image
   * Returns the new relative path.
   */
  async replaceImage(
    file: Express.Multer.File,
    entity: UploadEntity,
    oldImagePath?: string | null,
  ): Promise<string> {
    if (oldImagePath) {
      await this.deleteImage(oldImagePath);
    }
    return this.processImage(file, entity);
  }

  /**
   * Delete an image from disk, given a relative path like `users/abc.webp`
   * or a full URL containing `/uploads/...`.
   */
  async deleteImage(relativeOrUrl?: string | null): Promise<void> {
    const relative = relativeOrUrl
      ? this.normalizeRelativePath(relativeOrUrl)
      : null;
    if (!relative) return;

    const absolutePath = join(this.uploadsRoot, relative);
    try {
      await fs.unlink(absolutePath);
    } catch {
      // If file does not exist or cannot be deleted, ignore silently
    }
  }

  /**
   * Convenience helper to process many files for the same entity.
   */
  async processMany(
    files: Express.Multer.File[] | undefined,
    entity: UploadEntity,
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const results: string[] = [];
    for (const file of files) {
      const path = await this.processImage(file, entity);
      results.push(path);
    }
    return results;
  }
}

