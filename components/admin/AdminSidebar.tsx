// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  Tag,
  Shield,
  Flag,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-5 h-5" /> },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { label: "Events", href: "/admin/events", icon: <CalendarDays className="w-5 h-5" /> },
        { label: "Orders", href: "/admin/orders", icon: <DollarSign className="w-5 h-5" /> },
        { label: "Feedback", href: "/admin/feedback", icon: <MessageSquare className="w-5 h-5" /> },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Categories", href: "/admin/categories", icon: <Tag className="w-5 h-5" /> },
        { label: "Moderation", href: "/admin/moderation", icon: <Flag className="w-5 h-5" /> },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderNav = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-gray-800 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Evenza</span>
              <span className="text-[10px] text-gray-500 block -mt-0.5">Admin Panel</span>
            </div>
          </Link>
        ) : (
          <Link href="/">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-orange-500/10 text-orange-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <span className={`flex-shrink-0 ${active ? "text-orange-400" : "text-gray-500 group-hover:text-gray-300"}`}>
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={`border-t border-gray-800 p-4 ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-900/50 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 font-semibold text-xs">{user?.firstName?.[0] || "A"}</span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-gray-900 shadow-md border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-800"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-[#111318] z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800">
          <X className="w-4 h-4" />
        </button>
        {renderNav(() => setMobileOpen(false))}
      </aside>

      <aside className={`hidden lg:flex flex-col bg-[#111318] transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
        {renderNav()}
      </aside>
    </>
  );
}