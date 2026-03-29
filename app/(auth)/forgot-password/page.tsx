'use client';

import React from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

type Step = 'email' | 'code' | 'new-password' | 'complete';

/* ────────────────────────────────────────────
   Design tokens
   ──────────────────────────────────────────── */
const t = {
  bg: '#0c0c0c',
  card: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#e8e6e1',
  textSecondary: 'rgba(255,255,255,0.5)',
  textFaint: 'rgba(255,255,255,0.25)',
  accent: '#d4885a',
  accentHover: '#e09a6a',
  accentSoft: 'rgba(212,136,90,0.12)',
  accentBorder: 'rgba(212,136,90,0.25)',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.08)',
  inputFocusBorder: 'rgba(212,136,90,0.5)',
  error: '#e5564f',
  errorSoft: 'rgba(229,86,79,0.1)',
  errorBorder: 'rgba(229,86,79,0.2)',
  success: '#5bb98c',
  successSoft: 'rgba(91,185,140,0.1)',
  successBorder: 'rgba(91,185,140,0.2)',
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px 13px 42px',
  fontSize: '14px',
  fontFamily: 'Quicksand',
  color: t.text,
  background: t.inputBg,
  border: `1px solid ${t.inputBorder}`,
  borderRadius: '10px',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const inputFocusStyle = `
  input:focus {
    border-color: ${t.inputFocusBorder} !important;
    box-shadow: 0 0 0 3px rgba(212,136,90,0.08);
  }
  input::placeholder { color: ${t.textFaint}; }
`;

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'Quicksand',
  color: '#fff',
  background: t.accent,
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'background 0.2s ease, opacity 0.2s ease',
};

