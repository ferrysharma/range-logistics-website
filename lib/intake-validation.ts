import { z } from "zod";
import { californiaToday } from "./quote-validation";

export const stateCodes = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const phone = z.string().trim().max(40).refine((value) => /^[+()\d\s.\-x]+$/i.test(value) && value.replace(/\D/g, "").length >= 10, "Enter a valid phone number.");
const email = z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase());
const state = z.string().refine((value) => stateCodes.includes(value), "Select a state.");
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export const driverFormSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email,
  phone,
  city: z.string().trim().min(2, "Enter your city.").max(100),
  state,
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code."),
  hasCdlA: z.string().refine((value) => ["yes", "no"].includes(value), "Choose yes or no."),
  licenseState: z.string().max(2),
  experienceYears: z.string().trim().refine((value) => /^\d{1,2}(\.\d)?$/.test(value) && Number(value) <= 70, "Enter your years of commercial driving experience (0–70)."),
  routePreference: z.string().refine((value) => ["local", "regional", "otr", "open"].includes(value), "Choose a route preference."),
  endorsements: z.array(z.enum(["hazmat", "tanker", "doubles-triples", "passenger", "school-bus"])).max(5),
  availableDate: z.string().refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= californiaToday();
  }, "Choose today or a future date, or leave this blank."),
  noHistory: z.boolean(),
  workHistory: z.array(z.object({
    employer: z.string().trim().max(150),
    jobTitle: z.string().trim().max(100),
    startMonth: z.string().max(7),
    endMonth: z.string().max(7),
    current: z.boolean(),
    reasonForLeaving: z.string().trim().max(300),
  })).max(20),
  notes: z.string().trim().max(2000, "Use 2,000 characters or fewer."),
  certified: z.boolean(),
  website: z.string().max(200),
}).superRefine((data, context) => {
  if (data.hasCdlA === "yes" && !stateCodes.includes(data.licenseState)) context.addIssue({ code: "custom", path: ["licenseState"], message: "Select the state that issued your CDL." });
  if (!data.certified) context.addIssue({ code: "custom", path: ["certified"], message: "Please confirm your information before submitting." });
  if (data.noHistory) return;
  if (!data.workHistory.length) context.addIssue({ code: "custom", path: ["workHistory"], message: "Add an employer or select that you have no previous employment to list." });
  const currentMonth = californiaToday().slice(0, 7);
  data.workHistory.forEach((job, index) => {
    const error = (field: string, message: string) => context.addIssue({ code: "custom", path: ["workHistory", index, field], message });
    if (job.employer.length < 2) error("employer", "Enter the employer name.");
    if (job.jobTitle.length < 2) error("jobTitle", "Enter your job title.");
    if (!monthPattern.test(job.startMonth) || job.startMonth > currentMonth) error("startMonth", "Choose a valid start month that is not in the future.");
    if (!job.current && (!monthPattern.test(job.endMonth) || job.endMonth > currentMonth || job.endMonth < job.startMonth)) error("endMonth", "Choose a valid end month after the start month.");
  });
});

export type DriverFormValues = z.input<typeof driverFormSchema>;
export const driverRequestSchema = z.intersection(driverFormSchema, z.object({ requestId: z.string().uuid() }));

export const carrierInterests = [
  { value: "capacity", label: "Capacity partnerships" },
  { value: "lanes", label: "Lane opportunities" },
  { value: "coordination", label: "Dispatch coordination" },
  { value: "onboarding", label: "Carrier onboarding" },
];
export const equipmentOptions = [
  { value: "dry-van", label: "Dry van" },
  { value: "reefer", label: "Refrigerated" },
  { value: "flatbed", label: "Flatbed" },
  { value: "power-only", label: "Power only" },
  { value: "other", label: "Other / mixed fleet" },
];
export const carrierFormSchema = z.object({
  company: z.string().trim().min(2, "Enter your company name.").max(150),
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email,
  phone,
  dotNumber: z.string().trim().max(9).refine((value) => !value || /^\d{1,9}$/.test(value), "Enter only the digits of your USDOT number."),
  mcNumber: z.string().trim().max(9).refine((value) => !value || /^\d{1,9}$/.test(value), "Enter only the digits of your MC number."),
  equipment: z.string().refine((value) => equipmentOptions.some((option) => option.value === value), "Select your equipment type."),
  truckCount: z.string().refine((value) => /^\d{1,5}$/.test(value) && Number(value) > 0, "Enter the number of available trucks."),
  interest: z.string().refine((value) => carrierInterests.some((option) => option.value === value), "Choose the topic you’d like to discuss."),
  lanes: z.string().trim().min(3, "Tell us which lanes or regions you prefer.").max(1000),
  notes: z.string().trim().max(2000),
  consent: z.boolean().refine((value) => value, "Please confirm that we may respond to your inquiry."),
  website: z.string().max(200),
});
export type CarrierFormValues = z.input<typeof carrierFormSchema>;
export const carrierRequestSchema = carrierFormSchema.extend({ requestId: z.string().uuid() });
