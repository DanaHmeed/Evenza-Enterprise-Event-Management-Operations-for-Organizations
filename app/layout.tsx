import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/styles/FeaturesShowcase.css";

export const metadata: Metadata = {
  title: {
    default: "Evenza — Event Management Platform",
    template: "%s | Evenza",
  },
  description:
    "Discover, create, and manage extraordinary events. Evenza is the all-in-one platform for organizers and attendees.",
  keywords: [
    "events",
    "event management",
    "tickets",
    "conferences",
    "meetups",
    "organizer",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#f97316",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}