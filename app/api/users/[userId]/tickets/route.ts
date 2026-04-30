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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        qrCode: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            banner: true,
            startDate: true,
            endDate: true,
            isOnline: true,
            venueName: true,
            city: true,
          },
        },
        registration: {
          select: {
            status: true,
            checkedIn: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("[USER_TICKETS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
