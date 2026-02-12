import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from './upload.service';
import { UploadEntity } from './multer.config';

describe('UploadService', () => {
  let service: UploadService;
  const tmpDir = path.join(process.cwd(), 'uploads-test');

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    process.env.UPLOAD_DIR = tmpDir;
  });

  afterAll(() => {
    // Clean up test uploads directory
    if (fs.existsSync(tmpDir)) {
      const entries = fs.readdirSync(tmpDir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(tmpDir, entry.name);
        if (entry.isDirectory()) {
          fs.rmSync(entryPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(entryPath);
        }
      }
      fs.rmdirSync(tmpDir);
    }
    delete process.env.UPLOAD_DIR;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should process an image buffer and return relative path', async () => {
    // 1x1 white PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
      'base64',
    );

    const fakeFile = {
      buffer: pngBuffer,
      originalname: 'test.png',
      mimetype: 'image/png',
    } as Express.Multer.File;

    const relativePath = await service.processImage(
      fakeFile,
      UploadEntity.USERS,
    );

    expect(relativePath).toContain('users/');

    const fullPath = path.join(tmpDir, relativePath.replace(/\//g, path.sep));
    expect(fs.existsSync(fullPath)).toBe(true);
  });
});

