import { Role } from "@/lib/generated/prisma/enums";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
}

export interface SessionUser {
  userId: string;
  role: Role;
  user: AuthUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}