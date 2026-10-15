import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  FileUp,
  QrCode,
  Scan,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "placards">("placards");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "qr-reader-viewport";

  // Play a gentle confirmation chime on scan
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext not allowed or not supported, ignore safely
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    playBeep();
    setScannedResult(decodedText);

    // Stop scanner if active
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().catch(() => {});
      setIsScanning(false);
    }

    setTimeout(() => {
      onClose();

      // Determine destination route
      if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
        try {
          const url = new URL(decodedText);
          navigate(url.pathname);
          return;
        } catch {
          // fallback
        }
      }

      if (decodedText.startsWith("/qr/") || decodedText.startsWith("/faculty/")) {
        navigate(decodedText);
      } else {
        // Assume raw token
        navigate(`/qr/${decodedText.replace(/^qr-/, "qr-")}`);
      }
    }, 800);
  };

  // Start Camera
  const startCamera = async () => {
    setScannerError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScannerError("No cameras detected on this device. You can use the Quick Placards or Upload Image tabs.");
        return;
      }

      const cameraId = cameras[0].id;
      setIsScanning(true);

      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // scanning frame without detection, ignore
        },
      );
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setIsScanning(false);
      setScannerError(
        err?.message || "Camera permission was denied or camera is currently in use. You can use Quick Placards below.",
      );
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Handle Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError(null);

    try {
      const html5Qr = new Html5Qrcode("qr-file-dummy");
      const decodedText = await html5Qr.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setScannerError("Could not find a valid QR code in this image. Please try another photo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Office Door QR Scanner</h2>
              <p className="text-xs text-slate-400">Scan physical door placard to see live faculty status</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("placards")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
              activeTab === "placards"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Interactive Placards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
              activeTab === "camera"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
              activeTab === "upload"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileUp className="h-4 w-4" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Success Confirmation Overlay */}
        {scannedResult && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center backdrop-blur-sm animate-in fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">QR Placard Detected!</h3>
            <p className="mt-1 font-mono text-xs text-emerald-400">{scannedResult}</p>
            <p className="mt-3 text-xs text-slate-400">Opening faculty status dashboard…</p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: INTERACTIVE FAKE QR PLACARDS (Most useful for testing without webcam) */}
          {activeTab === "placards" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/40 p-3 text-xs text-indigo-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Interactive Campus Placards:</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Click any placard below to simulate scanning the permanent physical sign outside that professor's office door:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Placard 1: Dr. Elena Rivera (Active) */}
                <button
                  type="button"
                  onClick={() => handleScanSuccess("qr-elena-rivera-demo")}
                  className="group flex flex-col items-start rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-left transition hover:border-emerald-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-emerald-950/50"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="rounded-md bg-emerald-950 border border-emerald-700/50 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      ACTIVE PLACARD
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Room 204</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={api.getQrImageUrl("qr-elena-rivera-demo")}
                      alt="Dr. Rivera QR"
                      className="h-14 w-14 rounded-lg bg-white p-1 border border-slate-600 transition group-hover:scale-105"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                        Dr. Elena Rivera
                      </h4>
                      <p className="text-xs text-slate-400">Associate Professor</p>
                      <p className="text-[11px] text-indigo-400 font-medium">Ada Lovelace Hall · 204</p>
                    </div>
                  </div>

                  <div className="mt-3 w-full rounded-xl bg-slate-900/80 py-1.5 text-center text-[11px] font-semibold text-emerald-400 border border-slate-700/50 group-hover:bg-emerald-600 group-hover:text-white transition">
                    👉 Simulate Door Scan
                  </div>
                </button>

                {/* Placard 2: Dr. Marcus Chen (Expired Demo) */}
                <button
                  type="button"
                  onClick={() => handleScanSuccess("/faculty/marcus-chen")}
                  className="group flex flex-col items-start rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-left transition hover:border-amber-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-amber-950/50"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="rounded-md bg-amber-950 border border-amber-700/50 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      EXPIRED STATUS DEMO
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Room 311</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 font-bold text-amber-400">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                        Dr. Marcus Chen
                      </h4>
                      <p className="text-xs text-slate-400">Assistant Professor</p>
                      <p className="text-[11px] text-amber-400 font-medium">Ada Lovelace Hall · 311</p>
                    </div>
                  </div>

                  <div className="mt-3 w-full rounded-xl bg-slate-900/80 py-1.5 text-center text-[11px] font-semibold text-amber-400 border border-slate-700/50 group-hover:bg-amber-600 group-hover:text-white transition">
                    👉 Simulate Door Scan
                  </div>
                </button>

                {/* Placard 3: Revoked Placard Demo */}
                <button
                  type="button"
                  onClick={() => handleScanSuccess("qr-marcus-chen-revoked")}
                  className="group flex flex-col items-start rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-left transition hover:border-rose-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-rose-950/50 sm:col-span-2"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="rounded-md bg-rose-950 border border-rose-700/50 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                      REVOKED PLACARD DEMO
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Token: qr-marcus-chen-revoked</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between w-full">
                    <div>
                      <h4 className="text-xs font-bold text-white">Decommissioned Office Placard</h4>
                      <p className="text-[11px] text-slate-400">
                        Tests how the app handles a retired or stolen door sign gracefully.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-rose-400 group-hover:underline">
                      Simulate Scan →
                    </span>
                  </div>
                </button>
              </div>

              {/* Direct Token Input Fallback */}
              <div className="mt-4 flex gap-2 border-t border-slate-800 pt-4">
                <input
                  type="text"
                  placeholder="Or enter QR token directly (e.g. qr-elena-rivera-demo)..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => manualToken && handleScanSuccess(manualToken)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Go
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CAMERA SCANNER */}
          {activeTab === "camera" && (
            <div className="space-y-4 text-center">
              {scannerError && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-3 text-xs text-rose-300">
                  {scannerError}
                </div>
              )}

              {/* Viewport for Html5Qrcode */}
              <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-2xl border-2 border-dashed border-indigo-500 bg-black">
                <div id={readerElementId} className="h-full w-full" />
                {/* Laser animation */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
              </div>

              <p className="text-xs text-slate-400">
                Point your camera at any professor's office door QR sign.
              </p>

              <button
                type="button"
                onClick={() => (isScanning ? stopCamera() : startCamera())}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                {isScanning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                <span>{isScanning ? "Pause Camera" : "Restart Camera"}</span>
              </button>
            </div>
          )}

          {/* TAB 3: UPLOAD IMAGE FILE */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div id="qr-file-dummy" className="hidden" />

              {scannerError && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-3 text-xs text-rose-300">
                  {scannerError}
                </div>
              )}

              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 hover:border-indigo-500 hover:bg-slate-900/80 transition">
                <Upload className="h-8 w-8 text-indigo-400" />
                <span className="mt-2 text-xs font-semibold text-white">Click to upload QR image</span>
                <span className="mt-1 text-[11px] text-slate-500">Supports PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
