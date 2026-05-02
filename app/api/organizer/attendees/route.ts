// app/api/organizer/attendees/route.ts
// CONSOLIDATED: Replaces the N+1 pattern (fetch all events → fetch attendees per event)
// with a single Prisma query that joins Registration → Event filtered by organizerId.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";
import { RegistrationStatus } from "@/lib/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOrganizer();
    if (isAuthError(auth)) return auth;

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "20");
    const status = sp.get("status");
    const search = sp.get("search");
    const eventId = sp.get("eventId"); // optional: filter by specific event

    // Build where clause — single query, no N+1
    const where: Record<string, unknown> = {
      event: { organizerId: auth.userId },
    };

    if (eventId) {
      where.eventId = eventId;
    }

    if (status && status !== "ALL") {
      where.status = status as RegistrationStatus;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { event: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [attendees, total, statusCounts] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          event: {
            select: { id: true, title: true },
          },
          ticket: {
            select: { ticketNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.registration.count({ where }),
      // Get counts per status in one query (for filter badges)
      prisma.registration.groupBy({
        by: ["status"],
        where: {
          event: { organizerId: auth.userId },
          ...(eventId ? { eventId } : {}),
        },
        _count: true,
      }),
    ]);

    // Also count checked-in
    const checkedInCount = await prisma.registration.count({
      where: {
        event: { organizerId: auth.userId },
        ...(eventId ? { eventId } : {}),
        checkedIn: true,
      },
    });

    // Build status summary from groupBy
    const statusSummary: Record<string, number> = {};
    let totalAll = 0;
    for (const row of statusCounts) {
      statusSummary[row.status] = row._count;
      totalAll += row._count;
    }

    return NextResponse.json({
      success: true,
      data: attendees,
      stats: {
        total: totalAll,
        approved: statusSummary["APPROVED"] || 0,
        pending: statusSummary["PENDING"] || 0,
        rejected: statusSummary["REJECTED"] || 0,
        cancelled: statusSummary["CANCELLED"] || 0,
        checkedIn: checkedInCount,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[ORGANIZER_ATTENDEES]", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}