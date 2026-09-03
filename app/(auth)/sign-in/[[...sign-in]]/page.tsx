"use client";
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { useAuth } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "@/styles/auth.css";

export default function SignInPage() {
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
            <span className="auth-redirect-overlay__text">Signing you in…</span>
          </div>
        )}

        <SignIn
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
              footerAction: "flex justify-center",
            },
          }}
          fallbackRedirectUrl="/"
          signUpUrl="/sign-up"
        />
      </div>

      <div className="auth-secondary-action">
        <Link
          href="/forgot-password"
          className="auth-forgot-link text-sm transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
