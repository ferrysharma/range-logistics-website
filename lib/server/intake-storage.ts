import { getDatabaseBinding } from "@/db";
import { formResponse } from "./form-http";

// Table names are fixed server constants, never supplied by an applicant.
const tables = { driver: "driver_applications", carrier: "carrier_inquiries" } as const;

export async function saveIntake(kind: keyof typeof tables, data: { requestId: string; name: string; email: string; phone: string; payload: object }) {
  try {
    const db = getDatabaseBinding();
    const table = tables[kind];
    const existing = await db.prepare(`SELECT id FROM ${table} WHERE id = ?`).bind(data.requestId).first<{ id: string }>();
    if (existing) return formResponse({ requestId: data.requestId }, 200);
    const recent = await db.prepare(`SELECT COUNT(*) AS total FROM ${table} WHERE email = ? AND created_at >= ?`).bind(data.email, Date.now() - 15 * 60 * 1000).first<{ total: number }>();
    if (recent && recent.total >= 3) return formResponse({ error: "Several submissions were recently received with this email. Please wait 15 minutes or call our team." }, 429);
    await db.prepare(`INSERT INTO ${table} (id, name, email, phone, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`).bind(data.requestId, data.name, data.email, data.phone, JSON.stringify(data.payload), Date.now()).run();
    return formResponse({ requestId: data.requestId }, 201);
  } catch (error) {
    console.error(`${kind} intake unavailable`, error instanceof Error ? error.name : "UnknownError");
    return formResponse({ error: "We couldn’t save your form. Please try again; your information is still on this page." }, 503);
  }
}
