"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  eventType: "FREE" | "PAID";
  price: number | null;
  startDate: string;
  seatsRemaining: number;
  capacity: number;
  organizer: {
    name: string;
  };
  _count: {
    registrations: number;
  };
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "DRAFT" | "PUBLISHED">("all");

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      
      let filtered = data;
      if (filter !== "all") {
        filtered = data.filter((e: Event) => e.status === filter);
      }
      
      setEvents(filtered);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (eventId: string) => {
    if (!confirm("Unpublish this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT" }),
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Error unpublishing event:", error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEvents();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const eventCount = {
    all: events.length,
    DRAFT: events.filter((e) => e.status === "DRAFT").length,
    PUBLISHED: events.filter((e) => e.status === "PUBLISHED").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Event Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 rounded-lg font-semibold ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          All Events ({eventCount.all})
        </button>
        <button
          onClick={() => setFilter("PUBLISHED")}
          className={`px-6 py-3 rounded-lg font-semibold ${
            filter === "PUBLISHED"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Published ({eventCount.PUBLISHED})
        </button>
        <button
          onClick={() => setFilter("DRAFT")}
          className={`px-6 py-3 rounded-lg font-semibold ${
            filter === "DRAFT"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Drafts ({eventCount.DRAFT})
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No events found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      event.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p>👤 {event.organizer.name}</p>
                  <p>📅 {new Date(event.startDate).toLocaleDateString()}</p>
                  <p>
                    🎫 {event.seatsRemaining}/{event.capacity} seats
                  </p>
                  <p>👥 {event._count.registrations} registrations</p>
                  <p>
                    {event.eventType === "FREE" ? (
                      <span className="text-green-600 font-semibold">
                        FREE
                      </span>
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        ${event.price}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 text-sm"
                  >
                    View
                  </Link>
                  {event.status === "PUBLISHED" && (
                    <button
                      onClick={() => handleUnpublish(event.id)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}