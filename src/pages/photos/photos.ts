import fs from "node:fs";
import path from "node:path";

export type Photo = {
  src: string;
  alt: string;
  date: string;
};

const PHOTOS_DIR = path.join(process.cwd(), "public/images/photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

function discoverPhotos(): Photo[] {
  if (!fs.existsSync(PHOTOS_DIR)) return [];

  const yearDirs = fs
    .readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const photos: Photo[] = [];

  for (const yearDir of yearDirs) {
    const dirPath = path.join(PHOTOS_DIR, yearDir.name);
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!file.isFile() || !IMAGE_EXTS.has(ext)) continue;

      const filePath = path.join(dirPath, file.name);
      const stat = fs.statSync(filePath);
      const name = path.basename(file.name, path.extname(file.name));
      const alt = name.replace(/[-_]/g, " ");

      photos.push({
        src: `/images/photos/${yearDir.name}/${file.name}`,
        alt,
        date: stat.mtime.toISOString().slice(0, 10),
      });
    }
  }

  return photos;
}

export const photos: Photo[] = discoverPhotos();
