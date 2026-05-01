// components/admin/AdminUI.tsx
"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

/* ═══════════════════════════════════════════
   Dark Design Tokens — Evenza Admin
   ═══════════════════════════════════════════ */
export const t = {
  // Backgrounds
  bg:            "#09090c",
  bgDeep:        "#060608",
  surface:       "rgba(255,255,255,0.038)",
  surfaceHover:  "rgba(255,255,255,0.06)",
  surfaceActive: "rgba(255,255,255,0.09)",

  // Borders
  border:        "rgba(255,255,255,0.1)",
  borderLight:   "rgba(255,255,255,0.055)",

  // Text
  text:          "#f0f0ee",
  textSecondary: "#9a9a9a",
  textMuted:     "#666",
  textFaint:     "#3a3a3a",

  // Accent — Evenza Red
  accent:        "#e63946",
  accentHover:   "#c8303d",
  accentSoft:    "rgba(230,57,70,0.14)",
  accentGlow:    "rgba(230,57,70,0.06)",

  // Status palette
  amber:         "#f59e0b",
  amberSoft:     "rgba(245,158,11,0.13)",
  blue:          "#60a5fa",
  blueSoft:      "rgba(96,165,250,0.13)",
  green:         "#34d399",
  greenSoft:     "rgba(52,211,153,0.13)",
  orange:        "#f97316",
  orangeSoft:    "rgba(249,115,22,0.13)",
  purple:        "#a78bfa",
  purpleSoft:    "rgba(167,139,250,0.13)",

  // Typography
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', sans-serif",
  mono:  "'JetBrains Mono', 'Fira Code', monospace",

  // Legacy alias
  dark: "#1a1a2e",
};

/* ════════════════════════════════════════
   Status Badge
   ════════════════════════════════════════ */
const statusStyles: Record<string, { color: string; bg: string }> = {
  PUBLISHED: { color: t.green,    bg: t.greenSoft  },
  APPROVED:  { color: t.green,    bg: t.greenSoft  },
  PAID:      { color: t.green,    bg: t.greenSoft  },
  ACTIVE:    { color: t.green,    bg: t.greenSoft  },
  DRAFT:     { color: t.textMuted,bg: "rgba(255,255,255,0.06)" },
  PENDING:   { color: t.amber,    bg: t.amberSoft  },
  RESERVED:  { color: t.amber,    bg: t.amberSoft  },
  WAITING:   { color: t.amber,    bg: t.amberSoft  },
  CANCELLED: { color: t.accent,   bg: t.accentSoft },
  REJECTED:  { color: t.accent,   bg: t.accentSoft },
  FAILED:    { color: t.accent,   bg: t.accentSoft },
  REFUNDED:  { color: t.textMuted,bg: "rgba(255,255,255,0.06)" },
  COMPLETED: { color: t.blue,     bg: t.blueSoft   },
  EXPIRED:   { color: t.textMuted,bg: "rgba(255,255,255,0.04)" },
  SUSPENDED: { color: t.accent,   bg: t.accentSoft },
  USER:      { color: t.textMuted,bg: "rgba(255,255,255,0.06)" },
  ORGANIZER: { color: t.purple,   bg: t.purpleSoft },
  ADMIN:     { color: t.accent,   bg: t.accentSoft },
  ONLINE:    { color: t.green,    bg: t.greenSoft  },
  OFFLINE:   { color: t.textMuted,bg: "rgba(255,255,255,0.06)" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status?.toUpperCase()] ?? {
    color: t.textMuted,
    bg:    "rgba(255,255,255,0.06)",
  };
  return (
    <span
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        padding:       "2px 8px",
        fontSize:      "10px",
        fontWeight:    700,
        //fontFamily:    t.sans,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        borderRadius:  "3px",
        color:         s.color,
        background:    s.bg,
        whiteSpace:    "nowrap",
        flexShrink:    0,
      }}
    >
      {status}
    </span>
  );
}

