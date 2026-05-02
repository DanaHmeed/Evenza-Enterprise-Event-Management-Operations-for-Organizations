// components/shared/Navbar.tsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Heart,
  User,
  Star,
  Shield,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  BookSearch,
  Handshake,
  HeartPlus,
  Computer,
  Train,
  PaintRoller,
  Network,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Button from "@/components/shared/button/Button";

/* ═══════════════════════════════════════════
   Mega-menu content config
   ═══════════════════════════════════════════ */

interface DropdownItem {
  label: string;
  desc: string;
  href?: string;
  icon: React.ReactNode;
}

interface DropdownSection {
  title: string;
  items: DropdownItem[];
}

const exploreDropdown: DropdownSection[] = [
  {
    title: "Discover",
    items: [
      {
        label: "Business",
        desc: " Conferences & meetups",
        icon: <Handshake className="w-4 h-4" />,
      },
      {
        label: "Social",
        desc: "Find events near you",
        icon: <Star className="w-4 h-4" />,
      },
      {
        label: "Career",
        desc: "What's happening soon",
        icon: <Network className="w-4 h-4" />,
      },
      {
        label: "Health & Wellness",
        desc: "Well-being workshops",
        icon: <HeartPlus className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Categories",
    items: [
      {
        label: "Tech & Innovation",
        desc: "Cutting-edge conferences",
        icon: <Computer className="w-4 h-4" />,
      },
      {
        label: "Training",
        desc: "Meetups & networking",
        icon: <Train className="w-4 h-4" />,
      },
      {
        label: "Education",
        desc: "Hands-on learning",
        icon: <BookSearch className="w-4 h-4" />,
      },
      {
        label: "Arts & Culture",
        desc: "Creative workshops",
        icon: <PaintRoller className="w-4 h-4" />,
      },
    ],
  },
];

const platformDropdown: DropdownSection[] = [
  {
    title: "For Attendees",
    items: [
      {
        label: "How It Works",
        desc: "Register, attend, enjoy",
        href: "/#how-it-works",
        icon: <HelpCircle className="w-4 h-4" />,
      },
      {
        label: "who can use evenza?",
        desc: "What attendees say",
        href: "/#platform",
        icon: <MessageSquare className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "For Organizers",
    items: [
      {
        label: "Events Types",
        desc: "Launch in minutes",
        href: "/#event-types",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        label: "What we stand for?",
        desc: "Mission, vision, values",
        href: "/about/#values",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Everything you need",
        desc: "Powerful tools for success",
        href: "/about/#capabilities",
        icon: <Shield className="w-4 h-4" />,
      },
    ],
  },
];

/* ═══════════════════════════════════════════
   Design tokens (matching profile page)
   ═══════════════════════════════════════════ */
const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.07)",
  sans: "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════
   Mega Dropdown Component
   ═══════════════════════════════════════════ */
function MegaDropdown({
  sections,
  promoImage,
  promoTitle,
  promoDesc,
  promoHref,
  isOpen,
  onClose,
}: {
  sections: DropdownSection[];
  promoImage?: string;
  promoTitle: string;
  promoDesc: string;
  promoHref: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dropdown panel */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: "calc(100% + 4px)",
              width: "720px",
              maxWidth: "calc(100vw - 48px)",
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              boxShadow:
                "0 16px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
              overflow: "hidden",
              zIndex: 50,
              display: "flex",
            }}
          >
            {/* Left — Promo Card */}
            <div
              style={{
                width: "240px",
                background: t.text,
                padding: "0",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Image area */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "180px",
                  overflow: "hidden",
                }}
              >
                {promoImage ? (
                  <Image
                    src={promoImage}
                    alt={promoTitle}
                    fill
                    style={{ objectFit: "cover", opacity: 0.85 }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)",
                    }}
                  />
                )}
                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background:
                      "linear-gradient(to top, #1a1a1a 0%, transparent 100%)",
                  }}
                />
              </div>

              {/* Text */}
              <div
                style={{
                  padding: "16px 20px 20px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {promoTitle}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {promoDesc}
                </p>
                <Link
                  href={promoHref}
                  onClick={onClose}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: t.accent,
                    textDecoration: "none",
                    marginTop: "auto",
                    paddingTop: "8px",
                  }}
                >
                  Learn more
                  <ArrowRight style={{ width: "12px", height: "12px" }} />
                </Link>
              </div>
            </div>

            {/* Right — Links grid */}
            <div
              style={{
                flex: 1,
                padding: "20px 24px",
                display: "flex",
                gap: "28px",
              }}
            >
              {sections.map((section) => (
                <div key={section.title} style={{ flex: 1, minWidth: 0 }}>
                  {/* Section title */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                      paddingBottom: "8px",
                      borderBottom: `1px solid ${t.borderLight}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: t.textFaint,
                      }}
                    >
                      {section.title}
                    </span>
                  </div>

                  {/* Items */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {section.items.map((item) => (
                      <DropdownMenuItem
                        key={item.label}
                        item={item}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DropdownMenuItem({
  item,
  onClose,
}: {
  item: DropdownItem;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href || "#"}
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "5px",
        textDecoration: "none",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = t.bg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "5px",
          background: t.borderLight,
          color: t.textMuted,
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {item.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: t.text,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {item.label}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: t.textMuted,
            margin: "2px 0 0",
            lineHeight: 1.3,
          }}
        >
          {item.desc}
        </p>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   Nav Trigger with chevron
   ═══════════════════════════════════════════ */
function NavDropdownTrigger({
  label,
  isOpen,
}: {
  label: string;
  isOpen: boolean;
}) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
        color: isOpen ? t.text : "#4b5563",
        transition: "color 0.15s",
        padding: "4px 0",
        position: "relative",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = t.text)}
      onMouseLeave={(e) => {
        if (!isOpen) e.currentTarget.style.color = "#4b5563";
      }}
    >
      {label}
      <ChevronDown
        style={{
          width: "14px",
          height: "14px",
          transition: "transform 0.2s",
          transform: isOpen ? "rotate(180deg)" : "rotate(0)",
          opacity: 0.5,
        }}
      />
      {/* Underline indicator */}
      <span
        style={{
          position: "absolute",
          bottom: "-2px",
          left: 0,
          height: "2px",
          background: "#f97316",
          borderRadius: "1px",
          width: isOpen ? "100%" : "0",
          transition: "width 0.25s ease",
        }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════
   Main Navbar
   ═══════════════════════════════════════════ */
export default function Navbar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [fetchedRole, setFetchedRole] = useState<string | null>(null);

  // Use Clerk publicMetadata when available (instant); fall back to DB fetch for
  // existing users whose metadata hasn't been stamped yet.
  const metaRole = isSignedIn
    ? (user?.publicMetadata?.role as string | undefined)
    : undefined;
  const userRole = metaRole ?? fetchedRole;

  useEffect(() => {
    if (!isSignedIn || !user || metaRole !== undefined) return;
    // Metadata not set yet — fetch from DB and stamp it for next time
    (async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || data.role || "USER";
          setFetchedRole(role);
          // Fire-and-forget sync so next load is instant
          fetch("/api/auth/sync-role", { method: "POST" });
        }
      } catch {
        setFetchedRole("USER");
      }
    })();
  }, [isSignedIn, user, metaRole]);

  // Mega dropdown states
  const [exploreOpen, setExploreOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement | null>(null);
  const platformRef = useRef<HTMLDivElement | null>(null);

  // Close timeout for hover intent

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (!exploreRef.current?.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (!platformRef.current?.contains(e.target as Node)) {
        setPlatformOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close other dropdown when one opens
  const openExplore = useCallback(() => {
    setExploreOpen(true);
    setPlatformOpen(false);
    setAccountOpen(false);
  }, []);

  const openPlatform = useCallback(() => {
    setPlatformOpen(true);
    setExploreOpen(false);
    setAccountOpen(false);
  }, []);
  const isAdmin = userRole === "ADMIN";
  const isOrganizer = userRole === "ORGANIZER" || isAdmin;

  // Mobile accordion state
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [mobilePlatformOpen, setMobilePlatformOpen] = useState(false);

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
          <Link href="/" className="flex items-center flex-1">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
            >
              <img
                src="/icons/logito.png"
                alt="Evenza logo"
                width={140}
                height={40}
              />
            </motion.span>
          </Link>

          {/* ═══════════════════════════════════
              Center Nav with Mega Dropdowns
              ═══════════════════════════════════ */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {/* Explore dropdown */}
            <div
              ref={exploreRef}
              style={{ position: "relative" }}
              onMouseEnter={openExplore}
              onMouseLeave={() => setExploreOpen(false)}
            >
              <NavDropdownTrigger label="Explore" isOpen={exploreOpen} />
              <MegaDropdown
                sections={exploreDropdown}
                promoImage="/images/admin.png"
                promoTitle="Find Your Next Experience"
                promoDesc="Discover events that match your interests — from tech meetups to creative workshops."
                promoHref="/events"
                isOpen={exploreOpen}
                onClose={() => setExploreOpen(false)}
              />
            </div>

            {/* Platform dropdown */}
            <div
              ref={platformRef}
              style={{ position: "relative" }}
              onMouseEnter={openPlatform}
              onMouseLeave={() => setPlatformOpen(false)}
            >
              <NavDropdownTrigger label="Platform" isOpen={platformOpen} />
              <MegaDropdown
                sections={platformDropdown}
                promoImage="/images/attendee.png"
                promoTitle="Organize With Evenza"
                promoDesc="Create, manage, and grow your events with powerful tools built for organizers."
                promoHref="/dashboard/events/create"
                isOpen={platformOpen}
                onClose={() => setPlatformOpen(false)}
              />
            </div>

            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/events">Discover Events</NavLink>

            {isOrganizer && <NavLink href="/dashboard">Dashboard</NavLink>}
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>

          {/* ═══════════════════════════════════
              Right Side (account)
              ═══════════════════════════════════ */}
          <div className="hidden lg:flex flex-1 justify-end min-w-20">
            {!isLoaded ? (
              <div className="w-20 h-9 bg-gray-100 rounded-full animate-pulse" />
            ) : !isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => {
                    setAccountOpen((v) => !v);
                    setExploreOpen(false);
                    setPlatformOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
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
                        style={{
                          width: "15px",
                          height: "15px",
                          color: "#fff",
                        }}
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
                      <AccountDropdownLink
                        href="/profile"
                        icon={<UserCircle size={16} />}
                        label="My Profile"
                        onClick={() => setAccountOpen(false)}
                      />
                      <AccountDropdownLink
                        href="/my-hub"
                        icon={<Heart size={16} />}
                        label="My Hub"
                        onClick={() => setAccountOpen(false)}
                      />
                      <AccountDropdownLink
                        href="/my-tickets"
                        icon={<Star size={16} />}
                        label="My Tickets"
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
                          <AccountDropdownLink
                            href="/dashboard"
                            icon={<LayoutDashboard size={16} />}
                            label="Organizer Dashboard"
                            onClick={() => setAccountOpen(false)}
                          />
                          <AccountDropdownLink
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
                          <AccountDropdownLink
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

          {/* ═══════════════════════════════════
              Mobile Button
              ═══════════════════════════════════ */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ═══════════════════════════════════
            Mobile Menu
            ═══════════════════════════════════ */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4 border-t border-gray-200 pt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {/* Mobile Explore Accordion */}
                <MobileAccordion
                  label="Explore"
                  isOpen={mobileExploreOpen}
                  onToggle={() => {
                    setMobileExploreOpen((v) => !v);
                    setMobilePlatformOpen(false);
                  }}
                  sections={exploreDropdown}
                  onClose={() => setMobileMenuOpen(false)}
                />

                {/* Mobile Platform Accordion */}
                <MobileAccordion
                  label="Platform"
                  isOpen={mobilePlatformOpen}
                  onToggle={() => {
                    setMobilePlatformOpen((v) => !v);
                    setMobileExploreOpen(false);
                  }}
                  sections={platformDropdown}
                  onClose={() => setMobileMenuOpen(false)}
                />

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

/* ═══════════════════════════════════════════
   Mobile Accordion for dropdowns
   ═══════════════════════════════════════════ */
function MobileAccordion({
  label,
  isOpen,
  onToggle,
  sections,
  onClose,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  sections: DropdownSection[];
  onClose: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium px-4 py-3 rounded-lg"
      >
        {label}
        <ChevronDown
          style={{
            width: "16px",
            height: "16px",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            opacity: 0.4,
          }}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "4px 0 8px 16px" }}>
              {sections.map((section) => (
                <div key={section.title} style={{ marginBottom: "8px" }}>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textFaint,
                      padding: "4px 12px",
                      margin: 0,
                    }}
                  >
                    {section.title}
                  </p>
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href || "#"}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                      style={{ fontSize: "13px", textDecoration: "none" }}
                    >
                      <span style={{ color: t.textFaint, display: "flex" }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Helper components
   ═══════════════════════════════════════════ */

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

function AccountDropdownLink({
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
