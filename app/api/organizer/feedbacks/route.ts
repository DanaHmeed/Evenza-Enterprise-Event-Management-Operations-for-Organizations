// app/api/organizer/feedbacks/route.ts
// CONSOLIDATED: Replaces the N+1 pattern (fetch all events → fetch feedback per event)
// with a single Prisma query joining Feedback → Event filtered by organizerId.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";
import { FeedbackStatus } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOrganizer();
    if (isAuthError(auth)) return auth;

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "20");
    const status = sp.get("status");

    const where: Record<string, unknown> = {
      event: { organizerId: auth.userId },
    };

    if (status && status !== "ALL") {
      where.status = status as FeedbackStatus;
    }

    const [feedbacks, total, ratingAgg, statusCounts] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          user: { select: { name: true, avatar: true } },
          event: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.feedback.count({ where }),
      // Average rating across all approved feedback (unfiltered by status param)
      prisma.feedback.aggregate({
        where: {
          event: { organizerId: auth.userId },
          status: "APPROVED",
        },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.feedback.groupBy({
        by: ["status"],
        where: { event: { organizerId: auth.userId } },
        _count: true,
      }),
    ]);

    const statusSummary: Record<string, number> = {};
    let totalAll = 0;
    for (const row of statusCounts) {
      statusSummary[row.status] = row._count;
      totalAll += row._count;
    }

    return NextResponse.json({
      success: true,
      data: feedbacks,
      stats: {
        total: totalAll,
        approved: statusSummary["APPROVED"] || 0,
        pending: statusSummary["PENDING"] || 0,
        rejected: statusSummary["REJECTED"] || 0,
        averageRating: ratingAgg._avg.rating
          ? Math.round(ratingAgg._avg.rating * 10) / 10
          : 0,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[ORGANIZER_FEEDBACKS]", error);
    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}