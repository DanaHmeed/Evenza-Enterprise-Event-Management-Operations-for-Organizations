// app/(root)/events/EventsClient.tsx
"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Search, Loader2, X } from "lucide-react";
import EventCard from "@/app/(root)/events/EventCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
}

interface Event {
  id: string;
  slug?: string;
  title: string;
  banner?: string | null;
  summary?: string | null;
  startDate: string;
  endDate: string;
  eventType: "FREE" | "PAID";
  price?: number | null;
  currency?: string | null;
  isOnline: boolean;
  city?: string | null;
  venueName?: string | null;
  status: string;
  category?: {
    name: string;
    color?: string | null;
  } | null;
  _count?: {
    registrations: number;
  };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface EventsClientProps {
  initialEvents: Event[];
  categories: Category[];
  pagination: Pagination;
}

export default function EventsClient({
  initialEvents,
  categories,
  pagination: initialPagination,
}: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: Event[]; pagination: Pagination }>>(new Map());

  const updateURL = useCallback((search: string, category: string) => {
    const urlParams = new URLSearchParams();
    if (search) urlParams.set("search", search);
    if (category) urlParams.set("categoryId", category);
    const qs = urlParams.toString();
    window.history.replaceState(null, "", `/events${qs ? `?${qs}` : ""}`);
  }, []);

