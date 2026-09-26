"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, LoaderCircle, Phone, Plus, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ApplicationFooter, ApplicationInput, ApplicationPrivacy } from "@/components/application-elements";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { company } from "@/lib/company";
import { driverFormSchema, stateCodes, type DriverFormValues } from "@/lib/intake-validation";
import { californiaToday } from "@/lib/quote-validation";

const stepLabels = ["About you", "Your driving", "Work history", "Review"];
const stepHeadings = ["First, a little about you.", "Tell us about your driving.", "Where have you worked?", "Looking good. Let’s review."];
const stepDescriptions = ["How can our recruiting team reach you? Fields marked * are required.", "Share your CDL experience and the kind of routes you prefer.", "Start with your most recent employer. You can add more employers below.", "Check your information and make any changes before you submit."];
const stepFields: FieldPath<DriverFormValues>[][] = [
  ["firstName", "lastName", "email", "phone", "city", "state", "zip"],
  ["hasCdlA", "licenseState", "experienceYears", "routePreference", "endorsements", "availableDate"],
  ["noHistory", "workHistory"],
];
const emptyJob = () => ({ employer: "", jobTitle: "", startMonth: "", endMonth: "", current: false, reasonForLeaving: "" });
const routeOptions = [{ value: "local", label: "Local" }, { value: "regional", label: "Regional" }, { value: "otr", label: "Over the road (OTR)" }, { value: "open", label: "Open to different routes" }];
const endorsementOptions = [{ value: "hazmat", label: "Hazmat" }, { value: "tanker", label: "Tanker" }, { value: "doubles-triples", label: "Doubles / triples" }, { value: "passenger", label: "Passenger" }, { value: "school-bus", label: "School bus" }] as const;

