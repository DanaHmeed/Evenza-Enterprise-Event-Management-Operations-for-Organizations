import { z } from "zod";

export const purchaseTicketSchema = z.object({
  eventId: z.string().cuid(),
});

export const validateTicketSchema = z.object({
  ticketNumber: z.string(),
  eventId: z.string().cuid(),
});