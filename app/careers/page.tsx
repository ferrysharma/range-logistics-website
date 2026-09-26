import type { Metadata } from "next";
import { ArrowUpRight, Check, ChevronRight, Truck } from "lucide-react";
import { ApplicationFooter } from "@/components/application-elements";
import { SiteHeader } from "@/components/site-header";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Careers | Range Logistics Inc.",
  description: "Explore three CDL Class A reefer driver openings at Range Logistics Inc. in Bloomington, California.",
};

const driverResponsibilities = [
  "Safely operate a Class A tractor-trailer hauling refrigerated freight on assigned OTR lanes.",
  "Complete pre-trip and post-trip inspections, including reefer equipment checks.",
  "Maintain accurate ELD records and required trip documentation.",
  "Secure loads, monitor shipment requirements, and communicate pickup and delivery updates.",
  "Report delays or equipment concerns to dispatch promptly.",
];

const driverRequirements = [
  "Valid CDL Class A and at least two years of verifiable commercial driving experience.",
  "Clean, verifiable driving record and ability to pass DOT physical and drug screening.",
  "Ability to follow FMCSA hours-of-service rules and company safety policies.",
];

function DetailList({ items }: { items: string[] }) {
  return <ul className="career-detail-list">{items.map((item) => <li key={item}><Check size={18} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
}

export default function CareersPage() {
  return <>
    <a href="#main" className="skip-link">Skip to open positions</a>
    <SiteHeader />
    <main id="main" className="careers-page">
      <section className="careers-page-hero" aria-labelledby="careers-page-heading">
        <div className="container">
          <nav className="application-breadcrumb careers-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><ChevronRight size={14} aria-hidden="true" /><span>Careers</span></nav>
          <p className="eyebrow">Join Range Logistics</p>
          <h1 id="careers-page-heading">Move freight.<br /><span>Build your future.</span></h1>
          <p>We’re hiring CDL Class A drivers to move refrigerated freight from our Bloomington, California base.</p>
          <div className="careers-opening-counts"><span><strong>3</strong> Reefer driver openings</span></div>
        </div>
      </section>

      <div className="container careers-board">
        <div className="careers-board-heading"><div><p className="eyebrow blue-eyebrow">Open positions</p><h2>Drive with Range.</h2></div><p>Review the driver position, then apply online when you’re ready.</p></div>

        <article id="reefer-driver" className="career-role-card" aria-labelledby="driver-role-heading">
          <div className="career-role-main">
            <div className="career-role-label"><Truck size={20} aria-hidden="true" /><span>Driving · 3 openings</span></div>
            <h3 id="driver-role-heading">CDL Class A Reefer Driver</h3>
            <p className="career-role-intro">Full-time OTR driving based in Bloomington, California. Haul refrigerated freight with a team focused on safety, communication, and dependable service.</p>
            <dl className="career-facts">
              <div><dt>Location</dt><dd>Bloomington, CA</dd></div>
              <div><dt>Route</dt><dd>Over the road (OTR)</dd></div>
              <div><dt>Compensation</dt><dd>$0.55–$0.60 per mile</dd></div>
              <div><dt>Home time</dt><dd>4 days home after 7–14 days out</dd></div>
              <div><dt>Dispatch</dt><dd>Monday–Friday; occasional weekend availability</dd></div>
              <div><dt>Experience</dt><dd>2 years of verifiable commercial driving</dd></div>
            </dl>
            <div className="career-role-details"><section><h4>What you’ll do</h4><DetailList items={driverResponsibilities} /></section><section><h4>Requirements</h4><DetailList items={driverRequirements} /></section></div>
          </div>
          <aside className="career-apply-panel"><span className="career-apply-kicker">Ready to drive?</span><h4>Start your application.</h4><p>Our online driver application covers your contact information, CDL experience, and work history.</p><a className="primary-button" href={company.applicationUrl}>Apply for a driver opening <ArrowUpRight size={18} aria-hidden="true" /></a><small>Submitting an application begins the recruiting process.</small></aside>
        </article>

      </div>
    </main>
    <ApplicationFooter />
  </>;
}
