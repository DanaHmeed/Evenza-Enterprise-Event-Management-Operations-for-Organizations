//app/(root)/components/modals/ConfirmModal.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X, AlertCircle, Info } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms, 0 = persistent
  onClose?: () => void;
}

const config: Record<
  ToastVariant,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  success: {
    icon: <CheckCircle2 style={{ width: 16, height: 16 }} />,
    color: "#1a7a4a",
    bg: "#f0faf4",
    border: "#bbf0d4",
  },
  error: {
    icon: <XCircle style={{ width: 16, height: 16 }} />,
    color: "#c0392b",
    bg: "#fef5f5",
    border: "#fcc9c4",
  },
  warning: {
    icon: <AlertCircle style={{ width: 16, height: 16 }} />,
    color: "#92600a",
    bg: "#fffbeb",
    border: "#fed97f",
  },
  info: {
    icon: <Info style={{ width: 16, height: 16 }} />,
    color: "#1a56a4",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
};

/**
 * ActionToast — reusable slide-in notification
 *
 * Usage:
 *   const [toast, setToast] = useState<ToastProps | null>(null);
 *   setToast({ message: "Event published!", variant: "success" });
 *   <ActionToast {...toast} onClose={() => setToast(null)} />
 */
export default function ActionToast({
  message,
  description,
  variant = "success",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const c = config[variant];

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 260);
  };

  useEffect(() => {
    // Small delay so the entrance animation triggers
    const enter = setTimeout(() => setVisible(true), 16);
    let auto: ReturnType<typeof setTimeout> | null = null;
    if (duration > 0) {
      auto = setTimeout(dismiss, duration);
    }
    return () => {
      clearTimeout(enter);
      if (auto) clearTimeout(auto);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = visible && !leaving ? "0" : "-16px";
  const opacity = visible && !leaving ? 1 : 0;

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {/* Portal-style fixed overlay — top-right */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          minWidth: 300,
          maxWidth: 400,
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          overflow: "hidden",
          transform: `translateY(${translateY})`,
          opacity,
          transition: "transform 0.26s cubic-bezier(0.16,1,0.3,1), opacity 0.26s ease",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
        role="alert"
        aria-live="assertive"
      >
        {/* Body */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "14px 16px",
          }}
        >
          <span style={{ color: c.color, marginTop: 1, flexShrink: 0 }}>
            {c.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#111",
                lineHeight: 1.4,
              }}
            >
              {message}
            </p>
            {description && (
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 12,
                  color: "#555",
                  lineHeight: 1.5,
                }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={dismiss}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888",
              padding: 2,
              display: "flex",
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Progress bar (only when duration > 0) */}
        {duration > 0 && (
          <div
            style={{
              height: 2,
              background: c.border,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                height: "100%",
                background: c.color,
                transformOrigin: "left center",
                animation: `toast-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

/* ─── useToast hook ─────────────────────────────────────────────────────── */

import { useCallback } from "react";

export interface ToastState extends ToastProps {
  id: number;
}

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((props: ToastProps) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { ...props, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map((t) => (
        <ActionToast key={t.id} {...t} onClose={() => dismiss(t.id)} />
      ))}
    </>
  );

  return { show, dismiss, ToastContainer };
}