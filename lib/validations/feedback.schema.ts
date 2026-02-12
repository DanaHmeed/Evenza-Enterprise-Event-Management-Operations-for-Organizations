import { z } from "zod";

export const submitFeedbackSchema = z.object({
  eventId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(2000).optional(),
});

export const moderateFeedbackSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectReason: z.string().max(500).optional(),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;