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
      "inline-flex items-center justify-center font-semibold rounded transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
      primary:
        "bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.99]",
      secondary:
        "bg-white text-[#1a1a1a] border border-[#d4d4d0] hover:bg-[#fafaf8] active:scale-[0.99]",
      outline:
        "border border-[#1a1a1a] text-[#1a1a1a] bg-transparent hover:bg-[#1a1a1a] hover:text-white active:scale-[0.99]",
      ghost:
        "text-[#666] bg-transparent hover:text-[#1a1a1a] hover:bg-[#f5f5f0]",
      danger:
        "bg-[#e63946] text-white hover:bg-[#d62f3a] active:scale-[0.99]",
    };

    const sizes: Record<string, string> = {
      sm: "text-[13px] px-4 py-2 gap-1.5",
      md: "text-[13px] px-5 py-2.5 gap-2",
      lg: "text-[14px] px-7 py-3 gap-2",
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
