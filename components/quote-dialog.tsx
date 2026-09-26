"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { company, services, type ServiceId } from "@/lib/company";
import { californiaToday, quoteFormSchema, type QuoteFormValues } from "@/lib/quote-validation";

type QuoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialService: ServiceId;
  onCloseAutoFocus: () => void;
};

export function QuoteDialog({ open, onOpenChange, initialService, onCloseAutoFocus }: QuoteDialogProps) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="quote-modal" onCloseAutoFocus={(event) => { event.preventDefault(); onCloseAutoFocus(); }} onInteractOutside={(event) => event.preventDefault()}>
      <QuoteForm initialService={initialService} close={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>;
}

function QuoteForm({ initialService, close }: { initialService: ServiceId; close: () => void }) {
  const [savedId, setSavedId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  // Preserve this ID on a failed/repeated submission so a retry never duplicates a request.
  const requestId = useRef<string | null>(null);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: { name: "", company: "", email: "", phone: "", origin: "", destination: "", service: initialService, pickupDate: "", details: "", website: "" },
  });

  async function submit(values: QuoteFormValues) {
    setServerError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, requestId: requestId.current }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json() as { requestId?: string; error?: string };
      if (!response.ok || !result.requestId) throw new Error(result.error || "We couldn’t save your request. Please try again.");
      setSavedId(result.requestId);
    } catch (error) {
      setServerError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The connection took too long. Please try again; your details are still here.");
    }
  }

  if (savedId) return <>
    <DialogTitle>Request received</DialogTitle>
    <DialogDescription>Your freight request has been saved.</DialogDescription>
    <div className="quote-success" role="status">
      <div className="success-icon">
        <Check size={30} aria-hidden="true" />
      </div>
      <h3>Let’s get your freight moving.</h3>
      <p>Thank you for sharing your shipment details. For a time-sensitive load, call our dispatch team at <a href={company.phoneHref}>{company.phone}</a>.</p>
      <div className="quote-reference">Your reference: <strong>RNG-{savedId.slice(0, 8).toUpperCase()}</strong>
      </div>
      <p>A request does not book or confirm a shipment.</p>
      <button className="primary-button" onClick={close}>Back to Range <ArrowUpRight aria-hidden="true" />
      </button>
    </div>
  </>;

  return <>
    <p className="quote-heading-label">YOUR NEXT MOVE STARTS HERE</p>
    <DialogTitle>Let’s talk freight.</DialogTitle>
    <DialogDescription>Share a few details about your shipment. Our team can review the right equipment and lane for your freight.</DialogDescription>
    <form className="quote-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-field">
        <label htmlFor="quote-name">Full name *</label>
        <input id="quote-name" autoComplete="name" placeholder="Your name" maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} />{errors.name && <small id="name-error">{errors.name.message}</small>}</div>
      <div className="form-field">
        <label htmlFor="quote-company">Company *</label>
        <input id="quote-company" autoComplete="organization" placeholder="Company name" maxLength={150} aria-invalid={!!errors.company} aria-describedby={errors.company ? "company-error" : undefined} {...register("company")} />{errors.company && <small id="company-error">{errors.company.message}</small>}</div>
      <div className="form-field">
        <label htmlFor="quote-email">Email *</label>
        <input id="quote-email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />{errors.email && <small id="email-error">{errors.email.message}</small>}</div>
      <div className="form-field">
        <label htmlFor="quote-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input id="quote-phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" maxLength={40} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} {...register("phone")} />{errors.phone && <small id="phone-error">{errors.phone.message}</small>}</div>
      <div className="form-field">
        <label htmlFor="quote-origin">Pickup location *</label>
        <input id="quote-origin" placeholder="City, state or ZIP" maxLength={120} aria-invalid={!!errors.origin} aria-describedby={errors.origin ? "origin-error" : undefined} {...register("origin")} />{errors.origin && <small id="origin-error">{errors.origin.message}</small>}</div>
      <div className="form-field">
        <label htmlFor="quote-destination">Delivery location *</label>
        <input id="quote-destination" placeholder="City, state or ZIP" maxLength={120} aria-invalid={!!errors.destination} aria-describedby={errors.destination ? "destination-error" : undefined} {...register("destination")} />{errors.destination && <small id="destination-error">{errors.destination.message}</small>}</div>
      <div className="form-field">
        <label htmlFor="quote-service">Freight service *</label>
        <Controller name="service" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger id="quote-service" ref={field.ref} onBlur={field.onBlur} aria-label="Freight service">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{services.map((service) => <SelectItem value={service.id} key={service.id}>{service.name}</SelectItem>)}</SelectContent>
        </Select>} />
      </div>
      <div className="form-field">
        <label htmlFor="quote-date">Pickup date <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input id="quote-date" type="date" min={californiaToday()} aria-invalid={!!errors.pickupDate} aria-describedby={errors.pickupDate ? "date-error" : undefined} {...register("pickupDate")} />{errors.pickupDate && <small id="date-error">{errors.pickupDate.message}</small>}</div>
      <div className="form-field full-width">
        <label htmlFor="quote-details">Shipment details <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea id="quote-details" placeholder="Commodity, weight, dimensions, temperature, or timing requirements…" maxLength={2000} {...register("details")} />{errors.details && <small>{errors.details.message}</small>}</div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="quote-website">Leave this field empty</label>
        <input id="quote-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      {serverError && <p className="form-error full-width" role="alert">{serverError} You can also call <a href={company.phoneHref}>{company.phone}</a>.</p>}
      <p className="form-note full-width">Your details are stored so Range Logistics can respond to this request. Submitting does not book a shipment.</p>
      <button type="submit" className="primary-button quote-submit full-width" disabled={isSubmitting}>{isSubmitting ? <>Saving your request <LoaderCircle className="spin" aria-hidden="true" />
      </> : <>Send quote request <ArrowUpRight aria-hidden="true" />
      </>}</button>
    </form>
    <p className="quote-direct">Prefer a conversation? <a href={company.phoneHref}>Call {company.phone}</a>
    </p>
  </>;
}
