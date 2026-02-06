import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(5000),
  category: z.string().min(1),
  
  // Dates
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string(),
  registrationDeadline: z.string().datetime(),
  
  // Location 
  isOnline: z.boolean(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(), 
  meetingLink: z.string().url().optional(),
  
  // Capacity & Approval
  capacity: z.number().int().positive(),
  approvalRequired: z.boolean().default(false),
  
  // Pricing
  eventType: z.enum(["FREE", "PAID"]),
  price: z.number().min(0).optional(), 
  currency: z.string().length(3).optional(), 
  
  // Media
  banner: z.string().url().optional(),
  
  // Status (for draft/publish)
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})
// conditional refinements
.refine(
  (data) => {
    // If paid event, price and currency are required
    if (data.eventType === "PAID") {
      return data.price !== undefined && data.price > 0 && data.currency !== undefined;
    }
    return true;
  },
  {
    message: "Paid events must have a price and currency",
    path: ["price"],
  }
)
.refine(
  (data) => {
    // If online, meetingLink is required
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
    // If physical, venue details required
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
    // End date must be after start date
    return new Date(data.endDate) > new Date(data.startDate);
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
)
.refine(
  (data) => {
    // Registration deadline should be before start date
    return new Date(data.registrationDeadline) < new Date(data.startDate);
  },
  {
    message: "Registration deadline must be before event start date",
    path: ["registrationDeadline"],
  }
);

// For updating events (all fields optional except ID)
export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().cuid(),
});

// For filtering/searching events
export const eventFilterSchema = z.object({
  category: z.string().optional(),
  eventType: z.enum(["FREE", "PAID"]).optional(),
  isOnline: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(), // For keyword search
  city: z.string().optional(),
});