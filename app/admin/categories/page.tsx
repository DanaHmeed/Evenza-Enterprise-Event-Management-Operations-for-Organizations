// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  _count?: { events: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#f97316");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const presetColors = [
    "#f97316", "#ef4444", "#8b5cf6", "#3b82f6",
    "#10b981", "#f59e0b", "#ec4899", "#6366f1",
    "#14b8a6", "#84cc16", "#f43f5e", "#0ea5e9",
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setColor("#f97316");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setColor(cat.color || "#f97316");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setSlug("");
    setColor("#f97316");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      setMessage({ type: "error", text: "Name and slug are required." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), color }),
      });

      if (res.ok) {
        await fetchCategories();
        closeForm();
        setMessage({
          type: "success",
          text: editingId ? "Category updated!" : "Category created!",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save category" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    const eventCount = cat?._count?.events || 0;
    if (eventCount > 0) {
      if (
        !confirm(
          `This category has ${eventCount} event(s). Deleting it may affect those events. Continue?`
        )
      )
        return;
    } else {
      if (!confirm("Delete this category?")) return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setMessage({ type: "success", text: "Category deleted." });
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert("Failed to delete category");
      }
    } catch {
      alert("Failed to delete category");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage event categories displayed across the platform.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <button
              onClick={closeForm}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Technology"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="technology"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-mono"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Color
              </label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-lg transition-all ${
                        color === c
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {name || "Category"}
              </span>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Update Category" : "Create Category"}
              </button>
              <button
                onClick={closeForm}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">No categories yet.</p>
          <button
            onClick={openCreate}
            className="text-sm text-orange-600 font-semibold hover:underline"
          >
            Create your first category →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
              >
                {/* Color dot + name */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color || "#f97316" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                </div>

                {/* Event count */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {cat._count?.events || 0} events
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === cat.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}