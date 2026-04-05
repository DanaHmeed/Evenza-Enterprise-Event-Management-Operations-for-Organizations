// hooks/use-dashboard.ts
// Centralized SWR hooks for dashboard data.
// Benefits:
//   - Stale-while-revalidate: pages load instantly with cached data
//   - Deduplication: identical requests within 2s are merged
//   - Background refresh: data stays fresh without blocking UI
//   - Shared cache: navigating Dashboard → Events → Dashboard is instant
//
// INSTALL: npm install swr

import useSWR from "swr";
import { useCallback, useMemo } from "react";

// ─── Fetcher ────────────────────────────────────────────────────────
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Fetch failed");
    (error as unknown as Record<string, unknown>).status = res.status;
    throw error;
  }
  return res.json();
};

// SWR options for different data freshness needs
const CACHE_LONG = { dedupingInterval: 30_000, revalidateOnFocus: false } as const;    // stats, analytics
const CACHE_SHORT = { dedupingInterval: 5_000, revalidateOnFocus: true } as const;     // attendees, orders
const CACHE_INSTANT = { dedupingInterval: 60_000, revalidateOnFocus: false } as const; // role checks, rarely changes

// ─── Dashboard Stats (main dashboard page) ──────────────────────────
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/organizer/stats",
    fetcher,
    CACHE_LONG
  );
  return {
    stats: data?.data?.counts ?? null,
    recentEvents: data?.data?.recentEvents ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Organizer Events (events list page) ────────────────────────────
export function useOrganizerEvents(params: {
  page: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  const { page, pageSize = 20, status, search } = params;
  const sp = new URLSearchParams();
  sp.set("page", page.toString());
  sp.set("pageSize", pageSize.toString());
  if (status && status !== "ALL") sp.set("status", status);
  if (search) sp.set("search", search);

  const key = `/api/organizer/events?${sp.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, CACHE_SHORT);

  return {
    events: data?.data ?? [],
    pagination: data?.pagination ?? { page: 1, totalPages: 1, total: 0 },
    isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Organizer Attendees (consolidated — no N+1) ────────────────────
export function useOrganizerAttendees(params: {
  page: number;
  pageSize?: number;
  status?: string;
  search?: string;
  eventId?: string;
}) {
  const { page, pageSize = 20, status, search, eventId } = params;
  const sp = new URLSearchParams();
  sp.set("page", page.toString());
  sp.set("pageSize", pageSize.toString());
  if (status && status !== "ALL") sp.set("status", status);
  if (search) sp.set("search", search);
  if (eventId) sp.set("eventId", eventId);

  const key = `/api/organizer/attendees?${sp.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, CACHE_SHORT);

  return {
    attendees: data?.data ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? { page: 1, totalPages: 1, total: 0 },
    isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Organizer Orders (consolidated — no N+1) ──────────────────────
export function useOrganizerOrders(params: {
  page: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  const { page, pageSize = 20, status, search } = params;
  const sp = new URLSearchParams();
  sp.set("page", page.toString());
  sp.set("pageSize", pageSize.toString());
  if (status && status !== "ALL") sp.set("status", status);
  if (search) sp.set("search", search);

  const key = `/api/organizer/orders?${sp.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, CACHE_SHORT);

  return {
    orders: data?.data ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? { page: 1, totalPages: 1, total: 0 },
    isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Organizer Feedbacks (consolidated — no N+1) ────────────────────
export function useOrganizerFeedbacks(params: {
  page: number;
  pageSize?: number;
  status?: string;
}) {
  const { page, pageSize = 20, status } = params;
  const sp = new URLSearchParams();
  sp.set("page", page.toString());
  sp.set("pageSize", pageSize.toString());
  if (status && status !== "ALL") sp.set("status", status);

  const key = `/api/organizer/feedbacks?${sp.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, CACHE_SHORT);

  return {
    feedbacks: data?.data ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? { page: 1, totalPages: 1, total: 0 },
    isLoading,
    error,
    refresh: mutate,
  };
}

// ─── Role Check (used by layout — cached aggressively) ──────────────
export function useRoleCheck(userId: string | undefined | null) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/users/${userId}` : null,
    fetcher,
    CACHE_INSTANT
  );

  const role = data?.data?.role || data?.role || null;
  const isAuthorized = role === "ORGANIZER" || role === "ADMIN";

  return { role, isAuthorized, isLoading, error };
}