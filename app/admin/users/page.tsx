// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Loader2,
  MoreHorizontal,
  ShieldCheck,
  UserCog,
  UserX,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UserData {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    organizedEvents: number;
    registrations: number;
    feedbacks: number;
  };
}

type RoleFilter = "ALL" | "USER" | "ORGANIZER" | "ADMIN";

export default function AdminUsersPage() {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(
    (searchParams.get("role") as RoleFilter) || "ALL"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter !== "ALL") params.set("role", roleFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert("Failed to update role");
      }
    } catch {
      alert("Failed to update role");
    } finally {
      setProcessing(null);
      setActionMenuId(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
        );
      }
    } catch {
      alert("Failed to update user");
    } finally {
      setProcessing(null);
      setActionMenuId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    setProcessing(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      alert("Failed to delete user");
    } finally {
      setProcessing(null);
      setActionMenuId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700",
      ORGANIZER: "bg-purple-100 text-purple-700",
      USER: "bg-gray-100 text-gray-600",
    };
    return map[role] || map.USER;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total users on the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "USER", "ORGANIZER", "ADMIN"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                roleFilter === r
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                {/* User */}
                <div className="md:col-span-4 flex items-center gap-3">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs flex-shrink-0">
                      {u.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="md:col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${getRoleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                    {u.isActive ? "Active" : "Suspended"}
                  </span>
                </div>

                {/* Joined */}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">{formatDate(u.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center justify-end gap-1 relative">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuId(actionMenuId === u.id ? null : u.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {actionMenuId === u.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                          {/* Role changes */}
                          <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Change Role
                          </p>
                          {["USER", "ORGANIZER", "ADMIN"].filter((r) => r !== u.role).map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleChange(u.id, role)}
                              disabled={processing === u.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <UserCog className="w-3.5 h-3.5" />
                              Set as {role.charAt(0) + role.slice(1).toLowerCase()}
                            </button>
                          ))}

                          <div className="border-t border-gray-100 my-1" />

                          {/* Suspend/Activate */}
                          <button
                            onClick={() => handleToggleActive(u.id, u.isActive)}
                            disabled={processing === u.id}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 ${
                              u.isActive ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            {u.isActive ? "Suspend User" : "Activate User"}
                          </button>

                          <div className="border-t border-gray-100 my-1" />

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={processing === u.id}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border border-gray-200 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border border-gray-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}