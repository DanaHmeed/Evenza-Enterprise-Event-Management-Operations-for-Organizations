// app/api/organizer/orders/route.ts
// CONSOLIDATED: Replaces the N+1 pattern (fetch all events → fetch orders per event)
// with a single Prisma query joining Order → Event filtered by organizerId.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";
import { PaymentStatus } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOrganizer();
    if (isAuthError(auth)) return auth;

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "20");
    const status = sp.get("status");
    const search = sp.get("search");

    const where: Record<string, unknown> = {
      event: { organizerId: auth.userId },
    };

    if (status && status !== "ALL") {
      where.paymentStatus = status as PaymentStatus;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { event: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total, revenueAgg, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
      // Revenue aggregate — always across ALL organizer orders (unfiltered)
      prisma.order.aggregate({
        where: {
          event: { organizerId: auth.userId },
          paymentStatus: "PAID",
        },
        _sum: { amount: true },
      }),
      // Status counts for summary cards
      prisma.order.groupBy({
        by: ["paymentStatus"],
        where: { event: { organizerId: auth.userId } },
        _count: true,
      }),
    ]);

    const statusSummary: Record<string, number> = {};
    let totalAll = 0;
    for (const row of statusCounts) {
      statusSummary[row.paymentStatus] = row._count;
      totalAll += row._count;
    }

    return NextResponse.json({
      success: true,
      data: orders,
      stats: {
        totalRevenue: revenueAgg._sum.amount ?? 0,
        totalOrders: totalAll,
        paidCount: statusSummary["PAID"] || 0,
        pendingCount: statusSummary["PENDING"] || 0,
        failedCount: statusSummary["FAILED"] || 0,
        refundedCount: statusSummary["REFUNDED"] || 0,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[ORGANIZER_ORDERS]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}