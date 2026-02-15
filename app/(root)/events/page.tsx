// app/(root)/events/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown, Loader2, CalendarX } from "lucide-react";
import EventCard from "@/app/(root)/events/EventCard";
import EventCardSkeleton from "./EventCardSkeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
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

interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryId") || ""
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || data || []);
        }
      } catch {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(
    async (page: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("pageSize", "12");
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (selectedCategory) params.set("categoryId", selectedCategory);

        const res = await fetch(`/api/events?${params.toString()}`);
        if (res.ok) {
          const data: EventsResponse = await res.json();
          if (append) {
            setEvents((prev) => [...prev, ...data.data]);
          } else {
            setEvents(data.data);
          }
          setPagination(data.pagination);
        }
      } catch {
        console.error("Failed to fetch events");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, selectedCategory]
  );

  // Refetch when filters change
  useEffect(() => {
    fetchEvents(1, false);
  }, [fetchEvents]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    const query = params.toString();
    router.replace(`/events${query ? `?${query}` : ""}`, { scroll: false });
  }, [debouncedSearch, selectedCategory, router]);

  const handleShowMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchEvents(pagination.page + 1, true);
    }
  };

  const hasMore = pagination.page < pagination.totalPages;
  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || "Category";

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Trusted by Thousands of Events
          </h1>
          <p className="text-gray-500">
            Discover upcoming events and experiences near you.
          </p>
        </div>

        {/* Filters — Search + Category */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[200px]">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
            >
              <span className={selectedCategory ? "text-gray-900 font-medium" : "text-gray-500"}>
                {selectedCategory ? selectedCategoryName : "Category"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  categoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setCategoryDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                  {/* All categories option */}
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      !selectedCategory
                        ? "text-orange-600 font-semibold bg-orange-50"
                        : "text-gray-700"
                    }`}
                  >
                    All Categories
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        selectedCategory === cat.id
                          ? "text-orange-600 font-semibold bg-orange-50"
                          : "text-gray-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}

                  {categories.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      No categories found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <CalendarX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {debouncedSearch || selectedCategory
                ? "Try adjusting your search or filters to find more events."
                : "There are no published events yet. Check back soon!"}
            </p>
            {(debouncedSearch || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="mt-4 px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-5">
              Showing {events.length} of {pagination.total} events
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}

              {/* Show More card */}
              {hasMore && (
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] gap-3 cursor-pointer"
                >
                  {loadingMore ? (
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg font-semibold text-gray-700">
                        Show More
                      </span>
                      <span className="text-gray-400 text-2xl">···</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
