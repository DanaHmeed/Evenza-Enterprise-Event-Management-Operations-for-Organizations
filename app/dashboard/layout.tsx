import { auth } from "@clerk/nextjs/server";
import { requireRole } from "@/lib/auth/require-role";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await requireRole(userId, "ORGANIZER");

  return <>{children}</>;
}
