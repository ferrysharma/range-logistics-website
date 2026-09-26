import type { Metadata } from "next";
import { CarrierApplication } from "@/components/carrier-application";
import { carrierInterests } from "@/lib/intake-validation";

export const metadata: Metadata = { title: "Carrier Partnerships | Range Logistics Inc.", description: "Share your capacity, equipment, and preferred lanes with Range Logistics. Start a carrier partnership inquiry." };

export default async function CarriersPage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const params = await searchParams;
  const interest = carrierInterests.some((option) => option.value === params?.interest) ? params.interest! : "capacity";
  return <CarrierApplication initialInterest={interest} />;
}
