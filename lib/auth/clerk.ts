import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function syncUser() {
  const user = await currentUser();

  if (!user) return null;

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existing) {
    // Keep Clerk metadata in sync if it's missing or stale
    const clerkRole = user.publicMetadata?.role as string | undefined;
    if (clerkRole !== existing.role) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: { role: existing.role },
      });
    }
    return existing;
  }

  const created = await prisma.user.create({
    data: {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses[0].emailAddress,
      role: "USER",
    },
  });

  // Stamp role onto Clerk session so client reads it without an API call
  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { role: "USER" },
  });

  return created;
}
