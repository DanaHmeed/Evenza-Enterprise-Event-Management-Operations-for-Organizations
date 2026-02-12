import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import {
  getCurrentUser,
  requireAdmin,
  isAuthError,
} from "@/lib/auth/require-role";

type Params = { params: Promise<{ userId: string }> };

// GET - Get single user details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.userId !== userId && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only view your own profile" },
        { status: 403 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            organizedEvents: true,
            registrations: true,
            tickets: true,
            orders: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PATCH - Update user role or deactivate (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const { role, isActive } = body;

    const updateData: Record<string, unknown> = {};

    if (role) {
      if (!["USER", "ORGANIZER", "ADMIN"].includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be USER, ORGANIZER, or ADMIN" },
          { status: 400 },
        );
      }
      updateData.role = role;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: authResult.userId,
        action: role ? "user.role_changed" : "user.status_changed",
        entity: "User",
        entityId: userId,
        metadata: JSON.parse(JSON.stringify(updateData)),
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    // Prevent self-deletion
    if (authResult.userId === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizedEvents: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user has active events, deactivate instead of delete
    if (user.organizedEvents.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          actorId: authResult.userId,
          action: "user.deactivated",
          entity: "User",
          entityId: userId,
          metadata: { reason: "Had active published events" },
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "User deactivated (has active events). Events were not deleted.",
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    await prisma.auditLog.create({
      data: {
        actorId: authResult.userId,
        action: "user.deleted",
        entity: "User",
        entityId: userId,
        metadata: { email: user.email, name: user.name },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
