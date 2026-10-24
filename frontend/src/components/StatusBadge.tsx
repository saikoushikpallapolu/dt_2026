import { AlertCircle } from "lucide-react";
import type { FacultyStatus } from "@wimp/shared";
import { FACULTY_STATUS_LABELS } from "@wimp/shared";

interface StatusBadgeProps {
  status: FacultyStatus;
  isExpired?: boolean;
  isConfidentlyCurrent?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  isExpired,
  isConfidentlyCurrent,
  size = "md",
}: StatusBadgeProps) {
  const safeStatus = status || ("UNKNOWN" as FacultyStatus);
  const label = FACULTY_STATUS_LABELS[safeStatus] || safeStatus || "Unknown";

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3 py-1 text-sm font-semibold",
    lg: "px-4 py-1.5 text-base font-bold",
  }[size];

  // Colors and indicators depending on status
  let bgClass = "bg-slate-100 text-slate-800 border-slate-300";
  let dotClass = "bg-slate-400";
  let pulseClass = "";

  switch (status) {
    case "AVAILABLE":
      bgClass = "bg-emerald-50 text-emerald-900 border-emerald-300/80";
      dotClass = "bg-emerald-500";
      pulseClass = isConfidentlyCurrent ? "beacon-available" : "";
      break;
    case "IN_CLASS":
      bgClass = "bg-amber-50 text-amber-900 border-amber-300/80";
      dotClass = "bg-amber-500";
      pulseClass = isConfidentlyCurrent ? "beacon-in-class" : "";
      break;
    case "IN_MEETING":
      bgClass = "bg-violet-50 text-violet-900 border-violet-300/80";
      dotClass = "bg-violet-600";
      break;
    case "AWAY":
      bgClass = "bg-indigo-50/80 text-indigo-900 border-indigo-200";
      dotClass = "bg-indigo-500";
      break;
    case "ON_LEAVE":
      bgClass = "bg-stone-100 text-stone-800 border-stone-300";
      dotClass = "bg-stone-400";
      break;
    case "UNKNOWN":
    default:
      bgClass = "bg-slate-100 text-slate-700 border-slate-300";
      dotClass = "bg-slate-400";
      break;
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-2 rounded-full border shadow-2xs transition-all ${bgClass} ${sizeClasses}`}
      >
        <span className={`h-2 w-2 rounded-full ${dotClass} ${pulseClass}`} />
        <span>{label}</span>
      </span>

      {isExpired && (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 shadow-2xs">
          <AlertCircle className="h-3 w-3 text-amber-700 shrink-0" />
          <span>Stale / Expired</span>
        </span>
      )}
    </div>
  );
}
