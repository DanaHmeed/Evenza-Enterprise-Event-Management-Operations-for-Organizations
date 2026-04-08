// app/(root)/events/page.tsx
import { Suspense } from "react";
import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import EventsClient from "./EventsClient";
import EventsLoadingSkeleton from "./EventsLoadingSkeleton";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      select: { id: true, name: true, slug: true, color: true },
      orderBy: { name: "asc" },
    });
  },
  ["event-categories"],
  { revalidate: 300, tags: ["categories"] }
);

async function getEvents(page: number, pageSize: number) {
  const where = { status: "PUBLISHED" as const };


  
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        banner: true,
        startDate: true,
        endDate: true,
        eventType: true,
        price: true,
        currency: true,
        isOnline: true,
        city: true,
        venueName: true,
        status: true,
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total };
}

async function EventsData({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const [{ events, total }, categories] = await Promise.all([
    getEvents(page, pageSize),
    getCategories(),
  ]);

  const serializedEvents = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    summary: e.summary ? e.summary.slice(0, 140) : null,
    banner: e.banner,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    eventType: e.eventType,
    price: e.price,
    currency: e.currency,
    isOnline: e.isOnline,
    city: e.city,
    venueName: e.venueName,
    status: e.status,
    category: e.category,
    _count: e._count,
  }));

  return (
    <EventsClient
      initialEvents={serializedEvents}
      categories={categories}
      pagination={{
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }}
    />
  );
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 12;

  return (
    <Suspense fallback={<EventsLoadingSkeleton />}>
      <EventsData page={page} pageSize={pageSize} />
    </Suspense>
  );
}