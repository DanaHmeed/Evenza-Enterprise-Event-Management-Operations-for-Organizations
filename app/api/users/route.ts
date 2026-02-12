import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-role";

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              organizedEvents: true,
              registrations: true,
              feedbacks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}