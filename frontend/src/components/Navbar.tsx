import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, ChevronDown, Bell, LogOut, ScanLine, Users, CalendarDays, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => api.getNotifications(),
    enabled: !!user,
  });

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
                      <p className="muted py-5">You're all caught up.</p>
                    ) : (
                      data.notifications.slice(0, 8).map((n) => (
                        <div className="notification-item" key={n.id}>
                          <strong>{n.title}</strong>
                          <p>{n.body}</p>
                        </div>
                      ))
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
    </>
  );
}
