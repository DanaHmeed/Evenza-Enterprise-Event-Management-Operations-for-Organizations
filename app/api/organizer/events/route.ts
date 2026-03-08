// app/api/organizer/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOrganizer();
    if (isAuthError(auth)) return auth;

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "20");
    const search = sp.get("search");
    const status = sp.get("status");

    const where: Record<string, unknown> = { organizerId: auth.userId };
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          category: { select: { name: true, color: true } },
          _count: { select: { registrations: true, feedbacks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: events,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("[ORGANIZER_EVENTS]", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}