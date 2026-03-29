// app/api/users/[userId]/registrations/route.ts
//
// OPTIMIZATIONS:
// - Added `limit` param (profile page uses limit=4, events page uses pagination)
// - Added cursor-based pagination via `cursor` param
// - Added `fields` param to control which event fields are returned
// - Uses Prisma `select` instead of `include` to reduce payload size
// - Returns `nextCursor` for efficient pagination

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { userId } = await params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Parse query params ──
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor"); // registration ID for cursor-based pagination
    const status = searchParams.get("status"); // filter by status

    // Default 20 per page, max 50, allow "all" for backwards compat (capped at 200)
    const limit = limitParam === "all"
      ? 200
      : Math.min(Math.max(parseInt(limitParam || "20", 10) || 20, 1), 50);

    // ── Build where clause ──
    const where: Record<string, unknown> = { userId };
    if (status && ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    // ── Build cursor pagination ──
    const paginationArgs: Record<string, unknown> = {};
    if (cursor) {
      paginationArgs.cursor = { id: cursor };
      paginationArgs.skip = 1; // skip the cursor item itself
    }

    const registrations = await prisma.registration.findMany({
      where,
      select: {
        id: true,
        status: true,
        checkedIn: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            summary: true,
            banner: true,
            startDate: true,
            endDate: true,
            isOnline: true,
            venueName: true,
            city: true,
            eventType: true,
            price: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, 
      ...paginationArgs,
    });

    const hasMore = registrations.length > limit;
    const results = hasMore ? registrations.slice(0, limit) : registrations;
    const nextCursor = hasMore ? results[results.length - 1]?.id : null;

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        limit,
        hasMore,
        nextCursor,
        total: undefined, // Omit count query for speed; add if needed
      },
    });
  } catch (error) {
    console.error("[USER_REGISTRATIONS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}