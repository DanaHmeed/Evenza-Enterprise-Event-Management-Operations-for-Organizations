import { Suspense } from "react";
import EventsList from "./EventsList";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Discover Events</h1>
        <Suspense fallback={<div>Loading events...</div>}>
          <EventsList />
        </Suspense>
      </div>
    </div>
  );
}