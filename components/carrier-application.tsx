"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, LoaderCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ApplicationFooter, ApplicationInput, ApplicationPrivacy } from "@/components/application-elements";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { company } from "@/lib/company";
import { carrierFormSchema, carrierInterests, equipmentOptions, type CarrierFormValues } from "@/lib/intake-validation";

export function CarrierApplication({ initialInterest }: { initialInterest: string }) {
  const [savedId, setSavedId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const requestId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CarrierFormValues>({ resolver: zodResolver(carrierFormSchema), defaultValues: { company: "", name: "", email: "", phone: "", dotNumber: "", mcNumber: "", equipment: "", truckCount: "", interest: initialInterest, lanes: "", notes: "", consent: false, website: "" } });

  useEffect(() => { if (savedId) { heading.current?.focus({ preventScroll: true }); panel.current?.scrollIntoView({ block: "start", behavior: "auto" }); } }, [savedId]);

  async function submit(data: CarrierFormValues) {
    setServerError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const result = await fetch("/api/carrier-inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, requestId: requestId.current }), signal: AbortSignal.timeout(20000) });
      const body = await result.json() as { requestId?: string; error?: string };
      if (!result.ok || !body.requestId) throw new Error(body.error || "We couldn’t save your inquiry. Please try again.");
      setSavedId(body.requestId);
    } catch (error) { setServerError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The connection took too long. Please try again; your details are still here."); }
  }

  function selectField(name: "equipment" | "interest", label: string, options: { value: string; label: string }[]) {
    const id = `carrier-${name}`;
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
    <a href="#main" className="skip-link">Skip to carrier inquiry</a>
    <SiteHeader />
    <main id="main" className="application-page">
      <div className="container">
        <nav className="application-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <ChevronRight size={13} aria-hidden="true" />
          <span>Carrier partnerships</span>
        </nav>
        <div className="application-layout">
          <aside className="application-aside">
            <p className="eyebrow blue-eyebrow">Carriers &amp; owner-operators</p>
            <h1>Your capacity.<br />
              <span>Our connection.</span>
            </h1>
            <p>Tell us about your operation and the lanes you like to run. Let’s start a conversation about working together.</p>
            <div className="carrier-page-card">
              <h2>What happens next?</h2>
              <ul>
                <li>
                  <Check size={16} aria-hidden="true" />Our team reviews your company, equipment, and preferred lanes.</li>
                <li>
                  <Check size={16} aria-hidden="true" />We discuss a potential fit and any required documents.</li>
                <li>
                  <Check size={16} aria-hidden="true" />Terms and availability are confirmed before work is arranged.</li>
              </ul>
            </div>
            <div className="application-side-note">
              <strong>Prefer to talk?</strong>
              <a href={company.phoneHref}>
                <Phone size={16} aria-hidden="true" /> {company.phone}</a>
            </div>
          </aside>
          <div className="application-panel" ref={panel}>
            {savedId ? <section className="application-result" role="status">
              <div className="success-icon">
                <Check size={34} aria-hidden="true" />
              </div>
              <h2 ref={heading} tabIndex={-1}>Let’s connect.</h2>
              <p>Your carrier inquiry has been saved for our team to review. Thank you for sharing your operation with Range.</p>
              <div className="quote-reference">Your reference: <strong>CAR-{savedId.slice(0, 8).toUpperCase()}</strong>
              </div>
              <p>This inquiry does not approve your company or assign a load. Our team will discuss the next steps with you.</p>
              <div className="application-result-actions">
                <a href="/" className="primary-button">Back to homepage <ArrowRight aria-hidden="true" />
                </a>
              </div>
            </section> : <>
              <p className="quote-heading-label">CARRIER PARTNERSHIP INQUIRY</p>
              <h2 className="application-step-heading">Tell us about your operation.</h2>
              <p className="carrier-form-intro">Share your contact information, available equipment, and the regions you serve. Fields marked * are required.</p>
              <form onSubmit={handleSubmit(submit)} noValidate>
                <div className="application-fields">
                  <ApplicationInput id="carrier-company" label="Company name" autoComplete="organization" maxLength={150} registration={register("company")} error={errors.company?.message} />
                  <ApplicationInput id="carrier-name" label="Contact name" autoComplete="name" maxLength={120} registration={register("name")} error={errors.name?.message} />
                  <ApplicationInput id="carrier-email" label="Email" type="email" autoComplete="email" maxLength={254} registration={register("email")} error={errors.email?.message} />
                  <ApplicationInput id="carrier-phone" label="Phone" type="tel" autoComplete="tel" maxLength={40} registration={register("phone")} error={errors.phone?.message} />
                  <ApplicationInput id="carrier-dot" label="USDOT number" placeholder="Digits only" maxLength={9} optional registration={register("dotNumber")} error={errors.dotNumber?.message} />
                  <ApplicationInput id="carrier-mc" label="MC number" placeholder="Digits only, if applicable" maxLength={9} optional registration={register("mcNumber")} error={errors.mcNumber?.message} />
                  {selectField("equipment", "Equipment type", equipmentOptions)}
                  <ApplicationInput id="carrier-trucks" label="Available trucks" placeholder="For example, 5" maxLength={5} registration={register("truckCount")} error={errors.truckCount?.message} />
                  <div className="full-width">{selectField("interest", "What would you like to discuss?", carrierInterests)}</div>
                  <div className="form-field full-width">
                    <label htmlFor="carrier-lanes">Preferred lanes or regions *</label>
                    <textarea id="carrier-lanes" maxLength={1000} placeholder="For example, California to Arizona and Texas; West Coast regional…" aria-required="true" aria-invalid={!!errors.lanes} aria-describedby={errors.lanes ? "carrier-lanes-error" : undefined} {...register("lanes")} />{errors.lanes && <small id="carrier-lanes-error">{errors.lanes.message}</small>}</div>
                  <div className="form-field full-width">
                    <label htmlFor="carrier-notes">Anything else? <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea id="carrier-notes" maxLength={2000} placeholder="Equipment details, availability, or questions for our team…" {...register("notes")} />
                  </div>
                  <div className="full-width">
                    <Controller name="consent" control={control} render={({ field }) => <label className="application-checkbox">
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} ref={field.ref} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "carrier-consent-error" : undefined} />I confirm the information above is accurate and agree to be contacted about this inquiry.</label>} />{errors.consent && <p id="carrier-consent-error" className="form-error mt-3" role="alert">{errors.consent.message}</p>}</div>
                </div>
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="carrier-website">Leave empty</label>
                  <input id="carrier-website" tabIndex={-1} autoComplete="off" {...register("website")} />
                </div>{serverError && <p className="form-error mt-5" role="alert">{serverError} You can also call <a href={company.phoneHref}>{company.phone}</a>.</p>}<div className="application-step-actions">
                  <ApplicationPrivacy />
                  <button type="submit" className="primary-button" disabled={isSubmitting}>{isSubmitting ? <>Saving inquiry <LoaderCircle className="spin" aria-hidden="true" />
                  </> : <>Send inquiry <ArrowUpRight aria-hidden="true" />
                  </>}</button>
                </div>
                <p className="application-save-note">Submitting this form does not approve a carrier, assign a load, or confirm payment terms.</p>
              </form>
            </>}
          </div>
        </div>
      </div>
    </main>
    <ApplicationFooter />
  </>;
}
