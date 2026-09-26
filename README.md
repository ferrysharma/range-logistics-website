# Range Logistics Inc.

A responsive trucking website with freight quotes, an on-site driver application, carrier partnership inquiries, and persistent submission storage.

## Stack

- React 19.2.6 and TypeScript 5.9.3
- Next.js 16.2.6 App Router APIs, running on the Sites Vinext 0.0.50 compatibility runtime
- Tailwind CSS 4.2.1 and the bundled shadcn/Radix accessible components
- Vite 8 build pipeline and Cloudflare Workers ESM backend
- Cloudflare D1 (SQLite), with Drizzle 0.45.2 schema migrations
- React Hook Form and Zod for shared client/server validation

Versions are pinned by `package-lock.json`. This is a Sites Vinext project; it does not use the standard Next.js server or a Vercel deployment. Vinext is an evolving compatibility runtime. Keep framework/runtime upgrades deliberate and verify all three submission endpoints after changing them.

## Where to make changes

| File | Purpose |
| --- | --- |
| `lib/company.ts` | Verified contact details, Google Maps URLs, service copy, and social profiles |
| `app/page.tsx` | Homepage sections and service details |
| `components/site-header.tsx` | Shared shipper/carrier menus and mobile navigation |
| `components/brand.tsx` | Refreshed logo and live-text wordmark |
| `components/truck-animation.tsx` | Independent truck motion and pause control |
| `components/social-links.tsx` | Links to configured official social profiles |
| `components/driver-application.tsx` | Driver form steps, employment history, review/edit, and submission states |
| `components/carrier-application.tsx` | Carrier inquiry fields and submission states |
| `components/application-elements.tsx` | Shared accessible fields, privacy dialog, and footer |
| `app/globals.css` | Shared brand tokens, layout, motion, and responsive breakpoints |
| `app/layout.tsx` | Page title, description, and favicon |
| `components/quote-dialog.tsx` | Accessible quote dialog, fields, loading, error, and success states |
| `lib/quote-validation.ts` | Shared form validation and California pickup-date rules |
| `app/api/quote-requests/route.ts` | POST endpoint, request limits, validation, and persistence |
| `lib/intake-validation.ts` | Shared driver/carrier validation |
| `lib/server/` | Bounded JSON requests, origin checks, and prepared intake database writes |
| `app/api/driver-applications/route.ts` | Initial driver application POST endpoint |
| `app/api/carrier-inquiries/route.ts` | Carrier partnership inquiry POST endpoint |
| `db/schema.ts` | All three database tables |
| `db/index.ts` | D1 binding access |
| `drizzle/` | Generated, version-controlled schema migrations |
| `public/` | Local fonts and optimized images |
| `.openai/hosting.json` | Site identity and logical database binding |

## Local development

Use Node.js 22.13 or later on Linux. The project scripts also need bash, curl, flock, sha256sum, and GNU timeout.

```sh
npm run install:ci
npm run dev
```

The database binding is `DB`. Apply the SQL in `drizzle/` to your local D1 database before exercising a local form. Production migrations are included by the Sites build and applied by hosting. Do not add CREATE TABLE statements to request handlers.

```sh
npm run db:generate
npm run build
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --test tests/*.test.mjs
```

Tests invoke the actual API handlers against in-memory SQLite with the real migrations. They cover persistence, retries, conditional CDL/work-history rules, date validation, size/origin limits, abuse checks, and storage failures. Regenerate runtime declarations after a binding or Worker runtime change with `node node_modules/wrangler/bin/wrangler.js types --config dist/server/wrangler.json types/cloudflare-env.d.ts` after a successful build.

Preserve `sites()` in `vite.config.ts` and the current Site identity. In this ChatGPT Work environment, the Sites skill owns build and publishing. Publish through Sites with the exact committed source and its build artifact.

## Quote workflow

The form POSTs to `/api/quote-requests`. The backend validates the payload and stores contact and shipment details in `quote_requests`. Customer-generated UUIDs make retries idempotent. Requests over 16 KiB, cross-origin browser submissions, honeypot entries, invalid dates, and excessive recent requests from one email are rejected. The email limit is a basic abuse guard, not a complete bot prevention service.

There is no public endpoint listing customer requests. The owner can review `quote_requests` through the Site database tools, including by asking ChatGPT to show the saved freight requests for this Site. This release does not send email notifications, create TMS loads, confirm a price, or book transportation. Connect your chosen email service or TMS in the backend when you are ready; keep credentials in hosted environment variables, never in client code.

## Driver and carrier workflows

All driver links now use `/driver-application` on this website. The four-step form covers contact details, CDL experience, work history, and a review screen. The user can edit earlier answers and receives a saved reference after successful submission. It is an initial recruiting application, not a complete driver qualification packet; qualification documents are handled by the company during follow-up. It does not collect Social Security numbers or document uploads.

The `/carriers` form collects company/contact details, optional USDOT/MC numbers, equipment, available trucks, preferred lanes, and a partnership topic. `/carriers?interest=lanes` preselects a topic; `capacity`, `coordination`, and `onboarding` are also supported. Inquiries do not approve a carrier or assign a load.

| POST endpoint | Table | Stored details |
| --- | --- | --- |
| `/api/driver-applications` | `driver_applications` | Contact columns and `payload_json` containing initial recruiting details, work history, certification version, and application stage |
| `/api/carrier-inquiries` | `carrier_inquiries` | Contact columns and `payload_json` containing company, equipment, authority numbers, lanes, topic, and consent version |

Both new tables start records with status `new`; `created_at` uses Unix milliseconds. Owner database tools can inspect these records, including by asking ChatGPT to show saved driver applications or carrier inquiries for this Site. There is no public listing endpoint. Keep any future review dashboard behind owner authentication.

Both endpoints cap JSON bodies at 32 KiB, validate against shared schemas, reject cross-origin requests and honeypots, and apply an email-based limit of three submissions per 15 minutes. Client UUIDs make retries idempotent. Database errors leave the form in place for retry. Unsent applications stay in memory during step navigation; refreshing or leaving the page clears them, as explained beside the form.

This release stores inquiries but sends no email notifications and does not integrate a recruiting system or TMS. Connect these services in the backend when needed. The existing business domain is unchanged.

## Social profiles

The footer is ready for verified Instagram, Facebook, and LinkedIn profiles. Add the business's real profile URLs and handles to `socialProfiles` in `lib/company.ts`. Each entry has `platform` (`instagram`, `facebook`, or `linkedin`), `handle` (the visible account name), and `url` (the full HTTPS profile URL). Rebuild and publish after editing this configuration.

Official profile URLs are awaiting the business owner's input. Empty configuration hides the social section; no guessed handle or similarly named company is linked.

## Location, motion, and services

The contact address links to directions in Google Maps.

The homepage photograph is unchanged. A separate transparent truck asset runs along a dedicated strip beneath the hero, with a pause control and a static alternative for reduced-motion preferences.

The Shippers menu includes dry van, refrigerated, flatbed, expedited, dedicated, LTL, cross-docking, and regional delivery. The Carriers menu offers capacity partnerships, lane opportunities, dispatch coordination, and onboarding inquiries. Carrier copy does not claim brokerage authority; availability and terms are discussed with the team.

## Business content and assets

The business information comes from the existing Range Logistics website. Confirm operating coverage and dispatch hours before public launch. See `ASSETS.md` for imagery and font sources. The hero is a conceptual original image; the second image was retained from the existing company site.

The site supports mobile navigation, keyboard-operated dialogs, reduced-motion preferences, local font loading, and server-rendered page content. Quote success is shown only after the server confirms a saved record.
