import { getDatabaseBinding } from "@/db";
import { quoteRequestSchema } from "@/lib/quote-validation";

const MAX_BODY_BYTES = 16_384;
const response = (body: object, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin)) {
    return response({ error: "Please submit your request from this website." }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return response({ error: "Please send the form as JSON." }, 415);
  }

  let payload: unknown;
  try {
    // Read a bounded body even when Content-Length is absent.
    const reader = request.body?.getReader();
    if (!reader) return response({ error: "Please complete the quote form." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return response({ error: "Your request is too large. Please shorten the shipment details." }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return response({ error: "We couldn’t read your request. Please try again." }, 400);
  }

  const parsed = quoteRequestSchema.safeParse(payload);
  if (!parsed.success) return response({ error: parsed.error.issues[0]?.message || "Please check your form details." }, 400);
  const data = parsed.data;
  if (data.website) return response({ error: "We couldn’t submit this request. Please call our team." }, 400);

  try {
    const db = getDatabaseBinding();
    // Return the same acknowledgement if the original save succeeded but its response was lost.
    const existing = await db.prepare("SELECT id FROM quote_requests WHERE id = ?").bind(data.requestId).first<{ id: string }>();
    if (existing) return response({ requestId: data.requestId }, 200);

    const recent = await db.prepare("SELECT COUNT(*) AS total FROM quote_requests WHERE email = ? AND created_at >= ?").bind(data.email, Date.now() - 15 * 60 * 1000).first<{ total: number }>();
    if (recent && recent.total >= 3) return response({ error: "Several requests were recently submitted with this email. Please wait 15 minutes or call our team." }, 429);

    await db.prepare(`INSERT INTO quote_requests
      (id, name, company, email, phone, origin, destination, service, pickup_date, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING`).bind(data.requestId, data.name, data.company, data.email, data.phone, data.origin, data.destination, data.service, data.pickupDate, data.details, Date.now()).run();

    return response({ requestId: data.requestId }, 201);
  } catch (error) {
    // Do not log contact or shipment data. There is deliberately no public endpoint that lists requests.
    console.error("Quote request storage unavailable", error instanceof Error ? error.name : "UnknownError");
    return response({ error: "We couldn’t save your request. Please try again in a moment." }, 503);
  }
}
