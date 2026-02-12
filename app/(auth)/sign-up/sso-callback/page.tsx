"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="auth-card auth-card-centered">
      <div className="auth-form-container auth-form-container-full">
        <div className="auth-form-inner" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <span className="auth-spinner auth-spinner-lg" />
          <p style={{ marginTop: "1.5rem", color: "#64748b", fontSize: "0.95rem" }}>
            Setting up your account...
          </p>
          <AuthenticateWithRedirectCallback />
        </div>
      </div>
    </div>
  );
}