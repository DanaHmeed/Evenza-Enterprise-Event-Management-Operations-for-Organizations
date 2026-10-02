import Link from "next/link";
import styles from "./PlatformJourney.module.css";

const stages = [
  { phase: "Before the event", title: "Make it yours.", description: "Publish an event page with your banner, date, location, and ticket options.", detail: "Event pages & capacity controls" },
  { phase: "Registration", title: "Bring people in.", description: "Take free registrations or sell tickets. Keep bookings and attendee details together.", detail: "Registration & secure payments" },
  { phase: "At the door", title: "Keep arrivals moving.", description: "Scan each ticket’s QR code from your phone and confirm who has arrived.", detail: "QR tickets & check-in" },
  { phase: "After the event", title: "See the full picture.", description: "Review attendance, revenue, and attendee feedback in your organizer dashboard.", detail: "Analytics & feedback" },
];

export default function PlatformJourney() {
  return (
    <section className={`landing-section landing-section--dark ${styles.section}`} aria-labelledby="platform-journey-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Built for the whole event</p>
            <h2 id="platform-journey-title" className={styles.title}>From registration<br />to <em>check-in.</em></h2>
          </div>
          <div className={styles.intro}>
            <p>One platform handles it all. Plan the details, welcome your guests, and follow up with everything in one place.</p>
            <Link href="/#platform" className={styles.link}>Explore the platform <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" /></svg></Link>
          </div>
        </header>

        <ol className={styles.journey} aria-label="Your event with Evenza">
          {stages.map((stage, index) => (
            <li key={stage.phase} className={styles.stage}>
              <div className={styles.stageTop}><span className={styles.number} aria-hidden="true">0{index + 1}</span><span className={styles.phase}>{stage.phase}</span></div>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <span className={styles.detail}>{stage.detail}</span>
            </li>
          ))}
        </ol>

        <footer className={styles.footer}>
          <p>In a room. On a screen. Or both.</p>
          <ul aria-label="Supported event formats"><li>In person</li><li>Online</li><li>Hybrid</li></ul>
          <Link href="/events" className={styles.link}>Find your next event <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" /></svg></Link>
        </footer>
      </div>
    </section>
  );
}
