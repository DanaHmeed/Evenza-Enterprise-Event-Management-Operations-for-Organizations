import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CreateEventForm } from "@/components/forms/CreateEventForm";

export default async function CreateEventPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "USER") redirect("/");

  return <CreateEventForm />;
}
