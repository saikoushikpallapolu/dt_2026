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
  const label = FACULTY_STATUS_LABELS[status] || status;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3 py-1 text-sm font-semibold",
    lg: "px-4 py-1.5 text-base font-bold",
  }[size];

  // Colors and icons depending on status
  let bgClass = "bg-slate-100 text-slate-800 border-slate-300";
  let dotClass = "bg-slate-400";
  let pulseClass = "";

  switch (status) {
    case "AVAILABLE":
      bgClass = "bg-emerald-50 text-emerald-900 border-emerald-300";
      dotClass = "bg-emerald-500";
      pulseClass = isConfidentlyCurrent ? "beacon-available" : "";
      break;
    case "IN_CLASS":
      bgClass = "bg-amber-50 text-amber-900 border-amber-300";
      dotClass = "bg-amber-500";
      pulseClass = isConfidentlyCurrent ? "beacon-in-class" : "";
      break;
    case "IN_MEETING":
      bgClass = "bg-purple-50 text-purple-900 border-purple-300";
      dotClass = "bg-purple-500";
      break;
    case "AWAY":
      bgClass = "bg-blue-50 text-blue-900 border-blue-300";
      dotClass = "bg-blue-500";
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
        className={`inline-flex items-center gap-2 rounded-full border shadow-sm transition-all ${bgClass} ${sizeClasses}`}
      >
        <span className={`h-2 w-2 rounded-full ${dotClass} ${pulseClass}`} />
        <span>{label}</span>
      </span>

      {isExpired && (
        <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 shadow-sm">
          ⚠️ Stale / Expired
        </span>
      )}
    </div>
  );
}
