import { getSettings } from "@/lib/settings";

// Every WhatsApp button on the site points here (see whatsappLink), so changing the number
// in /admin/settings updates all of them at once.
export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("text") ?? "";
  const { whatsappNumber } = await getSettings();
  const target = `https://wa.me/${whatsappNumber}${text ? `?text=${encodeURIComponent(text.slice(0, 1000))}` : ""}`;
  return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store" } });
}
