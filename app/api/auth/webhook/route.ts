import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { syncUser, deleteUser } from "@/lib/auth/sync-user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[WEBHOOK] Missing CLERK_WEBHOOK_SECRET env variable");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[WEBHOOK] Verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const eventType = event.type;

  try {
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url, phone_numbers } =
          event.data;

        const primaryEmail = email_addresses?.find(
          (e) => e.id === event.data.primary_email_address_id
        );

        if (!primaryEmail) {
          console.error("[WEBHOOK] No primary email found for user:", id);
          return NextResponse.json(
            { error: "No primary email" },
            { status: 400 }
          );
        }

        const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
        const phone = phone_numbers?.[0]?.phone_number ?? null;

        await syncUser({
          clerkId: id,
          email: primaryEmail.email_address,
          name,
          avatar: image_url ?? null,
          phone,
        });

        console.log(`[WEBHOOK] User ${eventType}: ${id} (${primaryEmail.email_address})`);
        break;
      }

      case "user.deleted": {
        const { id } = event.data;
        if (id) {
          await deleteUser(id);
          console.log(`[WEBHOOK] User deleted: ${id}`);
        }
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`[WEBHOOK] Error processing ${eventType}:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}