// Resizes the chosen photos from the local media folder (landovgold/photos, not in git)
// into compressed WebP files under public/images. Hostinger can't optimize images at runtime.
// Run with: npm run photos
// To swap a photo, change its source here and run again.
import sharp from "sharp";

const SRC = "landovgold/photos";

const PHOTOS = [
  // Aswan program cards
  ["nile/pexels-diego-f-parra-33199-15131476.jpg", "public/images/trips/nile.webp"],
  ["temples/pexels-axp-photography-500641970-18991590.jpg", "public/images/trips/temple.webp"],
  // Aswan page gallery
  ["nile/pexels-toulouse-19820525.jpg", "public/images/gallery/nile.webp"],
  ["temples/pexels-axp-photography-500641970-16535879.jpg", "public/images/gallery/temple.webp"],
  ["Houses/pexels-axp-photography-500641970-18991504.jpg", "public/images/gallery/houses-1.webp"],
  ["Houses/pexels-axp-photography-500641970-18991596.jpg", "public/images/gallery/houses-2.webp"],
];

for (const [from, to] of PHOTOS) {
  const info = await sharp(`${SRC}/${from}`)
    .rotate() // respect the camera's orientation flag
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(to);
  console.log(`${to}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}