  const fetchEvents = useCallback(
    async (search: string, category: string, page: number = 1, append: boolean = false) => {
      const cacheKey = `${search}-${category}-${page}`;

      const cached = cacheRef.current.get(cacheKey);
      if (cached && !append) {
        setEvents(cached.data);
        setPagination(cached.pagination);
        updateURL(search, category);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "12");
      if (search) params.set("search", search);
      if (category) params.set("categoryId", category);

      try {
        const res = await fetch(`/api/events?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) return;

        const data = await res.json();

        const newEvents = data.data as Event[];
        const newPagination = data.pagination as Pagination;

        cacheRef.current.set(cacheKey, {
          data: newEvents,
          pagination: newPagination,
        });

        if (cacheRef.current.size > 20) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }

        setEvents((prev) => (append ? [...prev, ...newEvents] : newEvents));
        setPagination(newPagination);
        updateURL(search, category);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to fetch events:", err);
      }
    },
    [updateURL]
  );

  useEffect(() => {
    if (searchQuery === activeSearch) return;

    const timer = setTimeout(() => {
      setIsSearching(true);
      setActiveSearch(searchQuery);
      fetchEvents(searchQuery, selectedCategory).finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeSearch, selectedCategory, fetchEvents]);

  const handleCategoryChange = useCallback(
    (catId: string) => {
      const next = selectedCategory === catId ? "" : catId;
      setSelectedCategory(next);
      fetchEvents(activeSearch, next);
    },
    [selectedCategory, activeSearch, fetchEvents]
  );

  const handleShowMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPages || loadingMore) return;
    setLoadingMore(true);
    await fetchEvents(activeSearch, selectedCategory, pagination.page + 1, true);
    setLoadingMore(false);
  }, [pagination, activeSearch, selectedCategory, loadingMore, fetchEvents]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveSearch("");
    fetchEvents("", selectedCategory);
  }, [selectedCategory, fetchEvents]);

  const clearCategory = useCallback(() => {
    setSelectedCategory("");
    fetchEvents(activeSearch, "");
  }, [activeSearch, fetchEvents]);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setActiveSearch("");
    setSelectedCategory("");
    cacheRef.current.clear();
    fetchEvents("", "");
  }, [fetchEvents]);

  const hasMore = pagination.page < pagination.totalPages;
  const hasFilters = !!(activeSearch || selectedCategory);
  const isLoading = isSearching;

  const categoryButtons = useMemo(
    () =>
      categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryChange(cat.id)}
          style={{
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "3px",
            border: "none",
            cursor: "pointer",
            background: selectedCategory === cat.id ? "#1a1a1a" : "transparent",
            color: selectedCategory === cat.id ? "#fff" : "#666",
            transition: "all 0.2s ease",
          }}
        >
          {cat.name}
        </button>
      )),
    [categories, selectedCategory, handleCategoryChange]
  );

  return (
    <section
      className="w-full"
      style={{
        background: "#fafaf8",
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "80px 48px 48px",
          }}
        >
          <div className="flex items-center" style={{ gap: "12px", marginBottom: "24px" }}>
            <div
              style={{
                width: "32px",
                height: "2px",
                background: "#e63946",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#e63946",
              }}
            >
              Events
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              fontWeight: 600,
              color: "#1a1a1a",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: "0 0 16px 0",
            }}
          >
            Discover Events
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#888",
              maxWidth: "480px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Find upcoming events and experiences that inspire you.
          </p>

          <div
            className="flex flex-col lg:flex-row lg:items-center"
            style={{ marginTop: "40px", gap: "20px" }}
          >
            <div className="relative" style={{ maxWidth: "420px", width: "100%" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search events..."
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  fontSize: "14px",
                  color: "#1a1a1a",
                  background: "#fafaf8",
                  border: searchFocused ? "1px solid #1a1a1a" : "1px solid #e5e5e0",
                  borderRadius: "4px",
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.25s ease",
                }}
              />
              {isLoading ? (
                <Loader2
                  className="absolute top-1/2 -translate-y-1/2 animate-spin"
                  style={{
                    right: "14px",
                    width: "16px",
                    height: "16px",
                    color: "#aaa",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <Search
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{
                    right: "14px",
                    width: "16px",
                    height: "16px",
                    color: "#aaa",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: "6px" }}>
              <button
                onClick={() => handleCategoryChange("")}
                style={{
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: "3px",
                  border: "none",
                  cursor: "pointer",
                  background: !selectedCategory ? "#1a1a1a" : "transparent",
                  color: !selectedCategory ? "#fff" : "#666",
                  transition: "all 0.2s ease",
                }}
              >
                All
              </button>
              {categoryButtons}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "48px 48px 96px",
        }}
      >
        {hasFilters && (
          <div
            className="flex items-center flex-wrap"
            style={{ gap: "12px", marginBottom: "32px" }}
          >
            <span style={{ fontSize: "13px", color: "#999" }}>
              {pagination.total} result{pagination.total !== 1 ? "s" : ""}
            </span>

            {activeSearch && (
              <span
                className="inline-flex items-center"
                style={{
                  gap: "6px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  color: "#555",
                  background: "#fff",
                  border: "1px solid #e5e5e0",
                  borderRadius: "3px",
                }}
              >
                &ldquo;{activeSearch}&rdquo;
                <button
                  onClick={clearSearch}
                  style={{
                    display: "flex",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    padding: 0,
                  }}
                >
                  <X style={{ width: "12px", height: "12px", color: "#999" }} />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span
                className="inline-flex items-center"
                style={{
                  gap: "6px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  color: "#555",
                  background: "#fff",
                  border: "1px solid #e5e5e0",
                  borderRadius: "3px",
                }}
              >
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={clearCategory}
                  style={{
                    display: "flex",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    padding: 0,
                  }}
                >
                  <X style={{ width: "12px", height: "12px", color: "#999" }} />
                </button>
              </span>
            )}
          </div>
        )}

        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#f0f0ec",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search style={{ width: "18px", height: "18px", color: "#bbb" }} />
            </div>

            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: "8px",
              }}
            >
              No events found
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#999",
                maxWidth: "320px",
                margin: "0 auto 24px",
              }}
            >
              {hasFilters
                ? "Try adjusting your search or filters."
                : "No published events yet. Check back soon!"}
            </p>

            {hasFilters && (
              <button
                onClick={clearAll}
                style={{
                  padding: "10px 28px",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "48px 32px",
              }}
            >
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "56px" }}>
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  style={{
                    padding: "12px 40px",
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    background: "transparent",
                    color: "#1a1a1a",
                    border: "1px solid #d4d4d0",
                    borderRadius: "3px",
                    cursor: loadingMore ? "default" : "pointer",
                    opacity: loadingMore ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {loadingMore ? (
                    <Loader2
                      className="animate-spin"
                      style={{
                        width: "16px",
                        height: "16px",
                        margin: "0 auto",
                      }}
                    />
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}