export function DriverApplication() {
  const [step, setStep] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const requestId = useRef<string | null>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousStep = useRef(0);
  const { register, control, getValues, trigger, handleSubmit, formState: { errors, isSubmitting } } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    shouldUnregister: false,
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", city: "", state: "", zip: "", hasCdlA: "", licenseState: "", experienceYears: "", routePreference: "", endorsements: [], availableDate: "", noHistory: false, workHistory: [emptyJob()], notes: "", certified: false, website: "" },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "workHistory" });
  const hasCdlA = useWatch({ control, name: "hasCdlA" });
  const noHistory = useWatch({ control, name: "noHistory" });
  const historyValues = useWatch({ control, name: "workHistory" });
  const values = getValues();

  useEffect(() => {
    if (step !== previousStep.current || savedId) {
      stepHeading.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    previousStep.current = step;
  }, [step, savedId]);

  async function nextStep() {
    if (advancing || step >= 3) return;
    setAdvancing(true);
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    setAdvancing(false);
    if (valid) setStep(step + 1);
  }

  async function submit(data: DriverFormValues) {
    setServerError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const result = await fetch("/api/driver-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, requestId: requestId.current }), signal: AbortSignal.timeout(20000) });
      const body = await result.json() as { requestId?: string; error?: string };
      if (!result.ok || !body.requestId) throw new Error(body.error || "We couldn’t save your application. Please try again.");
      setSavedId(body.requestId);
    } catch (error) { setServerError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The connection took too long. Please try again; your information is still here."); }
  }

  function selectField(name: "state" | "hasCdlA" | "licenseState" | "routePreference", label: string, options: { value: string; label: string }[]) {
    const id = `driver-${name}`;
    return <div className="form-field">
      <label htmlFor={id}>{label} *</label>
      <Controller name={name} control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger id={id} ref={field.ref} onBlur={field.onBlur} aria-required="true" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${id}-error` : undefined}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>} />{errors[name] && <small id={`${id}-error`}>{errors[name]?.message}</small>}</div>;
  }

  return <>
    <a href="#main" className="skip-link">Skip to application</a>
    <SiteHeader />
    <main id="main" className="application-page">
      <div className="container">
        <nav className="application-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <ChevronRight size={13} aria-hidden="true" />
          <span>Driver application</span>
        </nav>
        <div className="application-layout">
          <aside className="application-aside">
            <p className="eyebrow blue-eyebrow">Drive with Range</p>
            <h1>Your next chapter.<br />
              <span>Starts here.</span>
            </h1>
            <p>Bring your experience. Tell us your goals. Let’s see where the road takes us together.</p>
            <div className="application-side-note">
              <strong>A real team, ready to listen.</strong>
              <p>Have a question about driving with Range? Talk to our recruiting team.</p>
              <a href={company.phoneHref}>
                <Phone size={16} aria-hidden="true" /> {company.phone}</a>
            </div>
          </aside>
          <div className="application-panel" ref={panel}>
            {savedId ? <section className="application-result" role="status">
              <div className="success-icon">
                <Check size={34} aria-hidden="true" />
              </div>
              <h2 ref={stepHeading} tabIndex={-1}>Application received.</h2>
              <p>Thank you for taking the first step with Range. Your information is saved for our recruiting team to review.</p>
              <div className="quote-reference">Your reference: <strong>DRV-{savedId.slice(0, 8).toUpperCase()}</strong>
              </div>
              <p>Our team can follow up about opportunities and the qualification documents needed for the next step. For questions, call {company.phone}.</p>
              <div className="application-result-actions">
                <a href="/" className="primary-button">Back to homepage <ArrowRight aria-hidden="true" />
                </a>
                <a href={company.phoneHref} className="application-back">
                  <Phone size={16} aria-hidden="true" /> Call recruiting</a>
              </div>
            </section> : <>
              <div className="application-progress-meta">
                <strong>DRIVER APPLICATION</strong>
                <span>Step {step + 1} of 4</span>
              </div>
              <Progress className="application-progress" value={(step + 1) * 25} aria-label="Driver application progress" />
              <nav className="application-steps" aria-label="Application steps">{stepLabels.map((label, index) => <button type="button" key={label} disabled={index > step || isSubmitting} onClick={() => setStep(index)} aria-current={index === step ? "step" : undefined}>
                <span className="step-number">{index < step ? <Check size={13} aria-hidden="true" /> : index + 1}</span>{label}</button>)}</nav>
              <h2 className="application-step-heading" ref={stepHeading} tabIndex={-1}>{stepHeadings[step]}</h2>
              <p className="application-step-description">{stepDescriptions[step]}</p>
              <form onSubmit={step === 3 ? handleSubmit(submit, (validationErrors) => {
                const invalidStep = stepFields.findIndex((names) => names.some((name) => Object.hasOwn(validationErrors, name)));
                if (invalidStep >= 0) setStep(invalidStep);
              }) : (event) => { event.preventDefault(); void nextStep(); }} noValidate>
                {step === 0 && <div className="application-fields">
                  <ApplicationInput id="driver-first" label="First name" autoComplete="given-name" maxLength={80} registration={register("firstName")} error={errors.firstName?.message} />
                  <ApplicationInput id="driver-last" label="Last name" autoComplete="family-name" maxLength={80} registration={register("lastName")} error={errors.lastName?.message} />
                  <ApplicationInput id="driver-email" label="Email" type="email" autoComplete="email" maxLength={254} registration={register("email")} error={errors.email?.message} />
                  <ApplicationInput id="driver-phone" label="Phone" type="tel" autoComplete="tel" maxLength={40} registration={register("phone")} error={errors.phone?.message} />
                  <ApplicationInput id="driver-city" label="City" autoComplete="address-level2" maxLength={100} registration={register("city")} error={errors.city?.message} />
                  {selectField("state", "State", stateCodes.map((code) => ({ value: code, label: code })))}
                  <ApplicationInput id="driver-zip" label="ZIP code" autoComplete="postal-code" maxLength={10} registration={register("zip")} error={errors.zip?.message} />
                </div>}

                {step === 1 && <div className="application-fields">
                  {selectField("hasCdlA", "Do you have a valid CDL Class A?", [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }])}
                  {hasCdlA === "yes" && selectField("licenseState", "CDL issuing state", stateCodes.map((code) => ({ value: code, label: code })))}
                  <ApplicationInput id="driver-experience" label="Years of commercial driving" placeholder="For example, 3 or 0.5" maxLength={4} registration={register("experienceYears")} error={errors.experienceYears?.message} />
                  {selectField("routePreference", "Preferred routes", routeOptions)}
                  <ApplicationInput id="driver-start" label="Available start date" type="date" min={californiaToday()} optional registration={register("availableDate")} error={errors.availableDate?.message} />
                  <div className="form-field full-width">
                    <label>Endorsements <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <Controller name="endorsements" control={control} render={({ field }) => <div className="endorsement-options">{endorsementOptions.map((option) => <label className="application-checkbox" key={option.value}>
                      <Checkbox checked={field.value.includes(option.value)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, option.value] : field.value.filter((value) => value !== option.value))} />{option.label}</label>)}</div>} />
                  </div>
                </div>}

                {step === 2 && <>
                  <Controller name="noHistory" control={control} render={({ field }) => <label className="application-checkbox">
                    <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />I have no previous employment to list.</label>} />
                  {!noHistory && <>{fields.map((field, index) => <section className="employment-card" key={field.id}>
                    <div className="employment-card-header">
                      <h3>Employer {index + 1}</h3>{fields.length > 1 && <button type="button" onClick={() => remove(index)} aria-label={`Remove employer ${index + 1}`}>
                        <Trash2 size={14} aria-hidden="true" />Remove</button>}</div>
                    <div className="application-fields">
                      <ApplicationInput id={`employer-${field.id}`} label="Employer / company" maxLength={150} registration={register(`workHistory.${index}.employer`)} error={errors.workHistory?.[index]?.employer?.message} />
                      <ApplicationInput id={`job-title-${field.id}`} label="Job title" maxLength={100} registration={register(`workHistory.${index}.jobTitle`)} error={errors.workHistory?.[index]?.jobTitle?.message} />
                      <ApplicationInput id={`job-start-${field.id}`} label="Start month" type="month" max={californiaToday().slice(0, 7)} registration={register(`workHistory.${index}.startMonth`)} error={errors.workHistory?.[index]?.startMonth?.message} />
                      {!historyValues?.[index]?.current && <ApplicationInput id={`job-end-${field.id}`} label="End month" type="month" max={californiaToday().slice(0, 7)} registration={register(`workHistory.${index}.endMonth`)} error={errors.workHistory?.[index]?.endMonth?.message} />}
                      <div className="full-width">
                        <Controller name={`workHistory.${index}.current`} control={control} render={({ field: currentField }) => <label className="application-checkbox">
                          <Checkbox checked={currentField.value} onCheckedChange={(checked) => currentField.onChange(checked === true)} />I currently work here.</label>} />
                      </div>
                      {!historyValues?.[index]?.current && <div className="full-width">
                        <ApplicationInput id={`job-reason-${field.id}`} label="Reason for leaving" optional maxLength={300} registration={register(`workHistory.${index}.reasonForLeaving`)} error={errors.workHistory?.[index]?.reasonForLeaving?.message} />
                      </div>}
                    </div>
                  </section>)}{fields.length < 20 && <button type="button" className="add-employment" onClick={() => append(emptyJob())}>
                    <Plus size={16} aria-hidden="true" /> Add another employer</button>}{errors.workHistory?.message && <p className="form-error" role="alert">{errors.workHistory.message}</p>}</>}
                  <p className="application-review-note">This starts the recruiting process. Our team will follow up on any additional employment history and qualification documents required.</p>
                </>}

                {step === 3 && <>
                  <section className="review-section">
                    <div className="review-heading">
                      <h3>Contact information</h3>
                      <button type="button" onClick={() => setStep(0)}>Edit</button>
                    </div>
                    <dl className="review-details">
                      <div>
                        <dt>Name</dt>
                        <dd>{values.firstName} {values.lastName}</dd>
                      </div>
                      <div>
                        <dt>Home base</dt>
                        <dd>{values.city}, {values.state} {values.zip}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{values.email}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{values.phone}</dd>
                      </div>
                    </dl>
                  </section>
                  <section className="review-section">
                    <div className="review-heading">
                      <h3>Driving experience</h3>
                      <button type="button" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <dl className="review-details">
                      <div>
                        <dt>Valid Class A CDL</dt>
                        <dd>{values.hasCdlA === "yes" ? `Yes · ${values.licenseState}` : "No"}</dd>
                      </div>
                      <div>
                        <dt>Experience</dt>
                        <dd>{values.experienceYears} years</dd>
                      </div>
                      <div>
                        <dt>Route preference</dt>
                        <dd>{routeOptions.find((option) => option.value === values.routePreference)?.label}</dd>
                      </div>
                      <div>
                        <dt>Available</dt>
                        <dd>{values.availableDate || "To be discussed"}</dd>
                      </div>
                      <div className="full-width">
                        <dt>Endorsements</dt>
                        <dd>{values.endorsements.length ? endorsementOptions.filter((option) => values.endorsements.includes(option.value)).map((option) => option.label).join(", ") : "None selected"}</dd>
                      </div>
                    </dl>
                  </section>
                  <section className="review-section">
                    <div className="review-heading">
                      <h3>Employment history</h3>
                      <button type="button" onClick={() => setStep(2)}>Edit</button>
                    </div>{values.noHistory ? <p className="text-sm text-muted-foreground">No previous employment listed.</p> : <div className="space-y-4">{values.workHistory.map((job, index) => <div key={index} className="text-sm leading-7">
                      <strong>{job.employer}</strong>
                      <p className="text-muted-foreground">{job.jobTitle} · {job.startMonth} – {job.current ? "Present" : job.endMonth}</p>
                    </div>)}</div>}</section>
                  <div className="form-field">
                    <label htmlFor="driver-notes">Anything else you’d like us to know? <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea id="driver-notes" maxLength={2000} placeholder="Your goals, preferred schedule, or questions for our team…" {...register("notes")} />{errors.notes && <small>{errors.notes.message}</small>}</div>
                  <div className="mt-6">
                    <Controller name="certified" control={control} render={({ field }) => <label className="application-checkbox">
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} ref={field.ref} aria-invalid={!!errors.certified} aria-describedby={errors.certified ? "certification-error" : undefined} />I confirm that this information is accurate to the best of my knowledge and agree to be contacted by Range Logistics about my application.</label>} />{errors.certified && <p id="certification-error" className="form-error mt-3" role="alert">{errors.certified.message}</p>}</div>
                  <p className="application-review-note">Submitting this form begins the recruiting process. It is not an offer of employment. <ApplicationPrivacy />
                  </p>
                </>}

                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="driver-website">Leave empty</label>
                  <input id="driver-website" tabIndex={-1} autoComplete="off" {...register("website")} />
                </div>
                {serverError && <p className="form-error mt-5" role="alert">{serverError} You can also call <a href={company.phoneHref}>{company.phone}</a>.</p>}
                <div className="application-step-actions">{step > 0 ? <button type="button" className="application-back" disabled={isSubmitting} onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={16} aria-hidden="true" /> Back</button> : <span className="text-xs text-muted-foreground">Your details stay on this page.</span>}{step < 3 ? <button type="submit" className="primary-button" disabled={advancing}>{advancing ? "Checking…" : "Continue"}<ArrowRight aria-hidden="true" />
                  </button> : <button type="submit" className="primary-button" disabled={isSubmitting}>{isSubmitting ? <>Saving application <LoaderCircle className="spin" aria-hidden="true" />
                  </> : <>Submit application <ArrowUpRight aria-hidden="true" />
                  </>}</button>}</div>
                <p className="application-save-note">You can go back to change your answers before submitting. Refreshing or leaving this page clears an unsent application.</p>
              </form>
            </>}
          </div>
        </div>
      </div>
    </main>
    <ApplicationFooter />
  </>;
}
