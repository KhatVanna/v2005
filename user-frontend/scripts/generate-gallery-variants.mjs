import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDir = path.join(__dirname, "../public/images/products");
const galleryDir = path.join(productsDir, "gallery");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function makeVariant(inputPath, outputPath, mode) {
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const size = 1000;
  const width = meta.width || size;
  const height = meta.height || size;

  let pipeline;

  if (mode === 2) {
    const rotated = await sharp(inputPath)
      .rotate(8, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .resize(Math.round(width * 0.9), Math.round(height * 0.9), {
        fit: "inside",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    }).composite([{ input: rotated, gravity: "center" }]);
  } else if (mode === 3) {
    const crop = Math.min(width, height);
    const cropSize = Math.floor(crop * 0.72);
    const left = Math.max(0, Math.floor((width - cropSize) / 2));
    const top = Math.max(0, Math.floor((height - cropSize) / 2));

    pipeline = sharp(inputPath)
      .extract({ left, top, width: cropSize, height: cropSize })
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } });
  } else {
    pipeline = sharp(inputPath)
      .resize(Math.round(size * 1.12), Math.round(size * 1.12), {
        fit: "cover",
        position: "centre",
      })
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } });
  }

  await pipeline.png().toFile(outputPath);
}

async function main() {
  await ensureDir(galleryDir);
  const files = (await fs.promises.readdir(productsDir)).filter(
    (file) => file.endsWith(".png") && !file.startsWith(".")
  );

  let created = 0;

  for (const file of files) {
    const base = path.basename(file, ".png");
    const input = path.join(productsDir, file);

    for (const mode of [2, 3, 4]) {
      const output = path.join(galleryDir, `${base}-${mode}.png`);
      await makeVariant(input, output, mode);
      created += 1;
    }
  }

  console.log(`created=${created} from=${files.length} sources`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
