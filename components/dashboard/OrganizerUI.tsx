// components/dashboard/OrganizerUI.tsx
"use client";

import { Loader2, AlertCircle } from "lucide-react";

// ── Design tokens ──
export const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#f97316", // orange for organizer (vs red for admin)
  accentSoft: "rgba(249,115,22,0.07)",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.06)",
  blue: "#1d4ed8",
  blueSoft: "rgba(29,78,216,0.06)",
  red: "#e63946",
  redSoft: "rgba(230,57,70,0.07)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

// ── Status Badge ──
const statusStyles: Record<string, { color: string; bg: string }> = {
  PUBLISHED: { color: t.green, bg: t.greenSoft },
  APPROVED: { color: t.green, bg: t.greenSoft },
  PAID: { color: t.green, bg: t.greenSoft },
  DRAFT: { color: t.textMuted, bg: t.borderLight },
  PENDING: { color: t.amber, bg: t.amberSoft },
  RESERVED: { color: t.amber, bg: t.amberSoft },
  CANCELLED: { color: t.red, bg: t.redSoft },
  REJECTED: { color: t.red, bg: t.redSoft },
  FAILED: { color: t.red, bg: t.redSoft },
  COMPLETED: { color: t.blue, bg: t.blueSoft },
  REFUNDED: { color: t.textMuted, bg: t.borderLight },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] || { color: t.textMuted, bg: t.borderLight };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: t.sans,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderRadius: "3px",
        color: s.color,
        background: s.bg,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

// ── Form Section ──
export function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "4px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: `1px solid ${t.borderLight}`,
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "4px",
            background: t.accentSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.accent,
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontFamily: t.serif,
            fontSize: "16px",
            fontWeight: 600,
            color: t.text,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Form Field ──
export function Field({
  label,
  sublabel,
  error,
  children,
}: {
  label: string;
  sublabel?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: t.textFaint,
          marginBottom: "6px",
          fontFamily: t.sans,
        }}
      >
        {label}
        {sublabel && (
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: "normal", marginLeft: "6px", color: t.textFaint }}>
            — {sublabel}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: "11px",
            color: t.red,
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: t.sans,
          }}
        >
          <AlertCircle style={{ width: "12px", height: "12px" }} />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Input class helper ──
export function inputStyle(error?: string): React.CSSProperties {
  return {
    width: "100%",
    padding: "9px 14px",
    fontSize: "13px",
    fontFamily: t.sans,
    color: t.text,
    background: error ? "rgba(230,57,70,0.03)" : t.bg,
    border: `1px solid ${error ? t.red : t.border}`,
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.15s",
  };
}

// ── Stat Card ──
export function StatCard({
  label,
  value,
  sub,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "4px",
        padding: "20px 24px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = t.border;
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.borderLight;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <p
        style={{
          fontFamily: t.serif,
          fontSize: "28px",
          fontWeight: 600,
          color: t.text,
          margin: "0 0 2px",
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: "11px", fontWeight: 500, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
        {label}
      </p>
      {sub && <p style={{ fontSize: "11px", color: t.textFaint, marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}

// ── Section Title ──
export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "24px", height: "2px", background: t.accent }} />
        <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textMuted, fontFamily: t.sans }}>
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

// ── Loading ──
export function OrganizerLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
      <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: t.accent }} />
    </div>
  );
}

// ── Empty ──
export function OrganizerEmpty({ icon, message, action }: { icon: React.ReactNode; message: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px" }}>
      <div style={{ color: t.borderLight, marginBottom: "12px" }}>{icon}</div>
      <p style={{ fontSize: "14px", color: t.textMuted, fontFamily: t.sans }}>{message}</p>
      {action && <div style={{ marginTop: "16px" }}>{action}</div>}
    </div>
  );
}

// ── Pagination ──
export function OrganizerPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
      <span style={{ fontSize: "12px", color: t.textFaint }}>Page {page} of {totalPages}</span>
      <div style={{ display: "flex", gap: "4px" }}>
        {[
          { label: "‹", disabled: page <= 1, onClick: () => onPageChange(page - 1) },
          { label: "›", disabled: page >= totalPages, onClick: () => onPageChange(page + 1) },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            disabled={btn.disabled}
            style={{
              width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${t.borderLight}`, borderRadius: "3px", background: t.surface,
              color: btn.disabled ? t.borderLight : t.textMuted, cursor: btn.disabled ? "default" : "pointer",
              fontSize: "14px", fontFamily: t.sans,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Filter Button ──
export function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px", fontSize: "12px", fontWeight: 500, fontFamily: t.sans,
        border: `1px solid ${active ? t.text : t.border}`, borderRadius: "4px",
        background: active ? t.text : t.surface,
        color: active ? "#fff" : t.textMuted, cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}