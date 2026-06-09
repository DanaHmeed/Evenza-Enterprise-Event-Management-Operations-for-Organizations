This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# Evenza

**Event management platform for companies and organizations.**

Evenza lets organizers create and manage events, handle ticket sales and seat availability, and track attendance — all from a single dashboard. Attendees can browse events, register, pay, and access QR-coded tickets. Admins get full visibility across the platform.

-----

## Tech Stack

|Layer     |Technology             |
|----------|-----------------------|
|Framework |Next.js 15 (App Router)|
|Database  |PostgreSQL + Prisma ORM|
|Auth      |Clerk                  |
|Payments  |Stripe (webhooks)      |
|Media     |Cloudinary             |
|AI Chatbot|Groq (LLaMA 3.3 70B)   |
|Deployment|Vercel + Neon          |

-----

## Features

### Attendee

- Browse and search events
- Register and pay via Stripe Checkout
- Waitlist enrollment with automated email notifications when seats open
- QR-coded tickets accessible from **My Tickets**
- Profile management via **My Profile**
- Personal event hub via **My Hub**

### Organizer

- Create, edit, and publish events with banner image upload
- Real-time seat tracking (seats deducted only on confirmed payment via webhook)
- Attendee list and check-in management
- Revenue and analytics dashboard
- Feedback overview from attendees

### Admin

- Full platform oversight: users, events, organizers
- Aggregate analytics and revenue reporting
- Role management

### Platform

- AI chatbot powered by Groq (LLaMA 3.3 70B) for attendee support
- QR code ticket scanning for check-in
- Role-based dashboards (attendee / organizer / admin)
- Waitlist system with webhook-triggered email automation

-----

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless)
- Accounts for: Clerk, Stripe, Cloudinary, Groq

### Installation

```bash
git clone https://github.com/your-username/evenza.git
cd evenza
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Groq
GROQ_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Locally

```bash
npm run dev
```

Open <http://localhost:3000>.

### Stripe Webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

-----

## Project Structure

```
evenza/
├── app/
│   ├── (auth)/              # Sign in / sign up (Clerk)
│   ├── (root)/              # Public pages
│   │   ├── events/          # Event listing and detail pages
│   │   └── page.tsx         # Home
│   ├── dashboard/
│   │   ├── attendee/        # My Hub, My Tickets, My Profile
│   │   ├── organizer/       # Event management, analytics, attendees
│   │   └── admin/           # Platform-wide admin panel
│   └── api/
│       ├── webhooks/stripe/ # Stripe webhook handler
│       ├── events/          # Event CRUD
│       ├── tickets/         # Ticket generation and QR
│       └── chat/            # Groq chatbot endpoint
├── components/              # Shared UI components
├── lib/                     # Utilities, Prisma client, helpers
├── prisma/
│   └── schema.prisma
└── public/
```

-----

## Key Implementation Notes

**Seat Management**
Seats are deducted exclusively on `checkout.session.completed` webhook events — not on checkout creation. This prevents ghost reservations from abandoned sessions.

**Waitlist**
When a seat opens (cancellation or refund), the first waitlisted user is automatically notified by email and given a time window to complete registration.

**QR Tickets**
Each ticket includes a unique QR code generated server-side. Organizers scan via the `/dashboard/organizer/scanner` page to mark attendance.

**Media Uploads**
Event banners are uploaded directly to Cloudinary. No binary data is stored in the database.

**AI Chatbot**
The chatbot uses Groq’s LLaMA 3.3 70B model with a system prompt scoped to Evenza context — event details, policies, and FAQs.

-----

## Deployment

The app is deployed on **Vercel** with a **Neon** serverless PostgreSQL database.

When deploying:

1. Add all environment variables to your Vercel project settings
1. Ensure `prisma generate` runs as part of the build step — add to `package.json`:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

1. Set up the Stripe webhook endpoint in the Stripe dashboard pointing to `https://your-domain.com/api/webhooks/stripe`

-----

## Graduation Project

Evenza was built as a full-stack graduation capstone at **Al-Quds University**, presented in May 2026. It demonstrates end-to-end product development: architecture decisions, third-party integrations, real-time data, role-based access control, and production deployment.

-----

## License

MIT
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
