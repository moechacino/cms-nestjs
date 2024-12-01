import { diskStorage, Options } from 'multer';
import * as fs from 'fs';
export const storageDirectory = {
  storage: 'storage',
  thumbnail: {
    subPath: 'files/thumbnail',
    mainPath: 'storage/files/thumbnail',
  },
  files: {
    mainPath: 'storage/files',
    subPath: 'files',
  },
};

export function getMulterConfig(storageDirectory: string): Options {
  if (!fs.existsSync(storageDirectory)) {
    fs.mkdirSync(storageDirectory, { recursive: true });
  }
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, storageDirectory);
      },
      filename: (req, file, cb) => {
        const filename = `${file.originalname}_${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        cb(null, filename);
      },
    }),
  };
}