export default function ForgotPasswordPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = React.useState<Step>('email');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={22} className="animate-spin" style={{ color: t.accent }} />
      </div>
    );
  }

  // ─── Handlers (unchanged logic) ────────────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn!.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      if (result.status === 'needs_first_factor') setStep('code');
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          'Could not find an account with that email.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      });
      if (result.status === 'needs_new_password') setStep('new-password');
      else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          'Invalid verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setIsLoading(true);
    try {
      const result = await signIn!.resetPassword({ password });
      if (result.status === 'needs_second_factor') {
        setError('Two-factor authentication is required. Please sign in normally.');
        return;
      }
      if (result.status === 'complete') {
        setStep('complete');
        await setActive({ session: result.createdSessionId });
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          'Failed to reset password.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Step config ───────────────────────────────────────────────
  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'email', label: 'Email', icon: <Mail size={13} /> },
    { key: 'code', label: 'Verify', icon: <ShieldCheck size={13} /> },
    { key: 'new-password', label: 'Reset', icon: <KeyRound size={13} /> },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const passwordStrength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : password.length >= 4 ? 1 : 0;
  const strengthColor = passwordStrength >= 3 ? t.success : passwordStrength >= 2 ? t.accent : t.error;

  return (
    <>
      <style>{inputFocusStyle}</style>

      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', fontFamily: t.sans }}>
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {step !== 'complete' ? (
            <>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  margin: '0 auto 20px',
                  borderRadius: '14px',
                  background: t.accentSoft,
                  border: `1px solid ${t.accentBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KeyRound size={20} style={{ color: t.text }} />
              </div>
              <h1
                style={{
                  fontFamily: t.serif,
                  fontSize: '24px',
                  fontWeight: 600,
                  color: t.text,
                  letterSpacing: '-0.02em',
                  margin: '0 0 8px 0',
                }}
              >
                Reset Password
              </h1>
              <p style={{ fontSize: '14px', fontFamily:'Quicksand', color: t.textSecondary, margin: 0, lineHeight: 1.5 }}>
                {step === 'email' && 'Enter the email associated with your account.'}
                {step === 'code' && (
                  <>
                    We sent a code to{' '}
                    <span style={{ color: t.accent, fontWeight: 500 }}>{emailAddress}</span>
                  </>
                )}
                {step === 'new-password' && 'Choose a strong new password.'}
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: t.successSoft,
                  border: `1px solid ${t.successBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={26} style={{ color: t.success }} />
              </div>
              <h1
                style={{
                  fontFamily: t.serif,
                  fontSize: '24px',
                  fontWeight: 600,
                  color: t.text,
                  letterSpacing: '-0.02em',
                  margin: '0 0 8px 0',
                }}
              >
                Password reset
              </h1>
              <p style={{ fontSize: '14px', color: t.textSecondary, margin: 0 }}>
                You&apos;re all set. Redirecting you now…
              </p>
            </>
          )}
        </div>

        {/* ── Step indicator ── */}
        {step !== 'complete' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0',
              marginBottom: '36px',
            }}
          >
            {steps.map((s, i) => {
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              return (
                <React.Fragment key={s.key}>
                  {i > 0 && (
                    <div
                      style={{
                        width: '32px',
                        height: '1px',
                        background: isDone ? t.accent : 'rgba(255,255,255,0.06)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      transition: 'all 0.3s ease',
                      ...(isActive
                        ? {
                            background: t.accentSoft,
                            color: t.accent,
                            border: `1px solid ${t.accentBorder}`,
                          }
                        : isDone
                          ? {
                              background: 'transparent',
                              color: t.accent,
                              border: '1px solid transparent',
                              opacity: 0.6,
                            }
                          : {
                              background: 'transparent',
                              color: t.textFaint,
                              border: '1px solid transparent',
                            }),
                    }}
                  >
                    {isDone ? <CheckCircle2 size={11} /> : s.icon}
                    {s.label}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              marginBottom: '24px',
              borderRadius: '10px',
              background: t.errorSoft,
              border: `1px solid ${t.errorBorder}`,
              fontSize: '13px',
              color: t.error,
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <form onSubmit={handleSendCode}>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: t.textSecondary,
                  marginBottom: '8px',
                }}
              >
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: t.textFaint,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailAddress}
              style={{
                fontFamily: 'Quicksand',
                ...buttonStyle,
                opacity: isLoading || !emailAddress ? 0.4 : 1,
                cursor: isLoading || !emailAddress ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading && emailAddress) e.currentTarget.style.background = t.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.accent;
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending code…
                </>
              ) : (
                'Send reset code'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link
                href="/sign-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: t.textFaint,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  fontFamily: 'Quicksand',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.textSecondary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = t.textFaint)}
              >
                <ArrowLeft size={13} />
                Back to sign in
              </Link>
            </div>
          </form>
        )}

        {/* ── Step 2: Code ── */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="code"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: t.textSecondary,
                  marginBottom: '8px',
                }}
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  ...inputStyle,
                  paddingLeft: '14px',
                  textAlign: 'center',
                  fontSize: '18px',
                  letterSpacing: '0.3em',
                  fontFamily: "'DM Mono', 'SF Mono', monospace",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              style={{
                ...buttonStyle,
                opacity: isLoading || code.length < 6 ? 0.4 : 1,
                cursor: isLoading || code.length < 6 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading && code.length >= 6) e.currentTarget.style.background = t.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.accent;
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify code'
              )}
            </button>

            <button
              type="button"
              onClick={() => { setCode(''); setError(''); setStep('email'); }}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '20px',
                padding: 0,
                border: 'none',
                background: 'none',
                fontSize: '13px',
                color: t.textFaint,
                cursor: 'pointer',
                fontFamily: t.sans,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.textSecondary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.textFaint)}
            >
              Didn&apos;t receive a code? Try again
            </button>
          </form>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 'new-password' && (
          <form onSubmit={handleSetPassword}>
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: t.textSecondary,
                  marginBottom: '8px',
                }}
              >
                New password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: t.textFaint,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: t.textSecondary,
                  marginBottom: '8px',
                }}
              >
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: t.textFaint,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: '12px', color: t.error, margin: '6px 0 0', lineHeight: 1 }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '22px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '2px',
                      background: level <= passwordStrength ? strengthColor : 'rgba(255,255,255,0.06)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password || password !== confirmPassword}
              style={{
                ...buttonStyle,
                opacity: isLoading || !password || password !== confirmPassword ? 0.4 : 1,
                cursor: isLoading || !password || password !== confirmPassword ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading && password && password === confirmPassword)
                  e.currentTarget.style.background = t.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.accent;
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Resetting password…
                </>
              ) : (
                'Set new password'
              )}
            </button>
          </form>
        )}

        {/* ── Step 4: Success ── */}
        {step === 'complete' && (
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <Loader2 size={18} className="animate-spin" style={{ color: t.accent, margin: '0 auto' }} />
          </div>
        )}
      </div>
    </>
  );
}