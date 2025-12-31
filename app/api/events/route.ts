import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createEventSchema } from "@/lib/validations/event.schema";
import { createEvent, listPublishedEvents } from "@/lib/events/event.service";
import { requireRole } from "@/lib/auth/require-role";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  await requireRole(userId, "ORGANIZER");

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const event = await createEvent(userId, parsed.data);
  return NextResponse.json(event, { status: 201 });
}

export async function GET() {
  const events = await listPublishedEvents();
  return NextResponse.json(events);
}
