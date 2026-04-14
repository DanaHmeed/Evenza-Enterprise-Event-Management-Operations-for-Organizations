// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router   = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking,   setChecking]   = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/sign-in?redirect_url=/admin"); return; }

    (async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || data.role;
          role === "ADMIN" ? setAuthorized(true) : router.replace("/");
        } else { router.replace("/"); }
      } catch { router.replace("/"); }
      finally  { setChecking(false); }
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

  if (!isLoaded || checking) return centerScreen(
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