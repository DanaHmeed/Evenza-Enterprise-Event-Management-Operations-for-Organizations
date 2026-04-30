// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  MoreHorizontal,
  UserCog,
  UserX,
  Trash2,
} from "lucide-react";
import { t, StatusBadge, AdminPagination, AdminEmpty, AdminLoading } from "@/components/admin/AdminUI";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: { organizedEvents: number; registrations: number; feedbacks: number };
}

type RoleFilter = "ALL" | "USER" | "ORGANIZER" | "ADMIN";

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(
    (searchParams.get("role") as RoleFilter) || "ALL"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "12");
      if (search) params.set("search", search);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch { /* */ } finally { setLoading(false); }
  };

  const patchUser = async (userId: string, body: Record<string, unknown>) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...body } : u)));
      } else { alert("Failed to update user"); }
    } catch { alert("Failed to update user"); }
    finally { setProcessing(null); setMenuId(null); }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setProcessing(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch { alert("Failed to delete user"); }
    finally { setProcessing(null); setMenuId(null); }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filters: RoleFilter[] = ["ALL", "USER", "ORGANIZER", "ADMIN"];

  return (
    <div >
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: t.text, margin: 4 }}>Users</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px",marginLeft:4 }}>{total} total users on the platform.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.text }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            style={{ width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px",  border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text, background: t.surface }}
          />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {filters.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              style={{
                padding: "8px 14px", fontSize: "12px", fontWeight: 500, 
                border: `1px solid ${roleFilter === r ? t.text : t.border}`, borderRadius: "4px",
                background: roleFilter === r ? t.text : t.surface,
                color: roleFilter === r ? "#0a0a0a" : t.textMuted, cursor: "pointer",
              }}
            >
              {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? <AdminLoading /> : users.length === 0 ? (
        <AdminEmpty icon={<Users style={{ width: "32px", height: "32px" }} />} message="No users found." />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px" }}>
          {/* Table header */}
          <div
            className="hidden md:grid"
            style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr 80px", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textSecondary }}
          >
            <span>User</span><span>Role</span><span>Status</span><span>Joined</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {users.map((u, i) => (
            <div
              key={u.id}
              style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 80px", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", transition: "background 0.1s" }}
              className="grid-cols-1 md:grid-cols-none"
              onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                {u.avatar ? (
                  <img src={u.avatar} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: t.borderLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                    {u.name?.charAt(0)}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                  <p style={{ fontSize: "11px", color: t.textSecondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                </div>
              </div>

              <StatusBadge status={u.role} />
              <StatusBadge status={u.isActive ? "ACTIVE" : "SUSPENDED"} />
              <span style={{ fontSize: "12px", color: t.textMuted }}>{fmtDate(u.createdAt)}</span>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "2px", position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuId(menuId === u.id ? null : u.id)}
                    style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: t.text, cursor: "pointer", borderRadius: "4px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <MoreHorizontal style={{ width: "14px", height: "14px" }} />
                  </button>

                  {menuId === u.id && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setMenuId(null)} />
                      <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", width: "180px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 20, padding: "4px 0"}}>
                        <p style={{ padding: "6px 12px", fontSize: "10px", fontWeight: 600, color: t.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>Change Role</p>
                        {(["USER", "ORGANIZER", "ADMIN"] as const).filter((r) => r !== u.role).map((role) => (
                          <button
                            key={role}
                            onClick={() => patchUser(u.id, { role })}
                            disabled={processing === u.id}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color: t.textSecondary, background: "transparent", border: "none", cursor: "pointer", opacity: processing === u.id ? 0.5 : 1 }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <UserCog style={{ width: "13px", height: "13px" }} />
                            Set as {role.charAt(0) + role.slice(1).toLowerCase()}
                          </button>
                        ))}
                        <div style={{ height: "1px", background: t.borderLight, margin: "4px 0" }} />
                        <button
                          onClick={() => patchUser(u.id, { isActive: !u.isActive })}
                          disabled={processing === u.id}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color: u.isActive ? t.amber : t.green, background: "transparent", border: "none", cursor: "pointer",  }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <UserX style={{ width: "13px", height: "13px" }} />
                          {u.isActive ? "Suspend" : "Activate"}
                        </button>
                        <div style={{ height: "1px", background: t.borderLight, margin: "4px 0" }} />
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={processing === u.id}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color: t.accent, background: "transparent", border: "none", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = t.accentSoft)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Trash2 style={{ width: "13px", height: "13px" }} />
                          Delete User
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}