import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function syncUser() {
  const user = await currentUser();

  if (!user) return null;

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      role: "USER",
    },
  });
}
