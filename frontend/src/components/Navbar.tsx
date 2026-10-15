import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  ChevronDown,
  Compass,
  DoorOpen,
  LogOut,
  Scan,
  Shield,
  User,
  Users,
} from "lucide-react";
import { DEMO_ACCOUNTS, useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { QrScannerModal } from "./QrScannerModal";

export function Navbar() {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => api.getNotifications(),
    enabled: !!user,
    refetchInterval: 12000,
  });

  const handleQuickSwitch = async (email: string) => {
    setShowDemoMenu(false);
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
    <header className="sticky top-0 z-40 border-b border-violet-100/90 bg-white/95 backdrop-blur-md no-print shadow-2xs">
      {/* Top Demo & Network Bar */}
      <div className="bg-gradient-to-r from-violet-950 via-[#35105a] to-violet-950 px-4 py-1.5 text-xs text-violet-200 border-b border-amber-400/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-amber-300">WIMP Campus Network</span>
            <span className="hidden text-violet-300 sm:inline">— Live Faculty Availability &amp; Door Placards</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-violet-300">Active Role:</span>
            <span className="font-semibold text-amber-200">
              {user ? `${user.displayName || user.email} (${user.role})` : "Guest Visitor"}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="ml-2 inline-flex items-center gap-1 rounded-md bg-violet-900/90 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-violet-800 transition"
              >
                <span>Switch Role</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-1.5 w-72 rounded-2xl border border-violet-800 bg-violet-950 p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                    Switch Active Campus Account:
                  </p>
                  <div className="mt-1 space-y-1">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleQuickSwitch(acc.email)}
                        className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs transition flex flex-col gap-0.5 ${
                          user?.email === acc.email
                            ? "bg-violet-800 text-amber-200 border border-amber-400/40 font-semibold"
                            : "text-slate-200 hover:bg-violet-900/60"
                        }`}
                      >
                        <span className="font-semibold">{acc.label}</span>
                        <span className="text-[10px] text-violet-300">{acc.roleDescription}</span>
                      </button>
                    ))}
                  </div>
                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDemoMenu(false);
                        logout();
                      }}
                      className="mt-1.5 w-full rounded-xl px-2.5 py-1.5 text-left text-xs text-rose-300 hover:bg-rose-950/40 transition border-t border-violet-900"
                    >
                      Sign Out (Browse as Guest)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-slate-900 hover:opacity-95 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-900 text-amber-300 border border-amber-300/40 shadow-md shadow-violet-950/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-violet-950">Where Is My Professor?</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Official Campus Placard Network
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-300/80 px-3.5 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 transition shadow-2xs mr-1"
            >
              <Scan className="h-3.5 w-3.5 text-amber-700" />
              <span>Door QR Scanner</span>
            </button>

            <Link
              to="/directory"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-950 transition"
            >
              <Users className="h-4 w-4 text-violet-700" />
              <span>Faculty Directory</span>
            </Link>

            {user?.role === "STUDENT" && (
              <Link
                to="/student/portal"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-950 transition"
              >
                <Calendar className="h-4 w-4 text-violet-700" />
                <span>My Consultations &amp; Saved</span>
              </Link>
            )}

            {user?.role === "PROFESSOR" && (
              <Link
                to="/faculty/dashboard"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-950 transition"
              >
                <DoorOpen className="h-4 w-4 text-violet-700" />
                <span>Faculty Status Portal</span>
              </Link>
            )}

            {user?.role === "ADMINISTRATOR" && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-950 transition"
              >
                <Shield className="h-4 w-4 text-violet-700" />
                <span>Campus Admin</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications dropdown for logged in users */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative rounded-xl border border-violet-100 p-2 text-slate-600 hover:bg-violet-50 hover:text-violet-950 transition"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(notifData?.unreadCount ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {notifData?.unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-violet-100 bg-white p-3 shadow-2xl z-50 animate-in fade-in">
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

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold text-violet-950 bg-violet-50 border border-violet-200/60 px-3 py-1.5 rounded-xl">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition"
            >
              <User className="h-3.5 w-3.5 text-amber-300" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </header>
  );
}
