import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/require-role";
import prisma from "@/lib/db/prisma";
import TicketsView from "./TicketsView";

export default async function MyTicketsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const tickets = await prisma.ticket.findMany({
    where: { userId: currentUser.userId },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      qrCode: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          title: true,
          banner: true,
          startDate: true,
          endDate: true,
          isOnline: true,
          venueName: true,
          city: true,
        },
      },
      registration: {
        select: {
          status: true,
          checkedIn: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = tickets.map((tk) => ({
    ...tk,
    createdAt: tk.createdAt.toISOString(),
    event: {
      ...tk.event,
      startDate: tk.event.startDate.toISOString(),
      endDate: tk.event.endDate.toISOString(),
    },
  }));

  return <TicketsView tickets={serialized} />;
}
