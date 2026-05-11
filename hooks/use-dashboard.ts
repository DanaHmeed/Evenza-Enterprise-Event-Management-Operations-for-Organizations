
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Fetch failed");
    (error as unknown as Record<string, unknown>).status = res.status;
    throw error;
  }
  return res.json();
};

const CACHE_LONG = { dedupingInterval: 30_000, revalidateOnFocus: false } as const;    // stats, analytics
const CACHE_SHORT = { dedupingInterval: 5_000, revalidateOnFocus: true } as const;     // attendees, orders
const CACHE_INSTANT = { dedupingInterval: 60_000, revalidateOnFocus: false } as const; // role checks, rarely changes

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

export function useOrganizerEvents(params: {
  page: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  const { page, pageSize = 12, status, search } = params;
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

export function useOrganizerAttendees(params: {
  page: number;
  pageSize?: number;
  status?: string;
  search?: string;
  eventId?: string;
}) {
  const { page, pageSize = 12, status, search, eventId } = params;
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

export function useOrganizerOrders(params: {
  page: number;
  pageSize?: number;
  status?: string;
  search?: string;
}) {
  const { page, pageSize = 12, status, search } = params;
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

export function useOrganizerFeedbacks(params: {
  page: number;
  pageSize?: number;
  status?: string;
}) {
  const { page, pageSize = 12, status } = params;
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