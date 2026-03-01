// app/api/events/[eventId]/registration-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

type Params = { params: Promise<{ eventId: string }> };

// GET — check if current user is registered for this event
// This is a lightweight endpoint any signed-in user can call
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    const { eventId } = await params;

    if (!userId) {
      return NextResponse.json({ registered: false });
    }

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
      select: {
        id: true,
        status: true,
        checkedIn: true,
        ticket: {
          select: {
            ticketNumber: true,
            status: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ registered: false });
    }

    return NextResponse.json({
      registered: true,
      status: registration.status,
      checkedIn: registration.checkedIn,
      registrationId: registration.id,
      ticket: registration.ticket || null,
    });
  } catch (error) {
    console.error("[REGISTRATION_STATUS_GET]", error);
    return NextResponse.json({ registered: false });
  }
}