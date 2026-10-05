import "server-only";
import path from "node:path";

/**
 * The folder for everything the owner adds from the admin panel: photos, settings, trips,
 * questions, articles, the trash and backups. It's outside the app folder (UPLOAD_DIR, or
 * "landovgold-uploads" next to it) so a new deploy never wipes it.
 */
export function uploadDir() {
  return process.env.UPLOAD_DIR || path.resolve(process.cwd(), "..", "landovgold-uploads");
}
