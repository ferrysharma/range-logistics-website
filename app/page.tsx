"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Clock3, Headphones, Mail, MapPin, Menu, MoveRight, PackageCheck, Phone, Route, ShieldCheck, Snowflake, Truck, Zap, Repeat2, Layers3, Warehouse, Compass, ClipboardCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Brand } from "@/components/brand";
import { TruckAnimation } from "@/components/truck-animation";
import { SocialLinks } from "@/components/social-links";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { QuoteDialog } from "@/components/quote-dialog";
import { company, services, carrierServices, maps, type ServiceId } from "@/lib/company";

const serviceIcons = [Truck, Snowflake, PackageCheck, Zap, Repeat2, Layers3, Warehouse, Compass];
const carrierIcons = [Truck, Route, Headphones, ClipboardCheck];
const navLinks = [{ href: "#shippers", label: "Shippers" }, { href: "#carriers", label: "Carriers" }, { href: "/careers", label: "Careers" }, { href: "#about", label: "About us" }, { href: "#contact", label: "Contact" }];


export default function Home() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceId>("dry-van");
  const [detailService, setDetailService] = useState<ServiceId | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const quoteOrigin = useRef<HTMLElement | null>(null);
  const detailOrigin = useRef<HTMLElement | null>(null);
  const privacyOrigin = useRef<HTMLElement | null>(null);
  const activeService = services.find((s) => s.id === detailService);

  function openQuote(service: ServiceId = "dry-van") {
    quoteOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedService(service);
    setQuoteOpen(true);
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader isHome onQuote={() => openQuote()} />

    <main id="main">
      <section className="hero" aria-labelledby="hero-heading">
        <img className="hero-image" src="/images/range-highway.webp" alt="A silver semi truck traveling along a desert highway at sunrise" width={1672} height={941} fetchPriority="high" />
        <div className="container hero-inner">
          <div className="hero-content">
            <p className="eyebrow">California roots. Nationwide reach.</p>
            <h1 id="hero-heading">Your freight.<br />
              <span>Our drive.</span>
            </h1>
            <p className="hero-description">More than a load. A promise to keep.<br />Dependable trucking, real people, and a commitment that goes the distance.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => openQuote()}>Move your freight <ArrowUpRight aria-hidden="true" />
              </button>
              <a className="outline-button" href="#careers">Drive with Range <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="hero-footer">
            <p className="hero-note">
              <ShieldCheck aria-hidden="true" /> Driven by care. Delivered with pride.</p>
            <span className="hero-caption">From the Inland Empire. Across America.</span>
            <a href="#services" className="scroll-link">Explore <ArrowDown aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <TruckAnimation />

      <div className="promise-strip">
        <div className="container promises">
          <div className="promise">
            <Route aria-hidden="true" />
            <div>
              <strong>48-state reach</strong>
              <span>Coast-to-coast coverage</span>
            </div>
          </div>
          <div className="promise">
            <Headphones aria-hidden="true" />
            <div>
              <strong>24/7 dispatch</strong>
              <span>People you can reach</span>
            </div>
          </div>
          <div className="promise">
            <Truck aria-hidden="true" />
            <div>
              <strong>Versatile capacity</strong>
              <span>Freight-specific solutions</span>
            </div>
          </div>
          <div className="promise">
            <MapPin aria-hidden="true" />
            <div>
              <strong>California roots</strong>
              <span>Bloomington, California</span>
            </div>
          </div>
        </div>
      </div>

      <section className="services-section" id="shippers" aria-labelledby="services-heading">
        <div className="container">
          <div className="section-intro">
            <div>
              <span id="services" className="section-anchor" />
              <p className="eyebrow blue-eyebrow">For shippers</p>
              <h2 id="services-heading" className="section-heading">Whatever the load.<br />We go the distance.</h2>
            </div>
            <p className="section-copy">From everyday essentials to time-sensitive deliveries, find the right transportation for your next move.</p>
          </div>
          <div className="services-grid">{services.map((service, i) => {
            const Icon = serviceIcons[i]; return <article className="service-card" id={`service-${service.id}`} key={service.id}>
              <div className="service-card-top">
                <Icon aria-hidden="true" />
                <span className="service-index">0{i + 1}</span>
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <button onClick={(event) => { detailOrigin.current = event.currentTarget; setDetailService(service.id); }} aria-label={`Explore ${service.name.toLowerCase()} freight service`}>Explore service <ArrowUpRight aria-hidden="true" />
              </button>
            </article>;
          })}</div>
          <div className="services-bottom">
            <p>A single shipment or a recurring lane. Let’s find your fit.</p>
            <a href="#contact">Talk to our team <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section id="carriers" className="carrier-section" aria-labelledby="carrier-heading">
        <div className="container">
          <div className="section-intro">
            <div>
              <p className="eyebrow blue-eyebrow">For carriers &amp; owner-operators</p>
              <h2 id="carrier-heading" className="section-heading">Good people.<br />Better partnerships.</h2>
            </div>
            <div>
              <p className="section-copy">Tell us about your operation. Let’s explore where your capacity, preferred lanes, and our transportation needs connect.</p>
              <a href="/carriers" className="text-link carrier-intro-link">Start a carrier inquiry <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="carrier-service-grid">{carrierServices.map((service, index) => {
            const Icon = carrierIcons[index]; return <article className="carrier-service-card" key={service.id} id={`carrier-${service.id}`}>
              <Icon aria-hidden="true" />
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <a href={`/carriers?interest=${service.id}`} aria-label={`Discuss ${service.name.toLowerCase()}`}>Let’s connect <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>;
          })}</div>
          <div className="carrier-footnote">
            <span>Equipment. Lanes. People. Let’s find the right fit.</span>
            <a href="/carriers">Connect with our team <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-heading">
        <div className="container about-grid">
          <div className="about-visual">
            <img src="/images/range-on-the-road.webp" alt="Semi trucks parked in a row at a trucking yard" width={1100} height={715} loading="lazy" />
            <div className="about-image-caption">
              <p className="eyebrow">The Range commitment</p>
              <p>Big on the miles.<br />Bigger on the details.</p>
            </div>
          </div>
          <div className="about-content">
            <p className="eyebrow blue-eyebrow">The people behind the miles</p>
            <h2 className="section-heading" id="about-heading">Your business moves.<br />So do we.</h2>
            <p className="section-copy">We’re a family-run trucking company based in Bloomington, California. We believe good transportation starts with a simple idea: care about the people and the freight you carry.</p>
            <div className="about-values">
              <div className="about-value">
                <Check aria-hidden="true" />
                <div>
                  <strong>Real people. Clear communication.</strong>
                  <p>Connect with a dispatch team that understands your shipment.</p>
                </div>
              </div>
              <div className="about-value">
                <Check aria-hidden="true" />
                <div>
                  <strong>A plan for every load.</strong>
                  <p>The right equipment, careful coordination, and attention to detail.</p>
                </div>
              </div>
              <div className="about-value">
                <Check aria-hidden="true" />
                <div>
                  <strong>Relationships that go further.</strong>
                  <p>Built around your next shipment and the ones that follow.</p>
                </div>
              </div>
            </div>
            <a href="#contact" className="text-link">Get to know Range <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="careers" className="careers-section" aria-labelledby="careers-heading">
        <div className="container careers-inner">
          <div>
            <p className="eyebrow">For the people in the driver’s seat</p>
            <h2 className="section-heading" id="careers-heading">Your next chapter.<br />
              <span>The open road.</span>
            </h2>
          </div>
          <div className="careers-copy">
            <p>You keep the country moving. Build your next chapter with a team that values your experience, your time, and the work you do every day.</p>
            <div className="careers-tags">
              <span>CDL-A opportunities</span>
              <span>OTR lanes</span>
              <span>California based</span>
            </div>
            <div className="careers-buttons">
              <a className="light-button" href="/careers">See open positions <ArrowUpRight aria-hidden="true" />

              </a>
              <a href={company.phoneHref}>
                <Phone aria-hidden="true" /> Talk to our team</a>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section" aria-labelledby="contact-heading">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow blue-eyebrow">Let’s get moving</p>
            <h2 className="section-heading" id="contact-heading">A better move<br />starts here.</h2>
            <p className="section-copy">Have freight to move? Tell us where it needs to go. We’ll work with you on the details.</p>
            <div className="contact-actions">
              <button className="primary-button" onClick={() => openQuote()}>Request a quote <ArrowUpRight aria-hidden="true" />
              </button>
              <a href={company.phoneHref}>
                <Phone aria-hidden="true" /> {company.phone}</a>
            </div>
          </div>
          <div className="contact-card">
            <p className="contact-card-title">Connect with Range</p>
            <div className="contact-row">
              <Mail aria-hidden="true" />
              <div>
                <small>Email our team</small>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            </div>
            <div className="contact-row">
              <MapPin aria-hidden="true" />
              <div>
                <small>Address</small>
                <a href={maps.directionsUrl} target="_blank" rel="noopener noreferrer">{company.address}<br />{company.city} <ArrowUpRight size={14} className="inline" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="contact-row">
              <Clock3 aria-hidden="true" />
              <div>
                <small>Here when you need us</small>
                <p>Dispatch available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand />
            <p className="footer-tagline">California roots. Nationwide reach.<br />Your freight. Our drive.</p>
            <SocialLinks />
          </div>
          <nav className="footer-links" aria-label="Footer navigation">{navLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Range Logistics Inc. All rights reserved.</p>
          <button onClick={(event) => { privacyOrigin.current = event.currentTarget; setPrivacyOpen(true); }}>Privacy &amp; your information</button>
        </div>
      </div>
    </footer>

    <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} initialService={selectedService} onCloseAutoFocus={() => quoteOrigin.current?.focus()} />
    <Dialog open={!!activeService} onOpenChange={(open) => { if (!open) setDetailService(null); }}>
      <DialogContent className="quote-modal" onCloseAutoFocus={(event) => { event.preventDefault(); if (!quoteOpen) detailOrigin.current?.focus(); }}>
        <p className="quote-heading-label">RANGE FREIGHT SOLUTIONS</p>
        <DialogTitle>{activeService?.name}</DialogTitle>
        <DialogDescription>{activeService?.label}</DialogDescription>
        <div className="privacy-copy">
          <p>{activeService?.detail}</p>
          <ul className="my-5 space-y-3">{activeService?.examples.map((example) => <li key={example} className="flex items-center gap-3">
            <Check size={17} className="text-primary" aria-hidden="true" />{example}</li>)}</ul>
          <button className="primary-button" onClick={() => { if (detailService) { quoteOrigin.current = detailOrigin.current; setSelectedService(detailService); setDetailService(null); setQuoteOpen(true); } }}>Get a {activeService?.name.toLowerCase()} quote <MoveRight size={18} aria-hidden="true" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
      <DialogContent className="quote-modal" onCloseAutoFocus={(event) => { event.preventDefault(); privacyOrigin.current?.focus(); }}>
        <DialogTitle>Your information</DialogTitle>
        <DialogDescription>How this website handles requests and applications.</DialogDescription>
        <div className="privacy-copy">
          <p>Our forms collect the contact, shipment, company, or employment information you choose to submit. These details are stored so Range Logistics can review your request or application and respond.</p>
          <p>Please do not include payment information, Social Security numbers, or sensitive documents in the form. A quote request does not confirm a shipment or book transportation.</p>
          <p>Driver applications are submitted on this website. Our recruiting team follows up about employment history and any qualification documents needed for the next step.</p>
          <p>For questions about a request or to ask us to remove your information, email <a href={`mailto:${company.email}`}>{company.email}</a>.</p>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
