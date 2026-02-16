// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import SidebarContent from "./SidebarContent";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Users,
  ScanLine,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ticket,
  DollarSign,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  /* useEffect(() => {
    if (prevPathname.current !== pathname) {
      setMobileOpen(false);
      prevPathname.current = pathname;
    }
    }, [pathname]);*/

  // Persist collapse state
  const [collapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Create Event",
      href: "/dashboard/events/create",
      icon: <CalendarPlus className="w-5 h-5" />,
    },
    {
      label: "My Events",
      href: "/dashboard/events",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      label: "Attendees",
      href: "/dashboard/attendees",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "QR Scanner",
      href: "/dashboard/scanner",
      icon: <ScanLine className="w-5 h-5" />,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };
  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent
          collapsed={false}
          pathname={pathname}
          navItems={navItems}
          isActive={isActive}
          onNavigate={() => setMobileOpen(false)}
        />{" "}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          navItems={navItems}
          isActive={isActive}
        />{" "}
      </aside>
    </>
  );
}
