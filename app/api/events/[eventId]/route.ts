// app/api/events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";
import { updateEventSchema } from "@/lib/validations/event.schema";
import { ZodError } from "zod";

type Params = { params: Promise<{ eventId: string }> };

// GET - Fetch single event (public)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
        feedbacks: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { registrations: true, feedbacks: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Increment view count (non-blocking)
    prisma.event
      .update({
        where: { id: eventId },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("[EVENT_GET]", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}


// PATCH - Update event (organizer who owns it, or admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only owner or admin
    if (event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "You can only edit your own events" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Handle status transitions
    const updateData: Record<string, unknown> = { ...validatedData };

    if (validatedData.status === "PUBLISHED" && event.status === "DRAFT") {
      updateData.publishedAt = new Date();
    }
    if (validatedData.status === "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    // Handle tags update
    if (validatedData.tags) {
      const tagConnections = await Promise.all(
        validatedData.tags.map(async (tagName: string) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") },
          });
          return { id: tag.id };
        })
      );
      delete updateData.tags;
      updateData.tags = { set: [], connect: tagConnections };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        category: true,
        tags: true,
        organizer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("[EVENT_PATCH]", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE - Delete event (organizer who owns it, or admin)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "You can only delete your own events" }, { status: 403 });
    }

    // If there are registrations, cancel instead of delete
    if (event._count.registrations > 0) {
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: "Cancelled by organizer",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Event cancelled (has existing registrations)",
        data: updatedEvent,
      });
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("[EVENT_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}