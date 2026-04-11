// app/(auth)/layout.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/styles/auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: "translateZ(0)",
          willChange: "transform",
          backgroundImage: `
            radial-gradient(circle at 50% 100%, rgba(255,69,0,0.6)   0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(255,140,0,0.4)  0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(255,215,0,0.3)  0%, transparent 80%)
          `,
        }}
      />

      <Link
        href="/"
        className="absolute left-6 top-6 z-20 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-black hover:text-white hover:shadow-lg"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
        {children}
      </main>
    </div>
  );
}