// app/api/stripe/webhook/route.ts
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

      // Idempotency: skip if already processed
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true },
      });

      if (existingOrder?.paymentStatus === "PAID") {
        console.log("⚠️ Webhook already processed for order:", orderId);
        return NextResponse.json({ received: true });
      }

      // Fetch receipt URL from the payment intent
      let receiptUrl: string | null = null;
      if (session.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string,
            { expand: ["latest_charge"] }
          );
          const charge = paymentIntent.latest_charge as Stripe.Charge | null;
          receiptUrl = charge?.receipt_url ?? null;
        } catch {
          // Non-critical — continue without receipt URL
        }
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
            ...(receiptUrl ? { receiptUrl } : {}),
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

  // Handle expired checkout session
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { ticketId, orderId, registrationId, eventId } =
        session.metadata || {};

      if (!ticketId || !orderId || !registrationId || !eventId) {
        console.error("[STRIPE_WEBHOOK] Missing metadata on expired session");
        return NextResponse.json({ received: true });
      }

      // Idempotency: skip if already processed
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true },
      });

      if (existingOrder?.paymentStatus !== "PENDING") {
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.ticket.update({
          where: { id: ticketId },
          data: { status: "CANCELLED" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });

        await tx.registration.update({
          where: { id: registrationId },
          data: { status: "CANCELLED" },
        });

        await tx.event.update({
          where: { id: eventId },
          data: { seatsRemaining: { increment: 1 } },
        });
      });

      console.log("❌ Session expired, resources released:", session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[STRIPE_WEBHOOK] Error handling expired session:", errorMessage);
    }
  }

  // Handle failed payment intent — look up by paymentIntentId stored on the ticket
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      // Attempt to find the ticket linked to this payment intent
      const ticket = await prisma.ticket.findFirst({
        where: { paymentIntentId: paymentIntent.id },
        include: { registration: true },
      });

      if (!ticket) {
        // Can't trace back — already handled by session.expired or never linked
        return NextResponse.json({ received: true });
      }

      // Idempotency
      if (ticket.status !== "RESERVED") {
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { status: "CANCELLED" },
        });

        if (ticket.registration) {
          const relatedOrder = await tx.order.findFirst({
            where: { eventId: ticket.eventId, userId: ticket.userId, paymentStatus: "PENDING" },
          });

          if (relatedOrder) {
            await tx.order.update({
              where: { id: relatedOrder.id },
              data: { paymentStatus: "FAILED" },
            });
          }

          await tx.registration.update({
            where: { id: ticket.registration.id },
            data: { status: "CANCELLED" },
          });
        }

        await tx.event.update({
          where: { id: ticket.eventId },
          data: { seatsRemaining: { increment: 1 } },
        });
      });

      console.log("❌ Payment intent failed, resources released:", paymentIntent.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[STRIPE_WEBHOOK] Error handling failed payment intent:", errorMessage);
    }
  }

  return NextResponse.json({ received: true });
}
