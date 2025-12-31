import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function syncUserToDatabase() {
  const user = await currentUser();

  if (!user) return null;

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existingUser) return existingUser;

  return prisma.user.create({
    data: {
      id: user.id, // Clerk userId
      email: user.emailAddresses[0].emailAddress,
      role: "USER",
    },
  });
}
