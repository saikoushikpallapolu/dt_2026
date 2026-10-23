import { NextAvailability } from "@/components/NextAvailability";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  Info,
  MapPin,
  Printer,
  RefreshCw,
  Share2,
} from "lucide-react";
import { ConsultationModal } from "@/components/ConsultationModal";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function QrStatusPage() {
  const { token, slug } = useParams();
  const { user } = useAuth();
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch either via QR token or via faculty slug
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["qr-status", token, slug],
    queryFn: async () => {
      if (token) {
        return api.getQrStatus(token);
      }
      if (slug) {
        const fac = await api.getFacultyBySlug(slug);
        return {
          token: fac.activeQrToken || "slug-view",
          isActive: true,
          isRevoked: false,
          professor: fac,
          status: fac.currentStatus,
          officeHours: fac.officeHours || [],
          meta: {
            selfReported: true,
            locationTracking: false,
            lastUpdated: fac.currentStatus?.updatedAt || new Date().toISOString(),
            qrPublicUrl: window.location.href,
          },
        };
      }
      throw new Error("No token or slug provided");
    },
    refetchInterval: 2000, // automatic live refresh every 2s
  });

  const { data: favoriteData, refetch: refreshFavorites } = useQuery({ queryKey: ['favorites', user?.id], queryFn: () => api.getFavorites(), enabled: user?.role === 'STUDENT' });
  const currentFav = favoriteData?.favorites.find(p => p.id === data?.professor.id);
  const isFavorited = !!currentFav;
  const notifyEnabled = !!(currentFav as any)?.notifyWhenAvailable;

  const handleToggleFavorite = async () => {
    if (!data?.professor?.id || !user) return;
    try {
      if (isFavorited) {
        await api.removeFavorite(data.professor.id);
      } else {
        await api.addFavorite(data.professor.id);
      }
      await refreshFavorites();
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleToggleNotify = async () => {
    if (!data?.professor?.id || !user) return;
    try {
      if (!isFavorited) {
        await api.addFavorite(data.professor.id);
      } else {
        await api.toggleNotifyWhenAvailable(data.professor.id, !notifyEnabled);
      }
      await refreshFavorites();
    } catch (err) {
      console.error("Failed to toggle notification preference:", err);
    }
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch { window.prompt("Copy this profile link", window.location.href); return; }
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-violet-100" />
          <div className="h-6 w-3/4 mx-auto animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 mx-auto animate-pulse rounded bg-slate-100" />
          <div className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />
          <p className="text-xs text-slate-400">Loading current office status...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Placard Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">
            {(error as any)?.message || "This QR code does not match any registered office sign."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/directory"
              className="rounded-xl bg-violet-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-violet-800 transition"
            >
              Browse Faculty Directory
            </Link>
            <Link to="/" className="text-xs text-slate-500 hover:underline">
              Return to Campus Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Revoked State
  if (data.isRevoked || !data.isActive) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-amber-300 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">QR Placard Deactivated</h2>
          <p className="mt-1 text-sm font-medium text-amber-900">
            {data.professor.displayName} ({data.professor.department.name})
          </p>
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-xs text-amber-900">
            <p className="font-semibold">Placard Status: Revoked</p>
            <p className="mt-1">
              This physical door QR code was revoked or replaced. Please search the official faculty directory to locate the professor's current office assignment.
            </p>
          </div>
          <div className="mt-6">
            <Link
              to="/directory"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-950 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-violet-900 transition"
            >
              Search Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { professor, status, officeHours } = data;
  const isExpired = status.isExpired;

  // Format return time
  let returnTimeLabel = null;
  if (status.expectedReturnAt) {
    const returnDate = new Date(status.expectedReturnAt);
    const now = new Date();
    const diffMins = Math.round((returnDate.getTime() - now.getTime()) / 60000);

    const timeStr = returnDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffMins > 0) {
      returnTimeLabel = `${timeStr} (in ~${diffMins} mins)`;
    } else {
      returnTimeLabel = `${timeStr} (${Math.abs(diffMins)} mins ago)`;
    }
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-4">
      {/* Top back bar */}
      <div className="mx-auto max-w-xl px-4 flex items-center justify-between no-print">
        <Link
          to="/directory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-violet-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Faculty Directory</span>
        </Link>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-violet-50/50 hover:text-violet-900 transition"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin text-violet-700" : ""}`} />
          <span>{isFetching ? "Refreshing..." : "Live Refresh"}</span>
        </button>
      </div>

      {/* Main Status Card */}
      <main className="mx-auto mt-3 max-w-xl px-4">
        <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-950/5">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-violet-950 via-purple-900 to-violet-950 p-6 text-white sm:p-8 border-b border-amber-400/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-amber-300 border border-amber-400/30 shadow-inner backdrop-blur-md">
                  {professor.displayName
                    .split(" ")
                    .filter((p: string) => !p.startsWith("Dr."))
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2) || "FP"}
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {professor.displayName}
                  </h1>
                  <p className="text-xs text-amber-200/90 font-medium sm:text-sm">
                    {professor.designation} · {professor.department.name}
                  </p>
                  {professor.office ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 backdrop-blur-sm border border-white/10">
                      <MapPin className="h-3.5 w-3.5 text-amber-300" />
                      <span>
                        {professor.office.buildingName} · Floor {professor.office.floor} · Room {professor.office.room}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">Office unassigned</p>
                  )}
                </div>
              </div>

              {user?.role === "STUDENT" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`rounded-xl p-2.5 transition ${
                      isFavorited ? "bg-amber-400 text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title={isFavorited ? "Bookmarked" : "Bookmark this professor"}
                  >
                    {isFavorited ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                  </button>
                  {isFavorited && (
                    <button
                      onClick={handleToggleNotify}
                      className={`rounded-xl p-2.5 transition flex items-center gap-1.5 text-xs font-semibold ${
                        notifyEnabled
                          ? "bg-emerald-400 text-slate-900 shadow-sm"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                      title={notifyEnabled ? "Notifications enabled when available" : "Click to notify when available"}
                    >
                      <Bell className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Primary Live Status Display */}
            <div className="rounded-2xl border border-violet-100 bg-slate-50/70 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Published Status
                </span>
                <span className="text-[11px] text-slate-400">
                  Updated {new Date(status.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <StatusBadge
                  status={status.status}
                  isExpired={status.isExpired}
                  isConfidentlyCurrent={status.isConfidentlyCurrent}
                  size="lg"
                />
              </div>

              {/* Expired Warning Notice */}
              {isExpired && (
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-900">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-bold">Status Stale / Not Recently Confirmed</p>
                      <p className="mt-0.5 text-amber-800">
                        This self-reported status passed its validity duration (
                        {new Date(status.expiresAt || status.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        ). The professor may have finished class or left the office.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PROMINENT: CURRENT PHYSICAL LOCATION */}
              <div className="mt-4 overflow-hidden rounded-2xl border-2 border-violet-900 bg-violet-950 text-white p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                    <MapPin className="h-3.5 w-3.5 text-amber-300" />
                    <span>Current Physical Location</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-Time Self-Reported</span>
                  </span>
                </div>

                <div className="mt-2.5">
                  {status.status === "AVAILABLE" && (
                    <div>
                      <p className="text-xl font-black text-white">
                        In Office: {professor.office ? `${professor.office.buildingName} · Room ${professor.office.room}` : "Campus Office"}
                      </p>
                      <p className="mt-1 text-xs text-violet-200/90">
                        Door open for student drop-ins and quick questions.
                      </p>
                    </div>
                  )}

                  {status.status === "IN_CLASS" && (
                    <div>
                      <p className="text-xl font-black text-amber-300">
                        In Class: {status.alternateLocation || "Campus Lecture Hall"}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {status.publicMessage || "Currently giving lecture. Please do not disturb during class."}
                      </p>
                    </div>
                  )}

                  {status.status === "IN_MEETING" && (
                    <div>
                      <p className="text-xl font-black text-purple-300">
                        In Consultation: {professor.office ? `Room ${professor.office.room}` : "Meeting Room"}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Meeting in progress. Please wait outside or book a slot below.
                      </p>
                    </div>
                  )}

                  {status.status === "AWAY" && (
                    <div>
                      <p className="text-xl font-black text-sky-300">
                        Stepped Away from Office
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Briefly away from desk. Expected to return shortly.
                      </p>
                    </div>
                  )}

                  {status.status === "ON_LEAVE" && (
                    <div>
                      <p className="text-xl font-black text-slate-300">
                        On Leave / Out of Campus Today
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Please check posted consultation hours or email for inquiries.
                      </p>
                    </div>
                  )}

                  {status.status === "UNKNOWN" && (
                    <div>
                      <p className="text-xl font-black text-slate-300">
                        Office: {professor.office ? `${professor.office.buildingName} · Room ${professor.office.room}` : "Unassigned"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Awaiting latest availability confirmation from faculty member.
                      </p>
                    </div>
                  )}
                </div>

                {/* Return Countdown / Target */}
                {status.expectedReturnAt && (
                  <div className="mt-3 flex items-center justify-between border-t border-violet-800/80 pt-3 text-xs">
                    <span className="text-slate-300">Expected return to office:</span>
                    <strong className="font-bold text-amber-300">{returnTimeLabel}</strong>
                  </div>
                )}
              </div>

              {/* Alternate Location Note */}
              {status.alternateLocation && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200">
                  <Building2 className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Alternate location: <strong>{status.alternateLocation}</strong></span>
                </div>
              )}

              {/* Public Message */}
              {status.publicMessage && (
                <div className="mt-3 rounded-xl border border-violet-100 bg-white p-3.5 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">Note from Professor:</p>
                  <p className="mt-1 italic text-slate-600">"{status.publicMessage}"</p>
                </div>
              )}

              {/* Notify when Available Banner (for students when professor is not available) */}
              {user?.role === "STUDENT" && status.status !== "AVAILABLE" && (
                <div className="mt-4 rounded-xl border border-violet-200 bg-linear-to-r from-violet-50 to-indigo-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${notifyEnabled ? "bg-violet-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {notifyEnabled ? "Notification Alert Active" : "Notify When Available"}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {notifyEnabled
                            ? `You will be alerted instantly when ${professor.user.displayName || professor.user.name} returns to office.`
                            : `Get an instant alert the moment ${professor.user.displayName || professor.user.name} marks their status as Available.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleNotify}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        notifyEnabled
                          ? "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
                          : "bg-white text-violet-700 border border-violet-300 hover:bg-violet-50"
                      }`}
                    >
                      {notifyEnabled ? "Active" : "Notify Me"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <NextAvailability slots={officeHours || []} />
            {/* Office Hours Section */}
            {officeHours && officeHours.length > 0 && (
              <div className="rounded-2xl border border-violet-100 p-5 bg-white shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Calendar className="h-4 w-4 text-violet-700" />
                  <span>Weekly office hours · IST</span>
                </div>
                <div className="mt-3 divide-y divide-slate-100 text-xs">
                  {officeHours.map((oh: any) => (
                    <div key={oh.id} className="flex items-center justify-between py-2">
                      <span className="font-semibold text-slate-700">{days[oh.dayOfWeek]}</span>
                      <span className="text-slate-600 font-medium">
                        {oh.startTime} – {oh.endTime} {oh.notes ? `(${oh.notes})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConsultModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-900 py-3 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
              >
                <Calendar className="h-4 w-4 text-amber-300" />
                <span>Request Meeting</span>
              </button>

              <Link
                to={`/qr/${token || data.token}/print`}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-800 shadow-sm hover:bg-violet-50/50 hover:text-violet-950 transition"
              >
                <Printer className="h-4 w-4 text-slate-600" />
                <span>Print Door Sign</span>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-violet-900 transition"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{copySuccess ? "Link copied!" : "Share QR status link"}</span>
              </button>
            </div>

            {/* Ethical Disclaimer */}
            <div className="rounded-xl border border-violet-100 bg-slate-50/80 p-3.5 text-[11px] leading-relaxed text-slate-500">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-violet-600 mt-0.5 shrink-0" />
                <p>
                  <strong>Self-Reported Availability:</strong> This information is published directly by faculty members. The system does not claim or use automated physical location tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Consultation Modal */}
      <ConsultationModal
        professorId={professor.id}
        professorName={professor.displayName}
        isOpen={showConsultModal}
        onClose={() => setShowConsultModal(false)}
      />
    </div>
  );
}
