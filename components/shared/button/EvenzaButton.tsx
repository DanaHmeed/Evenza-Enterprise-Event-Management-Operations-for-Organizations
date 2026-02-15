// components/shared/button/EvenzaButton.tsx
"use client";

import { forwardRef } from "react";

interface EvenzaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const EvenzaButton = forwardRef<HTMLButtonElement, EvenzaButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
      primary:
        "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]",
      secondary:
        "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]",
      outline:
        "border-2 border-orange-500/50 text-orange-600 hover:bg-orange-50 hover:border-orange-500",
      ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
    };

    const sizes: Record<string, string> = {
      sm: "text-sm px-4 py-2 gap-1.5",
      md: "text-sm px-6 py-2.5 gap-2",
      lg: "text-base px-8 py-3.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

EvenzaButton.displayName = "EvenzaButton";
export default EvenzaButton;
