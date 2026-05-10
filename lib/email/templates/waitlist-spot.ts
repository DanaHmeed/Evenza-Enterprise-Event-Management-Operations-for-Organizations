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
  <title>A spot opened up for you — Evenza</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f7f4;font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f4;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #e4e4e0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#111110;padding:36px 44px 32px;">
              <p style="margin:0 0 20px;font-size:11px;font-weight:500;letter-spacing:2px;color:#888884;text-transform:uppercase;">Evenza</p>
              <h1 style="margin:0 0 8px;color:#fafaf8;font-size:22px;font-weight:500;letter-spacing:-0.3px;line-height:1.3;">
                A spot just opened up for you
              </h1>
              <p style="margin:0;color:#888884;font-size:14px;line-height:1.5;">
                You're next in line — act fast before it's gone.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 44px 0;">
              <p style="margin:0 0 6px;color:#888884;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">Hello</p>
              <p style="margin:0 0 28px;color:#111110;font-size:15px;line-height:1.6;font-weight:400;">
                ${userName} — someone cancelled their registration and you are now <span style="font-weight:500;">first on the waitlist</span> for the following event.
              </p>

              <!-- Event Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f4;border:1px solid #e4e4e0;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#888884;font-weight:500;">Event</p>
                    <h2 style="margin:0 0 20px;color:#111110;font-size:17px;font-weight:500;line-height:1.4;">
                      ${eventTitle}
                    </h2>
                    <table cellpadding="0" cellspacing="0" style="width:100%;">
                      <tr>
                        <td style="padding:6px 0;border-top:1px solid #e4e4e0;">
                          <span style="color:#888884;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">Date</span>
                        </td>
                        <td style="padding:6px 0;border-top:1px solid #e4e4e0;text-align:right;">
                          <span style="color:#111110;font-size:13px;">${eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-top:1px solid #e4e4e0;">
                          <span style="color:#888884;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">Location</span>
                        </td>
                        <td style="padding:6px 0;border-top:1px solid #e4e4e0;text-align:right;">
                          <span style="color:#111110;font-size:13px;">${eventLocation}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-left:2px solid #111110;padding:12px 16px;background-color:#f7f7f4;">
                    <p style="margin:0;color:#444440;font-size:13px;line-height:1.6;">
                      This spot will not be held indefinitely. If you do not register in time, it will be offered to the next person on the waitlist.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  <td>
                    <a href="${eventUrl}"
                       style="display:inline-block;background-color:#111110;color:#fafaf8;text-decoration:none;font-size:13px;font-weight:500;padding:12px 28px;border-radius:3px;letter-spacing:0.5px;">
                      Claim My Spot
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 44px;">
              <hr style="border:none;border-top:1px solid #e4e4e0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 44px;">
              <p style="margin:0 0 4px;color:#aaaaaa;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Evenza</p>
              <p style="margin:0;color:#bbbbbb;font-size:11px;line-height:1.6;">
                You're receiving this because you joined the waitlist for this event.
                &nbsp;© ${new Date().getFullYear()} Evenza. All rights reserved.
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