// app/(root)/events/page.tsx
import { Suspense } from "react";
import prisma from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";
import EventsClient from "./EventsClient";
import EventsLoadingSkeleton from  "./EventsLoadingSkeleton";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

// ── Cache categories — they rarely change ──
const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      select: { id: true, name: true, slug: true, color: true },
      orderBy: { name: "asc" },
    });
  },
  ["event-categories"],
  { revalidate: 300 } // 5 minutes
);

// ── Data fetching extracted into its own component so Suspense works ──
async function EventsData({
  search,
  categoryId,
  page,
  pageSize,
}: {
  search: string;
  categoryId: string;
  page: number;
  pageSize: number;
}) {
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

  const [events, total, categories] = await Promise.all([
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
    getCategories(),
  ]);

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
  );
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const categoryId = params.categoryId || "";
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  // Suspense key forces re-suspension when params change
  const suspenseKey = `${search}-${categoryId}-${page}`;

  return (
    <Suspense key={suspenseKey} fallback={<EventsLoadingSkeleton />}>
      <EventsData
        search={search}
        categoryId={categoryId}
        page={page}
        pageSize={pageSize}
      />
    </Suspense>
  );
}