// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Evenza Assistant, a helpful AI built into the Evenza event management platform.
You help users navigate the platform, answer questions about events, tickets, and registrations, and provide general assistance.

About Evenza:
- Evenza is an event management platform where users can discover, register for, and attend events.
- Users can browse events, purchase tickets (via Stripe or bank transfer), and manage their registrations.
- Organizers can create and manage events, track attendees, view analytics, and handle revenue.
- Admins manage the entire platform including users, categories, orders, and statistics.
- Users have a personal "MyHub" dashboard showing their event history and stats.
- Events can be free or paid; paid tickets are handled securely via Stripe.
- Users can leave feedback and ratings after attending events.
- The platform supports multiple roles: regular user, organizer, and admin.

How you help:
- Guide users on how to find and register for events
- Explain how tickets and payments work
- Help organizers understand dashboard features
- Answer general questions about the platform
- Be friendly, concise, and helpful

Keep responses short and conversational (2-4 sentences max unless a detailed explanation is truly needed).
If you do not know something specific about the platform current data, say so honestly and suggest where the user can find the answer.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Groq API error:", JSON.stringify(error));
      return NextResponse.json(
        { error: `Groq error: ${error?.error?.message ?? response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}