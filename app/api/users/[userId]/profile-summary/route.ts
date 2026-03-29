// app/api/users/[userId]/profile-summary/route.ts
//
//  OPTIMIZATION: Combined endpoint that returns profile + recent registrations
// in a single request, eliminating the second round-trip the profile page was making.
// Also uses Prisma `select` to return only the fields the UI needs.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";

type Params = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.userId !== userId && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only view your own profile" },
        { status: 403 }
      );
    }

    const [user, recentRegistrations] = await Promise.all([
      // Profile with counts — only select fields the UI uses
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          avatar: true,
          bio: true,
          isActive: true,
          phone: true,
          experience: true,
          industry: true,
          jobTitle: true,
          location: true,
          organization: true,
          _count: {
            select: {
              organizedEvents: true,
              registrations: true,
              tickets: true,
              orders: true,
              feedbacks: true,
            },
          },
        },
      }),

      // Uses the new composite index: Registration(userId, createdAt DESC)
      prisma.registration.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              isOnline: true,
              city: true,
              banner: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 4, 
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: user,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error("[PROFILE_SUMMARY_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch profile summary" },
      { status: 500 }
    );
  }
}