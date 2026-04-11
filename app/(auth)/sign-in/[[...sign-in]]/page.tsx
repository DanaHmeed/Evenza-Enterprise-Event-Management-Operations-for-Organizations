"use client";
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { useAuth } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/auth.css";

export default function SignInPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  // Prefetch the home route as soon as the sign-in page mounts.
  // This removes the biggest chunk of the blank-screen delay after login.
  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  // Watch Clerk's auth state. The moment it flips to signed-in:
  //  • Show the overlay immediately (hides the collapsing Clerk card)
  //  • Navigate programmatically
  useEffect(() => {
    if (!isSignedIn) return;
    setRedirecting(true);
    router.replace("/");
  }, [isSignedIn, router]);

  return (
    // data-redirecting controls the CSS that hides the "Forgot password?" link
    <div className="auth-shell" data-redirecting={String(redirecting)}>
      <div className="auth-widget-wrap">
        {/* Overlay covers the collapsing Clerk card during redirect */}
        {redirecting && (
          <div className="auth-redirect-overlay">
            <div className="auth-redirect-overlay__spinner" />
            <span className="auth-redirect-overlay__text">Signing you in…</span>
          </div>
        )}

        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#c65504",
            },
            elements: {
              rootBox: "auth-root-box",
              card: "auth-white-card rounded-xl shadow-xl",
              formButtonPrimary: "transition-all duration-150",
              footerAction: "flex justify-center",
            },
          }}
          /*
            FIX: use fallbackRedirectUrl instead of forceRedirectUrl.
            forceRedirectUrl overrides even intentional deep-links; the
            fallback variant only kicks in when there's no pending redirect
            already queued, which is the correct default behaviour here.
            Our programmatic router.replace("/") above takes over anyway.
          */
          fallbackRedirectUrl="/"
          signUpUrl="/sign-up"
        />
      </div>

      <div className="auth-secondary-action">
        <Link
          href="/forgot-password"
          className="text-sm text-orange-400 hover:text-orange-300 transition-colors font-quicksand"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}