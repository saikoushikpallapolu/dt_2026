import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { ConsultationModal } from "@/components/ConsultationModal";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { FacultyStatus } from "@wimp/shared";

export function DirectoryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [consultTarget, setConsultTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.getDepartments(),
  });

  const { data: facultyData, isLoading, isError, refetch } = useQuery({
    queryKey: ["faculty-directory", search, selectedDept, selectedStatus],
    queryFn: () =>
      api.getFacultyList({
        search: search || undefined,
        departmentId: selectedDept || undefined,
        status: selectedStatus || undefined,
        limit: 30,
      }),
  });

  const handleToggleFavorite = async (profId: string, currentlyFavorited?: boolean) => {
    if (!user) return;
    try {
      if (currentlyFavorited) {
        await api.removeFavorite(profId);
      } else {
        await api.addFavorite(profId);
      }
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const statusFilters: { label: string; value: string }[] = [
    { label: "All Statuses", value: "" },
    { label: "Available in Office", value: "AVAILABLE" },
    { label: "In Class", value: "IN_CLASS" },
    { label: "In Consultation", value: "IN_MEETING" },
    { label: "Stepped Away", value: "AWAY" },
  ];

  return (
    <DashboardLayout
      title="Faculty Directory"
      subtitle="Find the right person. Check their availability. Make your next conversation count."
      actions={
        <div className="text-xs font-semibold text-slate-500 bg-white border border-violet-100 px-3 py-1.5 rounded-xl shadow-2xs">
          Showing {facultyData?.items?.length || 0} Faculty Members
        </div>
      }
    >
      {/* Search & Filter Panel */}
      <div className="rounded-3xl border border-violet-100 bg-white p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-violet-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by professor name, designation, or department..."
              className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
          </div>

          {/* Department Select */}
          <div className="md:col-span-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 py-2.5 px-3 text-xs sm:text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
            >
              <option value="">All Academic Departments</option>
              {deptData?.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 py-2.5 px-3 text-xs sm:text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600 bg-white"
            >
              {statusFilters.map((sf) => (
                <option key={sf.value} value={sf.value}>
                  {sf.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="mt-6">
        {isError ? <div role="alert" className="panel">Could not load faculty. <button onClick={() => refetch()}>Try again</button></div> : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-3xl border border-violet-100 bg-white p-6 shadow-xs animate-pulse" />
            ))}
          </div>
        ) : !facultyData?.items || facultyData.items.length === 0 ? (
          <div className="rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-xs">
            <Users className="mx-auto h-12 w-12 text-violet-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No faculty members found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search query or reset the filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facultyData.items.map((prof) => (
              <div
                key={prof.id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-900 text-amber-300 font-bold text-base border border-amber-300/40 shadow-xs">
                        {prof.displayName
                          .split(" ")
                          .filter((p) => !p.startsWith("Dr."))
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2) || "FP"}
                      </div>
                      <div>
                        <Link
                          to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                          className="font-bold text-violet-950 hover:text-violet-700 transition text-sm"
                        >
                          {prof.displayName}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">
                          {prof.designation} · {prof.department.code}
                        </p>
                      </div>
                    </div>

                    {user?.role === "STUDENT" && (
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(prof.id, prof.isFavorited)}
                        className={`rounded-xl p-1.5 transition ${
                          prof.isFavorited
                            ? "text-amber-500 hover:bg-amber-50"
                            : "text-slate-400 hover:bg-violet-50 hover:text-violet-950"
                        }`}
                        title="Bookmark faculty"
                      >
                        {prof.isFavorited ? (
                          <BookmarkCheck className="h-5 w-5 fill-amber-500" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="mt-4">
                    <StatusBadge
                      status={(prof.currentStatus?.status || "UNKNOWN") as FacultyStatus}
                      isExpired={prof.currentStatus?.isExpired}
                      isConfidentlyCurrent={prof.currentStatus?.isConfidentlyCurrent}
                      size="sm"
                    />
                  </div>

                  {/* Office Location */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    {prof.office ? (
                      <span>
                        {prof.office.buildingName} · Floor {prof.office.floor} · Room {prof.office.room}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Office unassigned</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                    className="flex-1 rounded-xl bg-violet-50 border border-violet-200/60 py-2 text-center text-xs font-bold text-violet-900 hover:bg-violet-100 transition"
                  >
                    View profile
                  </Link>

                  <button
                    type="button"
                    onClick={() => setConsultTarget({ id: prof.id, name: prof.displayName })}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-violet-800 shadow-xs transition"
                  >
                    <Calendar className="h-3.5 w-3.5 text-amber-300" />
                    <span>Meet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {consultTarget && (
        <ConsultationModal
          professorId={consultTarget.id}
          professorName={consultTarget.name}
          isOpen={!!consultTarget}
          onClose={() => setConsultTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}
