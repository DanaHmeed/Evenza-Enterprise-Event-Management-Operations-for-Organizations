// app/api/users/[userId]/route.ts
//
// - GET uses `select` instead of implicit select-all (excludes updatedAt etc.)
// - Adds Cache-Control: private, s-maxage=60 for browser caching
// - Cleaner response shape

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";

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
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        avatar: true,
        bio: true,
        isActive: true,
        phone: true,
        experience: true,
        industry: true,
        jobTitle: true,
        location: true,
        organization: true,
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

    const response = NextResponse.json({ success: true, data: user });
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120"
    );
    return response;
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile (self) or admin actions (admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSelf = currentUser.userId === userId;
    const isAdmin = currentUser.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    const selfEditableFields = [
      "name",
      "phone",
      "bio",
      "location",
      "jobTitle",
      "organization",
      "industry",
      "experience",
    ];

    if (isSelf || isAdmin) {
      for (const field of selfEditableFields) {
        if (body[field] !== undefined) {
          const val = typeof body[field] === "string" ? body[field].trim() : body[field];
          updateData[field] = val === "" ? null : val;
        }
      }
    }

    if (updateData.name !== undefined && !updateData.name) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (updateData.bio && (updateData.bio as string).length > 500) {
      return NextResponse.json({ error: "Bio must be 500 characters or less" }, { status: 400 });
    }

    if (isAdmin) {
      if (body.role) {
        if (!["USER", "ORGANIZER", "ADMIN"].includes(body.role)) {
          return NextResponse.json(
            { error: "Invalid role. Must be USER, ORGANIZER, or ADMIN" },
            { status: 400 }
          );
        }
        updateData.role = body.role;
      }

      if (typeof body.isActive === "boolean") {
        updateData.isActive = body.isActive;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        avatar: true,
        bio: true,
        isActive: true,
        phone: true,
        experience: true,
        industry: true,
        jobTitle: true,
        location: true,
        organization: true,
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

    // Audit log for admin actions only
    if (isAdmin && !isSelf && (body.role || typeof body.isActive === "boolean")) {
      await prisma.auditLog.create({
        data: {
          actorId: currentUser.userId,
          action: body.role ? "user.role_changed" : "user.status_changed",
          entity: "User",
          entityId: userId,
          metadata: JSON.parse(
            JSON.stringify({
              ...(body.role && { role: body.role }),
              ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
            })
          ),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (currentUser.userId === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        organizedEvents: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.organizedEvents.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          actorId: currentUser.userId,
          action: "user.deactivated",
          entity: "User",
          entityId: userId,
          metadata: { reason: "Had active published events" },
        },
      });

      return NextResponse.json({
        success: true,
        message: "User deactivated (has active events). Events were not deleted.",
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    await prisma.auditLog.create({
      data: {
        actorId: currentUser.userId,
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
      { status: 500 }
    );
  }
}