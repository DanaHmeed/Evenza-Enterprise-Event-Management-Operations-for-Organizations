// app/api/organizer/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await requireOrganizer();
    if (isAuthError(auth)) return auth;

    const { orderId } = await params;
    const body = await req.json();
    const { action } = body; // "mark_paid" | "mark_failed" | "refund"

    // Get order and verify it belongs to organizer's event
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: { select: { id: true, organizerId: true, title: true, price: true, currency: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.event.organizerId !== auth.userId) {
      return NextResponse.json({ error: "Not your event" }, { status: 403 });
    }

    if (action === "mark_paid") {
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ error: "Order already paid" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Update order — schema uses `paymentStatus` and `amount`
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID" },
        });

        // Check if registration already exists
        const existingReg = await tx.registration.findUnique({
          where: { userId_eventId: { userId: order.userId, eventId: order.eventId } },
        });

        if (!existingReg || existingReg.status === "CANCELLED") {
          // Create or update registration
          const registration = existingReg
            ? await tx.registration.update({
                where: { id: existingReg.id },
                data: { status: "APPROVED" },
              })
            : await tx.registration.create({
                data: { userId: order.userId, eventId: order.eventId, status: "APPROVED" },
              });

          // Check if ticket already exists for this registration
          const existingTicket = await tx.ticket.findUnique({
            where: { registrationId: registration.id },
          });

          if (!existingTicket) {
            // Generate ticket — schema requires price, currency, registrationId (unique)
            const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const ticketPrice = order.amount ?? order.event.price ?? 0;
            const ticketCurrency = order.currency ?? order.event.currency ?? "USD";

            await tx.ticket.create({
              data: {
                ticketNumber,
                userId: order.userId,
                eventId: order.eventId,
                registrationId: registration.id,
                price: ticketPrice,
                currency: ticketCurrency,
                status: "PAID",
                qrCode: JSON.stringify({ ticketNumber, eventId: order.eventId, userId: order.userId }),
              },
            });
          }

          // Decrement seats
          await tx.event.update({
            where: { id: order.eventId },
            data: { seatsRemaining: { decrement: 1 } },
          });
        } else if (existingReg.status === "PENDING" || existingReg.status === "REJECTED") {
          // Approve existing registration
          await tx.registration.update({
            where: { id: existingReg.id },
            data: { status: "APPROVED" },
          });
        }
      });

      return NextResponse.json({ success: true, message: "Payment confirmed. Registration and ticket created." });
    }

    if (action === "mark_failed") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ success: true, message: "Order marked as failed." });
    }

    if (action === "refund") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "REFUNDED", refundedAt: new Date(), refundAmount: order.amount },
        });
        await tx.registration.updateMany({
          where: { eventId: order.eventId, userId: order.userId },
          data: { status: "CANCELLED" },
        });
        await tx.ticket.updateMany({
          where: { eventId: order.eventId, userId: order.userId },
          data: { status: "REFUNDED" },
        });
        await tx.event.update({
          where: { id: order.eventId },
          data: { seatsRemaining: { increment: 1 } },
        });
      });
      return NextResponse.json({ success: true, message: "Order refunded." });
    }

    return NextResponse.json({ error: "Invalid action. Use: mark_paid, mark_failed, or refund" }, { status: 400 });
  } catch (error) {
    console.error("[ORGANIZER_ORDER_PATCH]", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}