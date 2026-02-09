import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
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
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const { userId, eventId, ticketId, orderId } = session.metadata || {};

      if (!userId || !eventId || !ticketId || !orderId) {
        throw new Error("Missing metadata");
      }

      // Use transaction to ensure all updates succeed together
      await prisma.$transaction(async (tx) => {
        // Update ticket to PAID
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: "PAID",
            paymentIntentId: session.payment_intent as string,
          },
        });

        // Update order to PAID
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
          },
        });

        // Create registration with ticket
        await tx.registration.create({
          data: {
            userId,
            eventId,
            ticketId,
            status: "APPROVED", // Auto-approve paid registrations
          },
        });

        // Decrease available seats
        await tx.event.update({
          where: { id: eventId },
          data: {
            seatsRemaining: {
              decrement: 1,
            },
          },
        });
      });

      console.log("✅ Payment successful and ticket created:", session.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing successful payment:", errorMessage);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      );
    }
  }

  // Handle failed payment
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log("❌ Payment failed:", paymentIntent.id);

    try {
      // Update order to FAILED
      await prisma.order.updateMany({
        where: {
          stripeSessionId: paymentIntent.id,
        },
        data: {
          paymentStatus: "FAILED",
        },
      });

      // Release the reserved ticket
      await prisma.ticket.updateMany({
        where: {
          paymentIntentId: paymentIntent.id,
          status: "RESERVED",
        },
        data: {
          status: "CANCELLED",
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing failed payment:", errorMessage);
    }
  }

  return NextResponse.json({ received: true });
}