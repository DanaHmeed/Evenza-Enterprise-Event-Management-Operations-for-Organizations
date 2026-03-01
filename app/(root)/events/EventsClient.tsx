// app/(root)/events/EventsClient.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, CalendarX, X } from "lucide-react";
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
  summary?: string | null;
  banner?: string | null;
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

interface EventsClientProps {
  initialEvents: Event[];
  categories: Category[];
  initialSearch: string;
  initialCategory: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function EventsClient({
  initialEvents,
  categories,
  initialSearch,
  initialCategory,
  pagination: initialPagination,
}: EventsClientProps) {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [pagination, setPagination] = useState(initialPagination);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When filters change, update URL (server component re-fetches)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    const query = params.toString();
    router.push(`/events${query ? `?${query}` : ""}`, { scroll: false });
  }, [debouncedSearch, selectedCategory, router]);

  // Update state when props change (from server re-render)
  useEffect(() => {
    setEvents(initialEvents);
    setPagination(initialPagination);
  }, [initialEvents, initialPagination]);

  // Load more (client-side append)
  const handleShowMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const params = new URLSearchParams();
      params.set("page", nextPage.toString());
      params.set("pageSize", "12");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedCategory) params.set("categoryId", selectedCategory);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents((prev) => [...prev, ...data.data]);
        setPagination(data.pagination);
      }
    } catch {
      console.error("Failed to load more events");
    } finally {
      setLoadingMore(false);
    }
  }, [pagination, debouncedSearch, selectedCategory]);

  const hasMore = pagination.page < pagination.totalPages;

  return (
    <section className="min-h-screen bg-white pt-30 mt-10">
      {/* Header area */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl px-6 pt-20 pb-12">
          {/* Title & Description */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Discover Events
            </h1>
            <p className="text-gray-500">
              Find upcoming events and experiences that inspire you.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mt-16 mb-16">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 focus:outline-none shadow-sm"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                !selectedCategory
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 shadow-sm"
              }`}
            >
              All Events
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? "" : cat.id,
                  )
                }
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 shadow-sm"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events grid area */}
      <div className="w-full flex justify-center">
        <div className="max-w-7xl mx-auto px-20 py-10">
          {/* Active filters */}
          {(debouncedSearch || selectedCategory) && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-500">
                {pagination.total} result
                {pagination.total !== 1 ? "s" : ""}
              </span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                  &quot;{debouncedSearch}&quot;
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {events.length === 0 ? (
            <div className="text-center py-24">
              <CalendarX className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                {debouncedSearch || selectedCategory
                  ? "Try adjusting your search or filters."
                  : "No published events yet. Check back soon!"}
              </p>
              {(debouncedSearch || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                  }}
                  className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold transition-colors hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleShowMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Load More Events"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}