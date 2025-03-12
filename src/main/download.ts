import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { app } from 'electron';

export async function downloadFiles(
  files: string[],
): Promise<{ success: boolean; path?: string; error?: string }> {
  const downloadPath = path.join(app.getPath('downloads'), 'XsnlFiles');

  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }

  try {
    let downloadedCount = 0;

    for (const fileUrl of files) {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(downloadPath, fileName);

      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          downloadedCount++;
          console.log(
            `Downloaded: ${fileName} (${downloadedCount}/${files.length})`,
          );
          resolve(null);
        });
        writer.on('error', reject);
      });
    }

    return { success: true, path: downloadPath };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: 'Failed to download files' };
  }
}
