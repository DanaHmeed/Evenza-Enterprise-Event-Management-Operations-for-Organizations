import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";
import { createEventSchema } from "@/lib/validations/event.schema";
import { generateSlug } from "@/lib/utils/helpers";
import { ZodError } from "zod";

// GET - Browse all published events (public) with filters & pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const skip = (page - 1) * pageSize;

    // Filters
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const city = searchParams.get("city");
    const eventType = searchParams.get("eventType"); // FREE or PAID
    const isOnline = searchParams.get("isOnline");
    const startAfter = searchParams.get("startAfter");
    const startBefore = searchParams.get("startBefore");
    const sortBy = searchParams.get("sortBy") || "startDate"; // startDate, createdAt, title
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build where clause
   const status = searchParams.get("status");
    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    } else if (!searchParams.get("all")) {
      where.status = "PUBLISHED";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { venueName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (eventType) where.eventType = eventType;
    if (isOnline !== null && isOnline !== undefined) {
      where.isOnline = isOnline === "true";
    }
    if (startAfter || startBefore) {
      where.startDate = {};
      if (startAfter) (where.startDate as Record<string, unknown>).gte = new Date(startAfter);
      if (startBefore) (where.startDate as Record<string, unknown>).lte = new Date(startBefore);
    }

    // Validate sort
    const allowedSortFields = ["startDate", "createdAt", "title", "price"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "startDate";
    const safeSortOrder = sortOrder === "desc" ? "desc" : "asc";

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, name: true, avatar: true },
          },
          category: {
            select: { id: true, name: true, slug: true, color: true },
          },
          tags: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { registrations: true, feedbacks: true },
          },
        },
        orderBy: { [safeSortBy]: safeSortOrder },
        skip,
        take: pageSize,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create a new event (organizer/admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizer();
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Validate dates
    const start = new Date(validatedData.startDate);
    const end = new Date(validatedData.endDate);
    const deadline = new Date(validatedData.registrationDeadline);

    if (end <= start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (deadline >= start) {
      return NextResponse.json(
        { error: "Registration deadline must be before event start date" },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(validatedData.title);

    // Handle tags — connect existing or create new
    const tagConnections = validatedData.tags
      ? await Promise.all(
          validatedData.tags.map(async (tagName) => {
            const tag = await prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, "-"),
              },
            });
            return { id: tag.id };
          })
        )
      : [];

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        summary: validatedData.summary,
        categoryId: validatedData.categoryId,
        tags: { connect: tagConnections },

        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        timezone: validatedData.timezone,
        registrationDeadline: validatedData.registrationDeadline,

        isOnline: validatedData.isOnline,
        venueName: validatedData.venueName,
        address: validatedData.address,
        city: validatedData.city,
        country: validatedData.country,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        meetingLink: validatedData.meetingLink,

        capacity: validatedData.capacity,
        seatsRemaining: validatedData.capacity,
        waitlistEnabled: validatedData.waitlistEnabled,
        approvalRequired: validatedData.approvalRequired,

        eventType: validatedData.eventType,
        price: validatedData.eventType === "PAID" ? validatedData.price : 0,
        currency: validatedData.currency,

        banner: validatedData.banner,
        gallery: validatedData.gallery || [],
        videoUrl: validatedData.videoUrl,

        status: validatedData.status,
        publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,

        organizerId: authResult.userId,
      },
      include: {
        category: true,
        tags: true,
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: event, message: "Event created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[EVENTS_POST]", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}