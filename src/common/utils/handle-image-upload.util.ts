import { BadRequestException } from '@nestjs/common';
import { uploadToSersawy } from './upload-to-sersawy.util';

export async function handleImageUpload(
  files: Record<string, Express.Multer.File[] | undefined>,
): Promise<Record<string, string | string[]>> {
  const uploadedResults: Record<string, string | string[]> = {};

  try {
    await Promise.all(
      Object.entries(files).map(async ([key, value]) => {
        // If field is missing or empty → skip upload
        if (!value || !value.length) {
          uploadedResults[key] = '';
          return;
        }

        const uploaded = await uploadToSersawy(value);
        uploadedResults[key] =
          uploaded.length === 1
            ? uploaded[0].path
            : uploaded.map((f) => f.path);
      }),
    );
  } catch (err) {
    console.error(
      '❌ Upload to Sersawy failed:',
      err.response?.data || err.message,
    );
    throw new BadRequestException(
      'File upload failed. Please try again later.',
    );
  }

  return uploadedResults;
}
