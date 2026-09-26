/** Edit verified company details here. Source: https://rangelogistics.org/ (September 2026). */
export const company = {
  name: "Range Logistics Inc.",
  phone: "(424) 842-3130",
  phoneHref: "tel:+14248423130",
  email: "rangelogisticsinc@gmail.com",
  address: "10712 Locust Avenue",
  city: "Bloomington, CA 92316",
  applicationUrl: "/driver-application",
};

const mapAddress = encodeURIComponent(`${company.address}, ${company.city}`);
export const maps = {
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${mapAddress}`,
};

export const serviceIds = ["dry-van", "reefer", "flatbed", "expedited", "dedicated", "ltl", "cross-dock", "regional"] as const;

/** Add the company's verified profile URLs here. Unconfigured profiles are not displayed. */
export const socialProfiles: { platform: "instagram" | "facebook" | "linkedin"; handle: string; url: string }[] = [];

export const services = [
  { id: "dry-van", name: "Dry van", label: "Everyday freight. Exceptional care.", description: "Secure, enclosed transport for the freight that keeps your business running.", detail: "Full truckload transportation for general commodities, from one shipment to recurring lanes. Tell us your pickup, delivery, and scheduling requirements so we can plan the right move.", examples: ["Palletized retail and consumer goods", "Packaged food and general commodities", "Industrial equipment and building supplies"] },
  { id: "reefer", name: "Refrigerated", label: "The right temperature. Every mile.", description: "Temperature-controlled transportation for your most sensitive shipments.", detail: "Refrigerated freight service for products that need temperature control in transit. Share your required temperature, product details, and appointment windows with our dispatch team.", examples: ["Fresh produce and perishable food", "Frozen and chilled products", "Temperature-sensitive freight"] },
  { id: "flatbed", name: "Flatbed", label: "Built for the bigger picture.", description: "Open-deck solutions for materials and equipment that need more room.", detail: "Flatbed freight transportation for loads that call for open-deck access. Our team reviews dimensions, weight, securement, and any special loading requirements before confirming the move.", examples: ["Construction and building materials", "Machinery and industrial equipment", "Loads requiring side or overhead access"] },
  { id: "expedited", name: "Expedited", label: "When the clock matters.", description: "Time-sensitive freight, with a plan built around your delivery deadline.", detail: "Start a conversation about your urgent shipment. We review the lane, equipment availability, and required arrival time to confirm a realistic transportation plan.", examples: ["Urgent replenishment shipments", "Production-critical freight", "Time-sensitive pickup and delivery"] },
  { id: "dedicated", name: "Dedicated lanes", label: "Consistency you can plan around.", description: "A transportation plan for recurring shipments and regular lanes.", detail: "Share your weekly volume, origin and destination, and shipping schedule. We’ll discuss equipment availability and a repeatable plan for your recurring freight.", examples: ["Recurring shipping schedules", "Regular customer and facility lanes", "Volume and equipment planning"] },
  { id: "ltl", name: "LTL & partial loads", label: "The right fit for a smaller shipment.", description: "Explore transportation options when your freight needs less than a full trailer.", detail: "Tell us your pallet count, dimensions, weight, and timing. Our team will review the shipment and confirm the options available for your lane before a move is arranged.", examples: ["Palletized partial shipments", "Smaller-volume freight", "Equipment and transit-time review"] },
  { id: "cross-dock", name: "Cross-dock coordination", label: "Keep the handoff moving.", description: "Discuss freight transfers, delivery handoffs, and cross-dock requirements.", detail: "For shipments that need a transfer between trucks, share your freight details, location, and time window. We’ll review the requirements and confirm whether an appropriate arrangement is available.", examples: ["Truck-to-truck freight transfers", "Appointment and handoff coordination", "Lane-specific availability review"] },
  { id: "regional", name: "Regional & OTR", label: "Across the region. Across the country.", description: "California regional moves and longer hauls across the lower 48.", detail: "From Southern California pickup and delivery to long-haul transportation, discuss your lane, delivery appointments, and equipment requirements with our dispatch team.", examples: ["Southern California and West Coast lanes", "Interstate and long-haul freight", "Pickup and delivery coordination"] },
] as const;

export type ServiceId = (typeof serviceIds)[number];

export const carrierServices = [
  { id: "capacity", name: "Capacity partnerships", description: "Share your equipment, operating regions, and available capacity with our team." },
  { id: "lanes", name: "Lane opportunities", description: "Discuss the lanes that fit your operation and your preferred running schedule." },
  { id: "coordination", name: "Dispatch coordination", description: "Connect on pickup details, delivery appointments, and shipment communication." },
  { id: "onboarding", name: "Carrier onboarding", description: "Start a conversation about company information and the documents needed for review." },
] as const;
