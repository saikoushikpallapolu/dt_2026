import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  DoorOpen,
  Info,
  MapPin,
  Scan,
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
    <div className="min-h-screen bg-[#fcfbfe] text-[#1e1338] pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-violet-100 bg-gradient-to-b from-white via-violet-50/30 to-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.12),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Campus Real-Time Availability Network</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-violet-950 sm:text-6xl sm:leading-tight">
            Know If Your Professor Is In Office <br className="hidden sm:inline" />
            <span className="gold-gradient-text">Before Walking Across Campus</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
            Every faculty office on campus is equipped with a permanent door placard. 
            Professors publish their live availability, lecture room location, and expected return time. 
            Check online or scan the placard directly at their office door.
          </p>

          {/* Quick Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-950/25 hover:bg-violet-800 transition"
            >
              <Scan className="h-4 w-4 text-amber-300" />
              <span>Scan Door QR Placard</span>
            </Link>

            <Link
              to="/directory"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-3.5 text-sm font-bold text-violet-950 shadow-xs hover:bg-violet-50 transition"
            >
              <Users className="h-4 w-4 text-violet-700" />
              <span>Browse Faculty Directory</span>
            </Link>

            <Link
              to="/qr/qr-elena-rivera-demo"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/60 px-5 py-3.5 text-sm font-bold text-amber-950 shadow-xs hover:bg-amber-100/70 transition"
            >
              <DoorOpen className="h-4 w-4 text-amber-700" />
              <span>View Sample Door Sign</span>
            </Link>
          </div>

          {/* Ethical Disclaimer Callout */}
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-violet-100 bg-white p-3.5 text-left text-xs text-slate-600 flex items-start gap-2.5 shadow-2xs">
            <Info className="h-4 w-4 text-violet-700 shrink-0 mt-0.5" />
            <p>
              <strong className="text-violet-950">Self-Reported Privacy Architecture:</strong> Faculty publish their own availability and return times. This platform does not claim or perform automated physical GPS or device tracking.
            </p>
          </div>
        </div>
      </section>

      {/* "What Do You Want To Do?" - 3 Defined User Panels */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Immediate Campus Entry Points
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-violet-950 sm:text-3xl">
            Choose Your Interaction
          </h2>
          <p className="mt-2 text-xs text-slate-500 max-w-lg mx-auto">
            Whether you are standing outside an office door or planning your week from the library, here is how to use WIMP:
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Panel 1: Students */}
          <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-900 font-bold border border-violet-200">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-violet-950">1. I Am a Student</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Find your advisor or course instructor, check if they are in their office right now, review posted consultation hours, and submit meeting requests.
              </p>
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Real-time availability status beacons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>One-click consultation booking</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/directory"
                className="flex items-center justify-between rounded-xl bg-violet-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-800 transition"
              >
                <span>Browse Faculty Directory</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/student/portal"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>My Saved Faculty &amp; Meetings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Panel 2: At Office Door */}
          <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-b from-amber-50/40 via-white to-white p-7 shadow-xs hover:shadow-md transition flex flex-col justify-between ring-1 ring-amber-400/20">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 font-bold border border-amber-300">
                <Scan className="h-6 w-6" />
              </div>
              <div className="mt-2 inline-block rounded-md bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                AT THE OFFICE DOOR
              </div>
              <h3 className="mt-2 text-lg font-bold text-violet-950">2. Standing at Door Placard</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Scan the permanent placard mounted outside any faculty door. Instantly see their physical location, return countdown clock, or leave a note.
              </p>
              <div className="mt-4 space-y-2 border-t border-amber-100 pt-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-700" />
                  <span>Permanent door tokens (no battery, zero GPS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-700" />
                  <span>Audible scan chime &amp; interactive simulator</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/scan"
                className="flex items-center justify-between rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-amber-950 shadow-sm hover:bg-amber-400 transition"
              >
                <span>Open Door Scanner</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/qr/qr-elena-rivera-demo"
                className="flex items-center justify-between rounded-xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-50 transition"
              >
                <span>Preview Placard Demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Panel 3: Faculty */}
          <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-900 font-bold border border-violet-200">
                <DoorOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-violet-950">3. I Am Faculty / Staff</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Update your office door status in 1 tap, connect automatic timetable sync, accept student consultation requests, and print your physical door placard.
              </p>
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-700" />
                  <span>Timetable auto-switch between classes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-700" />
                  <span>High-resolution printable door signs</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/faculty/dashboard"
                className="flex items-center justify-between rounded-xl bg-violet-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-800 transition"
              >
                <span>Faculty Status Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/qr/qr-elena-rivera-demo/print"
                target="_blank"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Print Office Door Sign</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How the System Works: 3 Steps */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-950 via-purple-950 to-violet-950 p-8 sm:p-12 text-white shadow-xl shadow-violet-950/10">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Campus Placard Architecture
            </span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              How "Where Is My Professor?" Works
            </h2>
            <p className="mt-2 text-xs text-violet-200 leading-relaxed">
              Eliminate wasted walks across campus and missed office hours with a permanent, privacy-first physical placard platform.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-violet-800/60 bg-violet-900/50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-violet-950 font-black text-sm">
                1
              </div>
              <h4 className="mt-4 text-sm font-bold text-white">Permanent Door Sign</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Every office door receives a permanent QR placard. Even when status changes or professors switch offices, the permanent sign never requires reprinting.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-800/60 bg-violet-900/50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-violet-950 font-black text-sm">
                2
              </div>
              <h4 className="mt-4 text-sm font-bold text-white">Live Broadcast &amp; Auto-Sync</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Professors tap once to change status (Available, In Class, In Meeting, Away). The automation worker also auto-syncs with scheduled classes and booked consultations.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-800/60 bg-violet-900/50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-violet-950 font-black text-sm">
                3
              </div>
              <h4 className="mt-4 text-sm font-bold text-white">Clear Return Times</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Students scan the sign or check online to see real-time return countdowns, alternate lecture rooms, and drop-in availability before knocking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Faculty Availability Directory Preview */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-violet-100 pb-4 gap-2">
          <div>
            <h2 className="text-xl font-black text-violet-950">Campus Faculty Directory</h2>
            <p className="text-xs text-slate-500">Real-time status broadcast by university faculty members.</p>
          </div>
          <Link
            to="/directory"
            className="inline-flex items-center gap-1 text-xs font-bold text-violet-800 hover:text-violet-950 transition"
          >
            <span>View Full Directory ({facultyData?.pagination?.total || 2} Faculty)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {facultyData?.items.map((prof) => (
            <div
              key={prof.id}
              className="flex items-start justify-between rounded-3xl border border-violet-100 bg-white p-6 shadow-xs hover:border-violet-300 hover:shadow-md transition"
            >
              <div>
                <Link
                  to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                  className="text-base font-bold text-violet-950 hover:text-violet-700 transition"
                >
                  {prof.displayName}
                </Link>
                <p className="text-xs text-slate-500">
                  {prof.designation} · {prof.department.name}
                </p>

                <div className="mt-3">
                  <StatusBadge
                    status={prof.currentStatus.status as FacultyStatus}
                    isExpired={prof.currentStatus.isExpired}
                    isConfidentlyCurrent={prof.currentStatus.isConfidentlyCurrent}
                    size="sm"
                  />
                </div>

                {prof.office && (
                  <p className="mt-3 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-amber-600" />
                    <span>{prof.office.buildingName} · Room {prof.office.room}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to={prof.activeQrToken ? `/qr/${prof.activeQrToken}` : `/faculty/${prof.slug}`}
                  className="rounded-xl bg-violet-50 border border-violet-200/60 px-3.5 py-1.5 text-xs font-bold text-violet-900 hover:bg-violet-100 transition text-center"
                >
                  Door Sign
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
