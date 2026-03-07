// app/api/admin/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-role";

type Params = { params: Promise<{ messageId: string }> };

// PATCH — mark as read
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (isAuthError(auth)) return auth;
    const { messageId } = await params;

    const msg = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: true, repliedBy: auth.userId },
    });

    return NextResponse.json({ success: true, data: msg });
  } catch (error) {
    console.error("[ADMIN_MESSAGE_PATCH]", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (isAuthError(auth)) return auth;
    const { messageId } = await params;

    await prisma.contactMessage.delete({ where: { id: messageId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_MESSAGE_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}