import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Evenza Admin
              </Link>
              <div className="flex gap-6">
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Users
                </Link>
                <Link
                  href="/admin/events"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Events
                </Link>
                <Link
                  href="/admin/feedback"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Feedback
                </Link>
                <Link
                  href="/admin/statistics"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Statistics
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">👤 {user.name}</span>
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}