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

  const { data: facultyData, isLoading, refetch } = useQuery({
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
    { label: "Available Now", value: "AVAILABLE" },
    { label: "In Class", value: "IN_CLASS" },
    { label: "In Meeting", value: "IN_MEETING" },
    { label: "Away", value: "AWAY" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Faculty Directory
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse campus professors, locate offices, and check real-time self-reported availability.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by professor name, title, or department…"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Department Select */}
            <div className="md:col-span-4">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Departments</option>
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
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : !facultyData?.items || facultyData.items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">No faculty members found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try clearing your search filters or check your spelling.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {facultyData.items.map((prof) => (
                <div
                  key={prof.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-lg border border-indigo-100">
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
                            className="font-bold text-slate-900 hover:text-indigo-600 transition"
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
                          onClick={() => handleToggleFavorite(prof.id, prof.isFavorited)}
                          className={`rounded-lg p-1.5 transition ${
                            prof.isFavorited
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                        status={prof.currentStatus.status as FacultyStatus}
                        isExpired={prof.currentStatus.isExpired}
                        isConfidentlyCurrent={prof.currentStatus.isConfidentlyCurrent}
                        size="sm"
                      />
                    </div>

                    {/* Office Location */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
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
                      className="flex-1 rounded-xl bg-slate-100 py-2 text-center text-xs font-semibold text-slate-800 hover:bg-slate-200 transition"
                    >
                      Door Placard
                    </Link>

                    <button
                      onClick={() => setConsultTarget({ id: prof.id, name: prof.displayName })}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Meet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {consultTarget && (
        <ConsultationModal
          professorId={consultTarget.id}
          professorName={consultTarget.name}
          isOpen={!!consultTarget}
          onClose={() => setConsultTarget(null)}
        />
      )}
    </div>
  );
}
