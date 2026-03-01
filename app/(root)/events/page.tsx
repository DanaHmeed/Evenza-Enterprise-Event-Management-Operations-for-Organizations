// app/(root)/events/page.tsx
import { Suspense } from "react";
import prisma from "@/lib/db/prisma";
import EventsClient from "./EventsClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const categoryId = params.categoryId || "";
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  // Build where clause
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { venueName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;

  // Parallel data fetching on server
  const [events, total, categories] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, color: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize dates for client
  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    summary: e.summary,
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
    <Suspense fallback={<EventsLoadingSkeleton />}>
      <EventsClient
        initialEvents={serializedEvents}
        categories={categories}
        initialSearch={search}
        initialCategory={categoryId}
        pagination={{
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        }}
      />
    </Suspense>
  );
}

function EventsLoadingSkeleton() {
  return (
    <section className="min-h-screen bg-white pt-30 mt-10">
      <div className="border-b border-gray-100">
        <div className="max-w-8xl px-6 pt-20 pb-12">
          <div className="text-center">
            <div className="h-10 w-64 bg-gray-100 rounded-lg mx-auto mb-2 animate-pulse" />
            <div className="h-5 w-80 bg-gray-50 rounded mx-auto animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-20 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              <div className="aspect-[18/10] bg-gray-100 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}