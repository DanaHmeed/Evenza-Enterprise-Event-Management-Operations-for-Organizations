import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", errorMessage);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { userId, eventId, ticketId, orderId, registrationId } =
        session.metadata || {};

      if (!userId || !eventId || !ticketId || !orderId || !registrationId) {
        throw new Error("Missing metadata");
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update ticket to PAID
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: "PAID",
            paymentIntentId: session.payment_intent as string,
          },
        });

        // 2. Update order to PAID
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
          },
        });

        // 3. Approve registration
        await tx.registration.update({
          where: { id: registrationId },
          data: { status: "APPROVED" },
        });

        // 4. Notify user
        await tx.notification.create({
          data: {
            userId,
            type: "PAYMENT_RECEIVED",
            title: "Payment Confirmed!",
            message: "Your payment was successful and your ticket is ready.",
            link: `/events/${eventId}`,
          },
        });
      });

      console.log("✅ Payment successful:", session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[STRIPE_WEBHOOK] Error processing payment:", errorMessage);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  // Handle failed payment
  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { ticketId, orderId, registrationId, eventId } =
        session.metadata || {};

      if (!ticketId || !orderId || !registrationId || !eventId) {
        console.error("[STRIPE_WEBHOOK] Missing metadata on failed payment");
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        // 1. Cancel ticket
        await tx.ticket.update({
          where: { id: ticketId },
          data: { status: "CANCELLED" },
        });

        // 2. Fail order
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });

        // 3. Cancel registration
        await tx.registration.update({
          where: { id: registrationId },
          data: { status: "CANCELLED" },
        });

        // 4. Restore seat
        await tx.event.update({
          where: { id: eventId },
          data: { seatsRemaining: { increment: 1 } },
        });
      });

      console.log("❌ Payment failed/expired, resources released:", session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[STRIPE_WEBHOOK] Error handling failed payment:", errorMessage);
    }
  }

  return NextResponse.json({ received: true });
}