// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import prisma from "@/lib/db/prisma";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    username: string | null;
  };
};

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Get Svix headers
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";

        await prisma.user.upsert({
          where: { id: data.id },
          update: {
            name,
            email,
            avatar: data.image_url,
          },
          create: {
            id: data.id,
            name,
            email,
            avatar: data.image_url,
            role: "USER",
            isActive: true,
          },
        });

        console.log(`[CLERK_WEBHOOK] User created: ${email}`);
        break;
      }

      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";

        await prisma.user.upsert({
          where: { id: data.id },
          update: {
            name,
            email,
            avatar: data.image_url,
          },
          create: {
            id: data.id,
            name,
            email,
            avatar: data.image_url,
            role: "USER",
            isActive: true,
          },
        });

        console.log(`[CLERK_WEBHOOK] User updated: ${email}`);
        break;
      }

      case "user.deleted": {
        // Soft delete — just deactivate
        await prisma.user.updateMany({
          where: { id: data.id },
          data: { isActive: false },
        });

        console.log(`[CLERK_WEBHOOK] User deactivated: ${data.id}`);
        break;
      }

      default:
        console.log(`[CLERK_WEBHOOK] Unhandled event type: ${type}`);
    }
  } catch (error) {
    console.error(`[CLERK_WEBHOOK] Error processing ${type}:`, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}