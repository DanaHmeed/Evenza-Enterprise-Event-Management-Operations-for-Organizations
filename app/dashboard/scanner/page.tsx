//app/dashboard/scanner/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  User,
  Calendar,
  Ticket,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { t } from "@/components/dashboard/OrganizerUI";

type ScanState = "idle" | "scanning" | "loading" | "success" | "error";

interface ValidateResult {
  valid: boolean;
  message?: string;
  error?: string;
  usedAt?: string;
  data?: {
    ticketNumber: string;
    attendee: { name: string; email: string; avatar?: string };
    event: string;
    validatedAt: string;
  };
}

const SCANNER_ID = "qr-scanner-element";

export default function ScannerPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ValidateResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    await stopScanner();
    setScanState("loading");

    try {
      let ticketId: string;
      try {
        const parsed = JSON.parse(decodedText);
        ticketId = parsed.ticketId;
      } catch {
        setResult({ valid: false, error: "Invalid QR code format" });
        setScanState("error");
        isProcessingRef.current = false;
        return;
      }

      if (!ticketId) {
        setResult({ valid: false, error: "QR code is missing ticket information" });
        setScanState("error");
        isProcessingRef.current = false;
        return;
      }

      const res = await fetch(`/api/tickets/${ticketId}/validate`, { method: "POST" });
      const data: ValidateResult = await res.json();

      setResult(data);
      setScanState(data.valid ? "success" : "error");
    } catch {
      setResult({ valid: false, error: "Network error. Please try again." });
      setScanState("error");
    }

    isProcessingRef.current = false;
  }, [stopScanner]);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScanState("scanning");
    setResult(null);
    isProcessingRef.current = false;

    await new Promise((r) => setTimeout(r, 100));

    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleScanSuccess,
        () => {}
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.toLowerCase().includes("permission")
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not start camera. Make sure no other app is using it."
      );
      setScanState("idle");
    }
  }, [handleScanSuccess]);

  const reset = useCallback(async () => {
    await stopScanner();
    setResult(null);
    setCameraError(null);
    setScanState("idle");
  }, [stopScanner]);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div style={{ fontFamily: "Rubik, sans-serif", minHeight: "100vh", background: "#f7f7f4" }}>

      {/* Breadcrumb */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff", borderBottom: `1px solid ${t.borderLight}`,
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
          <Link href="/dashboard" style={{ color: t.textMuted, textDecoration: "none", fontWeight: 500 }}>
            Dashboard
          </Link>
          <ChevronRight style={{ width: 13, height: 13, opacity: 0.4 }} />
          <span style={{ color: t.text, fontWeight: 600 }}>Ticket Scanner</span>
        </div>
      </div>

    <div style={{ maxWidth: 620, margin: "40px auto", padding: "0 24px" }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12,}}>
          <h1 style={{
            fontSize: 22, fontWeight: 600, color: t.text, flex: 1, textAlign: "center"
          }}>
            Ticket Scanner
          </h1>
        </div>
        <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 0 48px", textAlign: "center" }}>
          Scan attendee QR codes to validate and check them in.
        </p>
      </div>

      {/* Camera card */}
      <div style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>

        {/* Scanner viewport */}
        <div
          style={{
            display: scanState === "scanning" ? "block" : "none",
            position: "relative",
            background: "#111",
            minHeight: 320,
          }}
        >
          <div id={SCANNER_ID} style={{ width: "100%" }} />
          {/* Corner overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ position: "relative", width: 240, height: 240 }}>
              {(["tl","tr","bl","br"] as const).map((corner) => (
                <div key={corner} style={{
                  position: "absolute",
                  width: 28, height: 28,
                  ...(corner === "tl" ? { top: 0, left: 0, borderTop: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}`, borderRadius: "6px 0 0 0" } : {}),
                  ...(corner === "tr" ? { top: 0, right: 0, borderTop: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}`, borderRadius: "0 6px 0 0" } : {}),
                  ...(corner === "bl" ? { bottom: 0, left: 0, borderBottom: `2px solid ${t.accent}`, borderLeft: `2px solid ${t.accent}`, borderRadius: "0 0 0 6px" } : {}),
                  ...(corner === "br" ? { bottom: 0, right: 0, borderBottom: `2px solid ${t.accent}`, borderRight: `2px solid ${t.accent}`, borderRadius: "0 0 6px 0" } : {}),
                }} />
              ))}
              <div style={{
                position: "absolute", left: 0, right: 0, top: 0,
                height: 2, background: t.accent, opacity: 0.8,
                animation: "scanLine 2s linear infinite",
              }} />
            </div>
          </div>
          <p style={{
            position: "absolute", bottom: 14, left: 0, right: 0,
            textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}>
            Point camera at attendee&apos;s QR code
          </p>

          {/* Cancel button */}
          <button
            onClick={reset}
            style={{
              position: "absolute", top: 12, right: 12,
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px",
              fontSize: 12, fontWeight: 600,
              background: "rgba(0,0,0,0.55)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.75)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
          >
            <XCircle style={{ width: 13, height: 13 }} />
            Cancel
          </button>
        </div>

        {/* Loading */}
        {scanState === "loading" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "64px 24px", gap: 12,
          }}>
            <Loader2 style={{ width: 28, height: 28, color: t.accent, animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Validating ticket…</p>
          </div>
        )}

        {/* Idle / ready */}
        {scanState === "idle" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "56px 24px", gap: 16,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: t.borderLight,
              border: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ScanLine style={{ width: 26, height: 26, color: t.textFaint }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: "0 0 4px" }}>
                Ready to scan
              </p>
              <p style={{ fontSize: 12, color: t.textFaint, margin: 0 }}>
                Camera will open when you start
              </p>
            </div>

            {cameraError && (
              <div style={{
                padding: "10px 14px",
                background: t.redSoft,
                border: `1px solid rgba(230,57,70,0.18)`,
                borderRadius: 6,
                fontSize: 12, color: t.red,
                textAlign: "center", maxWidth: 340,
              }}>
                {cameraError}
              </div>
            )}

            <button
              onClick={startScanner}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 22px",
                fontSize: 13, fontWeight: 600,
                backgroundColor: '#151414',
                color: "#fff",
                border: "none", borderRadius: 6,
                cursor: "pointer", marginTop: 4,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <ScanLine style={{ width: 15, height: 15 }} />
              Start Scanning
            </button>
          </div>
        )}

        {/* Result */}
        {(scanState === "success" || scanState === "error") && result && (
          <div style={{ padding: "20px 24px" }}>

            {/* Status banner */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "12px 16px",
              background: result.valid ? t.greenSoft : t.redSoft,
              border: `1px solid ${result.valid ? "rgba(45,106,79,0.16)" : "rgba(230,57,70,0.16)"}`,
              borderRadius: 8,
              marginBottom: 20,
            }}>
              {result.valid
                ? <CheckCircle2 style={{ width: 20, height: 20, color: t.green, flexShrink: 0, marginTop: 1 }} />
                : <XCircle style={{ width: 20, height: 20, color: t.red, flexShrink: 0, marginTop: 1 }} />
              }
              <div>
                <p style={{
                  fontSize: 13, fontWeight: 600, margin: "0 0 2px",
                  color: result.valid ? t.green : t.red,
                }}>
                  {result.valid ? "Ticket Valid — Check In" : "Ticket Invalid"}
                </p>
                <p style={{ fontSize: 12, margin: 0, color: result.valid ? "#3d8a62" : "#c0333f" }}>
                  {result.valid ? result.message : result.error}
                </p>
              </div>
            </div>

            {/* Attendee details */}
            {result.valid && result.data && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                {/* Attendee row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  background: t.bg,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: 8,
                }}>
                  {result.data.attendee.avatar ? (
                    <Image
                      src={result.data.attendee.avatar}
                      alt=""
                      width={36}
                      height={36}
                      style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: t.borderLight,
                      border: `1px solid ${t.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <User style={{ width: 16, height: 16, color: t.textFaint }} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {result.data.attendee.name}
                    </p>
                    <p style={{ fontSize: 12, color: t.textMuted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {result.data.attendee.email}
                    </p>
                  </div>
                </div>

                {/* Ticket + Check-in grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{
                    padding: "10px 14px",
                    background: t.bg,
                    border: `1px solid ${t.borderLight}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <Ticket style={{ width: 12, height: 12, color: t.textFaint }} />
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: t.textFaint }}>
                        Ticket
                      </span>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: t.text, margin: 0 }}>
                      {result.data.ticketNumber}
                    </p>
                  </div>
                  <div style={{
                    padding: "10px 14px",
                    background: t.bg,
                    border: `1px solid ${t.borderLight}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <Calendar style={{ width: 12, height: 12, color: t.textFaint }} />
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: t.textFaint }}>
                        Checked in
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: t.text, margin: 0 }}>
                      {fmtTime(result.data.validatedAt)}
                    </p>
                  </div>
                </div>

                {/* Event */}
                <div style={{
                  padding: "10px 14px",
                  background: t.bg,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: 8,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: t.textFaint, margin: "0 0 4px" }}>
                    Event
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {result.data.event}
                  </p>
                </div>
              </div>
            )}

            {/* Already used */}
            {!result.valid && result.usedAt && (
              <div style={{
                padding: "10px 14px",
                background: t.bg,
                border: `1px solid ${t.borderLight}`,
                borderRadius: 8,
                textAlign: "center",
                marginTop: 8,
              }}>
                <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
                  This ticket was already scanned at{" "}
                  <span style={{ fontWeight: 600, color: t.text }}>{fmtTime(result.usedAt)}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={startScanner}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  width: "100%", padding: "10px 0",
                  fontSize: 13, fontWeight: 600,
                  background: t.accent, color: "#fff",
                  border: "none", borderRadius: 6,
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <RefreshCw style={{ width: 14, height: 14 }} />
                Scan Next Ticket
              </button>
              <button
                onClick={reset}
                style={{
                  width: "100%", padding: "8px 0",
                  fontSize: 12, color: t.textFaint,
                  background: "none", border: "none",
                  cursor: "pointer", transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = t.textSecondary)}
                onMouseLeave={e => (e.currentTarget.style.color = t.textFaint)}
              >
                Stop scanner
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: t.textMuted, marginTop: 14 }}>
        Only organizers of an event can validate its tickets.
      </p>

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(240px); }
          100% { transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    </div>
  );
}