/* ════════════════════════════════════════
   Breadcrumb
   ════════════════════════════════════════ */
export function AdminBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <div style={{
      margin: "-32px -28px 28px -28px",
      padding: "0 28px",
      height: 48,
      display: "flex",
      alignItems: "center",
      borderBottom: `2px solid ${t.border}`,
      background: "rgba(255,255,255,0.018)",
      position: "sticky",
      top: 0,
      zIndex: 10,
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && (
                <ChevronRight style={{ width: 13, height: 13, color: t.text, opacity: 0.4, flexShrink: 0 }} />
              )}
              {isLast || !item.href ? (
                <span style={{ color: isLast ? t.text : t.textMuted, fontWeight: isLast ? 600 : 500 }}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  style={{ color: t.text, textDecoration: "none", fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Section Title
   ════════════════════════════════════════ */
export function SectionTitle({
  title,
  action,
}: {
  title:   string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        marginBottom:   "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width:        "16px",
            height:       "2px",
            background:   `linear-gradient(90deg, ${t.accent}, transparent)`,
            borderRadius: "1px",
          }}
        />
        <span
          style={{
            fontSize:      "11px",
            fontWeight:    600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color:         t.textMuted,
            //fontFamily:    t.sans,
          }}
        >
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

/* ════════════════════════════════════════
   Stat Card
   ════════════════════════════════════════ */
export function StatCard({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label:    string;
  value:    string | number;
  sub?:     string;
  accent?:  boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position:     "relative",
        background:   t.surface,
        border:       `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        padding:      "20px 22px",
        cursor:       onClick ? "pointer" : "default",
        overflow:     "hidden",
        transition:   "border-color 0.18s, background 0.18s",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        (e.currentTarget as HTMLElement).style.borderColor =
          accent ? t.accent : "rgba(255,255,255,0.14)";
        (e.currentTarget as HTMLElement).style.background = t.surfaceHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = t.borderLight;
        (e.currentTarget as HTMLElement).style.background  = t.surface;
      }}
    >
      {accent && (
        <div
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            right:      0,
            height:     "1px",
            background: `linear-gradient(90deg, ${t.accent} 0%, transparent 65%)`,
          }}
        />
      )}
      <p
        style={{
          //fontFamily:         t.serif,
          fontSize:           "26px",
          fontWeight:         600,
          color:              accent ? t.accent : t.text,
          margin:             "0 0 6px",
          letterSpacing:      "-0.02em",
          fontVariantNumeric: "tabular-nums",
          lineHeight:         1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize:      "11px",
          fontWeight:    600,
          color:         t.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          margin:        0,
          //fontFamily:    t.sans,
        }}
      >
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: "12px", color: t.textMuted, margin: "6px 0 0",  }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Page Header
   ════════════════════════════════════════ */
export function PageHeader({
  title,
  description,
  action,
}: {
  title:        string;
  description?: string;
  action?:      ReactNode;
}) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        flexWrap:       "wrap",
        gap:            "16px",
        marginBottom:   "32px",
      }}
    >
      <div>
        <h1
          style={{
           // fontFamily:    t.sans,
            fontSize:      "22px",
            fontWeight:    700,
            color:         t.text,
            margin:        0,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: "13px", color: t.textMuted, margin: "4px 0 0", }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ════════════════════════════════════════
   Action Button
   ════════════════════════════════════════ */
export function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  icon,
}: {
  children:  ReactNode;
  onClick?:  () => void;
  variant?:  "primary" | "secondary" | "danger";
  disabled?: boolean;
  icon?:     ReactNode;
}) {
  const map = {
    primary:   { bg: t.accent,     color: "#fff",           border: t.accent   },
    secondary: { bg: "transparent",color: t.textSecondary,  border: t.border   },
    danger:    { bg: t.accentSoft, color: t.accent,         border: t.border   },
  };
  const s = map[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          "8px",
        padding:      "9px 18px",
        fontSize:     "13px",
        fontWeight:   600,
       // fontFamily:   t.sans,
        color:        s.color,
        background:   s.bg,
        border:       `1px solid ${s.border}`,
        borderRadius: "4px",
        cursor:       disabled ? "default" : "pointer",
        opacity:      disabled ? 0.45 : 1,
        transition:   "opacity 0.15s, background 0.15s",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/* ════════════════════════════════════════
   Loading
   ════════════════════════════════════════ */
export function AdminLoading() {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "80px 0",
      }}
    >
      <Loader2
        className="animate-spin"
        style={{ width: "22px", height: "22px", color: t.accent }}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   Empty State
   ════════════════════════════════════════ */
export function AdminEmpty({
  icon,
  message,
  action,
}: {
  icon:    ReactNode;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign:      "center",
        padding:        "64px 24px",
        background:     t.surface,
        border:         `1px solid ${t.borderLight}`,
        borderRadius:   "6px",
        //fontFamily:     t.sans,
      }}
    >
      <div style={{ color: t.textFaint, marginBottom: "14px", display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <p style={{ fontSize: "13px", color: t.textMuted,  margin: 0 }}>
        {message}
      </p>
      {action && <div style={{ marginTop: "20px" }}>{action}</div>}
    </div>
  );
}

/* ════════════════════════════════════════
   Pagination
   ════════════════════════════════════════ */
export function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page:         number;
  totalPages:   number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        marginTop:      "20px",
      }}
    >
      <span style={{ fontSize: "12px", color: t.textMuted,  }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: "5px" }}>
        {[
          { label: "‹", target: Math.max(1, page - 1),          disabled: page <= 1          },
          { label: "›", target: Math.min(totalPages, page + 1), disabled: page >= totalPages },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={() => onPageChange(btn.target)}
            disabled={btn.disabled}
            style={{
              width:          "32px",
              height:         "32px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              border:         `1px solid ${t.borderLight}`,
              borderRadius:   "4px",
              background:     t.surface,
              color:          btn.disabled ? t.textFaint : t.textSecondary,
              cursor:         btn.disabled ? "default" : "pointer",
              fontSize:       "16px",
             // fontFamily:     t.sans,
              transition:     "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!btn.disabled) {
                (e.currentTarget as HTMLElement).style.borderColor = t.border;
                (e.currentTarget as HTMLElement).style.color        = t.text;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = t.borderLight;
              (e.currentTarget as HTMLElement).style.color =
                btn.disabled ? t.textFaint : t.textSecondary;
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Table
   ════════════════════════════════════════ */
export function AdminTable({
  headers,
  children,
}: {
  headers:  string[];
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background:   t.surface,
        border:       `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        overflow:     "visible",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse",  }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.borderLight}` }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding:       "11px 16px",
                    fontSize:      "10px",
                    fontWeight:    700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color:         t.textFaint,
                    textAlign:     "left",
                    whiteSpace:    "nowrap",
                    background:    "rgba(255,255,255,0.018)",
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

/* ════════════════════════════════════════
   Table Row
   ════════════════════════════════════════ */
export function AdminTableRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: `1px solid ${t.borderLight}`,
        cursor:       onClick ? "pointer" : "default",
        transition:   "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (onClick)
          (e.currentTarget as HTMLElement).style.background = t.surfaceHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </tr>
  );
}

/* ════════════════════════════════════════
   Table Cell
   ════════════════════════════════════════ */
export function AdminTableCell({
  children,
  bold,
  muted,
}: {
  children: ReactNode;
  bold?:    boolean;
  muted?:   boolean;
}) {
  return (
    <td
      style={{
        padding:    "13px 16px",
        fontSize:   "13px",
        fontWeight: bold ? 600 : 400,
        color:      muted ? t.textMuted : t.text,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}