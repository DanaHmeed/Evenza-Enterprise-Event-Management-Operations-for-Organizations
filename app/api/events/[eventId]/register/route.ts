import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// POST - Register for a FREE event
export async function POST(
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

    // Check if event is published
    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Event is not available for registration" },
        { status: 400 }
      );
    }

    // Check if event is free
    if (event.eventType !== "FREE") {
      return NextResponse.json(
        { error: "This is a paid event. Please use the purchase endpoint." },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    // Check if event has already started
    if (new Date() > new Date(event.startDate)) {
      return NextResponse.json(
        { error: "Event has already started" },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.seatsRemaining <= 0) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: params.eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.$transaction(async (tx) => {
      // Create the registration
      const newRegistration = await tx.registration.create({
        data: {
          userId,
          eventId: params.eventId,
          status: event.approvalRequired ? "PENDING" : "APPROVED",
        },
        include: {
          event: {
            select: {
              title: true,
              startDate: true,
              endDate: true,
              address: true,
              city: true,
              country: true,
              isOnline: true,
              meetingLink: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Update seats remaining
      await tx.event.update({
        where: { id: params.eventId },
        data: {
          seatsRemaining: {
            decrement: 1,
          },
        },
      });

      return newRegistration;
    });

    return NextResponse.json(
      {
        message: event.approvalRequired
          ? "Registration submitted for approval"
          : "Successfully registered for event",
        registration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel registration
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

    // Find the registration
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: params.eventId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Check if event has already started
    if (new Date() > new Date(registration.event.startDate)) {
      return NextResponse.json(
        { error: "Cannot cancel registration after event has started" },
        { status: 400 }
      );
    }

    // Delete registration and update seats
    await prisma.$transaction(async (tx) => {
      await tx.registration.delete({
        where: {
          userId_eventId: {
            userId,
            eventId: params.eventId,
          },
        },
      });

      await tx.event.update({
        where: { id: params.eventId },
        data: {
          seatsRemaining: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}