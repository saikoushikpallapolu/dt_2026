import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, ChevronDown, Bell, LogOut, ScanLine, Users, CalendarDays, User, LayoutDashboard, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; body: string } | null>(null);
  const prevCountRef = useRef<number | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => api.getNotifications(),
    enabled: !!user,
  });

  useEffect(() => {
    if (data?.unreadCount !== undefined) {
      if (prevCountRef.current !== null && data.unreadCount > prevCountRef.current) {
        const latest = data.notifications[0];
        if (latest) {
          setActiveToast({ id: latest.id, title: latest.title, body: latest.body });
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(latest.title, { body: latest.body });
            } catch {
              // ignore
            }
          }
        }
      }
      prevCountRef.current = data.unreadCount;
    }
  }, [data]);

  const portal = user?.role === 'PROFESSOR'
    ? '/faculty/dashboard'
    : user?.role === 'ADMINISTRATOR'
    ? '/admin/dashboard'
    : '/student/portal';

  const handleSignOut = async () => {
    await logout();
    setMenu(false);
    navigate('/login');
  };

  return (
    <>
      <header className="campus-nav no-print">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Compass size={23} />
            </span>
            <span>
              Find my professor
              <small>VNR VJIET · CAMPUS CONNECT</small>
            </span>
          </Link>

          <nav className="desktop-nav">
            <NavLink to="/directory">Faculty directory</NavLink>
            <NavLink to="/scan">Scan QR</NavLink>
            {user ? (
              <NavLink to={portal}>
                {user.role === 'PROFESSOR' ? 'My workspace' : user.role === 'ADMINISTRATOR' ? 'Admin portal' : 'My consultations'}
              </NavLink>
            ) : null}
          </nav>

          <div className="nav-controls">
            {user && (
              <div className="relative">
                <button
                  className="icon-button"
                  aria-label="Notifications"
                  onClick={() => setNotifications(!notifications)}
                >
                  <Bell size={19} />
                  {!!data?.unreadCount && <span className="notification-dot" />}
                </button>
                {notifications && (
                  <div className="nav-popover">
                    <div className="flex justify-between items-center">
                      <strong>Notifications</strong>
                      <button
                        className="text-xs text-violet-700 font-semibold"
                        onClick={async () => {
                          await api.markAllNotificationsRead();
                          refetch();
                        }}
                      >
                        Mark all read
                      </button>
                    </div>
                    {!data?.notifications.length ? (
                      <p className="muted py-5 text-center text-xs text-slate-400">You're all caught up.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {data.notifications.slice(0, 10).map((n) => {
                          const isUnread = !n.readAt;
                          return (
                            <div
                              className={`p-3 text-xs transition cursor-pointer hover:bg-violet-50/60 ${isUnread ? 'bg-violet-50/40' : ''}`}
                              key={n.id}
                              onClick={async () => {
                                if (isUnread) {
                                  await api.markNotificationRead(n.id);
                                  refetch();
                                }
                                setNotifications(false);
                                if (n.type === 'FACULTY_AVAILABLE' && n.payload?.slug) {
                                  navigate(`/faculty/${n.payload.slug}`);
                                } else if (n.type === 'MEETING_REQUESTED') {
                                  navigate(portal);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <strong className="text-slate-900 font-bold text-xs">{n.title}</strong>
                                {isUnread && <span className="h-2 w-2 rounded-full bg-violet-600 shrink-0 mt-1" />}
                              </div>
                              <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{n.body}</p>
                              <span className="mt-1.5 inline-block text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  className="role-button"
                  onClick={() => setMenu(!menu)}
                  aria-expanded={menu}
                >
                  <span className="role-avatar">
                    {user.displayName?.replace('Dr. ', '').slice(0, 1) || user.email.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="role-label">
                    {user.displayName || user.email.split('@')[0]}
                    <small>
                      {user.role === 'PROFESSOR'
                        ? 'Faculty Member'
                        : user.role === 'ADMINISTRATOR'
                        ? 'Administrator'
                        : 'Student'}
                    </small>
                  </span>
                  <ChevronDown size={14} />
                </button>

                {menu && (
                  <div className="nav-popover">
                    <div className="border-b border-violet-100 pb-3 mb-2">
                      <p className="font-bold text-xs text-violet-950">{user.displayName || user.email}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={portal}
                      onClick={() => setMenu(false)}
                      className="role-option"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard size={14} />
                        {user.role === 'PROFESSOR' ? 'My workspace' : user.role === 'ADMINISTRATOR' ? 'Admin dashboard' : 'My consultations'}
                      </span>
                    </Link>

                    <button
                      className="role-option text-rose-700"
                      onClick={handleSignOut}
                    >
                      <span className="flex items-center gap-2">
                        <LogOut size={14} />
                        Sign out
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-violet-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-800 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="mobile-nav no-print">
        <NavLink to="/directory">
          <Users size={20} />
          Directory
        </NavLink>
        <NavLink to="/scan">
          <ScanLine size={20} />
          Scan QR
        </NavLink>
        {user ? (
          <NavLink to={portal}>
            <CalendarDays size={20} />
            {user.role === 'PROFESSOR' ? 'Workspace' : 'Consultations'}
          </NavLink>
        ) : (
          <NavLink to="/login">
            <User size={20} />
            Sign In
          </NavLink>
        )}
      </nav>

      {/* Real-time Floating Notification Banner Toast */}
      {activeToast && (
        <div
          role="alert"
          className="fixed top-18 right-4 z-50 max-w-sm rounded-2xl border border-violet-200 bg-white p-4 shadow-xl ring-1 ring-violet-500/10 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-violet-600 text-white shrink-0 mt-0.5 shadow-xs">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-violet-950">{activeToast.title}</p>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{activeToast.body}</p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg"
              title="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
