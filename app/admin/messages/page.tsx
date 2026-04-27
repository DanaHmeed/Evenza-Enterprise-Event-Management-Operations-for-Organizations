// app/admin/messages/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Mail, Loader2, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { t, SectionTitle, AdminPagination, AdminEmpty, AdminLoading } from "@/components/admin/AdminUI";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [page, unreadOnly]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (unreadOnly) params.set("unread", "true");

      const res = await fetch(`/api/admin/messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "PATCH" });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      }
    } catch {
      console.error("Failed to mark as read");
    } finally {
      setProcessing(null);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      console.error("Failed to delete");
    } finally {
      setProcessing(null);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div style={{ fontFamily: 'Quicksand' }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: 'Quicksand', fontSize: "24px", fontWeight: 600, color: t.text, margin: 4 }}>Contact Messages</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" , marginLeft: 4}}>{total} messages from the contact form.</p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
        {[false, true].map((val) => (
          <button
            key={String(val)}
            onClick={() => { setUnreadOnly(val); setPage(1); }}
            style={{
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: 'Quicksand',
              border: `1px solid ${unreadOnly === val ? t.text : t.border}`,
              borderRadius: "4px",
              background: unreadOnly === val ? t.text : t.surface,
              color: unreadOnly === val ? "#050505" : t.textMuted,
              cursor: "pointer",
              marginLeft: 4,
            }}
          >
            {val ? "Unread Only" : "All Messages"}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminLoading />
      ) : messages.length === 0 ? (
        <AdminEmpty
          icon={<Mail style={{ width: "32px", height: "32px" }} />}
          message="No messages found."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {messages.map((msg) => {
            const expanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${msg.isRead ? t.borderLight : t.border}`,
                  borderRadius: "4px",
                  borderLeft: msg.isRead ? undefined : `3px solid ${t.accent}`,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(expanded ? null : msg.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 20px",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {!msg.isRead && (
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: msg.isRead ? 500 : 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.subject}
                    </p>
                    <p style={{ fontSize: "12px", color: t.textMuted, margin: "2px 0 0" }}>
                      {msg.name} · {msg.email}
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", color: t.textSecondary, flexShrink: 0 }}>{fmtDate(msg.createdAt)}</span>
                  {expanded ? (
                    <ChevronUp style={{ width: "14px", height: "14px", color: t.textFaint }} />
                  ) : (
                    <ChevronDown style={{ width: "14px", height: "14px", color: t.textFaint }} />
                  )}
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${t.borderLight}`, paddingTop: "16px" }}>
                    <p style={{ fontSize: "14px", color: t.textSecondary, lineHeight: 1.7, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>
                      {msg.message}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!msg.isRead && (
                        <button
                          onClick={() => markRead(msg.id)}
                          disabled={processing === msg.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 14px",
                            fontSize: "12px",
                            fontWeight: 600,
                            fontFamily: 'Quicksand',
                            color: t.green,
                            background: t.greenSoft,
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            opacity: processing === msg.id ? 0.5 : 1,
                          }}
                        >
                          <Check style={{ width: "12px", height: "12px" }} />
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={processing === msg.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          fontFamily: 'Quicksand',
                          color: t.accent,
                          background: t.accentSoft,
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          opacity: processing === msg.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 style={{ width: "12px", height: "12px" }} />
                        Delete
                      </button>
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          fontFamily: 'Quicksand',
                          color: t.textSecondary,
                          background: t.borderLight,
                          border: "none",
                          borderRadius: "4px",
                          textDecoration: "none",
                          marginLeft: "auto",
                        }}
                      >
                        <Mail style={{ width: "12px", height: "12px" }} />
                        Reply via Email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}