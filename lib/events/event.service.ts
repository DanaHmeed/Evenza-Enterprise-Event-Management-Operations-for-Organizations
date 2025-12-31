import { prisma } from "@/lib/db/prisma";

export async function createEvent(organizerId: string, data: any) {
  return prisma.event.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      seatsRemaining: data.capacity,
      organizerId,
    },
  });
}

export async function listPublishedEvents() {
  return prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "asc" },
  });
}
