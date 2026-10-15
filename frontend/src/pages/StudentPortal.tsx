import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Calendar,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { FacultyStatus } from "@wimp/shared";

export function StudentPortal() {
  const queryClient = useQueryClient();

  const { data: favData, isLoading: favLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.getFavorites(),
  });

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ["my-meetings"],
    queryFn: () => api.getMyMeetings(),
  });

  const cancelMutation = useMutation({
    mutationFn: (meetingId: string) => api.cancelMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-meetings"] });
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: (professorId: string) => api.removeFavorite(professorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Student Consultation & Bookmark Portal
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your bookmarked professors' availability and manage your consultation appointments.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Bookmarked Faculty */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Bookmarked Faculty</h2>
              </div>
              <Link
                to="/directory"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Add more from Directory
              </Link>
            </div>

            {favLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading bookmarks…</div>
            ) : !favData?.favorites || favData.favorites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">No faculty saved yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save professors from the directory to track their office door status quickly.
                </p>
                <Link
                  to="/directory"
                  className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Browse Directory
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favData.favorites.map((prof) => (
                  <div
                    key={prof.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <Link
                        to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition"
                      >
                        {prof.displayName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {prof.designation} · {prof.department.code}
                      </p>
                      <div className="mt-2">
                        <StatusBadge
                          status={prof.currentStatus.status as FacultyStatus}
                          isExpired={prof.currentStatus.isExpired}
                          isConfidentlyCurrent={prof.currentStatus.isConfidentlyCurrent}
                          size="sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition"
                      >
                        Door Placard
                      </Link>
                      <button
                        onClick={() => removeFavMutation.mutate(prof.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Consultation Requests */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">My Consultation Requests</h2>
              </div>
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                {meetingsData?.meetings.length ?? 0}
              </span>
            </div>

            {meetingsLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading requests…</div>
            ) : !meetingsData?.meetings || meetingsData.meetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">No meeting requests</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can request a meeting directly from any professor's QR door page or directory card.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetingsData.meetings.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{m.reason}</p>
                        <p className="text-xs text-slate-600">
                          With: <strong className="text-indigo-900">{m.professorName}</strong>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(m.proposedStart).toLocaleDateString()} at{" "}
                          {new Date(m.proposedStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {m.note && <p className="mt-1 text-xs italic text-slate-600">Note: "{m.note}"</p>}
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          m.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-800"
                            : m.status === "DECLINED"
                            ? "bg-rose-100 text-rose-800"
                            : m.status === "CANCELLED"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {/* Timeline of events if any */}
                    {m.events && m.events.length > 0 && (
                      <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                        {m.events.map((e) => (
                          <div key={e.id} className="flex items-center justify-between py-0.5">
                            <span>Status transitioned to <strong>{e.toStatus}</strong></span>
                            <span>{new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.status === "PENDING" && (
                      <div className="mt-3 border-t border-slate-100 pt-2 flex justify-end">
                        <button
                          onClick={() => cancelMutation.mutate(m.id)}
                          className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel Request</span>
                        </button>
                      </div>
                    )}
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
