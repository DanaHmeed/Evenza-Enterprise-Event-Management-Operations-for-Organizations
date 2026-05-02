import { prisma } from "@/lib/db/prisma";
import { PaymentMethod } from "@/lib/generated/prisma/client";

export async function purchaseTicket({
  userId,
  eventId,
  paymentMethod,
  paymentRef,
}: {
  userId: string;
  eventId: string;
  paymentMethod: PaymentMethod;
  paymentRef?: string; // Optional - only for bank transfers
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Get event details
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // 2. Validate event status
    if (event.status !== "PUBLISHED") {
      throw new Error("Event is not available for purchase");
    }

    if (event.eventType !== "PAID") {
      throw new Error("This is a free event");
    }

    if (!event.price || event.price <= 0) {
      throw new Error("Invalid event price");
    }

    // 3. Check deadlines
    const now = new Date();
    
    if (now > new Date(event.registrationDeadline)) {
      throw new Error("Registration deadline has passed");
    }

    if (now > new Date(event.startDate)) {
      throw new Error("Event has already started");
    }

    // 4. Check capacity
    if (event.seatsRemaining <= 0) {
      throw new Error("Event is sold out");
    }

    // 5. Check for duplicate purchase/registration
    const existingRegistration = await tx.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      throw new Error("You have already purchased a ticket for this event");
    }

    // 6. Generate unique ticket number and QR code
    const suffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const ticketNumber = `EVZ-${suffix}`;
    const qrCode = `QR-${suffix}`;

    // 7. Determine payment status based on method
    // Cash and Bank Transfer need admin verification
    const paymentStatus =
      paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
        ? "PENDING"
        : "PAID";

    const ticketStatus =
      paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER"
        ? "RESERVED"
        : "PAID";

    // 8. Create registration first (Ticket FK points to Registration)
    const registration = await tx.registration.create({
      data: {
        userId,
        eventId,
        status: paymentStatus === "PAID" ? "APPROVED" : "PENDING",
      },
    });

    // 9. Create ticket with registrationId
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        qrCode,
        userId,
        eventId,
        registrationId: registration.id,
        price: event.price,
        currency: event.currency || "USD",
        status: ticketStatus,
        paymentIntentId: paymentRef || null,
      },
    });

    // 10. Create order
    const order = await tx.order.create({
      data: {
        userId,
        eventId,
        amount: event.price,
        currency: event.currency || "USD",
        paymentMethod,
        paymentStatus,
        stripeSessionId: paymentMethod === "STRIPE" ? paymentRef : null,
      },
    });

    // 11. Decrease available seats (reserve the seat even for pending payments)
    await tx.event.update({
      where: { id: eventId },
      data: {
        seatsRemaining: { decrement: 1 },
      },
    });

    return {
      order,
      ticket,
      registration,
      message:
        paymentStatus === "PENDING"
          ? "Payment pending verification. Your ticket will be confirmed once payment is verified."
          : "Ticket purchased successfully!",
    };
  });
}

// Helper function to verify and approve manual payments (for admin)
export async function approveManualPayment(ticketId: string) {
  return prisma.$transaction(async (tx) => {
    // Update ticket status
    const ticket = await tx.ticket.update({
      where: { id: ticketId },
      data: { status: "PAID" },
      include: {
        registration: true,
      },
    });

    if (!ticket.registration) {
      throw new Error("No registration found for this ticket");
    }

    // Update registration status
    await tx.registration.update({
      where: { id: ticket.registration.id },
      data: { status: "APPROVED" },
    });

    // Update order status
    await tx.order.updateMany({
      where: {
        userId: ticket.userId,
        eventId: ticket.eventId,
      },
      data: { paymentStatus: "PAID" },
    });

    return ticket;
  });
}

// Helper function to reject manual payment (for admin)
export async function rejectManualPayment(ticketId: string) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.update({
      where: { id: ticketId },
      data: { status: "CANCELLED" },
      include: {
        registration: true,
        event: true,
      },
    });

    if (!ticket.registration) {
      throw new Error("No registration found for this ticket");
    }

    // Update registration status
    await tx.registration.update({
      where: { id: ticket.registration.id },
      data: { status: "REJECTED" },
    });

    // Update order status
    await tx.order.updateMany({
      where: {
        userId: ticket.userId,
        eventId: ticket.eventId,
      },
      data: { paymentStatus: "FAILED" },
    });

    // Return the seat to available pool
    await tx.event.update({
      where: { id: ticket.eventId },
      data: {
        seatsRemaining: { increment: 1 },
      },
    });

    return ticket;
  });
}