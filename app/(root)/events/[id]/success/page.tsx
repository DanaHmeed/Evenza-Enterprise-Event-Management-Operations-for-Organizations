// app/(root)/events/[id]/success/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import Stripe from "stripe";
import { CheckCircle2, Ticket, Calendar, ArrowRight, Download } from "lucide-react";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  text: "#1a1a1a",
  textMuted: "#888",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  greenBorder: "rgba(45,106,79,0.2)",
  accent: "#ea580c",
  sans: "'DM Sans', sans-serif",
  serif: "'Playfair Display', Georgia, serif",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

async function SuccessContent({
  eventId,
  sessionId,
}: {
  eventId: string;
  sessionId: string;
}) {
  // Verify the Stripe session belongs to this event
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });
  } catch {
    // Invalid session — redirect back to event
    redirect(`/events/${eventId}?payment=cancelled`);
  }

  if (
    session.payment_status !== "paid" ||
    session.metadata?.eventId !== eventId
  ) {
    redirect(`/events/${eventId}?payment=cancelled`);
  }

  // Fetch event and ticket details
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      city: true,
      country: true,
      isOnline: true,
      venueName: true,
      banner: true,
    },
  });

  if (!event) notFound();

  const ticket = session.metadata?.ticketId
    ? await prisma.ticket.findUnique({
        where: { id: session.metadata.ticketId },
        select: {
          ticketNumber: true,
          status: true,
          qrCode: true,
        },
      })
    : null;

  const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
  const charge = paymentIntent
    ? await stripe.charges
        .list({ payment_intent: paymentIntent.id, limit: 1 })
        .then((r) => r.data[0] ?? null)
        .catch(() => null)
    : null;

  const amountPaid = session.amount_total ? session.amount_total / 100 : null;
  const currency = session.currency?.toUpperCase() ?? "USD";

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: t.sans,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Success card */}
        <div
          style={{
            background: t.surface,
            border: `1.5px solid ${t.greenBorder}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: t.greenSoft,
              padding: "2rem",
              textAlign: "center",
              borderBottom: `1px solid ${t.greenBorder}`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: t.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <CheckCircle2 size={32} color="#fff" />
            </div>
            <h1
              style={{
                fontFamily: t.serif,
                fontSize: "1.6rem",
                fontWeight: 700,
                color: t.green,
                margin: 0,
              }}
            >
              Payment Successful!
            </h1>
            <p style={{ color: t.textMuted, marginTop: 8, fontSize: "0.95rem" }}>
              Your ticket has been confirmed and is ready to use.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "1.75rem" }}>
            {/* Event info */}
            <div
              style={{
                background: t.bg,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <Calendar size={18} color={t.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: t.text,
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    {event.title}
                  </p>
                  <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: 0 }}>
                    {fmtDate(event.startDate)} · {fmtTime(event.startDate)}
                  </p>
                  {!event.isOnline && (event.city || event.country) && (
                    <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: "2px 0 0" }}>
                      {[event.venueName, event.city, event.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {event.isOnline && (
                    <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: "2px 0 0" }}>
                      Online event
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket info */}
            {ticket && (
              <div
                style={{
                  background: t.bg,
                  border: `1px dashed ${t.border}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Ticket size={18} color={t.accent} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: t.textMuted }}>
                    Ticket Number
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: t.text,
                      letterSpacing: "0.08em",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {ticket.ticketNumber}
                  </p>
                </div>
                {amountPaid !== null && (
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: t.textMuted }}>
                      Amount Paid
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: t.text,
                      }}
                    >
                      {currency} {amountPaid.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Receipt link */}
            {charge?.receipt_url && (
              <a
                href={charge.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: t.accent,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  marginBottom: "1.5rem",
                }}
              >
                <Download size={15} />
                Download payment receipt
              </a>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/profile/tickets"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: t.accent,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "0.8rem 1.25rem",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                View My Tickets
                <ArrowRight size={16} />
              </Link>

              <Link
                href={`/events/${event.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "transparent",
                  color: t.textMuted,
                  border: `1px solid ${t.border}`,
                  borderRadius: 10,
                  padding: "0.8rem 1.25rem",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                Back to Event
              </Link>
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            color: t.textMuted,
            fontSize: "0.8rem",
            marginTop: "1.5rem",
          }}
        >
          A confirmation has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}

export default async function PaymentSuccessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    redirect(`/events/${id}?payment=cancelled`);
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
            color: "#888",
          }}
        >
          Verifying your payment…
        </div>
      }
    >
      <SuccessContent eventId={id} sessionId={sessionId} />
    </Suspense>
  );
}
