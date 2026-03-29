// app/(auth)/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import "@/styles/auth.css";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#c65504",
        },
        elements: {
          card: "shadow-xl border rounded-xl glass-card",
          formButtonPrimary: "transition-all duration-150",
        },
      }}
      fallbackRedirectUrl="/"
      signInUrl="/sign-in"
    />
  );
}