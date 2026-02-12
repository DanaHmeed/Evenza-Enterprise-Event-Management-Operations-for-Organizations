import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";

type Params = { params: Promise<{ ticketId: string }> };

// POST - Validate/scan a ticket at event entry
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: { select: { id: true, organizerId: true, title: true, startDate: true, endDate: true } },
        user: { select: { id: true, name: true, email: true, avatar: true } },
        registration: { select: { status: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Invalid ticket", valid: false },
        { status: 404 }
      );
    }

    // Only organizer of this event or admin can validate
    if (ticket.event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if ticket is already used
    if (ticket.isUsed) {
      return NextResponse.json({
        valid: false,
        error: "Ticket already used",
        usedAt: ticket.usedAt,
        attendee: ticket.user,
      });
    }

    // Check ticket status
    if (ticket.status !== "PAID") {
      return NextResponse.json({
        valid: false,
        error: `Ticket status is ${ticket.status}`,
      });
    }

    // Check registration status
    if (ticket.registration?.status !== "APPROVED") {
      return NextResponse.json({
        valid: false,
        error: "Registration not approved",
      });
    }

    // Mark ticket as used
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const validated = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          isUsed: true,
          usedAt: new Date(),
          validatedBy: currentUser.userId,
        },
      });

      // Mark registration as checked in
      await tx.registration.update({
        where: { id: ticket.registrationId },
        data: {
          checkedIn: true,
          checkedInAt: new Date(),
        },
      });

      return validated;
    });

    return NextResponse.json({
      valid: true,
      message: "Ticket validated successfully",
      data: {
        ticketNumber: updatedTicket.ticketNumber,
        attendee: ticket.user,
        event: ticket.event.title,
        validatedAt: updatedTicket.usedAt,
      },
    });
  } catch (error) {
    console.error("[TICKET_VALIDATE]", error);
    return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 });
  }
}