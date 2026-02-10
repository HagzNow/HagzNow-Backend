import { BadRequestException } from '@nestjs/common';
import { uploadToSersawy } from './upload-to-sersawy.util';

export async function handleImageUpload(
  files: Record<string, Express.Multer.File[] | undefined>,
): Promise<Record<string, string[]>> {
  const uploadedResults: Record<string, string[]> = {};

  try {
    await Promise.all(
      Object.entries(files).map(async ([key, value]) => {
        // If field is missing or empty → return an empty array
        if (!value || !value.length) {
          uploadedResults[key] = [];
          return;
        }

        const uploaded = await uploadToSersawy(value);

        // ✅ Always store as array of file paths
        uploadedResults[key] = uploaded.map((f) => f.path);
      }),
    );
  } catch (err) {
    console.error(
      '❌ Upload to Sersawy failed:',
      err.response?.data || err.message,
    );
    throw new BadRequestException('errors.general.file_upload_failed');
  }

  return uploadedResults;
}
