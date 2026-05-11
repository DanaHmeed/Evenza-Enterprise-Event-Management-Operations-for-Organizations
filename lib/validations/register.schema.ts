import { z } from "zod";

export const registerForEventSchema = z.object({
  eventId: z.string().cuid(),
});

export const approveRegistrationSchema = z.object({
  registrationId: z.string().cuid(),
  approved: z.boolean(),
});