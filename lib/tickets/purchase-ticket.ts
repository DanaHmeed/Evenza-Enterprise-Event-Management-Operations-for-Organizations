import { prisma } from "@/lib/db/prisma";
import { Prisma, PaymentMethod } from "@/lib/generated/prisma/client";

export async function purchaseTicket({
  userId,
  eventId,
  paymentMethod,
  paymentRef,
}: {
  userId: string;
  eventId: string;
  paymentMethod:PaymentMethod;
  paymentRef: string;
}) {

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const event = (await tx.event.findUnique({
      where: { id: eventId },
    })) as Prisma.EventGetPayload<{}>;

    if (!event) throw new Error("Event not found");
    if (event.seatsRemaining <= 0) throw new Error("Sold out");

    // Decrease seats
    await tx.event.update({
      where: { id: eventId },
      data: { seatsRemaining: { decrement: 1 } },
    });

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        eventId,
        amount: event.price ?? 0,
        currency: event.currency ?? "ILS",
        paymentMethod,
        paymentStatus: "PAID",
        stripeSessionId: paymentRef,
      },
    });

    // Create ticket
    const ticket = await tx.ticket.create({
      data: {
        userId,
        eventId,
        price: event.price ?? 0,
        currency: event.currency ?? "ILS",
        status: "PAID",
      },
    });

    return { order, ticket };
  });
}
