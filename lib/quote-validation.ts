import { z } from "zod";
import { serviceIds } from "./company";

export function californiaToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export const quoteFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100, "Use 100 characters or fewer."),
  company: z.string().trim().min(2, "Enter your company name.").max(150, "Use 150 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).refine((value) => !value || /^[+()\d\s.\-x]+$/i.test(value) && value.replace(/\D/g, "").length >= 10, "Enter a valid phone number, or leave this blank."),
  origin: z.string().trim().min(2, "Enter a pickup city and state or ZIP.").max(120),
  destination: z.string().trim().min(2, "Enter a delivery city and state or ZIP.").max(120),
  service: z.enum(serviceIds),
  pickupDate: z.string().refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= californiaToday();
  }, "Choose today or a future pickup date."),
  details: z.string().trim().max(2000, "Use 2,000 characters or fewer."),
  website: z.string().max(200).default(""),
});

export const quoteRequestSchema = quoteFormSchema.extend({ requestId: z.string().uuid() });
export type QuoteFormValues = z.input<typeof quoteFormSchema>;
