import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store images in a public/uploads directory relative to backend root
const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads');

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.ensureDirectoryExists();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async ensureDirectoryExists() {
    try {
      await fs.ensureDir(UPLOADS_DIR);
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }

  public async saveImage(buffer: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.writeFile(filePath, buffer);
    // Return the URL path
    return `/uploads/${fileName}`;
  }

  public async deleteImage(fileName: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, fileName);
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete image ${fileName}:`, error);
    }
  }

  public getStaticDir(): string {
    return path.join(__dirname, '../../../public');
  }

  public async cleanOldFiles(maxAgeMs: number = 3600000): Promise<void> {
    try {
      const files = await fs.readdir(UPLOADS_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.remove(filePath);
          console.log(`Cleaned up old image: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning old files:', error);
    }
  }
}

export const storageService = StorageService.getInstance();
