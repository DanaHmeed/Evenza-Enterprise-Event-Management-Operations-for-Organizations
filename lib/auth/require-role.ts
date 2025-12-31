import { prisma } from "@/lib/db/prisma";

export async function requireRole(userId: string, role: "USER" | "ORGANIZER" | "ADMIN") {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== role) {
    throw new Error("Forbidden");
  }

  return user;
}
