import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-role";
import { moderateFeedbackSchema } from "@/lib/validations/feedback.schema";
import { ZodError } from "zod";

type Params = { params: Promise<{ feedbackId: string }> };

// PATCH - Approve/Reject feedback (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { feedbackId } = await params;
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const validatedData = moderateFeedbackSchema.parse(body);

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status: validatedData.status,
        rejectReason: validatedData.rejectReason,
        moderatedBy: authResult.userId,
        moderatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true } },
        event: { select: { id: true, title: true } },
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: updatedFeedback.userId,
        type: validatedData.status === "APPROVED" ? "FEEDBACK_APPROVED" : "FEEDBACK_REJECTED",
        title: validatedData.status === "APPROVED" ? "Feedback Published!" : "Feedback Not Published",
        message: validatedData.status === "APPROVED"
          ? `Your review for "${updatedFeedback.event.title}" is now public.`
          : `Your review for "${updatedFeedback.event.title}" was not approved.${validatedData.rejectReason ? ` Reason: ${validatedData.rejectReason}` : ""}`,
        link: `/events/${updatedFeedback.eventId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Feedback ${validatedData.status.toLowerCase()} successfully`,
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("[FEEDBACK_MODERATE]", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to moderate feedback" }, { status: 500 });
  }
}

// DELETE - Delete feedback (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { feedbackId } = await params;
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    await prisma.feedback.delete({ where: { id: feedbackId } });

    return NextResponse.json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    console.error("[FEEDBACK_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}