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

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (event.status !== "PUBLISHED") return NextResponse.json({ error: "Event is not available" }, { status: 400 });
    if (event.eventType !== "PAID") return NextResponse.json({ error: "This is a free event. Use the register endpoint." }, { status: 400 });
    if (new Date() > new Date(event.registrationDeadline)) return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });

    // ─── Seat availability: count only APPROVED registrations ────────────
    // We deliberately do NOT count PENDING (= Stripe sessions in-flight) so
    // that abandoned checkouts never permanently consume a spot.
    const approvedCount = await prisma.registration.count({
      where: { eventId, status: "APPROVED" },
    });

    if (approvedCount >= event.capacity) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }

    // Block duplicate APPROVED registrations only
    const existingRegistration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingRegistration?.status === "APPROVED") {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 });
    }

    // Clean up any stale PENDING/CANCELLED entry so we can create a fresh one
    if (existingRegistration) {
      await prisma.registration.delete({
        where: { userId_eventId: { userId, eventId } },
      });
    }

    // Cancel any existing PENDING orders for this user+event so they don't
    // accumulate as duplicate rows every time the user retries checkout.
    await prisma.order.updateMany({
      where: { userId, eventId, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" },
    });

    const body = await request.json();
    const { paymentMethod } = body;

    // ── Stripe ──────────────────────────────────────────────────────────
    if (paymentMethod === "STRIPE" || !paymentMethod) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const bannerImages = event.banner?.startsWith("http") ? [event.banner] : [];

      // Create Stripe session before any DB writes — if Stripe fails, nothing is written.
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: event.currency?.toLowerCase() || "usd",
            product_data: { name: event.title, description: `Ticket for ${event.title}`, images: bannerImages },
            unit_amount: Math.round((event.price ?? 0) * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}?payment_status=cancelled`,
        customer_email: user.email,
        // 30-minute expiry — the webhook handles cleanup on expiry
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        metadata: { userId, eventId },
      });

      // Write registration/ticket/order — but do NOT touch seatsRemaining yet.
      // seatsRemaining is only decremented by the webhook once payment succeeds.
      const result = await prisma.$transaction(async (tx) => {
        const registration = await tx.registration.create({
          data: { userId, eventId, status: "PENDING" },
        });

        const ticketNumber = generateTicketNumber();
        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: `pending-${registration.id}`,
            userId, eventId,
            registrationId: registration.id,
            price: event.price ?? 0,
            currency: event.currency || "USD",
            status: "RESERVED",
          },
        });
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { qrCode: generateQRData(ticket.id, eventId) },
        });

        const order = await tx.order.create({
          data: {
            userId, eventId,
            amount: event.price ?? 0,
            currency: event.currency || "USD",
            paymentMethod: "STRIPE",
            paymentStatus: "PENDING",
            stripeSessionId: session.id,
          },
        });

        return { registration, ticket, order };
      });

      // Patch session metadata with DB IDs for the webhook to use
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          userId, eventId,
          ticketId: result.ticket.id,
          orderId: result.order.id,
          registrationId: result.registration.id,
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        ticketNumber: result.ticket.ticketNumber,
      });
    }

    // ── Manual payments (CASH, BANK_TRANSFER, JAWWAL_PAY) ───────────────
    // Manual payments require organizer confirmation, so we also skip the
    // seat decrement here and let the organizer's "Mark as Paid" action
    // (PATCH /api/organizer/orders) handle it.
    if (["CASH", "BANK_TRANSFER", "JAWWAL_PAY"].includes(paymentMethod)) {
      const result = await prisma.$transaction(async (tx) => {
        const registration = await tx.registration.create({
          data: { userId, eventId, status: "PENDING" },
        });

        const ticketNumber = generateTicketNumber();
        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: `pending-manual-${registration.id}`,
            userId, eventId,
            registrationId: registration.id,
            price: event.price ?? 0,
            currency: event.currency || "USD",
            status: "RESERVED",
          },
        });
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { qrCode: generateQRData(ticket.id, eventId) },
        });

        const order = await tx.order.create({
          data: {
            userId, eventId,
            amount: event.price ?? 0,
            currency: event.currency || "USD",
            paymentMethod,
            paymentStatus: "PENDING",
          },
        });

        // seatsRemaining decremented when organizer confirms payment via
        // PATCH /api/organizer/orders — see that route for the decrement.

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