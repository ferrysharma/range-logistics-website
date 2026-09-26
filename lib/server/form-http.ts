export const formResponse = (body: object, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function readFormBody(request: Request, maximumBytes = 32_768): Promise<{ body: unknown; error?: never } | { error: Response; body?: never }> {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin)) return { error: formResponse({ error: "Please submit this form from our website." }, 403) };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return { error: formResponse({ error: "Please use the application form." }, 415) };
  try {
    const reader = request.body?.getReader();
    if (!reader) return { error: formResponse({ error: "Your form is empty." }, 400) };
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) { await reader.cancel(); return { error: formResponse({ error: "Please shorten your notes and try again." }, 413) }; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch { return { error: formResponse({ error: "We couldn’t read this form. Please try again." }, 400) }; }
}
