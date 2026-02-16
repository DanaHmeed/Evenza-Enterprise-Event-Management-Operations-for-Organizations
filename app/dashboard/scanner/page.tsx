// app/dashboard/scanner/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ScanLine,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Ticket,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface ScanResult {
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  attendee?: {
    name: string;
    email: string;
    ticketNumber: string;
  };
}

interface EventOption {
  id: string;
  title: string;
}

export default function QRScannerPage() {
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedEventId, setSelectedEventId] = useState(
    searchParams.get("eventId") || ""
  );
  const [events, setEvents] = useState<EventOption[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [validating, setValidating] = useState(false);

  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?pageSize=100");
        if (res.ok) {
          const data = await res.json();
          setEvents(
            (data.data || []).map((e: { id: string; title: string }) => ({
              id: e.id,
              title: e.title,
            }))
          );
        }
      } catch {}
    };
    fetchEvents();
  }, []);

  // Start camera
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      startScanning();
    } catch (err) {
      setCameraError(
        "Camera access denied. Please allow camera permissions."
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // QR scanning using canvas — basic approach
  // For production, use a library like html5-qrcode
  const startScanning = () => {
    setScanning(true);
    // We'll rely on manual input for now since QR decoding
    // needs a library. The camera acts as a visual guide.
  };

  // Validate ticket
  const validateTicket = async (qrData: string) => {
    if (!selectedEventId) {
      setLastResult({
        type: "warning",
        title: "No Event Selected",
        message: "Please select an event first.",
      });
      return;
    }

    setValidating(true);
    try {
      // Parse QR data — expected format: JSON with ticketId
      let ticketId = qrData;
      try {
        const parsed = JSON.parse(qrData);
        ticketId = parsed.ticketId || qrData;
      } catch {
        // Not JSON, use as-is (might be the ticket ID directly)
      }

      const res = await fetch(`/api/tickets/${ticketId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId }),
      });

      const data = await res.json();

      if (res.ok) {
        const result: ScanResult = {
          type: "success",
          title: "Valid Ticket ✓",
          message: `${data.data?.attendee?.name || "Attendee"} has been checked in.`,
          attendee: data.data?.attendee,
        };
        setLastResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 49)]);
      } else {
        const result: ScanResult = {
          type: "error",
          title: "Invalid Ticket",
          message: data.error || "This ticket could not be validated.",
        };
        setLastResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 49)]);
      }
    } catch {
      setLastResult({
        type: "error",
        title: "Validation Failed",
        message: "Network error. Please try again.",
      });
    } finally {
      setValidating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      validateTicket(manualInput.trim());
      setManualInput("");
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
          <p className="text-sm text-gray-500">
            Scan attendee tickets to check them in.
          </p>
        </div>
      </div>

      {/* Event Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event *
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
        >
          <option value="">Choose an event...</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Camera / Scanner */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-orange-500" />
            Camera Scanner
          </h2>

          <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden mb-4">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-orange-500/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500 rounded-br-lg" />
                  </div>
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">
                  Point camera at QR code
                </p>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <CameraOff className="w-10 h-10 mb-3" />
                <p className="text-sm">Camera is off</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                disabled={!selectedEventId}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </button>
            )}
          </div>

          {cameraError && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {cameraError}
            </p>
          )}

          {/* Manual Input */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Manual Entry
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter ticket ID or scan data..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || validating || !selectedEventId}
                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {validating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Validate"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {/* Last Scan Result */}
          {lastResult && (
            <div
              className={`rounded-2xl border p-5 ${
                lastResult.type === "success"
                  ? "bg-green-50 border-green-200"
                  : lastResult.type === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {lastResult.type === "success" ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                ) : lastResult.type === "error" ? (
                  <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {lastResult.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {lastResult.message}
                  </p>
                  {lastResult.attendee && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{lastResult.attendee.name}</span>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono text-xs">{lastResult.attendee.ticketNumber}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scan History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Scan History
              </h2>
              {scanHistory.length > 0 && (
                <button
                  onClick={() => setScanHistory([])}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <ScanLine className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No scans yet. Start scanning tickets!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {scanHistory.map((result, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50"
                  >
                    {result.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.attendee?.name || result.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}