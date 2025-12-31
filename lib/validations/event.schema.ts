import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category: z.string(),

  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string(),

  isOnline: z.boolean(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  meetingLink: z.string().url().optional(),

  capacity: z.number().int().positive(),
  registrationDeadline: z.string().datetime(),
  approvalRequired: z.boolean(),

  eventType: z.enum(["FREE", "PAID"]),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
});
