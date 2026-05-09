// prisma/seed.ts
import { config } from "dotenv";
import { createRequire } from "module";

config();

const require = createRequire(import.meta.url);
const path = require("path");
const pg = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require(
  path.join(process.cwd(), "lib", "generated", "prisma")
);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Categories ───
  const categories = [
    { name: "Technology", slug: "technology", color: "#3b82f6" },
    { name: "Business", slug: "business", color: "#10b981" },
    { name: "Education", slug: "education", color: "#8b5cf6" },
    { name: "Social", slug: "social", color: "#ec4899" },
    { name: "Career", slug: "career", color: "#f59e0b" },
    { name: "Health & Wellness", slug: "health-wellness", color: "#14b8a6" },
    { name: "Arts & Culture", slug: "arts-culture", color: "#f43f5e" },
    { name: "Community", slug: "community", color: "#6366f1" },
    { name: "Training", slug: "training", color: "#0ea5e9" },
    { name: "Startup", slug: "startup", color: "#84cc16" },
    { name: "Sports", slug: "sports", color: "#ef4444" },
    { name: "Entertainment", slug: "entertainment", color: "#a855f7" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, color: cat.color },
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // ─── Check if we have an admin user to attach events to ───
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  const organizerUser = await prisma.user.findFirst({
    where: { role: "ORGANIZER" },
  });

  const hostUser = adminUser || organizerUser;

  if (!hostUser) {
    console.log("\n⚠️  No admin or organizer user found in the database.");
    console.log("   Sign up on the app first, then set your role to ADMIN/ORGANIZER.");
    console.log("   Run this seed again after that to create sample events.\n");
    console.log("   To set yourself as admin, run:");
    console.log('   npx prisma studio → open User table → change role to "ADMIN"\n');
    return;
  }

  console.log(`📌 Using "${hostUser.name}" (${hostUser.role}) as event organizer\n`);

  // ─── Fetch created categories ───
  const allCats = await prisma.category.findMany();
  const catMap = Object.fromEntries(allCats.map((c: any) => [c.slug, c.id]));

  // ─── Sample Events ───
  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  const events = [
    {
      title: "Coding Bootcamp 2025",
      slug: "coding-bootcamp-2025",
      summary: "Intensive 3-day coding workshop for beginners",
      description: "Join our intensive coding bootcamp! Learn HTML, CSS, JavaScript, and React from industry experts. Hands-on projects, mentoring sessions, and networking opportunities.\n\nTopics covered:\n- Web fundamentals (HTML/CSS)\n- JavaScript ES6+\n- React & Next.js basics\n- Building your first full-stack app\n- Career guidance & portfolio review",
      startDate: daysFromNow(14),
      endDate: daysFromNow(16),
      registrationDeadline: daysFromNow(12),
      eventType: "PAID",
      price: 40,
      currency: "USD",
      isOnline: false,
      venueName: "An-Najah Innovation Lab",
      address: "Rafidia Campus",
      city: "Nablus",
      country: "Palestine",
      capacity: 50,
      categoryId: catMap["technology"],
      status: "PUBLISHED",
    },
    {
      title: "Women in Business Networking Gala",
      slug: "women-business-networking-gala",
      summary: "Empowering women entrepreneurs and professionals",
      description: "An elegant evening of networking, inspiration, and empowerment. Hear from successful women business leaders, participate in roundtable discussions, and build connections that matter.",
      startDate: daysFromNow(21),
      endDate: daysFromNow(21),
      registrationDeadline: daysFromNow(19),
      eventType: "FREE",
      isOnline: false,
      venueName: "Grand Palace Hotel",
      city: "Ramallah",
      country: "Palestine",
      capacity: 200,
      categoryId: catMap["social"],
      status: "PUBLISHED",
    },
    {
      title: "Digital Marketing Essentials Workshop",
      slug: "digital-marketing-essentials",
      summary: "Learn SEO, social media, and content marketing",
      description: "A comprehensive workshop covering the fundamentals of digital marketing.\n\nYou will learn:\n- SEO fundamentals\n- Social media strategy\n- Content marketing\n- Google Analytics\n- Email marketing basics",
      startDate: daysFromNow(7),
      endDate: daysFromNow(7),
      registrationDeadline: daysFromNow(5),
      eventType: "FREE",
      isOnline: false,
      venueName: "Al-Quds University",
      city: "Nablus",
      country: "Palestine",
      capacity: 100,
      categoryId: catMap["education"],
      status: "PUBLISHED",
    },
    {
      title: "Palestine Career Expo 2025",
      slug: "palestine-career-expo-2025",
      summary: "Connect with top employers across Palestine",
      description: "The largest career fair in Palestine! Over 50 companies hiring in tech, finance, healthcare, and more.\n\nFeatures:\n- Resume review stations\n- Mock interview sessions\n- Industry panels\n- Job board with 200+ openings",
      startDate: daysFromNow(30),
      endDate: daysFromNow(30),
      registrationDeadline: daysFromNow(28),
      eventType: "PAID",
      price: 10,
      currency: "USD",
      isOnline: false,
      venueName: "Ramallah Convention Center",
      city: "Ramallah",
      country: "Palestine",
      capacity: 500,
      categoryId: catMap["career"],
      status: "PUBLISHED",
    },
    {
      title: "Tech for Good Training",
      slug: "tech-for-good-training",
      summary: "Using technology to solve social challenges",
      description: "An online training program exploring how technology can address social, environmental, and community challenges.",
      startDate: daysFromNow(10),
      endDate: daysFromNow(10),
      registrationDeadline: daysFromNow(8),
      eventType: "PAID",
      price: 20,
      currency: "USD",
      isOnline: true,
      meetingLink: "https://zoom.us/j/example",
      capacity: 80,
      categoryId: catMap["training"],
      status: "PUBLISHED",
    },
    {
      title: "Startup Palestine Summit 2025",
      slug: "startup-palestine-summit-2025",
      summary: "The premier startup event in Palestine",
      description: "Connect with investors, mentors, and fellow founders at the biggest startup event of the year.\n\n3 tracks:\n- Early Stage Startups\n- Growth & Scale\n- Investor & VC Track",
      startDate: daysFromNow(45),
      endDate: daysFromNow(46),
      registrationDeadline: daysFromNow(40),
      eventType: "PAID",
      price: 25,
      currency: "USD",
      isOnline: false,
      venueName: "WorkHub Co-Working Space",
      city: "Bethlehem",
      country: "Palestine",
      capacity: 300,
      categoryId: catMap["startup"],
      status: "PUBLISHED",
    },
    {
      title: "Smart Agriculture Forum",
      slug: "smart-agriculture-forum",
      summary: "Technology meets farming in Palestine",
      description: "Explore how IoT, AI, and data analytics are revolutionizing agriculture.",
      startDate: daysFromNow(25),
      endDate: daysFromNow(25),
      registrationDeadline: daysFromNow(23),
      eventType: "PAID",
      price: 30,
      currency: "USD",
      isOnline: false,
      venueName: "Palestine Polytechnic University",
      city: "Hebron",
      country: "Palestine",
      capacity: 150,
      categoryId: catMap["technology"],
      status: "PUBLISHED",
    },
    {
      title: "Coding Hackathon: Build for Palestine",
      slug: "coding-hackathon-build-for-palestine",
      summary: "48-hour hackathon solving local challenges",
      description: "A 48-hour hackathon where teams build solutions for real Palestinian community challenges.\n\nPrizes worth $5,000+!",
      startDate: daysFromNow(35),
      endDate: daysFromNow(37),
      registrationDeadline: daysFromNow(30),
      eventType: "PAID",
      price: 15,
      currency: "USD",
      isOnline: false,
      venueName: "Gaza Sky Geeks Hub",
      address: "Al-Rimal",
      city: "Gaza",
      country: "Palestine",
      capacity: 120,
      categoryId: catMap["community"],
      status: "PUBLISHED",
    },
    {
      title: "AI & Machine Learning Webinar",
      slug: "ai-ml-webinar-2025",
      summary: "Introduction to AI for non-technical audiences",
      description: "Demystify AI and machine learning in this beginner-friendly webinar. No coding experience required.",
      startDate: daysFromNow(5),
      endDate: daysFromNow(5),
      registrationDeadline: daysFromNow(4),
      eventType: "FREE",
      isOnline: true,
      meetingLink: "https://zoom.us/j/ai-webinar",
      capacity: 500,
      categoryId: catMap["education"],
      status: "PUBLISHED",
    },
    {
      title: "Community Fitness Challenge",
      slug: "community-fitness-challenge",
      summary: "30-day fitness challenge for all levels",
      description: "Join our community fitness challenge! Daily workouts, nutrition tips, and group motivation. All fitness levels welcome.",
      startDate: daysFromNow(3),
      endDate: daysFromNow(33),
      registrationDeadline: daysFromNow(2),
      eventType: "FREE",
      isOnline: true,
      meetingLink: "https://zoom.us/j/fitness",
      capacity: 200,
      categoryId: catMap["health-wellness"],
      status: "PUBLISHED",
    },
    {
      title: "Photography Masterclass (Draft)",
      slug: "photography-masterclass-draft",
      summary: "Learn professional photography techniques",
      description: "Coming soon — a masterclass on portrait, landscape, and street photography.",
      startDate: daysFromNow(60),
      endDate: daysFromNow(60),
      registrationDeadline: daysFromNow(55),
      eventType: "PAID",
      price: 35,
      currency: "USD",
      isOnline: false,
      venueName: "TBA",
      city: "Nablus",
      country: "Palestine",
      capacity: 30,
      categoryId: catMap["arts-culture"],
      status: "DRAFT",
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({
      where: { slug: event.slug },
    });

    if (!existing) {
      await prisma.event.create({
        data: {
          ...event,
          organizerId: hostUser.id,
          seatsRemaining: event.capacity,
          timezone: "Asia/Jerusalem",
        },
      });
      console.log(`  ✅ Event: "${event.title}"`);
    } else {
      console.log(`  ⏭️  Skipped (exists): "${event.title}"`);
    }
  }

  console.log(`\n✅ ${events.length} events processed`);
  console.log("\n🎉 Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });