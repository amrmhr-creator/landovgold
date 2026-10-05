import { readFile } from "node:fs/promises";
import path from "node:path";
import { isImageName, shareImageFile, uploadDir } from "@/lib/uploads";

// Serves photos uploaded from the admin panel, and their link-preview JPGs. Names are random and
// never reused, so browsers may keep a copy for a long time.
const headers = (type: string) => ({ "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" });

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (file.endsWith("-og.jpg")) {
    const body = await shareImageFile(file);
    return body ? new Response(new Uint8Array(body), { headers: headers("image/jpeg") }) : new Response("Not found", { status: 404 });
  }
  if (!isImageName(file)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(uploadDir(), file));
    return new Response(new Uint8Array(body), { headers: headers("image/webp") });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
