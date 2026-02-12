// app/(auth)/layout.tsx
import "@/styles/auth.css";

export const metadata = {
  title: "Evenza — Sign In",
  description: "Sign in or create an account on Evenza",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}