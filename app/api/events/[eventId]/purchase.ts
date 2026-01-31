import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { purchaseTicket } from "@/lib/tickets/purchase-ticket";

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { paymentMethod, paymentRef } = await req.json();

  try {
    const result = await purchaseTicket({
      userId,
      eventId: params.eventId,
      paymentMethod,
      paymentRef,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 400 });
  }
}
