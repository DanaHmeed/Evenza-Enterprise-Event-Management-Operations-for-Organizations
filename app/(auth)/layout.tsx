import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "../../styles/auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Ember Glow Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 100%, rgba(255, 69, 0, 0.6) 0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(255, 140, 0, 0.4) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(255, 215, 0, 0.3) 0%, transparent 80%)
          `,
        }}
      />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-sm font-medium transition-all duration-200 hover:bg-black hover:text-white hover:shadow-lg"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-6">
        <div className="h-16" />

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/icons/Variant2.png"
            alt="Evenza Logo"
            width={210}
            height={80}
            priority
          />
        </div>

        {/* Card */}
        <div className="auth-card w-full">
          {children}
        </div>
        <div className="h-1" />
      </div>
    </div>
  );
}