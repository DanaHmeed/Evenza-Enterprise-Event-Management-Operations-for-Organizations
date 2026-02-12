import prisma from "@/lib/db/prisma";
import { Role } from "@/lib/generated/prisma/enums";

interface SyncUserParams {
  clerkId: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
}

export async function syncUser({
  clerkId,
  email,
  name,
  avatar,
  phone,
}: SyncUserParams) {
  try {
    const user = await prisma.user.upsert({
      where: { id: clerkId },
      update: {
        email,
        name,
        avatar: avatar ?? undefined,
        phone: phone ?? undefined,
      },
      create: {
        id: clerkId,
        email,
        name,
        avatar,
        phone,
        role: Role.USER,
      },
    });

    return user;
  } catch (error) {
    console.error("[SYNC_USER] Failed to sync user:", error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: clerkId },
    });
  } catch (error) {
    console.error("[GET_USER] Failed to get user:", error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: Role) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  } catch (error) {
    console.error("[UPDATE_ROLE] Failed to update role:", error);
    throw error;
  }
}

export async function deactivateUser(userId: string) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  } catch (error) {
    console.error("[DEACTIVATE_USER] Failed to deactivate:", error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    return await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error("[DELETE_USER] Failed to delete user:", error);
    throw error;
  }
}