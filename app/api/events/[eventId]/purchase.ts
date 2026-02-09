import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { purchaseTicket } from "@/lib/tickets/purchase-ticket";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    const body = await request.json();
    const { paymentMethod, paymentRef } = body;

    // Handle Stripe payments
    if (paymentMethod === "STRIPE" || !paymentMethod) {
      // Use Stripe checkout flow (previous code)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const event = await prisma.event.findUnique({
        where: { id: params.eventId },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      // Generate ticket number
      const ticketNumber = `EVZ-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`;

      // Create reserved ticket
      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          userId,
          eventId: params.eventId,
          price: event.price ?? 0,
          currency: event.currency || "USD",
          status: "RESERVED",
        },
      });

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          eventId: params.eventId,
          amount: event.price ?? 0,
          currency: event.currency || "USD",
          paymentMethod: "STRIPE",
          paymentStatus: "PENDING",
        },
      });

      // Create Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: event.currency?.toLowerCase() || "usd",
              product_data: {
                name: event.title,
                description: `Ticket for ${event.title}`,
                images: event.banner ? [event.banner] : [],
              },
              unit_amount: Math.round((event.price ?? 0) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${params.eventId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${params.eventId}`,
        customer_email: user.email,
        metadata: {
          userId,
          eventId: params.eventId,
          ticketId: ticket.id,
          orderId: order.id,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({
        sessionId: session.id,
        sessionUrl: session.url,
        ticketNumber,
      });
    }

    // Handle manual payments (CASH, BANK_TRANSFER, JAWWAL_PAY)
    if (["CASH", "BANK_TRANSFER", "JAWWAL_PAY"].includes(paymentMethod)) {
      const result = await purchaseTicket({
        userId,
        eventId: params.eventId,
        paymentMethod,
        paymentRef,
      });

      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error purchasing ticket:", errorMessage);
    throw error; // Re-throw to handle in API route
  }
}