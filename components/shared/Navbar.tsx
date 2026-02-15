// components/shared/Navbar.tsx
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
  Calendar,
  LayoutDashboard,
  Ticket,
  Heart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/shared/button/Button";

export default function Navbar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch role from database
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const fetchRole = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.data?.role || data.role || "USER");
        }
      } catch {
        setUserRole("USER");
      }
    };
    fetchRole();
  }, [isSignedIn, user]);

  const isAdmin = userRole === "ADMIN";
  const isOrganizer = userRole === "ORGANIZER" || isAdmin;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
            >
              EVENZA
            </motion.span>
          </Link>

          {/* Center Nav */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <NavLink href="/events">Discover Events</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            {isOrganizer && (
              <NavLink href="/dashboard">
                <LayoutDashboard className="w-4 h-4 inline mr-1" />
                Dashboard
              </NavLink>
            )}
            {isAdmin && (
              <NavLink href="/admin">
                <Settings className="w-4 h-4 inline mr-1" />
                Admin
              </NavLink>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoaded ? (
              <div className="w-20 h-9 bg-gray-100 rounded-full animate-pulse" />
            ) : !isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button >Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-7 h-7 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden xl:block max-w-[100px] truncate">
                    {user?.firstName || "Account"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {user?.fullName || "Account"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </div>
                        {userRole && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                            {userRole}
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <DropdownLink href="/profile" icon={<UserCircle size={18} />} label="My Profile" onClick={() => setAccountOpen(false)} />
                        <DropdownLink href="/my-tickets" icon={<Ticket size={18} />} label="My Tickets" onClick={() => setAccountOpen(false)} />
                        <DropdownLink href="/my-events" icon={<Heart size={18} />} label="My Registrations" onClick={() => setAccountOpen(false)} />

                        {isOrganizer && (
                          <>
                            <div className="border-t border-gray-100 my-1" />
                            <DropdownLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Organizer Dashboard" onClick={() => setAccountOpen(false)} />
                            <DropdownLink href="/dashboard/events/create" icon={<Calendar size={18} />} label="Create Event" onClick={() => setAccountOpen(false)} />
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <div className="border-t border-gray-100 my-1" />
                            <DropdownLink href="/admin" icon={<Settings size={18} />} label="Admin Panel" onClick={() => setAccountOpen(false)} />
                          </>
                        )}

                        <div className="border-t border-gray-100 my-1" />
                        <SignOutButton redirectUrl="/">
                          <button
                            onClick={() => setAccountOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
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

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4 border-t border-gray-200 pt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                <MobileNavLink href="/events" onClick={() => setMobileMenuOpen(false)}>Discover Events</MobileNavLink>
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
                <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>
                {isOrganizer && <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>}
                {isAdmin && <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</MobileNavLink>}

                <div className="h-px bg-gray-200 my-3" />

                {!isSignedIn ? (
                  <div className="flex flex-col gap-2">
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium text-center hover:bg-gray-50 transition-all">
                      Sign In
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="px-5 py-2.5 rounded-full bg-orange-500 text-white font-medium text-center hover:bg-orange-600 transition-all">
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</MobileNavLink>
                    <MobileNavLink href="/my-tickets" onClick={() => setMobileMenuOpen(false)}>My Tickets</MobileNavLink>
                    <SignOutButton redirectUrl="/">
                      <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left text-red-600 hover:bg-red-50 font-medium px-4 py-3 rounded-lg transition-all">
                        Log Out
                      </button>
                    </SignOutButton>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium px-4 py-3 rounded-lg">
      {children}
    </Link>
  );
}

function DropdownLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all">
      {icon}
      {label}
    </Link>
  );
}