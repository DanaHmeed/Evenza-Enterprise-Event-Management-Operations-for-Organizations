// app/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import "@/styles/auth.css";

export default function SignInPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-xl">
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#c65504",
          },
          elements: {
            card: "glass-card border rounded-xl shadow-xl",
            formButtonPrimary: "transition-all duration-150",
            footerAction: "flex justify-center",
          },
        }}
        fallbackRedirectUrl="/"
        signUpUrl="/sign-up"
      />

      {/* Positioned to overlap into the bottom of the Clerk card */}
      <div className="relative -mt-12 pb-4 flex justify-center z-[5]">
        <Link
          href="/forgot-password"
          className="text-sm text-orange-400 hover:text-orange-300 transition-colors text-family-Quicksand"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}