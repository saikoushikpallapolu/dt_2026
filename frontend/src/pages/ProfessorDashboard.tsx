import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  CheckCircle2,
  DoorOpen,
  ExternalLink,
  History,
  Printer,
  Sparkles,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { FacultyStatus } from "@wimp/shared";

export function ProfessorDashboard() {
  const queryClient = useQueryClient();

  const { data: statusData, isLoading } = useQuery({
    queryKey: ["professor-status"],
    queryFn: () => api.getMyStatus(),
  });

  const { data: historyData } = useQuery({
    queryKey: ["professor-history"],
    queryFn: () => api.getMyStatusHistory(),
  });

  const { data: requestsData } = useQuery({
    queryKey: ["professor-requests"],
    queryFn: () => api.getMyFacultyRequests(),
  });

  // Form states
  const [selectedStatus, setSelectedStatus] = useState<FacultyStatus>("AVAILABLE");
  const [returnPreset, setReturnPreset] = useState<number | null>(null);
  const [customReturnTime, setCustomReturnTime] = useState("");
  const [alternateLocation, setAlternateLocation] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      let expectedReturnAt: string | null = null;
      if (returnPreset) {
        expectedReturnAt = new Date(Date.now() + returnPreset * 60 * 1000).toISOString();
      } else if (customReturnTime) {
        const today = new Date().toISOString().split("T")[0];
        expectedReturnAt = new Date(`${today}T${customReturnTime}:00`).toISOString();
      }

      return api.updateMyStatus({
        status: selectedStatus,
        expectedReturnAt,
        alternateLocation: alternateLocation || null,
        publicMessage: publicMessage || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professor-status"] });
      queryClient.invalidateQueries({ queryKey: ["professor-history"] });
      queryClient.invalidateQueries({ queryKey: ["qr-status"] });
      setStatusFeedback("Status successfully updated! Door sign reflects this immediately.");
      setTimeout(() => setStatusFeedback(null), 4000);
    },
    onError: (err: any) => {
      setStatusFeedback(`Failed to update status: ${err.message}`);
    },
  });

  const respondRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      action,
      note,
    }: {
      requestId: string;
      action: "ACCEPT" | "DECLINE" | "PROPOSE_RESCHEDULE" | "COMPLETE";
      note?: string;
    }) => api.respondToFacultyRequest(requestId, { action, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professor-requests"] });
    },
  });

  const statusOptions: { status: FacultyStatus; label: string; desc: string }[] = [
    {
      status: "AVAILABLE",
      label: "Available in Office",
      desc: "Door open for student drop-ins",
    },
    {
      status: "IN_CLASS",
      label: "In Class / Lecturing",
      desc: "Teaching in scheduled campus lecture hall",
    },
    {
      status: "IN_MEETING",
      label: "In Consultation",
      desc: "Meeting with student or committee in progress",
    },
    {
      status: "AWAY",
      label: "Stepped Away",
      desc: "Briefly away from desk, returning shortly",
    },
    {
      status: "ON_LEAVE",
      label: "On Leave / Out Today",
      desc: "Not on campus today",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Faculty Status Control" subtitle="Loading faculty portal...">
        <div className="p-12 text-center text-sm text-slate-500">Loading professor portal...</div>
      </DashboardLayout>
    );
  }

  const currentStatus = statusData?.status;
  const qrToken = statusData?.activeQrToken;

  return (
    <DashboardLayout
      title="Faculty Status Portal"
      subtitle={`Welcome back, ${statusData?.displayName}. Update your office placard availability in one click.`}
      actions={
        qrToken ? (
          <div className="flex items-center gap-2">
            <Link
              to={`/qr/${qrToken}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-xs font-bold text-violet-950 shadow-2xs hover:bg-violet-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-violet-700" />
              <span>View Live Door Sign</span>
            </Link>
            <Link
              to={`/qr/${qrToken}/print`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-900 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
            >
              <Printer className="h-3.5 w-3.5 text-amber-300" />
              <span>Print Door Placard</span>
            </Link>
          </div>
        ) : null
      }
    >
      {/* Feedback banner */}
      {statusFeedback && (
        <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 shadow-sm flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Grid of Defined Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* PANEL 1: STATUS TRANSMITTER & CONTROL (Left Col, 7 spans) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-violet-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-900">
                  <DoorOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-violet-950">Broadcast Office Status</h2>
                  <p className="text-[11px] text-slate-500">Immediately visible on your door placard and campus directory</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Live now:</span>
                {currentStatus && (
                  <StatusBadge
                    status={currentStatus.status}
                    isExpired={currentStatus.isExpired}
                    isConfidentlyCurrent={currentStatus.isConfidentlyCurrent}
                    size="sm"
                  />
                )}
              </div>
            </div>

            {/* Status Selection Cards */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.status}
                  type="button"
                  onClick={() => setSelectedStatus(opt.status)}
                  className={`flex flex-col rounded-2xl border p-3.5 text-left transition ${
                    selectedStatus === opt.status
                      ? "border-violet-600 bg-violet-50/80 ring-2 ring-violet-500/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                    {selectedStatus === opt.status && (
                      <Check className="h-4 w-4 text-violet-700 font-bold" />
                    )}
                  </div>
                  <span className="mt-1 text-xs text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Expected Return Time Presets */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Expected Return Time (Optional)
              </label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  { label: "None", mins: null },
                  { label: "In 15 mins", mins: 15 },
                  { label: "In 30 mins", mins: 30 },
                  { label: "In 1 hour", mins: 60 },
                  { label: "In 2 hours", mins: 120 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setReturnPreset(preset.mins);
                      setCustomReturnTime("");
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      returnPreset === preset.mins && !customReturnTime
                        ? "border-violet-700 bg-violet-900 text-white shadow-xs"
                        : "border-slate-200 text-slate-700 hover:bg-violet-50/60"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span>Or exact time:</span>
                <input
                  type="time"
                  value={customReturnTime}
                  onChange={(e) => {
                    setCustomReturnTime(e.target.value);
                    setReturnPreset(null);
                  }}
                  className="rounded-xl border border-slate-300 px-3 py-1 text-xs text-slate-800 focus:border-violet-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Alternate Location */}
            <div className="mt-5 border-t border-slate-100 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Alternate Physical Location (If out of office)
              </label>
              <input
                type="text"
                placeholder="e.g. Ada Lovelace Hall Room 101, Campus Library Lab, Dean's Office..."
                value={alternateLocation}
                onChange={(e) => setAlternateLocation(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-violet-600 focus:outline-none"
              />
            </div>

            {/* Public Note */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Public Note to Students
              </label>
              <input
                type="text"
                placeholder="e.g. Please slip homework under the door; will return after departmental meeting."
                value={publicMessage}
                onChange={(e) => setPublicMessage(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-violet-600 focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={() => updateStatusMutation.mutate()}
                disabled={updateStatusMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-900 py-3.5 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>
                  {updateStatusMutation.isPending ? "Broadcasting to Placard..." : "Publish Live Status to Placard"}
                </span>
              </button>
            </div>
          </div>

          {/* PANEL 2: CONSULTATION QUEUE */}
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-violet-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-900">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-violet-950">Student Consultation Requests</h3>
                  <p className="text-[11px] text-slate-500">Incoming appointment and drop-in requests</p>
                </div>
              </div>

              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-900 border border-violet-200">
                {requestsData?.requests.filter((r) => r.status === "PENDING").length || 0} Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {!requestsData?.requests || requestsData.requests.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No consultation requests in queue.
                </p>
              ) : (
                requestsData.requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-violet-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{req.reason}</h4>
                        <p className="text-[11px] text-slate-500">
                          Student: {req.studentEmail}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-violet-900">
                          {new Date(req.proposedStart).toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(req.proposedStart).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(req.proposedEnd).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          req.status === "PENDING"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : req.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="mt-4 flex items-center gap-2 border-t border-slate-200/60 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            respondRequestMutation.mutate({
                              requestId: req.id,
                              action: "ACCEPT",
                              note: "Accepted, look forward to seeing you.",
                            })
                          }
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            respondRequestMutation.mutate({
                              requestId: req.id,
                              action: "DECLINE",
                              note: "Unfortunately unable to meet at this time.",
                            })
                          }
                          className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW, AUTOMATION & AUDIT (5 spans) */}
        <div className="lg:col-span-5 space-y-6">
          {/* PANEL 3: LIVE PLACARD PREVIEW */}
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-violet-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Door Placard Preview
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Real-Time
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-violet-100 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-900 text-amber-300 font-bold border border-amber-300/40">
                  {statusData?.displayName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-violet-950">{statusData?.displayName}</h3>
                  <p className="text-[11px] text-slate-500">Door QR Scan Output</p>
                </div>
              </div>

              <div className="mt-3">
                {currentStatus && (
                  <StatusBadge
                    status={currentStatus.status}
                    isExpired={currentStatus.isExpired}
                    isConfidentlyCurrent={currentStatus.isConfidentlyCurrent}
                    size="md"
                  />
                )}
              </div>

              {currentStatus?.expectedReturnAt && (
                <p className="mt-2 text-xs text-violet-900 font-medium">
                  Expected return: {new Date(currentStatus.expectedReturnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}

              {currentStatus?.alternateLocation && (
                <p className="mt-1 text-xs text-slate-700">
                  At: <strong>{currentStatus.alternateLocation}</strong>
                </p>
              )}

              {currentStatus?.publicMessage && (
                <p className="mt-2 text-xs italic text-slate-600 border-l-2 border-violet-500 pl-2">
                  "{currentStatus.publicMessage}"
                </p>
              )}
            </div>
          </div>

          {/* PANEL 4: AUTOMATION ENGINE */}
          <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-b from-amber-50/50 via-white to-white p-6 shadow-xs ring-1 ring-amber-400/20">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-violet-950">Timetable Automation Engine</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                Active (60s cycle)
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Your availability automatically updates based on your recurring class schedule and booked consultations.
            </p>

            <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 text-xs border border-amber-200/60 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Auto-sync with Class Timetable:
                </span>
                <span className="font-bold text-emerald-700">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Auto-sync with Consultations:
                </span>
                <span className="font-bold text-emerald-700">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Auto-reset when lecture concludes:
                </span>
                <span className="font-bold text-emerald-700">Enabled</span>
              </div>
            </div>

            {/* Automation Simulation Controls */}
            <div className="mt-4 border-t border-amber-100 pt-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Test Automation State:
              </span>
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await api.triggerAutomationSync();
                    queryClient.invalidateQueries({ queryKey: ["professor-status"] });
                    queryClient.invalidateQueries({ queryKey: ["professor-history"] });
                    setStatusFeedback(res.message);
                    setTimeout(() => setStatusFeedback(null), 4000);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-white py-2 text-xs font-bold text-violet-900 shadow-2xs hover:bg-violet-50 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-violet-700" />
                  <span>Execute Sync Check Now</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const d = new Date();
                      const dayDiff = (2 - d.getDay() + 7) % 7;
                      const sim = new Date(d.getTime() + dayDiff * 24 * 60 * 60 * 1000);
                      sim.setHours(10, 30, 0, 0);

                      await api.triggerAutomationSync({
                        simulatedTime: sim.toISOString(),
                        professorId: statusData?.professorId,
                      });
                      queryClient.invalidateQueries({ queryKey: ["professor-status"] });
                      queryClient.invalidateQueries({ queryKey: ["professor-history"] });
                      setStatusFeedback("Simulated class time (10:30 AM). Status automatically changed to IN_CLASS.");
                      setTimeout(() => setStatusFeedback(null), 5000);
                    }}
                    className="rounded-xl border border-amber-300 bg-amber-50/80 py-2 text-[11px] font-bold text-amber-950 hover:bg-amber-100 transition"
                  >
                    Simulate Class (10:30 AM)
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const d = new Date();
                      const dayDiff = (2 - d.getDay() + 7) % 7;
                      const sim = new Date(d.getTime() + dayDiff * 24 * 60 * 60 * 1000);
                      sim.setHours(11, 35, 0, 0);

                      await api.triggerAutomationSync({
                        simulatedTime: sim.toISOString(),
                        professorId: statusData?.professorId,
                      });
                      queryClient.invalidateQueries({ queryKey: ["professor-status"] });
                      queryClient.invalidateQueries({ queryKey: ["professor-history"] });
                      setStatusFeedback("Simulated 11:35 AM. Status automatically reset to AVAILABLE.");
                      setTimeout(() => setStatusFeedback(null), 5000);
                    }}
                    className="rounded-xl border border-emerald-300 bg-emerald-50/80 py-2 text-[11px] font-bold text-emerald-950 hover:bg-emerald-100 transition"
                  >
                    Simulate After-Class (11:35 AM)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 5: AUDIT TIMELINE */}
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-violet-100 pb-3">
              <History className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold text-violet-950">Recent Status Audit History</h3>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {!historyData?.history || historyData.history.length === 0 ? (
                <p className="py-4 text-center text-slate-400">No status updates recorded yet.</p>
              ) : (
                historyData.history.map((h) => (
                  <div key={h.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{h.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.recordedAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {h.publicMessage && (
                      <p className="mt-0.5 text-slate-500 italic">"{h.publicMessage}"</p>
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
