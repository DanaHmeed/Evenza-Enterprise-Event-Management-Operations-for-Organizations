import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET - Get list of attendees (organizer/admin only)
export async function GET(
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
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (event.organizerId !== userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only event organizers and admins can view attendees" },
        { status: 403 }
      );
    }

    // Get attendees with their registration status
    const attendees = await prisma.registration.findMany({
      where: { eventId: params.eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticket: {
          select: {
            ticketNumber: true,
            status: true,
            isUsed: true,
            usedAt: true,
            validatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by status
    const stats = {
      total: attendees.length,
      approved: attendees.filter((a) => a.status === "APPROVED").length,
      pending: attendees.filter((a) => a.status === "PENDING").length,
      rejected: attendees.filter((a) => a.status === "REJECTED").length,
    };

    return NextResponse.json({
      attendees,
      stats,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject registration (organizer/admin only)
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

    const body = await request.json();
    const { registrationId, status } = body;

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: "Registration ID and status are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    // Get the event
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (event.organizerId !== userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only event organizers and admins can approve registrations" },
        { status: 403 }
      );
    }

    // Update registration status
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Registration ${status.toLowerCase()} successfully`,
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}