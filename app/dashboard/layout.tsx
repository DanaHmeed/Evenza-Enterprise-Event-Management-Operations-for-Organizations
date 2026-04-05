// app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Loader2 } from "lucide-react";
import { useRoleCheck } from "@/hooks/use-dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // SWR-cached role check — navigating between dashboard pages
  // no longer re-fetches this. The first load caches the result for 60s.
  const { isAuthorized, isLoading: roleLoading } = useRoleCheck(
    isLoaded && isSignedIn ? user?.id : null
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Only redirect once the role check is done and user is NOT authorized
    if (!isLoaded || !isSignedIn || roleLoading) return;
    if (!isAuthorized) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, roleLoading, isAuthorized, router]);

  if (!isLoaded || roleLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}