// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-role";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isAuthError(auth)) return auth;

    const sp = req.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "20");
    const status = sp.get("status");
    const search = sp.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") where.paymentStatus = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { event: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          event: { select: { id: true, title: true } },
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
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("[ADMIN_ORDERS]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}