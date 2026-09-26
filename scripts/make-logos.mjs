// Generates the web logo variants from the transparent source logo.
// Run with: npm run logos
import sharp from "sharp";

const SRC = "originals/belad-eldahab-logo-transparent.png";

const meta = await sharp(SRC).metadata();
console.log(`source: ${meta.width}x${meta.height}, channels=${meta.channels}, alpha=${meta.hasAlpha}`);

// Trim fully transparent margins so the logo sits tight in the header.
const trimmed = await sharp(SRC).ensureAlpha().trim({ threshold: 1 }).png().toBuffer();

// Header logo: 2x of the ~64px display height.
const header = await sharp(trimmed).resize({ height: 160, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
await sharp(header.data).toFile("public/logo.png");
console.log(`public/logo.png: ${header.info.width}x${header.info.height}`);

// Footer logo: same shape, every visible pixel painted white (alpha preserved).
const { data: alpha, info } = await sharp(header.data).extractChannel("alpha").raw().toBuffer({ resolveWithObject: true });
await sharp({ create: { width: info.width, height: info.height, channels: 3, background: "#ffffff" } })
  .joinChannel(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
  .png({ compressionLevel: 9 })
  .toFile("public/logo-white.png");
console.log(`public/logo-white.png: ${info.width}x${info.height}`);

// Favicon / app icon: square, logo centered on transparent.
await sharp(trimmed)
  .resize({ width: 256, height: 256, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile("app/icon.png");
console.log("app/icon.png: 256x256");
