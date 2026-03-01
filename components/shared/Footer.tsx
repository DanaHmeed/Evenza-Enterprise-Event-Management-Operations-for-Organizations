// components/shared/Footer.tsx
"use client";

import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex justify-center">
      <div className="w-full max-w-7xl px-6 lg:px-12 py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-9 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="mt-4 mb-24">
                <img
                  src="/icons/logo.png"
                  alt="Evenza Logo"
                  className="w-30 h-30 inline-block mr-2"
                />
              </span>
            </Link>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {" "}
              The all-in-one platform for creating, managing, and attending
              professional events. Built for organizers, loved by attendees.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={14} />
                <span>support@evenza.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin size={14} />
              </div>
            </div>
            <div className="flex gap-3 justify-start">
              <SocialLink href="#" icon={<Twitter size={16} />} />
              <SocialLink href="#" icon={<Linkedin size={16} />} />
              <SocialLink href="#" icon={<Instagram size={16} />} />
              <SocialLink href="#" icon={<Github size={16} />} />
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Platform
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/sign-up">Create an Event</FooterLink>
              <FooterLink href="/about">How It Works</FooterLink>
              <FooterLink href="/about">For Organizers</FooterLink>
              <FooterLink href="/about">For Attendees</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-3">
              <FooterLink href="/contact">Help Center</FooterLink>
              <FooterLink href="/contact">Report an Issue</FooterLink>
              <FooterLink href="/contact">Feedback</FooterLink>
              <FooterLink href="/contact">FAQs</FooterLink>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-white mb-1">Stay Updated</h4>
              <p className="text-sm text-gray-700">
                Get notified about the latest events and platform updates.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2.5 rounded-full bg-white/5 border border-gray text-white placeholder:text-gray-700 text-sm focus:outline-none focus:border-orange-500 w-full md:w-64 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-700 text-sm">
              © {currentYear} Evenza. All rights reserved. Built as a graduation
              project.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-700 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-gray-700 hover:text-white transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-700 hover:text-orange-400 transition-colors text-sm"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/50 flex items-center justify-center text-gray-400 hover:text-orange-400 transition-all"
    >
      {icon}
    </a>
  );
}
