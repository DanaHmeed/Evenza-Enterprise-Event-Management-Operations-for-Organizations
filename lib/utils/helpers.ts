/**
 * Generate a URL-friendly slug from a title.
 * "My Cool Event!" → "my-cool-event-a3x9"
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Generate a unique ticket number: "EVZ-XXXX-XXXX"
 */
export function generateTicketNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  const part2 = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `EVZ-${part1}-${part2}`;
}

/**
 * Generate a QR code data string for a ticket.
 */
export function generateQRData(ticketId: string, eventId: string): string {
  return JSON.stringify({
    ticketId,
    eventId,
    timestamp: Date.now(),
    hash: Math.random().toString(36).substring(2, 10),
  });
}