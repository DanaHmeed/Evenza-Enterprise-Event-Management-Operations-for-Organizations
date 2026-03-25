// app/(root)/events/[id]/feedback/page.tsx
"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/events/${id}`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Feedback Submitted!</h2>
          <p className="text-gray-600">
            Your feedback will be visible after admin approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Submit Feedback</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    } hover:text-yellow-500 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Share your experience with this event..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {comment.length}/1000 characters
                {comment.length < 10 && comment.length > 0 && (
                  <span className="text-red-500 ml-2">
                    (Minimum 10 characters required)
                  </span>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || (comment.length > 0 && comment.length < 10)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}