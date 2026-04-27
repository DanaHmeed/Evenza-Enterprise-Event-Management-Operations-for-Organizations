// app/(root)/my-hub/page.tsx
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  ChevronRight,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getHubSummary, type HubData, type HubEvent, type HubRegistration } from "@/lib/my-hub/getHubSummary";

export const dynamic = "force-dynamic";

const t = {
  bg: "#fafaf8",
  surface: "#ffffff",
  border: "#e8e8e4",
  borderLight: "#ebebea",
  text: "#000000",
  textSecondary: "#555555",
  textMuted: "#aaaaaa",
  textFaint: "#cccccc",
  sans: "'DM Sans', sans-serif",
};

const fullDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const timeOnly = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const daysUntil = (d: string) =>
  Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const countdownLabel = (days: number) => {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

export default async function MyHubPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/my-hub");
  }

  const data = await getHubSummary(userId);

  if (!data) {
    return (
      <div style={{ background: t.bg, minHeight: "100vh", fontFamily: t.sans }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 32px" }}>
          <p style={{ color: t.text }}>Unable to load hub data.</p>
        </div>
      </div>
    );
  }

  const greeting = getGreeting();
  const nextEvent = data.upcoming[0] ?? null;
  const nextDays = nextEvent ? daysUntil(nextEvent.event.startDate) : null;
  const firstName = data.userName?.split(" ")[0] || "there";

  const statRows = [
    { label: "Upcoming", value: data.stats.upcomingCount },
    { label: "Attended", value: data.stats.eventsAttended },
    { label: "Registered", value: data.stats.totalRegistrations },
    { label: "Reviews", value: data.stats.reviewsGiven },
  ];

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: t.sans }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 32px 80px" }}>
        <div
          style={{
            paddingBottom: "28px",
            borderBottom: `1px solid ${t.borderLight}`,
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  letterSpacing: "-0.02em",
                  color: t.text,
                  margin: 0,
                }}
              >
                {greeting}, {firstName}
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: t.textSecondary,
                  fontWeight: 400,
                  margin: "5px 0 0",
                }}
              >
                {nextEvent
                  ? `Next event: ${nextEvent.event.title}`
                  : "No upcoming events - discover something new"}
              </p>
            </div>

            {nextDays !== null && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 14px",
                  background: t.surface,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: t.textSecondary,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: t.text,
                  }}
                />
                {countdownLabel(nextDays)}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          {statRows.map((s) => (
            <div
              key={s.label}
              style={{
                background: t.surface,
                border: `1px solid ${t.borderLight}`,
                borderRadius: "8px",
                padding: "18px 20px",
              }}
            >
              <p
                style={{
                  fontSize: "26px",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  color: t.text,
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 300,
                  color: t.textSecondary,
                  margin: "5px 0 0",
                  letterSpacing: "0.02em",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <Section
          title="Coming Up"
          action={data.upcoming.length > 4 ? { label: "View all", href: "/profile/events" } : undefined}
        >
          {data.upcoming.length === 0 ? (
            <EmptyState message="No upcoming events" cta="Discover Events" href="/events" />
          ) : (
            data.upcoming.slice(0, 4).map((reg) => <UpcomingCard key={reg.id} reg={reg} />)
          )}
        </Section>

        {data.recommended.length > 0 && (
          <Section title="Recommended for You" action={{ label: "Browse all", href: "/events" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {data.recommended.slice(0, 3).map((event) => (
                <RecommendedCard key={event.id} event={event} />
              ))}
            </div>
          </Section>
        )}

        {data.past.length > 0 && (
          <Section
            title="Event History"
            action={data.past.length > 5 ? { label: "View all", href: "/profile/events" } : undefined}
          >
            {data.past.slice(0, 5).map((reg) => (
              <PastRow key={reg.id} reg={reg} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: t.textSecondary,
          }}
        >
          {title}
        </span>
        {action && (
          <Link
            href={action.href}
            style={{
              fontSize: "12px",
              fontWeight: 400,
              color: "#888",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {action.label}
            <ArrowRight style={{ width: "11px", height: "11px" }} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function UpcomingCard({ reg }: { reg: HubRegistration }) {
  const days = daysUntil(reg.event.startDate);
  const isToday = days === 0;
  const label = countdownLabel(days);

  return (
    <Link
      href={`/events/${reg.event.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 18px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "8px",
        textDecoration: "none",
        marginBottom: "6px",
        transition: "border-color 0.15s",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "6px",
          overflow: "hidden",
          background: t.borderLight,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {reg.event.banner ? (
          <Image
            src={reg.event.banner}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <CalendarDays style={{ width: "16px", height: "16px", color: t.textFaint }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: t.text,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {reg.event.title}
        </p>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 300,
            color: t.textSecondary,
            margin: "3px 0 0",
          }}
        >
          {fullDate(reg.event.startDate)} · {timeOnly(reg.event.startDate)} ·{" "}
          {reg.event.isOnline ? "Online" : reg.event.city || reg.event.venueName || "TBA"}
        </p>
      </div>

      <div
        style={{
          flexShrink: 0,
          fontSize: "11px",
          fontWeight: 500,
          color: isToday ? t.text : t.textSecondary,
          background: isToday ? "#f0f0ec" : t.bg,
          border: `1px solid ${isToday ? t.border : t.borderLight}`,
          padding: "4px 10px",
          borderRadius: "5px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </Link>
  );
}

function RecommendedCard({ event }: { event: HubEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100px",
          background: t.borderLight,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {event.banner ? (
          <Image
            src={event.banner}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles style={{ width: "20px", height: "20px", color: t.textFaint }} />
          </div>
        )}

        {event.category && (
          <span
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              fontSize: "9px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "3px 7px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.9)",
              color: t.textSecondary,
            }}
          >
            {event.category}
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: t.text,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {event.title}
        </p>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 300,
            color: t.textSecondary,
            margin: "4px 0 0",
          }}
        >
          {shortDate(event.startDate)} · {event.isOnline ? "Online" : event.city || "TBA"}
        </p>
      </div>
    </Link>
  );
}

function PastRow({ reg }: { reg: HubRegistration }) {
  const statusOk = ["APPROVED", "ATTENDED"].includes(reg.status);

  return (
    <Link
      href={`/events/${reg.event.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "11px 16px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        textDecoration: "none",
        marginBottom: "5px",
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ width: "36px", textAlign: "center", flexShrink: 0 }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: t.textFaint,
            margin: 0,
          }}
        >
          {new Date(reg.event.startDate).toLocaleDateString("en-US", { month: "short" })}
        </p>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            color: t.text,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {new Date(reg.event.startDate).getDate()}
        </p>
      </div>

      <div style={{ width: "1px", height: "24px", background: t.borderLight, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: t.text,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {reg.event.title}
        </p>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 300,
            color: t.textFaint,
            margin: "2px 0 0",
          }}
        >
          {reg.event.isOnline ? "Online" : reg.event.city || "TBA"}
        </p>
      </div>

      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: statusOk ? "#bbb" : t.borderLight,
          flexShrink: 0,
        }}
      />
      <ChevronRight style={{ width: "13px", height: "13px", color: t.borderLight, flexShrink: 0 }} />
    </Link>
  );
}

function EmptyState({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "8px",
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <CalendarDays
        style={{
          width: "28px",
          height: "28px",
          color: t.borderLight,
          margin: "0 auto 12px",
          display: "block",
        }}
      />
      <p
        style={{
          fontSize: "13px",
          fontWeight: 300,
          color: t.textSecondary,
          margin: "0 0 14px",
        }}
      >
        {message}
      </p>
      <Link
        href={href}
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: t.text,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        {cta} <ArrowRight style={{ width: "12px", height: "12px" }} />
      </Link>
    </div>
  );
}