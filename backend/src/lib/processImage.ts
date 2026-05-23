import sharp from "sharp";

export interface ProcessedImage {
  main: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const main = await sharp(input)
    .rotate()
    .withMetadata({ orientation: undefined, exif: {} })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  const thumb = await sharp(input)
    .rotate()
    .withMetadata({ orientation: undefined, exif: {} })
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  return {
    main: main.data,
    thumb,
    width: main.info.width,
    height: main.info.height,
  };
}
