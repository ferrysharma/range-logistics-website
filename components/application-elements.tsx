"use client";

import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { company } from "@/lib/company";

export function ApplicationInput({ id, label, registration, error, placeholder, type = "text", autoComplete, optional = false, min, max, maxLength }: { id: string; label: string; registration: UseFormRegisterReturn; error?: string; placeholder?: string; type?: HTMLInputTypeAttribute; autoComplete?: HTMLInputAutoCompleteAttribute; optional?: boolean; min?: string; max?: string; maxLength?: number }) {
  return <div className="form-field">
    <label htmlFor={id}>{label} {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : <span aria-hidden="true">*</span>}</label>
    <input id={id} type={type} placeholder={placeholder} autoComplete={autoComplete} min={min} max={max} maxLength={maxLength} aria-required={!optional} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...registration} />{error && <small id={`${id}-error`}>{error}</small>}</div>;
}

export function ApplicationPrivacy() {
  return <Dialog>
    <DialogTrigger asChild>
      <button type="button" className="application-privacy-link">Privacy &amp; your information</button>
    </DialogTrigger>
    <DialogContent className="quote-modal">
      <DialogTitle>Your information</DialogTitle>
      <DialogDescription>How Range Logistics handles applications and inquiries.</DialogDescription>
      <div className="privacy-copy">
        <p>We store the contact, company, driving experience, and employment information you submit so our team can review your inquiry or application and respond.</p>
        <p>This is an initial recruiting or partnership inquiry. Driver qualification documents and any carrier agreements are handled during the follow-up process. Do not enter Social Security numbers, bank information, or sensitive documents in these forms.</p>
        <p>For questions or to request removal of your submitted information, contact <a href={`mailto:${company.email}`}>{company.email}</a>.</p>
      </div>
    </DialogContent>
  </Dialog>;
}

export function ApplicationFooter() {
  return <footer className="application-footer">
    <div className="container application-footer-inner">
      <Brand />
      <div className="application-footer-links">
        <ApplicationPrivacy />
        <a href="/">Back to homepage <ArrowRight size={14} className="inline" aria-hidden="true" />
        </a>
      </div>
      <p>© {new Date().getFullYear()} {company.name}</p>
    </div>
  </footer>;
}
