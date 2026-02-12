import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(5000),
  summary: z.string().max(200).optional(),
  categoryId: z.string().cuid(), 

  // Tags (new — for the Tag many-to-many relation)
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),

  // Dates
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default("Asia/Hebron"),
  registrationDeadline: z.string().datetime(),

  // Location
  isOnline: z.boolean(),
  venueName: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  meetingLink: z.string().url().optional(),

  // Capacity & Approval
  capacity: z.number().int().positive().max(100000),
  waitlistEnabled: z.boolean().default(false),
  approvalRequired: z.boolean().default(false),

  // Pricing
  eventType: z.enum(["FREE", "PAID"]),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),

  // Media
  banner: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(10).optional(),
  videoUrl: z.string().url().optional(),

  // Status
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})
// ── Your conditional refinements (kept — these are great) ──
.refine(
  (data) => {
    if (data.eventType === "PAID") {
      return data.price !== undefined && data.price > 0 && data.currency !== undefined;
    }
    return true;
  },
  {
    message: "Paid events must have a price greater than 0 and a currency",
    path: ["price"],
  }
)
.refine(
  (data) => {
    if (data.isOnline) {
      return data.meetingLink !== undefined && data.meetingLink.length > 0;
    }
    return true;
  },
  {
    message: "Online events must have a meeting link",
    path: ["meetingLink"],
  }
)
.refine(
  (data) => {
    if (!data.isOnline) {
      return data.venueName && data.address && data.city;
    }
    return true;
  },
  {
    message: "Physical events must have venue name, address, and city",
    path: ["venueName"],
  }
)
.refine(
  (data) => {
    return new Date(data.endDate) > new Date(data.startDate);
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
)
.refine(
  (data) => {
    return new Date(data.registrationDeadline) < new Date(data.startDate);
  },
  {
    message: "Registration deadline must be before event start date",
    path: ["registrationDeadline"],
  }
);

// For updating events — all fields optional, status allows all values
export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  summary: z.string().max(200).optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),

  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timezone: z.string().optional(),
  registrationDeadline: z.string().datetime().optional(),

  isOnline: z.boolean().optional(),
  venueName: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  meetingLink: z.string().url().optional(),

  capacity: z.number().int().positive().max(100000).optional(),
  waitlistEnabled: z.boolean().optional(),
  approvalRequired: z.boolean().optional(),

  eventType: z.enum(["FREE", "PAID"]).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),

  banner: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(10).optional(),
  videoUrl: z.string().url().optional(),

  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  cancelReason: z.string().max(500).optional(),
});

// For filtering/searching events (yours — kept as-is, just updated field name)
export const eventFilterSchema = z.object({
  categoryId: z.string().optional(),
  eventType: z.enum(["FREE", "PAID"]).optional(),
  isOnline: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  city: z.string().optional(),
});

// Type exports
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;