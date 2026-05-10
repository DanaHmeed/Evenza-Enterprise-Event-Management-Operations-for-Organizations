import { resend } from "./client";
import { waitlistSpotEmailHtml, waitlistSpotEmailText } from "./templates/waitlist-spot";

const FROM_ADDRESS = "Evenza <onboarding@resend.dev>";

interface SendWaitlistSpotEmailParams {
  toEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
}

export async function sendWaitlistSpotEmail(params: SendWaitlistSpotEmailParams) {
  const { toEmail, ...templateParams } = params;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: `🎉 A spot opened up for "${params.eventTitle}"`,
    html: waitlistSpotEmailHtml(templateParams),
    text: waitlistSpotEmailText(templateParams),
  });

  if (error) {
    console.error("[sendWaitlistSpotEmail] Failed to send email:", error);
  }
}
