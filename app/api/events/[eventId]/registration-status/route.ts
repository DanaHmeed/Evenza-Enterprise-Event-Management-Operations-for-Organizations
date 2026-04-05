// app/api/events/[eventId]/registration-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;

    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ registered: false });
    }

    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: authResult.userId, eventId } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            qrCode: true,
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
      registrationId: registration.id,
      createdAt: registration.createdAt,
      ticket: registration.ticket ?? null,
    });
  } catch (error) {
    console.error("[REGISTRATION_STATUS_GET]", error);
    return NextResponse.json({ registered: false });
  }
}
