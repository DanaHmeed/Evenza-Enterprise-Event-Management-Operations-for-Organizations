// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

// GET — fetch current user's orders
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { userId };
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              banner: true,
              startDate: true,
              endDate: true,
              isOnline: true,
              city: true,
              venueName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}