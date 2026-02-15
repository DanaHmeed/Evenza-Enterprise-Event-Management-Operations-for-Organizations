import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#c65504", // orange
          },
          elements: {
            card: "shadow-xl border rounded-xl",
          },
        }}
        redirectUrl="/sign-up/sso-callback"
      />
    </div>
  );
}
