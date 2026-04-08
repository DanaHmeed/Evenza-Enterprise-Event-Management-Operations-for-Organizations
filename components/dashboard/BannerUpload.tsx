// components/dashboard/BannerUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const t = {
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textFaint: "#aaa",
  accent: "#ea580c",
  red: "#e63946",
  sans: "'DM Sans', sans-serif",
};

interface BannerUploadProps {
  value: string; // current banner URL or empty
  onChange: (url: string) => void;
}

export default function BannerUpload({ value, onChange }: BannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const result = await uploadToCloudinary(file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setError("");
  };

  if (value) {
    return (
      <div style={{ position: "relative", borderRadius: "4px", overflow: "hidden", border: `1px solid ${t.borderLight}` }}>
        <img src={value} alt="Banner" style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }} />
        <button
          onClick={handleRemove}
          style={{
            position: "absolute", top: "8px", right: "8px",
            width: "28px", height: "28px", background: "rgba(0,0,0,0.5)",
            border: "none", borderRadius: "4px", display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff",
          }}
        >
          <X style={{ width: "14px", height: "14px" }} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "160px", border: `2px dashed ${uploading ? t.accent : t.border}`,
          borderRadius: "4px", cursor: uploading ? "default" : "pointer",
          transition: "border-color 0.15s", opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: t.accent, marginBottom: "8px" }} />
            <p style={{ fontSize: "13px", color: t.accent, fontWeight: 500, margin: 0, fontFamily: t.sans }}>Uploading...</p>
          </>
        ) : (
          <>
            <Upload style={{ width: "24px", height: "24px", color: t.textFaint, marginBottom: "8px" }} />
            <p style={{ fontSize: "13px", fontWeight: 500, color: t.textSecondary, margin: 0, fontFamily: t.sans }}>Click to upload cover image</p>
            <p style={{ fontSize: "11px", color: t.textFaint, marginTop: "4px", fontFamily: t.sans }}>PNG, JPG up to 5MB</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
      {error && (
        <p style={{ fontSize: "11px", color: t.red, marginTop: "6px", fontFamily: t.sans }}>{error}</p>
      )}
    </div>
  );
}