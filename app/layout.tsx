import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
export const metadata: Metadata = {
  title: "Evenza",
  description: "Event management and ticketing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html>
        <body>
          {children}</body>
      </html>
    </ClerkProvider>
  );
}
