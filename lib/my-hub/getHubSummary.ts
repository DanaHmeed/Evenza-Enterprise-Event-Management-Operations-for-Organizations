// lib/my-hub/getHubSummary.ts
import prisma from "@/lib/db/prisma";

export interface HubEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isOnline: boolean;
  city?: string | null;
  venueName?: string | null;
  banner?: string | null;
  category?: string | null;
}

export interface HubRegistration {
  id: string;
  status: string;
  createdAt: string;
  event: HubEvent;
}

export interface HubStats {
  totalRegistrations: number;
  eventsAttended: number;
  upcomingCount: number;
  reviewsGiven: number;
}

export interface HubData {
  stats: HubStats;
  upcoming: HubRegistration[];
  past: HubRegistration[];
  recommended: HubEvent[];
  userName: string;
}

type DbEventWithCategory = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isOnline: boolean;
  city: string | null;
  venueName: string | null;
  banner: string | null;
  categoryId?: string | null;
  category?: { name: string } | null;
};

type DbRegistration = {
  id: string;
  status: string;
  createdAt: Date;
  event: DbEventWithCategory;
};

function transformEvent(e: DbEventWithCategory): HubEvent {
  return {
    id: e.id,
    title: e.title,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    isOnline: e.isOnline,
    city: e.city,
    venueName: e.venueName,
    banner: e.banner,
    category: e.category?.name || null,
  };
}

function transformRegistration(r: DbRegistration): HubRegistration {
  return {
    id: r.id,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    event: transformEvent(r.event),
  };
}

export async function getHubSummary(userId: string): Promise<HubData | null> {
  const now = new Date();

  const [user, upcoming, past, feedbackCount, upcomingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    }),

    prisma.registration.findMany({
      where: {
        userId,
        status: { notIn: ["CANCELLED", "REJECTED"] },
        event: { startDate: { gt: now } },
      },
      orderBy: { event: { startDate: "asc" } },
      take: 6,
      select: {
        id: true,
        status: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            isOnline: true,
            city: true,
            venueName: true,
            banner: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
    }),

    prisma.registration.findMany({
      where: {
        userId,
        status: { notIn: ["CANCELLED", "REJECTED"] },
        event: { endDate: { lt: now } },
      },
      orderBy: { event: { startDate: "desc" } },
      take: 6,
      select: {
        id: true,
        status: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            isOnline: true,
            city: true,
            venueName: true,
            banner: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
    }),

    prisma.feedback.count({
      where: { userId },
    }),

    prisma.registration.count({
      where: {
        userId,
        status: { notIn: ["CANCELLED", "REJECTED"] },
        event: { startDate: { gt: now } },
      },
    }),
  ]);

  if (!user) return null;

  const attendedCategoryIds = [
    ...new Set(
      [...upcoming, ...past]
        .map((r) => r.event.categoryId)
        .filter((v): v is string => Boolean(v))
    ),
  ];

  const registeredEventIds = [...upcoming, ...past].map((r) => r.event.id);

  const recommended = await prisma.event.findMany({
    where: {
      startDate: { gt: now },
      status: "PUBLISHED",
      id: { notIn: registeredEventIds.length > 0 ? registeredEventIds : ["_"] },
      ...(attendedCategoryIds.length > 0
        ? { categoryId: { in: attendedCategoryIds } }
        : {}),
    },
    orderBy: { startDate: "asc" },
    take: 6,
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      isOnline: true,
      city: true,
      venueName: true,
      banner: true,
      category: { select: { name: true } },
    },
  });

  let finalRecommended = recommended;

  if (recommended.length < 3) {
    const excludeIds = [
      ...registeredEventIds,
      ...recommended.map((e) => e.id),
    ];

    const backfill = await prisma.event.findMany({
      where: {
        startDate: { gt: now },
        status: "PUBLISHED",
        id: { notIn: excludeIds.length > 0 ? excludeIds : ["_"] },
      },
      orderBy: { registrations: { _count: "desc" } },
      take: 3 - recommended.length,
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        isOnline: true,
        city: true,
        venueName: true,
        banner: true,
        category: { select: { name: true } },
      },
    });

    finalRecommended = [...recommended, ...backfill];
  }

  return {
    userName: user.name || "",
    stats: {
      totalRegistrations: user._count.registrations,
      eventsAttended: past.length,
      upcomingCount,
      reviewsGiven: feedbackCount,
    },
    upcoming: upcoming.map(transformRegistration),
    past: past.map(transformRegistration),
    recommended: finalRecommended.map(transformEvent),
  };
}