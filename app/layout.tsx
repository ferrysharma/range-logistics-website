import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Range Logistics Inc. | Your Freight. Our Drive.",
  description: "California roots. Nationwide reach. Range Logistics Inc. provides dry van, refrigerated, flatbed, and expedited freight services. Request a quote or apply to drive.",
  icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <body>{children}</body>
  </html>;
}
