import { z } from "zod";

export const registerForEventSchema = z.object({
  eventId: z.string().cuid(),
  // Add any additional fields if needed (e.g., dietary restrictions, questions)
});

export const approveRegistrationSchema = z.object({
  registrationId: z.string().cuid(),
  approved: z.boolean(),
});