// app/api/admin/messages/route.ts
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
    const unreadOnly = sp.get("unread") === "true";

    const where: Record<string, unknown> = {};
    if (unreadOnly) where.isRead = false;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("[ADMIN_MESSAGES]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}