import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const submitFeedbackSchema = z.object({
  eventId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

// POST - Submit feedback (attendees only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = submitFeedbackSchema.parse(body);

    // Check if user attended the event
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: validatedData.eventId,
        },
      },
      include: {
        event: {
          select: {
            endDate: true,
            title: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You can only provide feedback for events you registered for" },
        { status: 403 }
      );
    }

    // Check if event has ended
    if (new Date() < new Date(registration.event.endDate)) {
      return NextResponse.json(
        { error: "You can only provide feedback after the event has ended" },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        userId,
        eventId: validatedData.eventId,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You have already submitted feedback for this event" },
        { status: 400 }
      );
    }

    // Create feedback (pending approval)
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        eventId: validatedData.eventId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        approved: false,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Feedback submitted successfully. It will be visible after admin approval.",
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET - Get all feedback (admin only - for moderation)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view all feedback" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const approved = searchParams.get("approved");

    const feedback = await prisma.feedback.findMany({
      where: {
        ...(approved !== null && { approved: approved === "true" }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}