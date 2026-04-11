"use client";
// app/(auth)/sign-up/[[...sign-up]]/page.tsx

import { useAuth } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/auth.css";

export default function SignUpPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

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
              colorPrimary: "#c65504",
            },
            elements: {
              rootBox: "auth-root-box",
              card: "auth-white-card rounded-xl shadow-xl",
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