import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { FacultyStatus } from "@wimp/shared";

export function StudentPortal() {
  const queryClient = useQueryClient();

  const { data: favData, isLoading: favLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.getFavorites(),
    refetchInterval: 2500,
  });

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ["my-meetings"],
    queryFn: () => api.getMyMeetings(),
    refetchInterval: 2500,
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

  const toggleNotifyMutation = useMutation({
    mutationFn: ({ professorId, notify }: { professorId: string; notify: boolean }) =>
      api.toggleNotifyWhenAvailable(professorId, notify),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return (
    <DashboardLayout
      title="Student Consultation &amp; Saved Faculty"
      subtitle="Track your bookmarked professors' availability and manage your office hour consultation appointments."
      actions={
        <Link
          to="/directory"
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
        >
          <Users className="h-3.5 w-3.5 text-amber-300" />
          <span>Find Faculty</span>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* PANEL 1: BOOKMARKED FACULTY (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-violet-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300/60">
                  <Bookmark className="h-5 w-5 fill-amber-500 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-violet-950">Bookmarked Faculty Radar</h2>
                  <p className="text-[11px] text-slate-500">Real-time status beacons for your professors</p>
                </div>
              </div>
              <Link
                to="/directory"
                className="text-xs font-bold text-violet-800 hover:text-violet-950 hover:underline"
              >
                + Add from Directory
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {favLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading bookmarks...</div>
              ) : !favData?.favorites || favData.favorites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-violet-300" />
                  <p className="mt-2 text-sm font-bold text-slate-700">No faculty saved yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Save professors from the directory to track their office door status quickly.
                  </p>
                  <Link
                    to="/directory"
                    className="mt-4 inline-block rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white hover:bg-violet-800 transition"
                  >
                    Browse Directory
                  </Link>
                </div>
              ) : (
                favData.favorites.map((prof) => (
                  <div
                    key={prof.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-violet-300 hover:shadow-xs"
                  >
                    <div>
                      <Link
                        to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                        className="font-bold text-violet-950 hover:text-violet-700 transition text-sm"
                      >
                        {prof.displayName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {prof.designation} · {prof.department.code}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge
                          status={prof.currentStatus.status as FacultyStatus}
                          isExpired={prof.currentStatus.isExpired}
                          isConfidentlyCurrent={prof.currentStatus.isConfidentlyCurrent}
                          size="sm"
                        />
                      </div>

                      {prof.office && (
                        <p className="mt-2 text-xs text-slate-600 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-amber-600" />
                          <span>{prof.office.buildingName} · Room {prof.office.room}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            toggleNotifyMutation.mutate({
                              professorId: prof.id,
                              notify: !prof.notifyWhenAvailable,
                            })
                          }
                          className={`rounded-lg px-2 py-1 transition flex items-center gap-1 text-[11px] font-semibold ${
                            prof.notifyWhenAvailable
                              ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                          title={
                            prof.notifyWhenAvailable
                              ? "Click to disable notify when available"
                              : "Click to notify when professor becomes available"
                          }
                        >
                          <Bell
                            className={`h-3.5 w-3.5 ${
                              prof.notifyWhenAvailable ? "fill-violet-700 text-violet-700" : "text-slate-400"
                            }`}
                          />
                          <span>{prof.notifyWhenAvailable ? "Alert On" : "Notify Me"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFavMutation.mutate(prof.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Link
                        to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                        className="rounded-xl bg-violet-50 border border-violet-200/60 px-3 py-1 text-xs font-bold text-violet-900 hover:bg-violet-100 transition"
                      >
                        View Placard
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: CONSULTATION APPOINTMENTS (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-violet-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-900">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-violet-950">My Office Consultations</h2>
                  <p className="text-[11px] text-slate-500">Upcoming appointments and request status</p>
                </div>
              </div>

              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-900 border border-violet-200">
                {meetingsData?.meetings?.length || 0} Bookings
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {meetingsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
              ) : !meetingsData?.meetings || meetingsData.meetings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm font-bold text-slate-700">No consultations booked</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search for a professor and submit an appointment request during their office hours.
                  </p>
                </div>
              ) : (
                meetingsData.meetings.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-violet-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-violet-950">{m.reason}</h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Professor: {m.professorName}
                        </p>
                        <p className="mt-1 text-xs text-violet-900 font-semibold flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-violet-700" />
                          <span>
                            {new Date(m.proposedStart).toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(m.proposedStart).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        {m.note && (
                          <p className="mt-2 text-[11px] text-slate-600 italic border-l-2 border-violet-400 pl-2">
                            "{m.note}"
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          m.status === "PENDING"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : m.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {m.status === "PENDING" && (
                      <div className="mt-3 flex justify-end border-t border-slate-200/60 pt-2">
                        <button
                          type="button"
                          onClick={() => cancelMutation.mutate(m.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
