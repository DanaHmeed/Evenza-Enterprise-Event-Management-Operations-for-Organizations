import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";
import { generateTicketNumber, generateQRData } from "@/lib/utils/helpers";

type Params = { params: Promise<{ eventId: string }> };

const PAGE_SIZE = 20;

// GET - Get attendee list with server-side pagination, filtering, and search
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * PAGE_SIZE;

    /* ── Build shared where clause ── */
    const where = {
      eventId,
      ...(status && status !== "ALL" && {
        status: status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED",
      }),
      ...(search && {
        user: {
          OR: [
            { name:  { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }),
    };

    /* ── Run data + filtered count in parallel ── */
    const [attendees, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        select: {
          id: true,
          status: true,
          checkedIn: true,
          checkedInAt: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          ticket: {
            select: { ticketNumber: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),

      prisma.registration.count({ where }),
    ]);

    /* ── Stats via COUNT queries — no JS filtering of large arrays ── */
    const [statusGroups, checkedInCount, grandTotal] = await Promise.all([
      prisma.registration.groupBy({
        by: ["status"],
        where: { eventId },
        _count: { status: true },
      }),
      prisma.registration.count({ where: { eventId, checkedIn: true } }),
      prisma.registration.count({ where: { eventId } }),
    ]);

    const sm = Object.fromEntries(statusGroups.map((r) => [r.status, r._count.status]));
    const stats = {
      total:     grandTotal,
      approved:  sm["APPROVED"]  ?? 0,
      pending:   sm["PENDING"]   ?? 0,
      rejected:  sm["REJECTED"]  ?? 0,
      cancelled: sm["CANCELLED"] ?? 0,
      checkedIn: checkedInCount,
    };

    return NextResponse.json({
      success: true,
      data: {
        attendees,
        stats,
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      },
    });
  } catch (error) {
    console.error("[ATTENDEES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 });
  }
}

// PATCH - Approve/Reject registration
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true, currency: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== currentUser.userId && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { registrationId, status } = body;

    if (!registrationId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid registrationId and status (APPROVED/REJECTED) required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedRegistration = await tx.registration.update({
        where: { id: registrationId },
        data: { status },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      let ticket = null;
      if (status === "APPROVED") {
        const ticketNumber = generateTicketNumber();
        ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            qrCode: generateQRData(registrationId, eventId),
            eventId,
            userId: updatedRegistration.userId,
            registrationId,
            price: 0,
            currency: event.currency || "USD",
            status: "PAID",
          },
        });
      }

      if (status === "REJECTED") {
        await tx.event.update({
          where: { id: eventId },
          data: { seatsRemaining: { increment: 1 } },
        });
      }

      await tx.notification.create({
        data: {
          userId: updatedRegistration.userId,
          type: status === "APPROVED" ? "REGISTRATION_APPROVED" : "REGISTRATION_REJECTED",
          title: status === "APPROVED" ? "Registration Approved!" : "Registration Rejected",
          message: status === "APPROVED"
            ? `Your registration for "${event.title}" has been approved. Your ticket is ready!`
            : `Your registration for "${event.title}" was not approved.`,
          link: `/events/${eventId}`,
        },
      });

      return { registration: updatedRegistration, ticket };
    });

    return NextResponse.json({
      success: true,
      message: `Registration ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    console.error("[ATTENDEES_PATCH]", error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}