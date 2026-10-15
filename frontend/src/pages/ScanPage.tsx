import { useState } from "react";
import { Link } from "react-router-dom";
import { Scan } from "lucide-react";
import { QrScannerModal } from "@/components/QrScannerModal";

export function ScanPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4">
      <QrScannerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {!isOpen && (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Scan className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">QR Scanner Closed</h2>
          <p className="text-xs text-slate-500">Scan physical door placards to view real-time faculty availability.</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
            >
              Reopen Scanner
            </button>
            <Link
              to="/directory"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse Faculty Directory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
