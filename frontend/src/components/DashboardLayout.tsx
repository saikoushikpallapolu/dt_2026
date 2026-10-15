import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Scan,
  Shield,
  Users,
} from "lucide-react";
import { DEMO_ACCOUNTS, useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { QrScannerModal } from "@/components/QrScannerModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => api.getNotifications(),
    enabled: !!user,
    refetchInterval: 12000,
  });

  const handleQuickSwitch = async (email: string) => {
    await quickSwitch(email);
    if (email.includes("admin")) {
      navigate("/admin/dashboard");
    } else if (email.includes("rivera") || email.includes("chen")) {
      navigate("/faculty/dashboard");
    } else {
      navigate("/student/portal");
    }
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    refetchNotifs();
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-[#fcfbfe] text-[#1e1338]">
      {/* Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-violet-100 bg-white/95 shadow-xs backdrop-blur-sm no-print">
        <div className="flex flex-col flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Active User Card */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/70 to-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-900 text-amber-300 font-bold border border-amber-300/40 shadow-sm">
                {user?.displayName
                  ? user.displayName
                      .split(" ")
                      .filter((s: string) => !s.startsWith("Dr."))
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                  : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">
                  {user?.displayName || (user ? user.email : "Guest Visitor")}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-800">
                    {user?.role || "GUEST"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Panel 1: Primary Dashboard Routes */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-violet-700">
              Workspace Panels
            </p>

            {user?.role === "PROFESSOR" && (
              <>
                <Link
                  to="/faculty/dashboard"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/faculty/dashboard"
                      ? "bg-violet-900 text-white shadow-sm shadow-violet-950/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DoorOpen className={`h-4 w-4 ${location.pathname === "/faculty/dashboard" ? "text-amber-300" : "text-violet-700"}`} />
                    <span>Live Status Control</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/directory"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/directory"
                      ? "bg-violet-900 text-white shadow-sm shadow-violet-950/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`h-4 w-4 ${location.pathname === "/directory" ? "text-amber-300" : "text-violet-700"}`} />
                    <span>Faculty Directory</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </>
            )}

            {user?.role === "STUDENT" && (
              <>
                <Link
                  to="/student/portal"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/student/portal"
                      ? "bg-violet-900 text-white shadow-sm shadow-violet-950/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className={`h-4 w-4 ${location.pathname === "/student/portal" ? "text-amber-300" : "text-violet-700"}`} />
                    <span>My Consultations &amp; Saved</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/directory"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/directory"
                      ? "bg-violet-900 text-white shadow-sm shadow-violet-950/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`h-4 w-4 ${location.pathname === "/directory" ? "text-amber-300" : "text-violet-700"}`} />
                    <span>Faculty Directory</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </>
            )}

            {user?.role === "ADMINISTRATOR" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/admin/dashboard"
                      ? "bg-violet-900 text-white shadow-sm shadow-violet-950/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className={`h-4 w-4 ${location.pathname === "/admin/dashboard" ? "text-amber-300" : "text-violet-700"}`} />
                    <span>Campus Administration</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/directory"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/directory"
                      ? "bg-violet-900 text-white shadow-sm shadow-violet-950/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`h-4 w-4 ${location.pathname === "/directory" ? "text-amber-300" : "text-violet-700"}`} />
                    <span>Faculty Directory</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/"
                      ? "bg-violet-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4 text-violet-700" />
                    <span>Campus Home</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/directory"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    location.pathname === "/directory"
                      ? "bg-violet-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-violet-700" />
                    <span>Faculty Directory</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </>
            )}

            {/* Placard Scanner Button */}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="mt-2 flex w-full items-center justify-between rounded-xl border border-amber-300/60 bg-amber-50/70 px-3 py-2.5 text-xs font-bold text-amber-950 hover:bg-amber-100 transition shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Scan className="h-4 w-4 text-amber-700" />
                <span>Door QR Scanner</span>
              </div>
              <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] text-amber-900">Scan</span>
            </button>
          </div>

          {/* Quick Demo Switcher Panel */}
          <div className="space-y-2 border-t border-violet-100 pt-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-violet-700">
              Interactive Roles
            </p>
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSwitch(acc.email)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs transition flex flex-col ${
                    user?.email === acc.email
                      ? "bg-violet-100/90 text-violet-950 font-bold border border-violet-300"
                      : "text-slate-600 hover:bg-violet-50/60 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{acc.label}</span>
                    {user?.email === acc.email && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-violet-800" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{acc.roleDescription}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-violet-100 p-4 bg-slate-50/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Sync Active</span>
            </span>
            {user ? (
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link to="/login" className="font-semibold text-violet-800 hover:underline">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Context Breadcrumb & Action Strip */}
        <div className="border-b border-violet-100/80 bg-white/80 px-4 py-3.5 sm:px-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-violet-700 font-medium">
              <Link to="/" className="hover:underline">Campus</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">{title}</span>
            </div>
            <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 max-w-2xl">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {actions}

            {/* Notification button */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative rounded-xl border border-violet-100 bg-white p-2 text-slate-600 hover:bg-violet-50 transition shadow-2xs"
                  title="Campus Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {(notifData?.unreadCount ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                      {notifData?.unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-violet-100 bg-white p-3 shadow-xl z-50 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800 text-xs">Campus Notifications</span>
                      {(notifData?.unreadCount ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-violet-700 hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                      {!notifData?.notifications || notifData.notifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-400">No notifications yet</p>
                      ) : (
                        notifData.notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-xl p-2.5 text-xs transition ${
                              n.readAt ? "bg-slate-50 text-slate-600" : "bg-violet-50/80 text-violet-950 font-medium border border-violet-200/50"
                            }`}
                          >
                            <p className="font-bold">{n.title}</p>
                            <p className="mt-0.5 text-slate-600 text-[11px]">{n.body}</p>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
