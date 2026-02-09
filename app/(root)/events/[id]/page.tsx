import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      organizer: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Fetch approved feedback
  const feedback = await prisma.feedback.findMany({
    where: {
      eventId: params.id,
      approved: true,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate average rating
  const averageRating =
    feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {event.banner && (
            <img
              src={event.banner}
              alt={event.title}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="p-8">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    event.eventType === "FREE"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.eventType === "FREE" ? "Free Event" : `$${event.price}`}
                </span>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {event.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-lg">{event.description}</p>

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-3 text-lg">📅 Event Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(event.startDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(event.endDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {event.isOnline
                      ? "🌐 Online Event"
                      : `📍 ${event.venueName}, ${event.city}`}
                  </p>
                  <p>
                    <strong>Available Seats:</strong> 🎫 {event.seatsRemaining} /{" "}
                    {event.capacity}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-lg">👤 Organizer</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Name:</strong> {event.organizer.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {event.organizer.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Register/Buy Button */}
            <div className="mb-8">
              <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors">
                {event.eventType === "FREE"
                  ? "Register for Free"
                  : `Buy Ticket - $${event.price}`}
              </button>
            </div>

            {/* Feedback Section */}
            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Reviews & Feedback</h2>
                  {feedback.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-2xl ${
                              i < Math.round(averageRating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">
                        {averageRating.toFixed(1)} ({feedback.length} review
                        {feedback.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/events/${params.id}/feedback`}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  Leave Review
                </Link>
              </div>

              {feedback.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((review) => (
                    <div
                      key={review.id}
                      className="border rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">
                            {review.user.name}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-xl ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}