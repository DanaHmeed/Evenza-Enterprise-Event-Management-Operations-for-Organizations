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
      include: {
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
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, color: true },
      orderBy: { name: "asc" },
    }),
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
    <section
      style={{
        minHeight: "100vh",
        background: "#fafaf8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "80px 48px 48px",
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: "12px", marginBottom: "24px" }}
          >
            <div
              className="animate-pulse"
              style={{ width: "32px", height: "2px", background: "#f0f0ec" }}
            />
            <div
              className="animate-pulse"
              style={{
                width: "60px",
                height: "10px",
                background: "#f0f0ec",
                borderRadius: "2px",
              }}
            />
          </div>
          <div
            className="animate-pulse"
            style={{
              height: "40px",
              width: "280px",
              background: "#f0f0ec",
              borderRadius: "4px",
              marginBottom: "12px",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "16px",
              width: "360px",
              background: "#f5f5f0",
              borderRadius: "3px",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              marginTop: "40px",
              height: "44px",
              width: "420px",
              maxWidth: "100%",
              background: "#f5f5f0",
              borderRadius: "4px",
              border: "1px solid #eee",
            }}
          />
        </div>
      </div>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "48px 48px 96px",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "48px 32px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div
                className="animate-pulse"
                style={{
                  aspectRatio: "16 / 10",
                  background: "#efefe8",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div
                  className="animate-pulse"
                  style={{ height: "10px", width: "80px", background: "#efefe8", borderRadius: "2px" }}
                />
                <div
                  className="animate-pulse"
                  style={{ height: "14px", width: "85%", background: "#efefe8", borderRadius: "2px" }}
                />
                <div
                  className="animate-pulse"
                  style={{ height: "10px", width: "60%", background: "#f5f5f0", borderRadius: "2px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}