"use client";
// app/(auth)/sign-up/[[...sign-up]]/page.tsx

import { useAuth } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "@/styles/auth.css";

export default function SignUpPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const redirecting = Boolean(isSignedIn);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    if (!isSignedIn) return;
    router.replace("/");
  }, [isSignedIn, router]);

  return (
    <div className="auth-shell" data-redirecting={String(redirecting)}>
      <div className="auth-widget-wrap">
        {redirecting && (
          <div className="auth-redirect-overlay">
            <div className="auth-redirect-overlay__spinner" />
            <span className="auth-redirect-overlay__text">Creating your account…</span>
          </div>
        )}

        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#e85b2a",
              colorBackground: "#f3eee5",
              colorText: "#191713",
              borderRadius: "2px",
              fontFamily: "var(--font-dm-sans), sans-serif",
            },
            elements: {
              rootBox: "auth-root-box",
              card: "auth-white-card",
              formButtonPrimary: "transition-all duration-150",
            },
          }}
          fallbackRedirectUrl="/"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
