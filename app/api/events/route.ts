// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";
import { createEventSchema } from "@/lib/validations/event.schema";
import { generateSlug } from "@/lib/utils/helpers";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page     = Math.max(1, parseInt(searchParams.get("page")     || "1",  10) || 1);
    const pageSize = Math.min(
      Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10) || 12),
    );
    const skip = (page - 1) * pageSize;

    const search     = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("categoryId");
    const city       = searchParams.get("city");
    const eventType  = searchParams.get("eventType");
    const isOnline   = searchParams.get("isOnline");
    const startAfter  = searchParams.get("startAfter");
    const startBefore = searchParams.get("startBefore");
    const sortBy    = searchParams.get("sortBy")    || "startDate";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const isAdmin   = searchParams.get("all") === "true";

    // ── Where clause ──────────────────────────────────────────────
    const status = searchParams.get("status");
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    } else if (!isAdmin) {
      where.status = "PUBLISHED";
    }

    if (search) {
      where.OR = [
        { title:     { contains: search, mode: "insensitive" } },
        { city:      { contains: search, mode: "insensitive" } },
        { venueName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (city)       where.city = { contains: city, mode: "insensitive" };
    if (eventType)  where.eventType = eventType;
    if (isOnline !== null && isOnline !== undefined) {
      where.isOnline = isOnline === "true";
    }
    if (startAfter || startBefore) {
      where.startDate = {};
      if (startAfter)  (where.startDate as Record<string, unknown>).gte = new Date(startAfter);
      if (startBefore) (where.startDate as Record<string, unknown>).lte = new Date(startBefore);
    }

    const allowedSortFields = ["startDate", "createdAt", "title", "price"];
    const safeSortBy    = allowedSortFields.includes(sortBy) ? sortBy : "startDate";
    const safeSortOrder = sortOrder === "desc" ? "desc" : "asc";

    // ── Select — lean for public, full for admin ───────────────────
    const publicSelect = {
      id:        true,
      title:     true,
      slug:      true,
      banner:    true,
      summary:   true,
      startDate: true,
      endDate:   true,
      eventType: true,
      price:     true,
      currency:  true,
      isOnline:  true,
      city:      true,
      venueName: true,
      status:    true,
      category:  { select: { id: true, name: true, slug: true, color: true } },
      _count:    { select: { registrations: true } },
    };

    // Admin needs these extra fields for the events management table
    const adminSelect = {
      ...publicSelect,
      banner:         true,
      capacity:       true,
      seatsRemaining: true,
      organizer: {
        select: { id: true, name: true },
      },
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: isAdmin ? adminSelect : publicSelect,
        orderBy: { [safeSortBy]: safeSortOrder },
        skip,
        take: pageSize,
      }),
      prisma.event.count({ where }),
    ]);

    // ── Serialize ─────────────────────────────────────────────────
    const serializedEvents = events.map((e) => {
      const base = {
        id:        e.id,
        slug:      e.slug,
        title:     e.title,
        banner:    e.banner && (e.banner.startsWith("http") || e.banner.startsWith("/")) ? e.banner : null,
        summary:   e.summary ? e.summary.slice(0, 140) : null,
        startDate: e.startDate.toISOString(),
        endDate:   e.endDate.toISOString(),
        eventType: e.eventType,
        price:     e.price,
        currency:  e.currency,
        isOnline:  e.isOnline,
        city:      e.city,
        venueName: e.venueName,
        status:    e.status,
        category:  e.category,
        _count:    e._count,
      };

      if (!isAdmin) return base;

      // For admin — include management fields.
      // If banner is a large base64 string, replace with null to avoid
      // sending KBs of image data in a list response.
      const adminEvent = e as typeof e & {
        banner?: string | null;
        capacity?: number;
        seatsRemaining?: number;
        organizer?: { id: string; name: string } | null;
      };

      const bannerValue = adminEvent.banner;
      const isSafeUrl =
        bannerValue &&
        (bannerValue.startsWith("http") || bannerValue.startsWith("/"));

      return {
        ...base,
        banner:         isSafeUrl ? bannerValue : null,
        capacity:       adminEvent.capacity       ?? 0,
        seatsRemaining: adminEvent.seatsRemaining ?? 0,
        organizer:      adminEvent.organizer      ?? null,
      };
    });

    // ── Cache headers ────────────────────────────────────────────
    // Public listing: cache for 60s, revalidate in background up to 5min
    // Admin listing: no public cache, but allow private browser cache 10s
    const cacheHeader = isAdmin
      ? "private, max-age=10, stale-while-revalidate=30"
      : "public, s-maxage=60, stale-while-revalidate=300";

    return NextResponse.json(
      {
        success: true,
        data: serializedEvents,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": cacheHeader },
      }
    );
  } catch (error) {
    console.error("[EVENTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizer();
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    const start    = new Date(validatedData.startDate);
    const end      = new Date(validatedData.endDate);
    const deadline = new Date(validatedData.registrationDeadline);

    if (end <= start) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }
    if (deadline >= start) {
      return NextResponse.json({ error: "Registration deadline must be before event start date" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id: validatedData.categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const slug = generateSlug(validatedData.title);

    const tagConnections = validatedData.tags
      ? await Promise.all(
          validatedData.tags.map(async (tagName) => {
            const tag = await prisma.tag.upsert({
              where:  { name: tagName },
              update: {},
              create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") },
            });
            return { id: tag.id };
          })
        )
      : [];

    const event = await prisma.event.create({
      data: {
        title:                validatedData.title,
        slug,
        description:          validatedData.description,
        summary:              validatedData.summary,
        categoryId:           validatedData.categoryId,
        tags:                 { connect: tagConnections },
        startDate:            validatedData.startDate,
        endDate:              validatedData.endDate,
        timezone:             validatedData.timezone,
        registrationDeadline: validatedData.registrationDeadline,
        isOnline:             validatedData.isOnline,
        venueName:            validatedData.venueName,
        address:              validatedData.address,
        city:                 validatedData.city,
        country:              validatedData.country,
        latitude:             validatedData.latitude,
        longitude:            validatedData.longitude,
        meetingLink:          validatedData.meetingLink,
        capacity:             validatedData.capacity,
        seatsRemaining:       validatedData.capacity,
        waitlistEnabled:      validatedData.waitlistEnabled,
        approvalRequired:     validatedData.approvalRequired,
        eventType:            validatedData.eventType,
        price:                validatedData.eventType === "PAID" ? validatedData.price : 0,
        currency:             validatedData.currency,
        banner:               validatedData.banner,
        gallery:              validatedData.gallery || [],
        videoUrl:             validatedData.videoUrl,
        status:               validatedData.status,
        publishedAt:          validatedData.status === "PUBLISHED" ? new Date() : null,
        organizerId:          authResult.userId,
      },
      include: {
        category: true,
        tags:     true,
        organizer: { select: { id: true, name: true, avatar: true } },
      },
    });

    try {
      const { revalidateTag } = await import("next/cache");
     // revalidateTag("events");
    } catch { /* revalidation is best-effort */ }

    return NextResponse.json(
      { success: true, data: event, message: "Event created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[EVENTS_POST]", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}