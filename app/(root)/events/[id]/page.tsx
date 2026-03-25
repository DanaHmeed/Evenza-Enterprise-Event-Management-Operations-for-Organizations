// app/(root)/events/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import EventDetailClient from "./EventDetailClient";
import EventDetailSkeleton from "./EventDetailSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function EventData({ eventId, paymentStatus }: { eventId: string; paymentStatus?: string }) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
      feedbacks: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: { registrations: true, feedbacks: true },
      },
    },
  });

  if (!event) notFound();

  // Increment view count (non-blocking, fire-and-forget)
  prisma.event
    .update({
      where: { id: eventId },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  // Compute feedback stats on the server
  const approvedFeedbacks = event.feedbacks || [];
  const feedbackStats = {
    count: approvedFeedbacks.length,
    averageRating:
      approvedFeedbacks.length > 0
        ? Math.round(
            (approvedFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
              approvedFeedbacks.length) *
              10
          ) / 10
        : 0,
  };

  // Serialize dates for client
  const serializedEvent = {
    id: event.id,
    title: event.title,
    slug: (event as Record<string, unknown>).slug as string | undefined,
    description: event.description,
    summary: event.summary,
    banner: event.banner,
    gallery: (event as Record<string, unknown>).gallery as string[] | undefined,
    videoUrl: (event as Record<string, unknown>).videoUrl as string | null | undefined,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    timezone: (event as Record<string, unknown>).timezone as string | undefined,
    registrationDeadline: event.registrationDeadline.toISOString(),
    eventType: event.eventType,
    price: event.price,
    currency: event.currency,
    isOnline: event.isOnline,
    venueName: event.venueName,
    address: event.address,
    city: event.city,
    country: event.country,
    meetingLink: (event as Record<string, unknown>).meetingLink as string | null | undefined,
    capacity: event.capacity,
    seatsRemaining: event.seatsRemaining,
    waitlistEnabled: (event as Record<string, unknown>).waitlistEnabled as boolean | undefined,
    approvalRequired: (event as Record<string, unknown>).approvalRequired as boolean | undefined,
    status: event.status,
    viewCount: (event as Record<string, unknown>).viewCount as number | undefined,
    organizer: event.organizer,
    category: event.category,
    tags: event.tags,
    _count: event._count,
  };

  const serializedFeedbacks = approvedFeedbacks.map((f) => ({
    id: f.id,
    rating: f.rating,
    title: f.title,
    comment: f.comment,
    createdAt: f.createdAt.toISOString(),
    user: f.user,
  }));

  return (
    <EventDetailClient
      event={serializedEvent}
      feedbacks={serializedFeedbacks}
      feedbackStats={feedbackStats}
      paymentStatus={paymentStatus}
    />
  );
}

export default async function EventDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const paymentStatus = sp.payment;

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventData eventId={id} paymentStatus={paymentStatus} />
    </Suspense>
  );
}