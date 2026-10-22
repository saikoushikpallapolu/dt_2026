import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useIsMutating } from '@tanstack/react-query';
import { Compass, ChevronDown, Bell, LogOut, ScanLine, Users, CalendarDays, LayoutDashboard } from 'lucide-react';
import { DEMO_ACCOUNTS, useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
export function Navbar() {
  const {user, quickSwitch, logout}=useAuth();
  const navigate=useNavigate();
  const savingStatus=useIsMutating({mutationKey:["publish-status"]})>0;
  const [menu,setMenu]=useState(false), [notifications,setNotifications]=useState(false), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const {data,refetch}=useQuery({queryKey:['notifications',user?.id],queryFn:()=>api.getNotifications(),enabled:!!user});
  const portal=user?.role==='PROFESSOR'?'/faculty/dashboard':user?.role==='ADMINISTRATOR'?'/admin/dashboard':'/student/portal';
  async function switchRole(email:string, role:string) {setBusy(true);setError('');try {await quickSwitch(email);setMenu(false);navigate(role==='PROFESSOR'?'/faculty/dashboard':role==='ADMINISTRATOR'?'/admin/dashboard':'/student/portal');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <><header className="campus-nav no-print"><div className="nav-inner">
    <Link to="/" className="brand"><span className="brand-icon"><Compass size={23}/></span><span>Find my professor<small>VNR VJIET · CAMPUS CONNECT</small></span></Link>
    <nav className="desktop-nav"><NavLink to="/directory">Faculty directory</NavLink><NavLink to="/scan">Scan QR</NavLink><NavLink to={user?portal:'/login'}>{user?.role==='PROFESSOR'?'My workspace':'My campus'}</NavLink></nav>
    <div className="nav-controls">{user&&<div className="relative"><button className="icon-button" aria-label="Notifications" onClick={()=>setNotifications(!notifications)}><Bell size={19}/>{!!data?.unreadCount&&<span className="notification-dot"/>}</button>{notifications&&<div className="nav-popover"><div className="flex justify-between items-center"><strong>Notifications</strong><button className="text-xs text-violet-700" onClick={async()=>{await api.markAllNotificationsRead();refetch();}}>Mark read</button></div>{!data?.notifications.length?<p className="muted py-5">You're all caught up.</p>:data.notifications.slice(0,8).map(n=><div className="notification-item" key={n.id}><strong>{n.title}</strong><p>{n.body}</p></div>)}</div>}</div>}
    <div className="relative"><button className="role-button" onClick={()=>setMenu(!menu)} aria-expanded={menu}><span className="role-avatar">{user?.displayName?.replace('Dr. ','').slice(0,1)||'V'}</span><span className="role-label">{user?user.displayName||user.email.split('@')[0]:'Explore the demo'}<small>{user?user.role.toLowerCase():'Choose a role'}</small></span><ChevronDown size={14}/></button>
    {menu&&<div className="nav-popover"><p className="eyebrow mb-3">DEMO WORKSPACE</p><p className="muted text-xs mb-3">Sample accounts · fictional faculty</p>{DEMO_ACCOUNTS.map(a=><button disabled={busy || savingStatus} key={a.email} onClick={()=>switchRole(a.email,a.role)} className="role-option"><strong>{a.label}</strong><span>{a.roleDescription}</span></button>)}{error&&<p role="alert" className="text-red-700 text-xs">{error}</p>}{user&&<button disabled={savingStatus} className="role-option" onClick={async()=>{await logout();setMenu(false);navigate('/');}}><span className="flex gap-2"><LogOut size={14}/>Sign out</span></button>}</div>}</div></div></div></header>
    <nav className="mobile-nav no-print"><NavLink to="/directory"><Users size={20}/>Directory</NavLink><NavLink to="/scan"><ScanLine size={20}/>Scan QR</NavLink><NavLink to={user?portal:'/login'}><CalendarDays size={20}/>My campus</NavLink><NavLink to="/"><LayoutDashboard size={20}/>Home</NavLink></nav></>;
}
