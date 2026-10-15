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
      setStatusFeedback("Status successfully updated! Door QR will show this immediately.");
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

  const statusOptions: { status: FacultyStatus; label: string; desc: string; color: string }[] = [
    {
      status: "AVAILABLE",
      label: "Available in Office",
      desc: "Door open for student drop-ins",
      color: "hover:border-emerald-500 hover:bg-emerald-50/50",
    },
    {
      status: "IN_CLASS",
      label: "In Class",
      desc: "Currently lecturing / in teaching hall",
      color: "hover:border-amber-500 hover:bg-amber-50/50",
    },
    {
      status: "IN_MEETING",
      label: "In a Meeting",
      desc: "Consultation in progress",
      color: "hover:border-purple-500 hover:bg-purple-50/50",
    },
    {
      status: "AWAY",
      label: "Stepped Away",
      desc: "Briefly away from desk",
      color: "hover:border-blue-500 hover:bg-blue-50/50",
    },
    {
      status: "ON_LEAVE",
      label: "On Leave",
      desc: "Out of campus today",
      color: "hover:border-stone-500 hover:bg-stone-50/50",
    },
  ];

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading professor portal…</div>;
  }

  const currentStatus = statusData?.status;
  const qrToken = statusData?.activeQrToken;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Faculty Status Portal
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, <span className="font-semibold text-slate-900">{statusData?.displayName}</span>. Update your availability placard in 1 click.
            </p>
          </div>

          {qrToken && (
            <div className="flex items-center gap-3">
              <Link
                to={`/qr/${qrToken}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition"
              >
                <ExternalLink className="h-4 w-4 text-indigo-600" />
                <span>View Public Door Placard</span>
              </Link>
              <Link
                to={`/qr/${qrToken}/print`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Door Sign</span>
              </Link>
            </div>
          )}
        </div>

        {/* Feedback message */}
        {statusFeedback && (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-sm flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Status Control Column (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Set Office Door Status</h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Live now:</span>
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

              {/* Status Buttons */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => setSelectedStatus(opt.status)}
                    className={`flex flex-col rounded-xl border p-3.5 text-left transition ${
                      selectedStatus === opt.status
                        ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20"
                        : `border-slate-200 bg-white ${opt.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                      {selectedStatus === opt.status && (
                        <Check className="h-4 w-4 text-indigo-600 font-bold" />
                      )}
                    </div>
                    <span className="mt-1 text-xs text-slate-500">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {/* Return Time Presets */}
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
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        returnPreset === preset.mins && !customReturnTime
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>Or specific time:</span>
                  <input
                    type="time"
                    value={customReturnTime}
                    onChange={(e) => {
                      setCustomReturnTime(e.target.value);
                      setReturnPreset(null);
                    }}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Alternate Location & Message */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Alternate Location Note</label>
                  <input
                    type="text"
                    placeholder="e.g. CS Lab 2, Library Hall B"
                    value={alternateLocation}
                    onChange={(e) => setAlternateLocation(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Public Note for Students</label>
                  <input
                    type="text"
                    placeholder="e.g. Office hours starting shortly"
                    value={publicMessage}
                    onChange={(e) => setPublicMessage(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => updateStatusMutation.mutate()}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {updateStatusMutation.isPending ? "Publishing Status…" : "Publish Live Status"}
                  </span>
                </button>
              </div>
            </div>

            {/* Consultation Requests */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Student Consultation Requests</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {requestsData?.requests.length ?? 0}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {!requestsData?.requests || requestsData.requests.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No consultation requests yet.</p>
                ) : (
                  requestsData.requests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{req.reason}</p>
                          <p className="text-xs text-slate-500">
                            From: <strong className="text-slate-700">{req.studentEmail}</strong>
                          </p>
                          <p className="mt-1 text-xs text-indigo-700 font-medium">
                            {new Date(req.proposedStart).toLocaleDateString()} at{" "}
                            {new Date(req.proposedStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" – "}
                            {new Date(req.proposedEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {req.note && <p className="mt-1 text-xs italic text-slate-600">"{req.note}"</p>}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            req.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "DECLINED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {req.status === "PENDING" && (
                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                          <button
                            onClick={() =>
                              respondRequestMutation.mutate({
                                requestId: req.id,
                                action: "ACCEPT",
                                note: "Accepted, look forward to seeing you.",
                              })
                            }
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() =>
                              respondRequestMutation.mutate({
                                requestId: req.id,
                                action: "DECLINE",
                                note: "Unfortunately unable to meet at this time.",
                              })
                            }
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
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

          {/* Right Column: Live Student View & History */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Student Preview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Student View Preview
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real-time
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                    {statusData?.displayName[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{statusData?.displayName}</h3>
                    <p className="text-[11px] text-slate-500">Door QR Scan Result</p>
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
                  <p className="mt-2 text-xs text-indigo-900 font-medium">
                    Expected return: {new Date(currentStatus.expectedReturnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}

                {currentStatus?.alternateLocation && (
                  <p className="mt-1 text-xs text-slate-700">
                    At: <strong>{currentStatus.alternateLocation}</strong>
                  </p>
                )}

                {currentStatus?.publicMessage && (
                  <p className="mt-2 text-xs italic text-slate-600 border-l-2 border-indigo-400 pl-2">
                    "{currentStatus.publicMessage}"
                  </p>
                )}
              </div>
            </div>

            {/* Status Automation Engine Card */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Automated Status Engine</h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  Worker Active (60s)
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Your availability can update automatically based on your teaching timetable and accepted consultation meetings without manual clicks.
              </p>

              <div className="mt-3 space-y-2 rounded-xl bg-white/90 p-3 text-xs border border-indigo-100">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Auto-sync with Class Timetable:
                  </span>
                  <span className="font-bold text-emerald-700">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Auto-sync with Consultations:
                  </span>
                  <span className="font-bold text-emerald-700">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Auto-reset when class concludes:
                  </span>
                  <span className="font-bold text-emerald-700">Enabled</span>
                </div>
              </div>

              {/* Simulation triggers for testing */}
              <div className="mt-4 border-t border-indigo-100 pt-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Test / Simulate Automation:
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
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-300 bg-white py-2 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Run Automation Sync Check Now</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        // Simulate Tuesday 10:30 AM (CS201 Lecture Time)
                        const d = new Date();
                        // Find closest Tuesday
                        const dayDiff = (2 - d.getDay() + 7) % 7;
                        const sim = new Date(d.getTime() + dayDiff * 24 * 60 * 60 * 1000);
                        sim.setHours(10, 30, 0, 0);

                        await api.triggerAutomationSync({
                          simulatedTime: sim.toISOString(),
                          professorId: statusData?.professorId,
                        });
                        queryClient.invalidateQueries({ queryKey: ["professor-status"] });
                        queryClient.invalidateQueries({ queryKey: ["professor-history"] });
                        setStatusFeedback(`Simulated CS201 class time (10:30 AM)! Status automatically flipped to IN_CLASS.`);
                        setTimeout(() => setStatusFeedback(null), 5000);
                      }}
                      className="rounded-xl border border-amber-300 bg-amber-50/80 py-2 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition"
                    >
                      Simulate Class (10:30 AM)
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        // Simulate 11:35 AM (Class concluded)
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
                        setStatusFeedback(`Simulated 11:35 AM! Status automatically reset to AVAILABLE.`);
                        setTimeout(() => setStatusFeedback(null), 5000);
                      }}
                      className="rounded-xl border border-emerald-300 bg-emerald-50/80 py-2 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 transition"
                    >
                      Simulate After-Class (11:35 AM)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <History className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Recent Status History</h3>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {!historyData?.history || historyData.history.length === 0 ? (
                  <p className="py-4 text-center text-slate-400">No status updates recorded yet.</p>
                ) : (
                  historyData.history.map((h) => (
                    <div key={h.id} className="py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{h.status}</span>
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
      </div>
    </div>
  );
}
