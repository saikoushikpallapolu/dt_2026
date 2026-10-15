import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  CheckCircle,
  Eye,
  Printer,
  RotateCcw,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { FacultyStatus } from "@wimp/shared";

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"professors" | "campus" | "audit">("professors");

  // Onboard modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    displayName: "",
    email: "",
    password: "DemoPass123!",
    designation: "Assistant Professor",
    departmentName: "Computer Science",
    buildingName: "Ada Lovelace Hall",
    room: "",
    floor: "2",
    initialStatus: "AVAILABLE" as FacultyStatus,
    publicMessage: "",
  });
  const [createdPlacard, setCreatedPlacard] = useState<{
    displayName: string;
    token: string;
    room: string;
  } | null>(null);

  // Dynamic Status Trigger Simulator state
  const [selectedProfId, setSelectedProfId] = useState<string>("");
  const [triggerStatus, setTriggerStatus] = useState<FacultyStatus>("AVAILABLE");
  const [triggerReturnMins, setTriggerReturnMins] = useState<number | null>(null);
  const [triggerLocation, setTriggerLocation] = useState("");
  const [triggerMessage, setTriggerMessage] = useState("");
  const [statusTriggerFeedback, setStatusTriggerFeedback] = useState<string | null>(null);

  // Queries
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.getAdminAnalytics(),
  });

  const { data: profData, isLoading: profLoading } = useQuery({
    queryKey: ["admin-professors"],
    queryFn: () => api.getAdminProfessors(),
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.getDepartments(),
  });

  const { data: buildingData } = useQuery({
    queryKey: ["admin-buildings"],
    queryFn: () => api.getAdminBuildings(),
  });

  const { data: auditData } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => api.getAdminAuditLogs(),
    enabled: activeTab === "audit",
  });

  // Onboard mutation
  const quickOnboardMutation = useMutation({
    mutationFn: (payload: any) => api.quickOnboardFaculty(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-directory"] });
      setCreatedPlacard({
        displayName: data.professor.displayName,
        token: data.initialQrToken,
        room: onboardForm.room,
      });
      setOnboardForm({
        displayName: "",
        email: "",
        password: "DemoPass123!",
        designation: "Assistant Professor",
        departmentName: "Computer Science",
        buildingName: "Ada Lovelace Hall",
        room: "",
        floor: "2",
        initialStatus: "AVAILABLE",
        publicMessage: "",
      });
    },
  });

  // Dynamic status trigger mutation
  const triggerStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProfId) throw new Error("Select a professor first");
      let expectedReturnAt: string | null = null;
      if (triggerReturnMins) {
        expectedReturnAt = new Date(Date.now() + triggerReturnMins * 60 * 1000).toISOString();
      }

      return api.adminUpdateProfessorStatus(selectedProfId, {
        status: triggerStatus,
        expectedReturnAt,
        alternateLocation: triggerLocation || null,
        publicMessage: triggerMessage || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-directory"] });
      queryClient.invalidateQueries({ queryKey: ["qr-status"] });
      const prof = profData?.professors.find((p: any) => p.id === selectedProfId);
      setStatusTriggerFeedback(
        `Live status updated for ${prof?.displayName || "Professor"}! Scan their door QR to see the update.`
      );
      setTimeout(() => setStatusTriggerFeedback(null), 5000);
    },
    onError: (err: any) => {
      setStatusTriggerFeedback(`Failed to update status: ${err.message}`);
    },
  });

  const generateQrMutation = useMutation({
    mutationFn: (profId: string) => api.generateAdminQr(profId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });

  const revokeQrMutation = useMutation({
    mutationFn: (qrId: string) => api.revokeAdminQr(qrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });

  const analytics = analyticsData?.analytics;
  const activeSelectedProf = profData?.professors.find((p: any) => p.id === selectedProfId);

  return (
    <DashboardLayout
      title="Campus Administration &amp; Dynamic Faculty Hub"
      subtitle="Onboard faculty, auto-generate permanent office placards, and dynamically trigger real-time availability."
      actions={
        <button
          type="button"
          onClick={() => {
            setCreatedPlacard(null);
            setShowOnboardModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
        >
          <UserPlus className="h-4 w-4 text-amber-300" />
          <span>Add New Teacher &amp; QR</span>
        </button>
      }
    >
      {/* SECTION 1: DYNAMIC STATUS TRIGGER & SIMULATION PANEL */}
      <div className="mb-8 rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-950 via-[#37115c] to-violet-950 p-6 sm:p-7 text-white shadow-xl shadow-violet-950/10 border-b-2 border-b-amber-400/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-violet-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-violet-950 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live Status Simulator &amp; Trigger</h2>
              <p className="text-xs text-amber-200/90">
                Instantly trigger availability for ANY professor in the Supabase database to test phone scanning
              </p>
            </div>
          </div>

          {activeSelectedProf && (
            <div className="flex items-center gap-2 text-xs bg-violet-900/80 px-3 py-1.5 rounded-xl border border-violet-700">
              <span className="text-violet-300">Live Status:</span>
              <StatusBadge
                status={activeSelectedProf.currentStatus.status as FacultyStatus}
                isExpired={activeSelectedProf.currentStatus.isExpired}
                isConfidentlyCurrent={activeSelectedProf.currentStatus.isConfidentlyCurrent}
                size="sm"
              />
            </div>
          )}
        </div>

        {statusTriggerFeedback && (
          <div className="mt-4 rounded-xl border border-emerald-400 bg-emerald-950/80 p-3 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{statusTriggerFeedback}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
          {/* Select Professor */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
              1. Select Faculty Member
            </label>
            <select
              value={selectedProfId}
              onChange={(e) => {
                setSelectedProfId(e.target.value);
                const prof = profData?.professors.find((p: any) => p.id === e.target.value);
                if (prof) setTriggerStatus(prof.currentStatus.status as FacultyStatus);
              }}
              className="mt-1.5 w-full rounded-xl border border-violet-700 bg-violet-900/90 px-3.5 py-2.5 text-xs text-white focus:border-amber-300 focus:outline-none"
            >
              <option value="">-- Choose a professor --</option>
              {profData?.professors.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.department?.name} · {p.office ? `Room ${p.office.room}` : "No office"})
                </option>
              ))}
            </select>
          </div>

          {/* Status buttons */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
              2. Choose Target Status
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[
                { status: "AVAILABLE", label: "Available in Office" },
                { status: "IN_CLASS", label: "In Class" },
                { status: "IN_MEETING", label: "In Meeting" },
                { status: "AWAY", label: "Stepped Away" },
                { status: "ON_LEAVE", label: "On Leave" },
              ].map((s) => (
                <button
                  key={s.status}
                  type="button"
                  onClick={() => setTriggerStatus(s.status as FacultyStatus)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    triggerStatus === s.status
                      ? "bg-amber-400 text-violet-950 shadow-sm font-black"
                      : "bg-violet-900/80 text-violet-200 hover:bg-violet-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger action button */}
          <div className="lg:col-span-3">
            <button
              type="button"
              disabled={!selectedProfId || triggerStatusMutation.isPending}
              onClick={() => triggerStatusMutation.mutate()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-xs font-extrabold text-violet-950 shadow-md hover:bg-amber-300 transition disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4 text-violet-950" />
              <span>{triggerStatusMutation.isPending ? "Broadcasting..." : "Broadcast Live Status"}</span>
            </button>
          </div>
        </div>

        {/* Optional details (return time presets & note) */}
        {selectedProfId && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-violet-800/60 pt-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-violet-300">Return Countdown Preset:</span>
              <div className="mt-1 flex gap-1.5">
                {[
                  { label: "None", mins: null },
                  { label: "15m", mins: 15 },
                  { label: "30m", mins: 30 },
                  { label: "1h", mins: 60 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setTriggerReturnMins(p.mins)}
                    className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                      triggerReturnMins === p.mins
                        ? "bg-amber-300 text-violet-950"
                        : "bg-violet-900/60 text-violet-200 hover:bg-violet-800"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-violet-300">Alternate Location:</span>
              <input
                type="text"
                placeholder="e.g. Lecture Hall 101, Lab B..."
                value={triggerLocation}
                onChange={(e) => setTriggerLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-violet-700 bg-violet-900/90 px-2.5 py-1 text-xs text-white placeholder-violet-400 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-violet-300">Public Note:</span>
              <input
                type="text"
                placeholder="e.g. In class until 11:30 AM..."
                value={triggerMessage}
                onChange={(e) => setTriggerMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-violet-700 bg-violet-900/90 px-2.5 py-1 text-xs text-white placeholder-violet-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Analytics KPIs Panel */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Faculty</span>
            <p className="mt-2 text-3xl font-black text-violet-950">{analytics.facultyCount}</p>
            <span className="mt-1 text-[11px] text-slate-500">Across {analytics.departmentsCount} departments</span>
          </div>

          <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Door Placards</span>
            <p className="mt-2 text-3xl font-black text-emerald-600">{analytics.activeQrCount}</p>
            <span className="mt-1 text-[11px] text-slate-500">Permanent door signs</span>
          </div>

          <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Offices</span>
            <p className="mt-2 text-3xl font-black text-violet-950">{analytics.officesCount}</p>
            <span className="mt-1 text-[11px] text-slate-500">Assigned rooms</span>
          </div>

          <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation Bookings</span>
            <p className="mt-2 text-3xl font-black text-amber-600">{analytics.meetingsStats.total}</p>
            <span className="mt-1 text-[11px] text-slate-500">
              {analytics.meetingsStats.accepted} accepted, {analytics.meetingsStats.pending} pending
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-violet-100 pb-2">
        {[
          { id: "professors", label: "Faculty & Door QR Placards", icon: Users },
          { id: "campus", label: "Campus Buildings & Rooms", icon: Building2 },
          { id: "audit", label: "Security & Audit Logs", icon: Shield },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === t.id
                  ? "bg-violet-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Faculty & QR Placards Table */}
      {activeTab === "professors" && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/60 border-b border-violet-100 font-bold text-violet-950 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Faculty Member</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Office Location</th>
                  <th className="px-5 py-3.5">Live Status</th>
                  <th className="px-5 py-3.5">Door QR Token</th>
                  <th className="px-5 py-3.5 text-right">Placard Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading faculty from Supabase...</td>
                  </tr>
                ) : profData?.professors.map((p: any) => {
                  const activeQr = p.qrCodes?.find((q: any) => q.isActive);
                  return (
                    <tr key={p.id} className="hover:bg-violet-50/30 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{p.displayName}</p>
                        <p className="text-[11px] text-slate-500">{p.email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {p.department?.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {p.office ? (
                          <span className="font-semibold text-violet-950">
                            {p.office.buildingName} · Room {p.office.room}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={p.currentStatus?.status || "UNKNOWN"}
                          isExpired={p.currentStatus?.isExpired}
                          isConfidentlyCurrent={p.currentStatus?.isConfidentlyCurrent}
                          size="sm"
                        />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px]">
                        {activeQr ? (
                          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-violet-900 border border-violet-200 font-semibold">
                            {activeQr.token}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold">No QR active</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {activeQr ? (
                            <>
                              <Link
                                to={`/qr/${activeQr.token}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 rounded-lg bg-violet-50 border border-violet-200 px-2.5 py-1 text-[11px] font-bold text-violet-900 hover:bg-violet-100"
                                title="View public page"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View</span>
                              </Link>
                              <Link
                                to={`/qr/${activeQr.token}/print`}
                                target="_blank"
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
                                title="Print door placard"
                              >
                                <Printer className="h-3 w-3 text-amber-300" />
                                <span>Print</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => revokeQrMutation.mutate(activeQr.id)}
                                className="rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-50"
                                title="Revoke QR token"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => generateQrMutation.mutate(p.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-violet-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-violet-800"
                            >
                              <RotateCcw className="h-3 w-3 text-amber-300" />
                              <span>Issue Placard</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Campus Buildings */}
      {activeTab === "campus" && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {buildingData?.buildings.map((b: any) => (
            <div key={b.id} className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-violet-950">{b.name}</h3>
                  <p className="text-xs text-slate-500">Code: {b.code}</p>
                </div>
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-900 border border-violet-200">
                  {b.offices.length} Offices
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 text-xs">
                {b.offices.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-2">
                    <div>
                      <span className="font-bold text-slate-800">Room {o.room}</span>
                      <span className="ml-2 text-slate-500">Floor {o.floor}</span>
                      {o.label && <span className="ml-2 italic text-slate-400">({o.label})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Security & Audit Logs */}
      {activeTab === "audit" && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/60 border-b border-violet-100 font-bold text-violet-950 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditData?.auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-violet-50/30 transition">
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{l.action}</td>
                    <td className="px-5 py-3.5 text-slate-600">{l.entityType}</td>
                    <td className="px-5 py-3.5 text-slate-600">{l.actorEmail || "System"}</td>
                    <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">
                      {JSON.stringify(l.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ONBOARD NEW FACULTY MODAL */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-7 shadow-2xl">
            {createdPlacard ? (
              /* Success / Placard Generated View */
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                  <Check className="h-7 w-7 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-violet-950">Faculty Member Onboarded!</h3>
                <p className="text-xs text-slate-600">
                  {createdPlacard.displayName} has been saved to Supabase with permanent door sign token{" "}
                  <code className="bg-violet-50 text-violet-900 px-1.5 py-0.5 rounded font-mono text-xs">
                    {createdPlacard.token}
                  </code>
                </p>

                {/* Live QR Placard Preview */}
                <div className="my-4 rounded-2xl border-2 border-violet-950 bg-violet-50/50 p-4 max-w-xs mx-auto text-center shadow-md">
                  <div className="rounded-xl bg-white p-2 border border-violet-200 inline-block shadow-xs">
                    <img
                      src={api.getQrImageUrl(createdPlacard.token)}
                      alt={`QR code for ${createdPlacard.displayName}`}
                      className="h-44 w-44 object-contain"
                    />
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-violet-950">{createdPlacard.displayName}</h4>
                  <p className="text-xs font-semibold text-amber-700">Room {createdPlacard.room}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Point your phone camera to scan</p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <Link
                    to={`/qr/${createdPlacard.token}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-800"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Public Placard</span>
                  </Link>

                  <Link
                    to={`/qr/${createdPlacard.token}/print`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
                  >
                    <Printer className="h-4 w-4 text-amber-300" />
                    <span>Print Sign</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedPlacard(null);
                      setShowOnboardModal(false);
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Onboard Form */
              <>
                <h3 className="text-lg font-bold text-violet-950">Add Faculty Member &amp; Issue QR</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Creates login credentials, saves to Supabase, and generates a permanent door QR placard.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    quickOnboardMutation.mutate(onboardForm);
                  }}
                  className="mt-4 space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Faculty Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Alan Turing"
                      value={onboardForm.displayName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, displayName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. alan.turing@demo.local"
                        value={onboardForm.email}
                        onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Designation / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Full Professor, Chair"
                        value={onboardForm.designation}
                        onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Academic Department</label>
                      <input
                        type="text"
                        required
                        list="dept-datalist"
                        placeholder="e.g. Computer Science, Physics..."
                        value={onboardForm.departmentName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, departmentName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                      />
                      <datalist id="dept-datalist">
                        {deptData?.departments?.map((d: any) => (
                          <option key={d.id} value={d.name} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Campus Building</label>
                      <input
                        type="text"
                        required
                        list="building-datalist"
                        placeholder="e.g. Ada Lovelace Hall"
                        value={onboardForm.buildingName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, buildingName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                      />
                      <datalist id="building-datalist">
                        {buildingData?.buildings?.map((b: any) => (
                          <option key={b.id} value={b.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Office Room Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 204, 310, 405"
                        value={onboardForm.room}
                        onChange={(e) => setOnboardForm({ ...onboardForm, room: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Floor</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2"
                        value={onboardForm.floor}
                        onChange={(e) => setOnboardForm({ ...onboardForm, floor: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Initial Availability Status</label>
                    <select
                      value={onboardForm.initialStatus}
                      onChange={(e) => setOnboardForm({ ...onboardForm, initialStatus: e.target.value as FacultyStatus })}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none bg-white"
                    >
                      <option value="AVAILABLE">Available in Office</option>
                      <option value="IN_CLASS">In Class</option>
                      <option value="IN_MEETING">In Consultation</option>
                      <option value="AWAY">Stepped Away</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowOnboardModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={quickOnboardMutation.isPending}
                      className="rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white hover:bg-violet-800 transition disabled:opacity-50"
                    >
                      {quickOnboardMutation.isPending ? "Saving to Supabase..." : "Create Faculty & Issue QR"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
