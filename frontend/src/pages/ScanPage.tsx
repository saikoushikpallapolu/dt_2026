import { useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, Scan, Users } from "lucide-react";
import { QrScannerModal } from "@/components/QrScannerModal";

export function ScanPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4">
      <QrScannerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {!isOpen && (
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-900 text-amber-300 shadow-lg shadow-violet-950/20 border border-amber-300/30">
            <Scan className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">QR Placard Scanner</h2>
          <p className="text-xs text-slate-500">
            Scan physical door placards outside faculty offices to inspect real-time self-reported availability.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-900 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
            >
              <QrCode className="h-4 w-4 text-amber-300" />
              <span>Reopen Camera Scanner</span>
            </button>
            <Link
              to="/directory"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-violet-50/50 hover:text-violet-900 transition"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Browse Directory</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
