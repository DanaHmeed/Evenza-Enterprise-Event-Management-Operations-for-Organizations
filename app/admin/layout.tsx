// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/admin");
      return;
    }

    const checkRole = async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || data.role;
          if (role === "ADMIN") {
            setAuthorized(true);
          } else {
            router.replace("/");
          }
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/");
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-white font-semibold">Access Denied</p>
          <p className="text-sm text-gray-400 mt-1">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}