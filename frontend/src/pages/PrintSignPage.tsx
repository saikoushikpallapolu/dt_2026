import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export function PrintSignPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["qr-sign", token],
    queryFn: () => api.getQrStatus(token!),
    enabled: !!token,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Preparing office placard...</div>;
  }

  if (isError || !data) {
    return <div className="p-12 text-center text-sm text-rose-600">Failed to load placard for printing.</div>;
  }

  const { professor } = data;
  const qrImageUrl = api.getQrImageUrl(token!);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      {/* Action Toolbar (Hidden in print) */}
      <div className="mx-auto mb-6 flex max-w-lg items-center justify-between no-print">
        <Link
          to={`/qr/${token}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-violet-950 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Live Status</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-950 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-violet-900 transition"
        >
          <Printer className="h-4 w-4 text-amber-300" />
          <span>Print Door Sign</span>
        </button>
      </div>

      {/* The Printable Placard Card */}
      <div className="printable-sign mx-auto max-w-lg rounded-2xl border-4 border-slate-900 bg-white p-8 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-slate-800">
          <ShieldCheck className="h-6 w-6 text-violet-900" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800">
            VNR VJIET · Faculty Office
          </span>
        </div>

        <div className="mt-6 border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {professor.displayName}
          </h1>
          <p className="mt-1 text-base font-bold text-violet-950">
            {professor.designation}
          </p>
          <p className="text-sm font-medium text-slate-600">
            Department of {professor.department.name}
          </p>
        </div>

        {professor.office && (
          <div className="my-6 rounded-xl bg-slate-50 p-4 border border-slate-300">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Office Location</p>
            <p className="mt-1 text-xl font-black text-slate-900">
              {professor.office.buildingName}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Floor {professor.office.floor} · Room {professor.office.room}
            </p>
          </div>
        )}

        {/* QR Code Container */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="rounded-2xl border-2 border-slate-900 bg-white p-3 shadow-md">
            <img
              src={qrImageUrl}
              alt={`QR code for ${professor.displayName}`}
              className="h-56 w-56 object-contain"
            />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-900">
            Scan with smartphone camera
          </p>
          <p className="mt-1 text-xs text-slate-600 max-w-xs">
            Check real-time availability, expected return time, and posted consultation hours before knocking.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400">
          <span>Permanent Office Identifier: <code>{token}</code></span>
          <p className="mt-0.5">VNR VJIET · Faculty Office Placard Network</p>
        </div>
      </div>
    </div>
  );
}
