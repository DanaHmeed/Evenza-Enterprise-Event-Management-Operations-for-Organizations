import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

type Params = { params: Promise<{ eventId: string }> };

// GET - Get approved feedback for a specific event (public)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { eventId, status: "APPROVED" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        feedbacks,
        stats: {
          count: feedbacks.length,
          averageRating: Math.round(avgRating * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error("[EVENT_FEEDBACK_GET]", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}