// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2, ShieldAlert } from "lucide-react";
import { Rubik } from "next/font/google";

const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in?redirect_url=/admin"); return; }

    const metaRole = user?.publicMetadata?.role as string | undefined;

    if (metaRole === "ADMIN") {
      // Fast path: role already stamped in Clerk session
      setAuthorized(true);
      return;
    }

    if (metaRole && metaRole !== "ADMIN") {
      // Fast path: definitely not admin
      setAuthorized(false);
      router.replace("/");
      return;
    }

    // Metadata not stamped yet (existing user before sync) — fall back to DB fetch
    // and trigger a one-time sync so next visit is instant
    (async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || data.role;
          if (role === "ADMIN") {
            setAuthorized(true);
            // Sync role into Clerk metadata so this fetch never runs again
            await fetch("/api/auth/sync-role", { method: "POST" });
          } else {
            setAuthorized(false);
            router.replace("/");
          }
        } else {
          setAuthorized(false);
          router.replace("/");
        }
      } catch {
        setAuthorized(false);
        router.replace("/");
      }
    })();
  }, [isLoaded, isSignedIn, user, router]);

  const centerScreen = (content: React.ReactNode) => (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#09090c", flexDirection: "column", gap: "10px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {content}
    </div>
  );

  if (!isLoaded || authorized === null) return centerScreen(
    <>
      <Loader2 className="animate-spin" style={{ width: "22px", height: "22px", color: "#e63946" }} />
      <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>Verifying admin access…</p>
    </>
  );

  if (!authorized) return centerScreen(
    <>
      <ShieldAlert style={{ width: "34px", height: "34px", color: "#e63946" }} />
      <p style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0ee", margin: 0 }}>Access Denied</p>
      <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>Admin privileges required.</p>
    </>
  );

  return (
    <div
      className={rubik.className}
      style={{
        display:  "flex",
        height:   "100vh",
        overflow: "hidden",
        /* Layered atmospheric dark — red-tinted radial glows */
        background: `
          radial-gradient(ellipse 900px 700px at 15% 0%,   rgba(230,57,70,0.06) 0%, transparent 55%),
          radial-gradient(ellipse 700px 500px at 90% 100%, rgba(230,57,70,0.045) 0%, transparent 55%),
          radial-gradient(ellipse 500px 400px at 50% 50%,  rgba(230,57,70,0.018) 0%, transparent 60%),
          #09090c
        `,
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex:      1,
          overflowY: "auto",
          /* Subtle dot grid for depth */
          backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize:  "26px 26px",
          scrollbarWidth:  "thin",
          scrollbarColor:  "rgba(255,255,255,0.07) transparent",
        }}
      >
        <div style={{ padding: "32px 28px", maxWidth: "1400px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}