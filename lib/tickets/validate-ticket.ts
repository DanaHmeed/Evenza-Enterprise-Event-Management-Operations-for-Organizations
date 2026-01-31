import { prisma } from "@/lib/db/prisma";

export async function validateTicket({
  ticketId,
  organizerId,
}: {
  ticketId: string;
  organizerId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.status !== "PAID") {
      throw new Error("Ticket not paid");
    }

    if (ticket.isUsed) {
      throw new Error("Ticket already used");
    }

    if (ticket.event.organizerId !== organizerId) {
      throw new Error("Not authorized to validate this ticket");
    }

    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Entry granted",
    };
  });
}
