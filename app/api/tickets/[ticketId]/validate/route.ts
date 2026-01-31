import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateTicket } from "@/lib/tickets/validate-ticket";

export async function POST(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const result = await validateTicket({
      ticketId: params.ticketId,
      organizerId: userId,
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
  const message = e instanceof Error ? e.message : "Something went wrong";
    return new NextResponse(message, { status: 400 });
  }
}
