// src/common/utils/upload-to-sersawy.util.ts
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

export async function uploadToSersawy(files: Express.Multer.File[]) {
  const formData = new FormData();

  for (const file of files) {
    formData.append('images[]', Readable.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });
  }

  const response = await axios.post(
    'https://api.sersawy.com/images/',
    formData,
    {
      headers: formData.getHeaders(),
    },
  );

  if (response.data?.success) {
    return response.data.files.map((f) => ({
      path: f.url,
      filename: f.filename,
      size: f.size,
      width: f.dimensions?.width,
      height: f.dimensions?.height,
    }));
  }

  throw new Error('Upload failed: ' + JSON.stringify(response.data));
}
