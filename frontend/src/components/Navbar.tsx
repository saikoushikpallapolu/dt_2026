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
  Shield,
  User,
  Users,
} from "lucide-react";
import { DEMO_ACCOUNTS, useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function Navbar() {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => api.getNotifications(),
    enabled: !!user,
    refetchInterval: 10000,
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md no-print">
      {/* Top Demo Bar for Testing */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-100">Live Campus Demo</span>
            <span className="hidden text-slate-400 sm:inline">— Self-Reported Availability Platform</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Role:</span>
            <span className="font-medium text-emerald-300">
              {user ? `${user.displayName || user.email} (${user.role})` : "Guest (Logged out)"}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="ml-2 inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-0.5 font-medium text-white hover:bg-slate-700 transition"
              >
                <span>Switch Demo Role</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-1 w-72 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl z-50">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Accounts:
                  </p>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleQuickSwitch(acc.email)}
                      className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition flex flex-col gap-0.5 ${
                        user?.email === acc.email
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                          : "text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <span className="font-medium">{acc.label}</span>
                      <span className="text-[10px] text-slate-400">{acc.roleDescription}</span>
                    </button>
                  ))}
                  {user && (
                    <button
                      onClick={() => {
                        setShowDemoMenu(false);
                        logout();
                      }}
                      className="mt-1 w-full rounded px-2.5 py-1 text-left text-xs text-rose-300 hover:bg-rose-950/40 transition"
                    >
                      Log out (Browse as Student Guest)
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
          <Link to="/" className="flex items-center gap-2.5 text-slate-900 hover:opacity-90 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Where Is My Professor?</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-indigo-600">
                Campus Availability
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/directory"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Faculty Directory</span>
            </Link>

            {user?.role === "STUDENT" && (
              <Link
                to="/student/portal"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>My Consultations & Favorites</span>
              </Link>
            )}

            {user?.role === "PROFESSOR" && (
              <Link
                to="/faculty/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <DoorOpen className="h-4 w-4 text-emerald-600" />
                <span>Status Control & Door Sign</span>
              </Link>
            )}

            {user?.role === "ADMINISTRATOR" && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Admin Suite & Campus</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications dropdown for logged in users */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {(notifData?.unreadCount ?? 0) > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {notifData?.unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    {(notifData?.unreadCount ?? 0) > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {notifData?.notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">No notifications yet</p>
                    ) : (
                      notifData?.notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded-lg p-2 text-xs transition ${
                            n.readAt ? "bg-slate-50 text-slate-600" : "bg-indigo-50/70 text-indigo-950 font-medium"
                          }`}
                        >
                          <p className="font-semibold">{n.title}</p>
                          <p className="mt-0.5 text-slate-600">{n.body}</p>
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
              <span className="hidden sm:inline-block text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
