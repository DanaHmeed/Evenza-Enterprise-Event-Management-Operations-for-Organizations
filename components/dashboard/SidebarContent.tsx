"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarContentProps {
  collapsed: boolean;
  pathname: string;
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

export default function SidebarContent({
  collapsed,
  pathname,
  navItems,
  isActive,
  onNavigate,
  onToggleCollapse,
}: SidebarContentProps) {
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-gray-100 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>

          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Evenza
            </span>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            Toggle
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                active
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {item.icon}

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.imageUrl}
            className="w-8 h-8 rounded-full"
          />

          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}