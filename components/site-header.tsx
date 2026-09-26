"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Menu, Phone } from "lucide-react";
import { Brand } from "@/components/brand";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { carrierServices, company, maps, services } from "@/lib/company";

export function SiteHeader({ onQuote, isHome = false }: { onQuote?: () => void; isHome?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const home = isHome ? "" : "/";
  const mobileLinks = [{ href: `${home}#shippers`, label: "For shippers" }, { href: `${home}#carriers`, label: "For carriers" }, { href: "/careers", label: "Careers" }, { href: company.applicationUrl, label: "Driver application" }, { href: `${home}#about`, label: "About Range" }, { href: `${home}#contact`, label: "Contact" }];

  return <>
    <div id="top" className="utility-bar">
      <div className="container utility-inner">
        <a href={maps.directionsUrl} target="_blank" rel="noopener noreferrer">
          <MapPin aria-hidden="true" /> Bloomington, California <span className="utility-coverage">· Nationwide transportation</span>
        </a>
        <a href={company.phoneHref}>
          <Phone aria-hidden="true" /> {company.phone}</a>
      </div>
    </div>
    <header className="site-header">
      <div className="container nav-inner">
        <Brand href={isHome ? "#top" : "/"} />
        <NavigationMenu className="enhanced-desktop-nav" viewport={false} value={openMenu} onValueChange={setOpenMenu} aria-label="Main navigation">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Shippers</NavigationMenuTrigger>
              <NavigationMenuContent className="shipper-mega-menu">
                <div className="mega-intro">
                  <strong>Freight, handled.</strong>
                  <p>Find the right service for your next move.</p>
                </div>
                <div className="mega-links">{services.map((service) => <NavigationMenuLink asChild key={service.id}>
                  <a href={`${home}#service-${service.id}`} onClick={() => setOpenMenu("")}>
                    <strong>{service.name}</strong>
                    <span>{service.label}</span>
                  </a>
                </NavigationMenuLink>)}</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Carriers</NavigationMenuTrigger>
              <NavigationMenuContent className="carrier-mega-menu">
                <div className="mega-intro">
                  <strong>Better connections.</strong>
                  <p>Let’s get to know your operation.</p>
                </div>
                <div className="mega-links">{carrierServices.map((service) => <NavigationMenuLink asChild key={service.id}>
                  <a href={`${home}#carrier-${service.id}`} onClick={() => setOpenMenu("")}>
                    <strong>{service.name}</strong>
                  </a>
                </NavigationMenuLink>)}</div>
                <NavigationMenuLink asChild>
                  <a href="/carriers" className="mega-cta">Connect with Range <ArrowUpRight aria-hidden="true" />
                  </a>
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href="/careers" className="simple-nav-link">Careers</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href={`${home}#about`} className="simple-nav-link">About us</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href={`${home}#contact`} className="simple-nav-link">Contact</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {onQuote ? <button className="primary-button nav-quote" onClick={onQuote}>Get a quote <ArrowUpRight aria-hidden="true" />
        </button> : <a href="/#contact" className="primary-button nav-quote">Get a quote <ArrowUpRight aria-hidden="true" />
        </a>}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="mobile-menu-trigger enhanced-mobile-trigger" aria-label="Open navigation">
              <Menu aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent className="mobile-menu-content">
            <SheetTitle>Explore Range</SheetTitle>
            <SheetDescription>For your freight. For your future.</SheetDescription>
            <nav className="mobile-menu-links" aria-label="Mobile navigation">{mobileLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}</nav>
            <a className="text-link" href={company.phoneHref}>
              <Phone aria-hidden="true" /> {company.phone}</a>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  </>;
}
