// app/(root)/events/[id]/page.tsx
// Route-level revalidation — avoids 2MB data-cache limit from base64 banners.
export const revalidate = 60;

import { Suspense } from "react";
import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import EventDetailClient from "./EventDetailClient";
import EventDetailSkeleton from "./EventDetailSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_status?: string }>;
}

// ── Event data: NOT wrapped in unstable_cache — banner field can be large base64.
//    Route-level revalidate = 60 handles caching at the rendered HTML level. ──
async function getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        summary: true,
        banner: true,
        gallery: true,
        videoUrl: true,
        startDate: true,
        endDate: true,
        timezone: true,
        registrationDeadline: true,
        eventType: true,
        price: true,
        currency: true,
        isOnline: true,
        venueName: true,
        address: true,
        city: true,
        country: true,
        meetingLink: true,
        capacity: true,
        seatsRemaining: true,
        waitlistEnabled: true,
        approvalRequired: true,
        status: true,
        viewCount: true,
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { registrations: true, feedbacks: true },
        },
      },
    });

    return event;
}

// ── Cache feedbacks ──
const getEventFeedbacks = unstable_cache(
  async (eventId: string) => {
    const [feedbacks, stats] = await Promise.all([
      prisma.feedback.findMany({
        where: {
          eventId,
          status: "APPROVED",
        },
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.feedback.aggregate({
        where: {
          eventId,
          status: "APPROVED",
        },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return {
      feedbacks,
      stats: {
        count: stats._count || 0,
        averageRating: Math.round((stats._avg.rating || 0) * 10) / 10,
      },
    };
  },
  ["event-feedbacks"],
  { revalidate: 120, tags: ["feedbacks"] }
);

// ── Split into streaming chunks ──
async function EventContent({ eventId }: { eventId: string }) {
  const [event, { feedbacks, stats }] = await Promise.all([
    getEventById(eventId),
    getEventFeedbacks(eventId),
  ]);

  if (!event) {
    notFound();
  }

  // Increment view count asynchronously (don't block)
  prisma.event
    .update({
      where: { id: eventId },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  const serializedEvent = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    registrationDeadline: event.registrationDeadline.toISOString(),
    feedbacks: feedbacks.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    })),
  };

  return (
    <EventDetailClient
      event={serializedEvent}
      feedbacks={feedbacks.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
      }))}
      feedbackStats={stats}
    />
  );
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventContent eventId={id} />
    </Suspense>
  );
}