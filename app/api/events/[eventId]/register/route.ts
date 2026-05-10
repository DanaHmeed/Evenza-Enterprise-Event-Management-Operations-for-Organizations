// app/api/events/[eventId]/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAuth, isAuthError } from "@/lib/auth/require-role";
import { generateTicketNumber, generateQRData } from "@/lib/utils/helpers";
import { sendWaitlistSpotEmail } from "@/lib/email";

type Params = { params: Promise<{ eventId: string }> };

// POST - Register for a FREE event
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event is not available for registration" }, { status: 400 });
    }

    if (event.eventType !== "FREE") {
      return NextResponse.json({ error: "This is a paid event. Please use the purchase endpoint." }, { status: 400 });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });
    }

    if (new Date() > new Date(event.startDate)) {
      return NextResponse.json({ error: "Event has already started" }, { status: 400 });
    }

    if (event.seatsRemaining <= 0) {
      // Check if waitlist is enabled
      if (event.waitlistEnabled) {
        const waitlistCount = await prisma.waitlistEntry.count({
          where: { eventId },
        });

        await prisma.waitlistEntry.create({
          data: {
            userId: authResult.userId,
            eventId,
            position: waitlistCount + 1,
            status: "WAITING",
          },
        });

        return NextResponse.json(
          { success: true, message: "Event is full. You have been added to the waitlist.", waitlistPosition: waitlistCount + 1 },
          { status: 201 }
        );
      }

      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: authResult.userId, eventId } },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 });
    }

    // Create registration + ticket + update seats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const registrationStatus = event.approvalRequired ? "PENDING" : "APPROVED";

      const registration = await tx.registration.create({
        data: {
          userId: authResult.userId,
          eventId,
          status: registrationStatus,
        },
      });

      // Generate ticket if auto-approved (free event)
      let ticket = null;
      if (registrationStatus === "APPROVED") {
        const ticketNumber = generateTicketNumber();
        ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: `pending-free-${registration.id}`,
            eventId,
            userId: authResult.userId,
            registrationId: registration.id,
            price: 0,
            currency: event.currency || "USD",
            status: "PAID", // Free events are instantly "paid"
          },
        });
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { qrCode: generateQRData(ticket.id, eventId) },
        });
      }

      // Decrement seats
      await tx.event.update({
        where: { id: eventId },
        data: { seatsRemaining: { decrement: 1 } },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: authResult.userId,
          type: registrationStatus === "APPROVED"
            ? "REGISTRATION_CONFIRMED"
            : "REGISTRATION_APPROVED",
          title: registrationStatus === "APPROVED"
            ? "Registration Confirmed!"
            : "Registration Pending",
          message: registrationStatus === "APPROVED"
            ? `You are registered for "${event.title}".`
            : `Your registration for "${event.title}" is pending approval.`,
          link: `/events/${eventId}`,
        },
      });

      return { registration, ticket };
    });

    return NextResponse.json(
      {
        success: true,
        message: event.approvalRequired
          ? "Registration submitted for approval"
          : "Successfully registered for event",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_POST]", error);
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 });
  }
}

// DELETE - Cancel registration
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: authResult.userId, eventId } },
      include: { event: true, ticket: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (new Date() > new Date(registration.event.startDate)) {
      return NextResponse.json({ error: "Cannot cancel after event has started" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete ticket if exists
      if (registration.ticket) {
        await tx.ticket.delete({ where: { id: registration.ticket.id } });
      }

      // Delete registration
      await tx.registration.delete({
        where: { userId_eventId: { userId: authResult.userId, eventId } },
      });

      // Restore seat
      await tx.event.update({
        where: { id: eventId },
        data: { seatsRemaining: { increment: 1 } },
      });

      // Promote from waitlist if someone is waiting
      if (registration.event.waitlistEnabled) {
        const nextInLine = await tx.waitlistEntry.findFirst({
          where: { eventId, status: "WAITING" },
          orderBy: { position: "asc" },
          include: { user: true },
        });

        if (nextInLine) {
          await tx.waitlistEntry.update({
            where: { id: nextInLine.id },
            data: { status: "NOTIFIED", notifiedAt: new Date() },
          });

          await tx.notification.create({
            data: {
              userId: nextInLine.userId,
              type: "WAITLIST_SPOT_AVAILABLE",
              title: "A spot opened up!",
              message: `A spot is now available for "${registration.event.title}". Register now before it's taken!`,
              link: `/events/${eventId}`,
            },
          });

          // Send email outside the transaction so a mail failure doesn't roll back the DB
          void sendWaitlistSpotEmail({
            toEmail: nextInLine.user.email,
            userName: nextInLine.user.name,
            eventTitle: registration.event.title,
            eventDate: new Date(registration.event.startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            eventLocation: registration.event.location ?? registration.event.meetingLink ?? "See event page",
            eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Registration cancelled successfully" });
  } catch (error) {
    console.error("[REGISTER_DELETE]", error);
    return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 });
  }
}