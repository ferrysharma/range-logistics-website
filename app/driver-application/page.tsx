import type { Metadata } from "next";
import { DriverApplication } from "@/components/driver-application";

export const metadata: Metadata = {
  title: "Driver Application | Range Logistics Inc.",
  description: "Start your driver application with Range Logistics. Share your contact information, CDL experience, and employment history directly on our website.",
};

export default function DriverApplicationPage() {
  return <DriverApplication />;
}
