import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET - Get all users (admin only) or current user info
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // If not admin, only return current user's info
    if (currentUser?.role !== "ADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              events: true,
              registrations: true,
              tickets: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    }

    // Admin: Get all users with filters
    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as "USER" | "ORGANIZER" | "ADMIN" }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            events: true,
            registrations: true,
            tickets: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create/sync user (called by Clerk webhook)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, email, name, role } = body;

    if (!clerkId || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields: clerkId, email, name" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: clerkId },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { id: clerkId },
        data: {
          email,
          name,
          ...(role && { role }),
        },
      });

      return NextResponse.json(updatedUser);
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        id: clerkId,
        email,
        name,
        role: role || "USER", // Default to USER role
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}