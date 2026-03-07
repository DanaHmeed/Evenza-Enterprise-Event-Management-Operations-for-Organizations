// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2, X, CalendarDays } from "lucide-react";
import { t, AdminLoading, AdminEmpty } from "@/components/admin/AdminUI";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  _count?: { events: number };
}

const presetColors = [
  "#e63946", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#14b8a6", "#3b82f6", "#6366f1",
  "#8b5cf6", "#ec4899", "#0ea5e9", "#1a1a2e",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#e63946");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) { const data = await res.json(); setCategories(data.data || []); }
    } catch { /* */ } finally { setLoading(false); }
  };

  const genSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const openCreate = () => { setEditingId(null); setName(""); setSlug(""); setColor("#e63946"); setShowForm(true); };
  const openEdit = (c: Category) => { setEditingId(c.id); setName(c.name); setSlug(c.slug); setColor(c.color || "#e63946"); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

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
    if (!confirm(cat?._count?.events ? `This category has ${cat._count.events} event(s). Continue?` : "Delete this category?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch { /* */ } finally { setDeleting(null); }
  };

  return (
    <div style={{ fontFamily: 'Quicksand', maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: 'Quicksand', fontSize: "24px", fontWeight: 600, color: t.text, margin: 4 }}>Categories</h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px",fontFamily: 'Quicksand',marginLeft:4 }}>Manage event categories.</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px",
            fontSize: "13px", fontWeight: 600, fontFamily: 'Quicksand',
            color: "#fff", background: t.text, border: "none", borderRadius: "4px", cursor: "pointer",
          }}
        >
          <Plus style={{ width: "14px", height: "14px" }} />
          Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "4px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textMuted }}>
              {editingId ? "Edit Category" : "New Category"}
            </span>
            <button onClick={closeForm} style={{ background: "transparent", border: "none", cursor: "pointer", color: t.textFaint }}>
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint, marginBottom: "6px" }}>Name *</label>
              <input
                type="text" value={name}
                onChange={(e) => { setName(e.target.value); if (!editingId) setSlug(genSlug(e.target.value)); }}
                placeholder="e.g. Technology"
                style={{ width: "100%", padding: "9px 14px", fontSize: "13px", fontFamily: 'Quicksand', border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint, marginBottom: "6px" }}>Slug *</label>
              <input
                type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="technology"
                style={{ width: "100%", padding: "9px 14px", fontSize: "13px", fontFamily: "monospace", border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text }}
              />
            </div>
          </div>

          {/* Color picker */}
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint, marginBottom: "8px" }}>Color</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: "24px", height: "24px", borderRadius: "3px", background: c, border: "none", cursor: "pointer",
                    outline: color === c ? `2px solid ${t.text}` : "none", outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "28px", height: "28px", border: "none", cursor: "pointer", borderRadius: "3px" }} />
            {/* Preview */}
            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "3px", fontSize: "12px", fontWeight: 600, color: "#fff", background: color }}>
              {name || "Preview"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSubmit} disabled={submitting || !name.trim() || !slug.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px",
                fontSize: "13px", fontWeight: 600, fontFamily: 'Quicksand',
                color: "#fff", background: t.text, border: "none", borderRadius: "4px",
                cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting && <Loader2 className="animate-spin" style={{ width: "14px", height: "14px" }} />}
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={closeForm} style={{ padding: "9px 18px", fontSize: "13px", fontWeight: 500, fontFamily: 'Quicksand', color: t.textMuted, background: "transparent", border: `1px solid ${t.border}`, borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <AdminLoading /> : categories.length === 0 ? (
        <AdminEmpty
          icon={<Tag style={{ width: "32px", height: "32px" }} />}
          message="No categories yet."
          action={<button onClick={openCreate} style={{ fontSize: "13px", fontWeight: 600, color: t.accent, background: "transparent", border: "none", cursor: "pointer" }}>Create your first category →</button>}
        />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", overflow: "hidden" }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px",
                borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: cat.color || "#f97316", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>{cat.name}</p>
                <p style={{ fontSize: "11px", color: t.textFaint, margin: 0, fontFamily: 'Quicksand' }}>/{cat.slug}</p>
              </div>
              <span style={{ fontSize: "11px", color: t.textMuted, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                <CalendarDays style={{ width: "11px", height: "11px" }} />
                {cat._count?.events || 0}
              </span>
              <button
                onClick={() => openEdit(cat)}
                style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: t.textFaint, cursor: "pointer", borderRadius: "4px" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Pencil style={{ width: "12px", height: "12px" }} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deleting === cat.id}
                style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: t.textFaint, cursor: "pointer", borderRadius: "4px", opacity: deleting === cat.id ? 0.5 : 1 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.accentSoft)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {deleting === cat.id ? <Loader2 className="animate-spin" style={{ width: "12px", height: "12px" }} /> : <Trash2 style={{ width: "12px", height: "12px" }} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}