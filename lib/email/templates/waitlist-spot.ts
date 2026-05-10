interface WaitlistSpotEmailProps {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
}

export function waitlistSpotEmailHtml({
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  eventUrl,
}: WaitlistSpotEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A spot opened up for you!</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 48px;text-align:center;">
              <div style="font-size:42px;margin-bottom:12px;">🎉</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                A spot just opened up!
              </h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
                You're next in line — act fast!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Hi <strong>${userName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Great news — someone cancelled their spot and you're <strong>first on the waitlist</strong> for:
              </p>

              <!-- Event Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">
                      ${eventTitle}
                    </h2>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#6b7280;font-size:14px;">📅&nbsp;&nbsp;</span>
                          <span style="color:#374151;font-size:14px;">${eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#6b7280;font-size:14px;">📍&nbsp;&nbsp;</span>
                          <span style="color:#374151;font-size:14px;">${eventLocation}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#6b7280;font-size:14px;line-height:1.6;background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;">
                ⚠️ <strong style="color:#92400e;">This spot won't be held for long.</strong> If you don't register soon it may be taken by the next person on the waitlist.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${eventUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 40px;border-radius:8px;letter-spacing:0.2px;">
                      Claim My Spot →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 48px;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                You're receiving this because you joined the waitlist for this event.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                © ${new Date().getFullYear()} Evenza. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function waitlistSpotEmailText({
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  eventUrl,
}: WaitlistSpotEmailProps): string {
  return `Hi ${userName},

A spot just opened up for ${eventTitle}!

You're first on the waitlist — act fast before it's taken.

Event Details:
- Date: ${eventDate}
- Location: ${eventLocation}

Claim your spot here: ${eventUrl}

This spot won't be held for long.

— The Evenza Team`;
}
