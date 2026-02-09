import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { updateEventSchema } from "@/lib/validations/event.schema";
import { ZodError } from "zod";

// GET - Fetch single event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            feedback: true,
          },
        },
        feedback: {
          where: { approved: true },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH - Update event (organizer or admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the event
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is the organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (event.organizerId !== userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only edit your own events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    const updatedEvent = await prisma.event.update({
      where: { id: params.eventId },
      data: validatedData,
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event (organizer or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (event.organizerId !== userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    // Prevent deletion if there are registrations
    if (event._count.registrations > 0) {
      return NextResponse.json(
        { error: "Cannot delete event with existing registrations" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: params.eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error creating event:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.issues  
        },
        { status: 400 }
      );
    }
  }
}