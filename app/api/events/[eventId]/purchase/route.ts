// app/api/events/[eventId]/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAuth, isAuthError } from "@/lib/auth/require-role";
import { generateTicketNumber, generateQRData } from "@/lib/utils/helpers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Params = { params: Promise<{ eventId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const userId = authResult.userId;

    // Validate event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event is not available" }, { status: 400 });
    }

    if (event.eventType !== "PAID") {
      return NextResponse.json({ error: "This is a free event. Use the register endpoint." }, { status: 400 });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });
    }

    if (event.seatsRemaining <= 0) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 });
    }

    const body = await request.json();
    const { paymentMethod } = body;

    // Handle Stripe payments
    if (paymentMethod === "STRIPE" || !paymentMethod) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Create registration + ticket + order in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create registration (PENDING until payment completes)
        const registration = await tx.registration.create({
          data: {
            userId,
            eventId,
            status: "PENDING",
          },
        });

        // 2. Create ticket with required fields
        const ticketNumber = generateTicketNumber();
        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: generateQRData(registration.id, eventId),
            userId,
            eventId,
            registrationId: registration.id,
            price: event.price ?? 0,
            currency: event.currency || "USD",
            status: "RESERVED",
          },
        });

        // 3. Create order
        const order = await tx.order.create({
          data: {
            userId,
            eventId,
            amount: event.price ?? 0,
            currency: event.currency || "USD",
            paymentMethod: "STRIPE",
            paymentStatus: "PENDING",
          },
        });

        // 4. Decrement seats
        await tx.event.update({
          where: { id: eventId },
          data: { seatsRemaining: { decrement: 1 } },
        });

        return { registration, ticket, order };
      });

      // Create Stripe checkout session
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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
        customer_email: user.email,
        metadata: {
          userId,
          eventId,
          ticketId: result.ticket.id,
          orderId: result.order.id,
          registrationId: result.registration.id,
        },
      });

      // Link stripe session to order
      await prisma.order.update({
        where: { id: result.order.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        ticketNumber: result.ticket.ticketNumber,
      });
    }

    // Handle manual payments (CASH, BANK_TRANSFER, JAWWAL_PAY)
    if (["CASH", "BANK_TRANSFER", "JAWWAL_PAY"].includes(paymentMethod)) {
      const result = await prisma.$transaction(async (tx) => {
        const registration = await tx.registration.create({
          data: {
            userId,
            eventId,
            status: "PENDING",
          },
        });

        const ticketNumber = generateTicketNumber();
        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: generateQRData(registration.id, eventId),
            userId,
            eventId,
            registrationId: registration.id,
            price: event.price ?? 0,
            currency: event.currency || "USD",
            status: "RESERVED",
          },
        });

        const order = await tx.order.create({
          data: {
            userId,
            eventId,
            amount: event.price ?? 0,
            currency: event.currency || "USD",
            paymentMethod,
            paymentStatus: "PENDING",
          },
        });

        await tx.event.update({
          where: { id: eventId },
          data: { seatsRemaining: { decrement: 1 } },
        });

        return { registration, ticket, order };
      });

      return NextResponse.json(
        {
          success: true,
          message: "Order created. Awaiting payment confirmation.",
          data: {
            ticketNumber: result.ticket.ticketNumber,
            orderId: result.order.id,
            amount: event.price,
            currency: event.currency,
            paymentMethod,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  } catch (error) {
    console.error("[PURCHASE_POST]", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}