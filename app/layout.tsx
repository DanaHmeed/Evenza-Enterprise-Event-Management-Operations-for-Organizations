import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ChatBot from "@/components/shared/ChatBot";

import { Inter, Rubik, DM_Sans, Playfair_Display, Oswald, Quicksand } from 'next/font/google'

const rubik = Rubik({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
})

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
  weight: ['200', '300', '400', '500', '600', '700'],
})

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
  weight: ['300', '400', '500', '600', '700'],
})

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
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={`${rubik.variable} ${inter.variable} ${dmSans.variable} ${playfair.variable} ${oswald.variable} ${quicksand.variable}`}>
        <body className={rubik.className}>{children}
          <ChatBot />
        </body>
      </html>
    </ClerkProvider>
  );
}