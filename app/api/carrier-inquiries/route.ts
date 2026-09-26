import { carrierRequestSchema } from "@/lib/intake-validation";
import { formResponse, readFormBody } from "@/lib/server/form-http";
import { saveIntake } from "@/lib/server/intake-storage";

export async function POST(request: Request) {
  const input = await readFormBody(request);
  if (input.error) return input.error;
  const parsed = carrierRequestSchema.safeParse(input.body);
  if (!parsed.success) return formResponse({ error: parsed.error.issues[0]?.message || "Please review your inquiry." }, 400);
  const { requestId, website, ...data } = parsed.data;
  if (website) return formResponse({ error: "We couldn’t submit this form. Please call our team." }, 400);
  return saveIntake("carrier", { requestId, name: data.name, email: data.email, phone: data.phone, payload: { ...data, consentVersion: "carrier-2026-09-06" } });
}
