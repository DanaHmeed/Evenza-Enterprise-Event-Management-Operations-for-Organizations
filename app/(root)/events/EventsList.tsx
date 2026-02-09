"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  eventType: "FREE" | "PAID";
  price: number | null;
  banner: string | null;
  city: string | null;
  seatsRemaining: number;
};

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "",
    eventType: "",
    search: "",
  });

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.category) params.append("category", filter.category);
    if (filter.eventType) params.append("eventType", filter.eventType);
    if (filter.search) params.append("search", filter.search);

    const response = await fetch(`/api/events?${params}`);
    const data = await response.json();
    setEvents(data);
    setLoading(false);
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-8 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search events..."
          className="px-4 py-2 border rounded-lg"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />

        <select
          className="px-4 py-2 border rounded-lg"
          value={filter.eventType}
          onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="FREE">Free Events</option>
          <option value="PAID">Paid Events</option>
        </select>

        <select
          className="px-4 py-2 border rounded-lg"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Business">Business</option>
          <option value="Arts">Arts</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No events found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white">
                {event.banner && (
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        event.eventType === "FREE"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.eventType === "FREE"
                        ? "Free"
                        : `$${event.price}`}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>📅 {new Date(event.startDate).toLocaleDateString()}</p>
                    <p>📍 {event.city || "Online"}</p>
                    <p>🎫 {event.seatsRemaining} seats remaining</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}