// app/(auth)/layout.tsx
import Link from "next/link";
import "@/styles/auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: "translateZ(0)",
          willChange: "transform",
          backgroundImage: "linear-gradient(rgba(243,238,229,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(243,238,229,.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <Link
        href="/"
        className="auth-back-link absolute left-6 top-6 z-20 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200"
      >
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back
      </Link>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
        {children}
      </main>
    </div>
  );
}
