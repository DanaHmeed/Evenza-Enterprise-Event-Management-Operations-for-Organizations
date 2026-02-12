"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { OAuthStrategy } from "@clerk/types";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string; longMessage?: string }[] };
      const message =
        clerkError.errors?.[0]?.longMessage ||
        clerkError.errors?.[0]?.message ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/events");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string; longMessage?: string }[] };
      const message =
        clerkError.errors?.[0]?.longMessage ||
        clerkError.errors?.[0]?.message ||
        "Invalid verification code.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (strategy: OAuthStrategy) => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: "/events",
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || "OAuth sign up failed.");
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setError("");
    } catch {
      setError("Failed to resend code. Please try again.");
    }
  };

  // ── Verification Screen ──
  if (pendingVerification) {
    return (
      <div className="auth-card auth-card-centered">
        <div className="auth-form-container auth-form-container-full">
          <div className="auth-form-inner">
            <div className="auth-verification-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="#f0f4ff" />
                <rect x="16" y="20" width="24" height="18" rx="3" stroke="#6366f1" strokeWidth="2" fill="none" />
                <path d="M16 23l12 9 12-9" stroke="#6366f1" strokeWidth="2" fill="none" />
              </svg>
            </div>

            <div className="auth-form-header" style={{ textAlign: "center" }}>
              <h2 className="auth-form-title">Check your email</h2>
              <p className="auth-form-subtitle">
                We&apos;ve sent a 6-digit verification code to{" "}
                <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleVerification} className="auth-form">
              <div className="auth-field">
                <label htmlFor="code" className="auth-label">Verification code</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit code"
                  className="auth-input auth-input-code"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading || verificationCode.length < 6}
              >
                {isLoading ? <span className="auth-spinner" /> : "Verify Email"}
              </button>
            </form>

            <p className="auth-footer-text" style={{ textAlign: "center" }}>
              Didn&apos;t receive the code?{" "}
              <button
                onClick={handleResendCode}
                className="auth-footer-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Resend code
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Sign Up Form ──
  return (
    <div className="auth-card">
      {/* Left Side — Branding */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M12 14h16v3H12zm0 5h12v3H12zm0 5h14v3H12z" fill="white" />
            </svg>
            <span className="auth-logo-text">Evenza</span>
          </div>

          <h1 className="auth-brand-title">
            Create. Organize. <br />
            Inspire.
          </h1>
          <p className="auth-brand-subtitle">
            Join Evenza and start your journey — whether you&apos;re discovering
            amazing events or creating your own. Your next great experience
            starts here.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Discover events tailored to you</span>
            </div>
            <div className="auth-feature">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Create and manage events with ease</span>
            </div>
            <div className="auth-feature">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>QR tickets & real-time analytics</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-decoration">
          <div className="auth-brand-circle auth-brand-circle-1" />
          <div className="auth-brand-circle auth-brand-circle-2" />
          <div className="auth-brand-circle auth-brand-circle-3" />
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="auth-form-container">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-subtitle">Start exploring and organizing events</p>
          </div>

          <div className="auth-oauth-group">
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              className="auth-oauth-btn"
              disabled={!isLoaded}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("oauth_linkedin_oidc")}
              className="auth-oauth-btn"
              disabled={!isLoaded}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or continue with email</span>
            <div className="auth-divider-line" />
          </div>

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field-row">
              <div className="auth-field">
                <label htmlFor="firstName" className="auth-label">First name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="auth-input"
                  required
                  autoComplete="given-name"
                  disabled={isLoading}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName" className="auth-label">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="auth-input"
                  required
                  autoComplete="family-name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="auth-input"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-toggle-password"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="auth-password-strength">
                  <div className="auth-strength-bars">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="auth-strength-bar"
                        style={{
                          backgroundColor:
                            passwordStrength >= level
                              ? strengthColors[passwordStrength]
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="auth-strength-label"
                    style={{ color: strengthColors[passwordStrength] }}
                  >
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="auth-label">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="auth-input"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="auth-field-error">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading || !isLoaded || password !== confirmPassword}
            >
              {isLoading ? <span className="auth-spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link href="/sign-in" className="auth-footer-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}