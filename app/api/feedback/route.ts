import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAuth, requireAdmin, isAuthError } from "@/lib/auth/require-role";
import { submitFeedbackSchema } from "@/lib/validations/feedback.schema";
import { ZodError } from "zod";

// POST - Submit feedback (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const validatedData = submitFeedbackSchema.parse(body);

    // Check if user attended the event
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: authResult.userId,
          eventId: validatedData.eventId,
        },
      },
      include: { event: { select: { title: true } } },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You can only provide feedback for events you registered for" },
        { status: 403 }
      );
    }

    // Check for existing feedback
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        userId_eventId: {
          userId: authResult.userId,
          eventId: validatedData.eventId,
        },
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You have already submitted feedback for this event" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: authResult.userId,
        eventId: validatedData.eventId,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        status: "PENDING",
      },
      include: {
        user: { select: { name: true } },
        event: { select: { title: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully. It will be visible after admin approval.",
        data: feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[FEEDBACK_POST]", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

// GET - Get all feedback for moderation (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          event: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: feedbacks,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("[FEEDBACK_GET]", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}