// lib/auth/require-role.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import { NextResponse } from "next/server";

interface AuthResult {
  userId: string;
  role: Role;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    isActive: boolean;
  };
}

export async function getCurrentUser(): Promise<AuthResult | null> {
  const { userId } = await auth();

  if (!userId) return null;

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  // Lazy sync: if the Clerk user exists but isn't in the DB yet (webhook missed),
  // create the record now so authenticated users are never locked out.
  if (!user) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        "User";

      user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email, name, role: "USER", isActive: true },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
    } catch {
      return null;
    }
  }

  if (!user.isActive) return null;

  return { userId: user.id, role: user.role, user };
}

export async function requireRole(
  ...allowedRoles: Role[]
): Promise<AuthResult | NextResponse> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return NextResponse.json(
      { error: "Forbidden. You do not have permission to access this resource." },
      { status: 403 }
    );
  }

  return currentUser;
}

export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  return requireRole(Role.ADMIN);
}

export async function requireOrganizer(): Promise<AuthResult | NextResponse> {
  return requireRole(Role.ORGANIZER, Role.ADMIN);
}

export async function requireAuth(): Promise<AuthResult | NextResponse> {
  return requireRole(Role.USER, Role.ORGANIZER, Role.ADMIN);
}

export function isAuthError(
  result: AuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}