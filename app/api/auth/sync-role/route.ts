import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

// POST /api/auth/sync-role
// Stamps the user's DB role into Clerk publicMetadata so future requests
// can read it instantly without a DB roundtrip.
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: user.role },
  });

  return NextResponse.json({ success: true, role: user.role });
}
