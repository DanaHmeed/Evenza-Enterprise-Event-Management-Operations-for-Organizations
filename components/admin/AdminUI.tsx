// components/admin/AdminUI.tsx
"use client";

import { Loader2 } from "lucide-react";

// ── Design tokens (shared across admin + profile + public pages) ──
export const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.07)",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.06)",
  blue: "#1d4ed8",
  blueSoft: "rgba(29,78,216,0.06)",
  purple: "#7c3aed",
  purpleSoft: "rgba(124,58,237,0.06)",
  dark: "#1a1a2e",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

// ── Status Badge ──
const statusStyles: Record<string, { color: string; bg: string }> = {
  PUBLISHED: { color: t.green, bg: t.greenSoft },
  APPROVED: { color: t.green, bg: t.greenSoft },
  PAID: { color: t.green, bg: t.greenSoft },
  ACTIVE: { color: t.green, bg: t.greenSoft },
  DRAFT: { color: t.textMuted, bg: t.borderLight },
  PENDING: { color: t.amber, bg: t.amberSoft },
  RESERVED: { color: t.amber, bg: t.amberSoft },
  WAITING: { color: t.amber, bg: t.amberSoft },
  CANCELLED: { color: t.accent, bg: t.accentSoft },
  REJECTED: { color: t.accent, bg: t.accentSoft },
  FAILED: { color: t.accent, bg: t.accentSoft },
  REFUNDED: { color: t.textMuted, bg: t.borderLight },
  COMPLETED: { color: t.blue, bg: t.blueSoft },
  EXPIRED: { color: t.textFaint, bg: t.borderLight },
  SUSPENDED: { color: t.accent, bg: t.accentSoft },
  USER: { color: t.textMuted, bg: t.borderLight },
  ORGANIZER: { color: t.purple, bg: t.purpleSoft },
  ADMIN: { color: t.accent, bg: t.accentSoft },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] || { color: t.textMuted, bg: t.borderLight };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
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

// ── Section Header (accent bar + label) ──
export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "24px", height: "2px", background: t.accent }} />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: t.textMuted,
            fontFamily: t.sans,
          }}
        >
          {title}
        </span>
      </div>
      {action}
    </div>
  );
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
        borderRadius: "6px",
        padding: "24px",
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
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: t.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: 0,
        }}
      >
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: "12px", color: t.textFaint, marginTop: "6px" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Page Header (for admin pages) ──
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "32px",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: t.serif,
            fontSize: "24px",
            fontWeight: 600,
            color: t.text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "14px",
              color: t.textMuted,
              margin: "4px 0 0",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── Action Button ──
export function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const styles = {
    primary: { bg: t.text, color: "#fff", border: t.text },
    secondary: { bg: "transparent", color: t.textSecondary, border: t.border },
    danger: { bg: "transparent", color: t.accent, border: t.border },
  };
  const s = styles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 18px",
        fontSize: "13px",
        fontWeight: 600,
        fontFamily: t.sans,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "4px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ── Loading state ──
export function AdminLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
      }}
    >
      <Loader2
        className="animate-spin"
        style={{ width: "24px", height: "24px", color: t.accent }}
      />
    </div>
  );
}

// ── Empty state ──
export function AdminEmpty({
  icon,
  message,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        fontFamily: 'Quicksand',
      }}
    >
      <div style={{ color: t.borderLight, marginBottom: "16px", display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <p
        style={{
          fontSize: "14px",
          color: t.textMuted,
          fontFamily: 'Quicksand',
          margin: 0,
        }}
      >
        {message}
      </p>
      {action && <div style={{ marginTop: "20px" }}>{action}</div>}
    </div>
  );
}

// ── Pagination ──
export function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "20px",
      }}
    >
      <span style={{ fontSize: "13px", color: t.textFaint, fontFamily: 'Quicksand' }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { label: "‹", target: Math.max(1, page - 1), disabled: page <= 1 },
          { label: "›", target: Math.min(totalPages, page + 1), disabled: page >= totalPages },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={() => onPageChange(btn.target)}
            disabled={btn.disabled}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${t.borderLight}`,
              borderRadius: "4px",
              background: t.surface,
              color: btn.disabled ? t.borderLight : t.textSecondary,
              cursor: btn.disabled ? "default" : "pointer",
              fontSize: "16px",
              fontFamily: 'Quicksand',
              transition: "border-color 0.15s",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Table wrapper ──
export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        overflow: "visible",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: 'Quicksand',
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.borderLight}` }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "12px 16px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: t.textFaint,
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── Table row helper ──
export function AdminTableRow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: `1px solid ${t.borderLight}`,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.background = t.bg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </tr>
  );
}

// ── Table cell ──
export function AdminTableCell({
  children,
  bold,
  muted,
}: {
  children: React.ReactNode;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      style={{
        padding: "14px 16px",
        fontSize: "13px",
        fontWeight: bold ? 600 : 400,
        color: muted ? t.textMuted : t.text,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}