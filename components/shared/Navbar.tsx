"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import  Button from "@/components/shared/button/Button"
export default function Navbar() {
  const { user, isSignedIn } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Decide admin role (adjust key to match your project)
  const isAdmin = useMemo(() => {
    // Example: set in Clerk publicMetadata: { role: "admin" }
    const role = user?.publicMetadata?.role;
    return role === "admin";
  }, [user]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                EVENZA
              </span>
            </motion.div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <NavLink href="/events">
              Platform <ChevronDown size={16} className="inline ml-1" />
            </NavLink>
            <NavLink href="/pricing">
              Solutions <ChevronDown size={16} className="inline ml-1" />
            </NavLink>
            <NavLink href="/about">Why Evenza</NavLink>
            <NavLink href="/plans">Plans</NavLink>
            <NavLink href="/events">Discover Events</NavLink>
            <NavLink href="/resources">
              Resources <ChevronDown size={16} className="inline ml-1" />
            </NavLink>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!isSignedIn ? (
              <Link
                href="/sign-in"
              >
                <Button>Sign In</Button>
              </Link>
            ) : (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all grid place-items-center"
                  aria-label="Account menu"
                >
                  <UserCircle className="text-gray-700" size={22} />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">
                          {user?.fullName || "Account"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </div>
                      </div>

                      <div className="py-1">
                        <DropdownLink
                          href="/profile"
                          icon={<UserCircle size={18} />}
                          label="Profile"
                          onClick={() => setAccountOpen(false)}
                        />

                        {isAdmin && (
                          <DropdownLink
                            href="/admin"
                            icon={<Settings size={18} />}
                            label="Admin Panel"
                            onClick={() => setAccountOpen(false)}
                          />
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        <SignOutButton redirectUrl="/">
                          <button
                            onClick={() => setAccountOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            <LogOut size={18} />
                            Log Out
                          </button>
                        </SignOutButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-gray-200 pt-4"
          >
            <div className="flex flex-col gap-2">
              <MobileNavLink
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
              >
                Platform
              </MobileNavLink>
              <MobileNavLink
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </MobileNavLink>
              <MobileNavLink
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
              >
                Why Evenza
              </MobileNavLink>
              <MobileNavLink
                href="/plans"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plans
              </MobileNavLink>
              <MobileNavLink
                href="/resources"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </MobileNavLink>

              <div className="h-px bg-gray-200 my-3" />

              {!isSignedIn ? (
                <Link
                  href="/sign-in"
                  className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium text-center hover:bg-gray-50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <SignOutButton redirectUrl="/">
                    <button
                      className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium text-center hover:bg-gray-50 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log Out
                    </button>
                  </SignOutButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium px-4 py-3 rounded-lg"
    >
      {children}
    </Link>
  );
}

function DropdownLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}
