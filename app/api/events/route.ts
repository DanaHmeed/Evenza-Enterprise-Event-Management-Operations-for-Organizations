import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createEventSchema } from "@/lib/validations/event.schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const data = createEventSchema.parse(body);

  const event = await prisma.event.create({
    data: {
      ...data,
      organizerId: userId,
      seatsRemaining: data.capacity,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
