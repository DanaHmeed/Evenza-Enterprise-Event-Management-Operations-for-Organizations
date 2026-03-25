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
  User,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
              <img
                src="/icons/logo.png"
                alt="Evenza logo"
                width={140}
                height={40}
              />
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
{!mounted || !isLoaded ? (
                <div className="w-20 h-9 bg-gray-100 rounded-full animate-pulse" />
            ) : !isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "5px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "100px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafaf8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt=""
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #f0f0ec",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#1a1a1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <User
                        style={{ width: "15px", height: "15px", color: "#fff" }}
                      />
                    </div>
                  )}
                  <span
                    className="hidden xl:block"
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      maxWidth: "110px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.firstName || "Account"}
                  </span>
                  <ChevronDown
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "#aaa",
                      transition: "transform 0.2s",
                      transform: accountOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </button>

                {accountOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "260px",
                      background: "#fff",
                      border: "1px solid #e5e5e0",
                      borderRadius: "6px",
                      boxShadow:
                        "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    {/* User info */}
                    <div
                      style={{
                        padding: "16px 18px",
                        borderBottom: "1px solid #f0f0ec",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {user?.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt=""
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "#1a1a1a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <User
                              style={{
                                width: "16px",
                                height: "16px",
                                color: "#fff",
                              }}
                            />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user?.fullName || "Account"}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#888",
                              margin: "2px 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </div>
                      {userRole && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "10px",
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            padding: "3px 8px",
                            borderRadius: "3px",
                            background: "#f0f0ec",
                            color: "#555",
                          }}
                        >
                          {userRole}
                        </span>
                      )}
                    </div>

                    {/* Items */}
                    <div style={{ padding: "6px 0" }}>
                      <DropdownLink
                        href="/profile"
                        icon={<UserCircle size={16} />}
                        label="My Profile"
                        onClick={() => setAccountOpen(false)}
                      />
                      <DropdownLink
                        href="/my-tickets"
                        icon={<Ticket size={16} />}
                        label="My Tickets"
                        onClick={() => setAccountOpen(false)}
                      />
                      <DropdownLink
                        href="/my-events"
                        icon={<Heart size={16} />}
                        label="My Registrations"
                        onClick={() => setAccountOpen(false)}
                      />

                      {isOrganizer && (
                        <>
                          <div
                            style={{
                              height: "1px",
                              background: "#f0f0ec",
                              margin: "6px 0",
                            }}
                          />
                          <DropdownLink
                            href="/dashboard"
                            icon={<LayoutDashboard size={16} />}
                            label="Organizer Dashboard"
                            onClick={() => setAccountOpen(false)}
                          />
                          <DropdownLink
                            href="/dashboard/events/create"
                            icon={<Calendar size={16} />}
                            label="Create Event"
                            onClick={() => setAccountOpen(false)}
                          />
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <div
                            style={{
                              height: "1px",
                              background: "#f0f0ec",
                              margin: "6px 0",
                            }}
                          />
                          <DropdownLink
                            href="/admin"
                            icon={<Settings size={16} />}
                            label="Admin Panel"
                            onClick={() => setAccountOpen(false)}
                          />
                        </>
                      )}

                      <div
                        style={{
                          height: "1px",
                          background: "#f0f0ec",
                          margin: "6px 0",
                        }}
                      />
                      <SignOutButton redirectUrl="/">
                        <button
                          onClick={() => setAccountOpen(false)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 18px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#e63946",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(230,57,70,0.04)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <LogOut style={{ width: "16px", height: "16px" }} />
                          Log Out
                        </button>
                      </SignOutButton>
                    </div>
                  </div>
                )}
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
                <MobileNavLink
                  href="/events"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Discover Events
                </MobileNavLink>
                <MobileNavLink
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </MobileNavLink>
                <MobileNavLink
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </MobileNavLink>
                {isOrganizer && (
                  <MobileNavLink
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </MobileNavLink>
                )}
                {isAdmin && (
                  <MobileNavLink
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </MobileNavLink>
                )}

                <div className="h-px bg-gray-200 my-3" />

                {!isSignedIn ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium text-center hover:bg-gray-50 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-2.5 rounded-full bg-orange-500 text-white font-medium text-center hover:bg-orange-600 transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <MobileNavLink
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </MobileNavLink>
                    <MobileNavLink
                      href="/my-tickets"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Tickets
                    </MobileNavLink>
                    <SignOutButton redirectUrl="/">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-left text-red-600 hover:bg-red-50 font-medium px-4 py-3 rounded-lg transition-all"
                      >
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
      className="relative text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 18px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#555",
        textDecoration: "none",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fafaf8";
        e.currentTarget.style.color = "#1a1a1a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#555";
      }}
    >
      <span style={{ color: "#aaa", display: "flex" }}>{icon}</span>
      {label}
    </Link>
  );
}
