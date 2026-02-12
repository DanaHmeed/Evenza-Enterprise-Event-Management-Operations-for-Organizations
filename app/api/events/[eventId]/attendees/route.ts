import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";
import { generateTicketNumber, generateQRData } from "@/lib/utils/helpers";

type Params = { params: Promise<{ eventId: string }> };

// GET - Get attendee list (organizer/admin)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const attendees = await prisma.registration.findMany({
      where: {
        eventId,
        ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
        ticket: {
          select: {
            ticketNumber: true,
            qrCode: true,
            status: true,
            isUsed: true,
            usedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: attendees.length,
      approved: attendees.filter((a) => a.status === "APPROVED").length,
      pending: attendees.filter((a) => a.status === "PENDING").length,
      rejected: attendees.filter((a) => a.status === "REJECTED").length,
      cancelled: attendees.filter((a) => a.status === "CANCELLED").length,
      checkedIn: attendees.filter((a) => a.checkedIn).length,
    };

    return NextResponse.json({ success: true, data: { attendees, stats } });
  } catch (error) {
    console.error("[ATTENDEES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 });
  }
}

// PATCH - Approve/Reject registration (organizer/admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true, currency: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { registrationId, status } = body;

    if (!registrationId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid registrationId and status (APPROVED/REJECTED) required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedRegistration = await tx.registration.update({
        where: { id: registrationId },
        data: { status },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      // Generate ticket on approval
      let ticket = null;
      if (status === "APPROVED") {
        const ticketNumber = generateTicketNumber();
        ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: generateQRData(registrationId, eventId),
            eventId,
            userId: updatedRegistration.userId,
            registrationId,
            price: 0,
            currency: event.currency || "USD",
            status: "PAID",
          },
        });
      }

      // If rejected, restore seat
      if (status === "REJECTED") {
        await tx.event.update({
          where: { id: eventId },
          data: { seatsRemaining: { increment: 1 } },
        });
      }

      // Notify user
      await tx.notification.create({
        data: {
          userId: updatedRegistration.userId,
          type: status === "APPROVED" ? "REGISTRATION_APPROVED" : "REGISTRATION_REJECTED",
          title: status === "APPROVED" ? "Registration Approved!" : "Registration Rejected",
          message: status === "APPROVED"
            ? `Your registration for "${event.title}" has been approved. Your ticket is ready!`
            : `Your registration for "${event.title}" was not approved.`,
          link: `/events/${eventId}`,
        },
      });

      return { registration: updatedRegistration, ticket };
    });

    return NextResponse.json({
      success: true,
      message: `Registration ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    console.error("[ATTENDEES_PATCH]", error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}