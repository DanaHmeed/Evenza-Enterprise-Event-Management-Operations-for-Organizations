// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import "@/styles/auth.css";
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#c65504", // orange
          },
          elements: {
            card: "glass-card border rounded-xl shadow-xl",
          },
        }}
        redirectUrl="/sign-in/sso-callback"
      />
    </div>
  );
}
