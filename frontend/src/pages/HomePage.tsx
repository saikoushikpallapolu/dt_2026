import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  DoorOpen,
  Info,
  MapPin,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import type { FacultyStatus } from "@wimp/shared";

export function HomePage() {
  const { data: facultyData } = useQuery({
    queryKey: ["home-faculty"],
    queryFn: () => api.getFacultyList({ limit: 4 }),
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Smart &amp; Organized Campus Life</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Where Is My Professor?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
            Scan permanent office door QR codes to check a professor’s latest self-reported availability, expected return time, and consultation hours before knocking.
          </p>

          {/* Ethical Disclaimer Callout */}
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-left text-xs text-slate-600 flex items-start gap-2.5 shadow-2xs">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              <strong>Self-Reported Status:</strong> Faculty publish their own availability and return times. This platform does not claim or perform automated physical tracking.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition"
            >
              <QrCode className="h-5 w-5" />
              <span>📷 Open Live QR Scanner</span>
            </Link>

            <Link
              to="/qr/qr-elena-rivera-demo"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
            >
              <span>View Sample Door Placard</span>
            </Link>

            <Link
              to="/directory"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
            >
              <Users className="h-5 w-5 text-slate-500" />
              <span>Search Directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Demos */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Primary Checkpoint Demos
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Explore the Core System Features
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Demo 1: Active QR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">1. Active Office QR Placard</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Scan the permanent door sign for Dr. Elena Rivera (Room 204). Check live availability, office hours, and consultation booking.
              </p>
            </div>
            <Link
              to="/qr/qr-elena-rivera-demo"
              className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Launch QR Page</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Demo 2: Expired Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">2. Stale / Expired Status Demo</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Dr. Marcus Chen is seeded with an expired IN_CLASS status. View how the system transparently indicates stale information.
              </p>
            </div>
            <Link
              to="/faculty/marcus-chen"
              className="mt-6 flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-900"
            >
              <span>View Expired Status</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Demo 3: Revoked QR Placard */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 font-bold">
                <DoorOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">3. Revoked Placard Demo</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Try opening a decommissioned door sign token (`qr-marcus-chen-revoked`) to verify the graceful deactivated state.
              </p>
            </div>
            <Link
              to="/qr/qr-marcus-chen-revoked"
              className="mt-6 flex items-center justify-between text-xs font-bold text-rose-700 hover:text-rose-900"
            >
              <span>Test Revoked QR</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Faculty Highlights */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campus Faculty Directory Preview</h2>
            <p className="text-xs text-slate-500">Live statuses published by university professors.</p>
          </div>
          <Link to="/directory" className="text-xs font-bold text-indigo-600 hover:underline">
            View All ({facultyData?.pagination?.total || 2}) →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {facultyData?.items.map((prof) => (
            <div
              key={prof.id}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
            >
              <div>
                <Link
                  to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                  className="font-bold text-slate-900 hover:text-indigo-600 transition"
                >
                  {prof.displayName}
                </Link>
                <p className="text-xs text-slate-500">
                  {prof.designation} · {prof.department.name}
                </p>
                <div className="mt-2.5">
                  <StatusBadge
                    status={prof.currentStatus.status as FacultyStatus}
                    isExpired={prof.currentStatus.isExpired}
                    isConfidentlyCurrent={prof.currentStatus.isConfidentlyCurrent}
                    size="sm"
                  />
                </div>
                {prof.office && (
                  <p className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{prof.office.buildingName} · Room {prof.office.room}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition text-center"
                >
                  Door Placard
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
