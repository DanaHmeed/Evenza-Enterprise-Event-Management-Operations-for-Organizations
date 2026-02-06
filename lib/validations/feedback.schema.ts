import { z } from "zod";

export const submitFeedbackSchema = z.object({
  eventId: z.string().cuid(),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5), // 1-5 stars
});

export const approveFeedbackSchema = z.object({
  feedbackId: z.string().cuid(),
  approved: z.boolean(),
});