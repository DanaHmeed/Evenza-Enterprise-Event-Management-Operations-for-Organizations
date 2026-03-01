// lib/auth/require-role.ts
import { auth } from "@clerk/nextjs/server";
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;

  return {
    userId: user.id,
    role: user.role,
    user,
  };
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