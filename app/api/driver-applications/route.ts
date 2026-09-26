import { driverRequestSchema } from "@/lib/intake-validation";
import { formResponse, readFormBody } from "@/lib/server/form-http";
import { saveIntake } from "@/lib/server/intake-storage";

export async function POST(request: Request) {
  const input = await readFormBody(request);
  if (input.error) return input.error;
  const parsed = driverRequestSchema.safeParse(input.body);
  if (!parsed.success) return formResponse({ error: parsed.error.issues[0]?.message || "Please review your application." }, 400);
  const { requestId, website, ...data } = parsed.data;
  if (website) return formResponse({ error: "We couldn’t submit this form. Please call our recruiting team." }, 400);
  const payload = { ...data, licenseState: data.hasCdlA === "yes" ? data.licenseState : "", workHistory: data.noHistory ? [] : data.workHistory.map((job) => ({ ...job, endMonth: job.current ? "" : job.endMonth })), applicationStage: "initial-recruiting", consentVersion: "driver-2026-09-06" };
  return saveIntake("driver", { requestId, name: `${data.firstName} ${data.lastName}`, email: data.email, phone: data.phone, payload });
}
