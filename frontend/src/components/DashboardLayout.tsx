import { NavLink } from 'react-router-dom';
import { Compass, Users, ScanLine, CalendarDays, ArrowUpRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
interface DashboardLayoutProps {children:React.ReactNode; title:string; subtitle?:string; actions?:React.ReactNode;}
export function DashboardLayout({children,title,subtitle,actions}:DashboardLayoutProps) {
 const {user}=useAuth();
 const portal=user?.role==='PROFESSOR'?'/faculty/dashboard':user?.role==='ADMINISTRATOR'?'/admin/dashboard':'/student/portal';
 return <div className="workspace"><aside className="workspace-sidebar no-print"><p className="eyebrow">YOUR CAMPUS</p><NavLink to="/"><Compass size={18}/>Overview</NavLink><NavLink to="/directory"><Users size={18}/>Faculty directory</NavLink><NavLink to="/scan"><ScanLine size={18}/>Scan a QR code</NavLink><NavLink to={user?portal:'/login'}><CalendarDays size={18}/>{user?.role==='PROFESSOR'?'My workspace':'My consultations'}</NavLink><div className="sidebar-note"><LayoutDashboard size={23}/><h3>A little less searching.<br/>A lot more connecting.</h3><p>Find your faculty, plan a visit, and make time for what matters.</p><NavLink to="/qr-gallery">Campus QR collection <ArrowUpRight size={16}/></NavLink></div><p className="sidebar-footer">VNR VJIET<br/><span>Student project · Demonstration</span></p></aside><main className="workspace-main"><div className="page-heading"><div><p className="eyebrow">VNR VJIET / CAMPUS CONNECT</p><h1>{title}</h1>{subtitle&&<p className="muted">{subtitle}</p>}</div>{actions}</div>{children}</main></div>;
}
