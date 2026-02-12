"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
  };
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  const fetchFeedback = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "pending") params.append("approved", "false");
    if (filter === "approved") params.append("approved", "true");

    try {
      const response = await fetch(`/api/feedback?${params}`);
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (feedbackId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const pendingCount = feedback.filter((f) => !f.approved).length;
  const approvedCount = feedback.filter((f) => f.approved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Feedback Moderation</h1>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Pending{" "}
            {filter === "pending" && pendingCount > 0 && (
              <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              filter === "approved"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Approved{" "}
            {filter === "approved" && approvedCount > 0 && (
              <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm">
                {approvedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            All
          </button>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading feedback...</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              {filter === "pending"
                ? "No pending feedback to review"
                : filter === "approved"
                ? "No approved feedback yet"
                : "No feedback submissions yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-6 shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-blue-600 mb-1">
                      {item.event.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      👤 {item.user.name} ({item.user.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      📅 {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${
                          i < item.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {item.comment && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 italic">{item.comment}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!item.approved ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.id, true)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
                      >
                        ✗ Reject & Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="bg-green-100 text-green-800 px-6 py-2 rounded-lg font-semibold">
                        ✓ Approved
                      </span>
                      <button
                        onClick={() => handleApprove(item.id, false)}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 font-semibold transition-colors"
                      >
                        Unapprove
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}