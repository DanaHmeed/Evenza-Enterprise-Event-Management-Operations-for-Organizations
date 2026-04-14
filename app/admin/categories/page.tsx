// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2, X, CalendarDays } from "lucide-react";
import { t, AdminLoading, AdminEmpty } from "@/components/admin/AdminUI";

interface Category {
  id: string; name: string; slug: string;
  color?: string | null; _count?: { events: number };
}

const presetColors = [
  "#e63946", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#14b8a6", "#3b82f6", "#6366f1",
  "#8b5cf6", "#ec4899", "#0ea5e9", "#d4d4d4",
];

const darkInput: React.CSSProperties = {
  width: "100%", padding: "9px 14px", fontSize: "13px",
  fontFamily: "'DM Sans', sans-serif",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "4px", outline: "none",
  color: "#f0f0ee", transition: "border-color 0.15s",
  boxSizing: "border-box",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [name,       setName]       = useState("");
  const [slug,       setSlug]       = useState("");
  const [color,      setColor]      = useState("#e63946");
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) { const d = await res.json(); setCategories(d.data || []); }
    } catch { /* */ } finally { setLoading(false); }
  };

  const genSlug = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const openCreate = () => { setEditingId(null); setName(""); setSlug(""); setColor("#e63946"); setShowForm(true); };
  const openEdit   = (c: Category) => { setEditingId(c.id); setName(c.name); setSlug(c.slug); setColor(c.color || "#e63946"); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditingId(null); };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return;
    setSubmitting(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), color }),
      });
      if (res.ok) { await fetchCategories(); closeForm(); }
    } catch { /* */ } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!confirm(cat?._count?.events
      ? `This category has ${cat._count.events} event(s). Continue?`
      : "Delete this category?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch { /* */ } finally { setDeleting(null); }
  };

  return (
    <div style={{ fontFamily: t.sans, maxWidth: "820px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: t.text, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
            Categories
          </h1>
          <p style={{ fontSize: "13px", color: t.textMuted, margin: 0 }}>
            Manage event categories and their display colors.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", fontSize: "13px", fontWeight: 600,
            fontFamily: t.sans, color: "#fff",
            background: t.accent, border: "none", borderRadius: "4px",
            cursor: "pointer", transition: "background 0.15s", flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.accentHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = t.accent)}
        >
          <Plus style={{ width: "14px", height: "14px" }} />
          Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: "6px", padding: "22px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: t.textMuted }}>
              {editingId ? "Edit Category" : "New Category"}
            </span>
            <button onClick={closeForm} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: t.textMuted, display: "flex", alignItems: "center", padding: "2px",
            }}>
              <X style={{ width: "15px", height: "15px" }} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textMuted, marginBottom: "6px" }}>
                Name *
              </label>
              <input
                type="text" value={name}
                onChange={(e) => { setName(e.target.value); if (!editingId) setSlug(genSlug(e.target.value)); }}
                placeholder="e.g. Technology"
                style={darkInput}
                onFocus={(e)  => (e.currentTarget.style.borderColor = t.accent)}
                onBlur={(e)   => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textMuted, marginBottom: "6px" }}>
                Slug *
              </label>
              <input
                type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="technology"
                style={{ ...darkInput, fontFamily: t.mono, fontSize: "12px" }}
                onFocus={(e)  => (e.currentTarget.style.borderColor = t.accent)}
                onBlur={(e)   => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textMuted, marginBottom: "8px" }}>
            Color
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {presetColors.map((c) => (
                <button
                  key={c} onClick={() => setColor(c)}
                  style={{
                    width: "22px", height: "22px", borderRadius: "3px",
                    background: c, border: "none", cursor: "pointer",
                    outline: color === c ? `2px solid ${t.text}` : "2px solid transparent",
                    outlineOffset: "2px", transition: "outline 0.1s",
                  }}
                />
              ))}
            </div>
            <input
              type="color" value={color} onChange={(e) => setColor(e.target.value)}
              style={{ width: "26px", height: "26px", border: "none", cursor: "pointer", borderRadius: "3px", background: "transparent" }}
            />
            <span style={{
              display: "inline-flex", padding: "3px 10px", borderRadius: "3px",
              fontSize: "11px", fontWeight: 700, color: "#fff", background: color,
            }}>
              {name || "Preview"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !name.trim() || !slug.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "9px 18px", fontSize: "13px", fontWeight: 600,
                fontFamily: t.sans, color: "#fff", background: t.accent,
                border: "none", borderRadius: "4px",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting || !name.trim() || !slug.trim() ? 0.45 : 1,
                transition: "opacity 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = t.accentHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.accent; }}
            >
              {submitting && <Loader2 className="animate-spin" style={{ width: "13px", height: "13px" }} />}
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={closeForm}
              style={{
                padding: "9px 18px", fontSize: "13px", fontWeight: 500,
                fontFamily: t.sans, color: t.textMuted, background: "transparent",
                border: `1px solid ${t.border}`, borderRadius: "4px", cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <AdminLoading /> : categories.length === 0 ? (
        <AdminEmpty
          icon={<Tag style={{ width: "30px", height: "30px" }} />}
          message="No categories yet."
          action={
            <button onClick={openCreate} style={{
              fontSize: "13px", fontWeight: 600, color: t.accent,
              background: "transparent", border: "none", cursor: "pointer",
            }}>
              Create your first category →
            </button>
          }
        />
      ) : (
        <div style={{
          background: t.surface, border: `1px solid ${t.borderLight}`,
          borderRadius: "6px", overflow: "hidden",
        }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 18px",
                borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Color swatch */}
              <div style={{
                width: "10px", height: "10px", borderRadius: "2px",
                background: cat.color || t.accent, flexShrink: 0,
                boxShadow: `0 0 6px ${cat.color || t.accent}55`,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>
                  {cat.name}
                </p>
                <p style={{ fontSize: "11px", color: t.textMuted, margin: 0, fontFamily: t.mono }}>
                  /{cat.slug}
                </p>
              </div>

              <span style={{
                fontSize: "11px", color: t.textMuted,
                display: "flex", alignItems: "center", gap: "4px", flexShrink: 0,
              }}>
                <CalendarDays style={{ width: "11px", height: "11px" }} />
                {cat._count?.events || 0}
              </span>

              {/* Edit */}
              <button
                onClick={() => openEdit(cat)}
                style={{
                  width: "28px", height: "28px", display: "flex", alignItems: "center",
                  justifyContent: "center", border: "none", background: "transparent",
                  color: t.textMuted, cursor: "pointer", borderRadius: "4px",
                  transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceActive; e.currentTarget.style.color = t.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent";   e.currentTarget.style.color = t.textMuted; }}
              >
                <Pencil style={{ width: "12px", height: "12px" }} />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deleting === cat.id}
                style={{
                  width: "28px", height: "28px", display: "flex", alignItems: "center",
                  justifyContent: "center", border: "none", background: "transparent",
                  color: t.textMuted, cursor: "pointer", borderRadius: "4px",
                  opacity: deleting === cat.id ? 0.5 : 1,
                  transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.color = t.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}
              >
                {deleting === cat.id
                  ? <Loader2 className="animate-spin" style={{ width: "12px", height: "12px" }} />
                  : <Trash2 style={{ width: "12px", height: "12px" }} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}