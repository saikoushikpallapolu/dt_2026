import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle,
  Eye,
  RotateCcw,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";

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
    departmentId: "",
    officeId: "",
  });
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);

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

  // Mutations
  const onboardMutation = useMutation({
    mutationFn: (payload: any) => api.createAdminProfessor(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setOnboardSuccess(`Created ${data.professor.displayName} with QR token ${data.initialQrToken}`);
      setShowOnboardModal(false);
      setOnboardForm({
        displayName: "",
        email: "",
        password: "DemoPass123!",
        designation: "Assistant Professor",
        departmentId: "",
        officeId: "",
      });
      setTimeout(() => setOnboardSuccess(null), 5000);
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

  // Flatten offices for selection
  const allOffices: any[] = [];
  buildingData?.buildings.forEach((b: any) => {
    b.offices.forEach((o: any) => {
      allOffices.push({
        id: o.id,
        label: `${b.name} (${b.code}) - Floor ${o.floor}, Room ${o.room} ${o.label ? `[${o.label}]` : ""}`,
      });
    });
  });

  const analytics = analyticsData?.analytics;

  return (
    <DashboardLayout
      title="Campus Administration Suite"
      subtitle="Manage faculty assignments, permanent office door placards, campus buildings, and audit logs."
      actions={
        <button
          type="button"
          onClick={() => setShowOnboardModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
        >
          <UserPlus className="h-4 w-4 text-amber-300" />
          <span>Onboard Faculty</span>
        </button>
      }
    >
      {onboardSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{onboardSuccess}</span>
        </div>
      )}

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

      {/* Status Breakdown Panel */}
      {analytics && (
        <div className="mt-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Faculty Availability Breakdown
          </span>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {Object.entries(analytics.statusDistribution).map(([stat, count]) => (
              <div
                key={stat}
                className="flex items-center gap-2 rounded-xl bg-violet-50/70 px-3.5 py-1.5 border border-violet-200/60 text-xs font-semibold"
              >
                <span className="text-violet-950">{stat}:</span>
                <span className="font-bold text-amber-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="mt-8 flex gap-2 border-b border-violet-100 pb-2">
        {[
          { id: "professors", label: "Faculty & Door QR Codes", icon: Users },
          { id: "campus", label: "Buildings & Offices", icon: Building2 },
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

      {/* Tab 1: Faculty & QR Panel */}
      {activeTab === "professors" && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-violet-50/60 border-b border-violet-100 font-bold text-violet-950 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Faculty Member</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Assigned Office</th>
                  <th className="px-5 py-3.5">Live Status</th>
                  <th className="px-5 py-3.5">Permanent QR Token</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading faculty...</td>
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
                          <span>{p.office.buildingName} {p.office.room}</span>
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
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                        {activeQr ? (
                          <span className="rounded bg-violet-50 px-2 py-0.5 text-violet-900 border border-violet-200">
                            {activeQr.token}
                          </span>
                        ) : (
                          <span className="text-amber-700">None active</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeQr ? (
                            <>
                              <Link
                                to={`/qr/${activeQr.token}`}
                                target="_blank"
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-violet-50 hover:text-violet-900"
                                title="View public page"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => revokeQrMutation.mutate(activeQr.id)}
                                className="rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
                              >
                                Revoke Sign
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

      {/* Tab 2: Campus Buildings Panel */}
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

      {/* Tab 3: Security & Audit Logs Panel */}
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

      {/* Onboard Faculty Member Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-7 shadow-2xl">
            <h3 className="text-lg font-bold text-violet-950">Onboard Faculty Member</h3>
            <p className="mt-1 text-xs text-slate-500">
              Creates login credentials, faculty profile, assigns an office, and generates a permanent door QR placard.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onboardMutation.mutate(onboardForm);
              }}
              className="mt-5 space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ada Lovelace"
                  value={onboardForm.displayName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, displayName: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Faculty Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ada@demo.local"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Professor"
                    value={onboardForm.designation}
                    onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Department</label>
                  <select
                    required
                    value={onboardForm.departmentId}
                    onChange={(e) => setOnboardForm({ ...onboardForm, departmentId: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none bg-white"
                  >
                    <option value="">Select department</option>
                    {deptData?.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assign Office</label>
                  <select
                    value={onboardForm.officeId}
                    onChange={(e) => setOnboardForm({ ...onboardForm, officeId: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-violet-600 focus:outline-none bg-white"
                  >
                    <option value="">No office / assign later</option>
                    {allOffices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardMutation.isPending}
                  className="rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white hover:bg-violet-800 transition disabled:opacity-50"
                >
                  {onboardMutation.isPending ? "Onboarding..." : "Create Faculty & Issue QR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
