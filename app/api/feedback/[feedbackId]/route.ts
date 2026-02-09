import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// PATCH - Approve or reject feedback (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
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
        { error: "Only admins can moderate feedback" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Approved field must be a boolean" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.update({
      where: { id: params.feedbackId },
      data: { approved },
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

    return NextResponse.json({
      message: approved ? "Feedback approved" : "Feedback rejected",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
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
        { error: "Only admins can delete feedback" },
        { status: 403 }
      );
    }

    await prisma.feedback.delete({
      where: { id: params.feedbackId },
    });

    return NextResponse.json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
