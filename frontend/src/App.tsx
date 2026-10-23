import { LiveSync } from "@/components/LiveSync";
import { Fragment, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { QrStatusPage } from "@/pages/QrStatusPage";
import { PrintSignPage } from "@/pages/PrintSignPage";
import { DirectoryPage } from "@/pages/DirectoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfessorDashboard } from "@/pages/ProfessorDashboard";
import { StudentPortal } from "@/pages/StudentPortal";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { QrGalleryPage } from "@/pages/QrGalleryPage";

const ScanPage = lazy(() => import("@/pages/ScanPage").then(module => ({ default: module.ScanPage })));

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p className="p-8 muted">Connecting to campus portal…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "PROFESSOR") return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === "ADMINISTRATOR") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/directory" replace />;
}

function Protected({ role, children }: { role: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p className="p-8">Loading workspace…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <div className="panel m-8">
        <h1 className="text-xl font-semibold">Access Restricted</h1>
        <p className="muted mt-2">You are signed in as {user.role.toLowerCase()}. This section requires {role.toLowerCase()} authorization.</p>
      </div>
    );
  }
  return <Fragment key={user.id}>{children}</Fragment>;
}

export function App() {
  return (
    <AuthProvider>
      <LiveSync />
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={<p className="p-8 muted">Loading campus tools…</p>}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/directory" element={<DirectoryPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/qr/:token" element={<QrStatusPage />} />
              <Route path="/qr/:token/print" element={<PrintSignPage />} />
              <Route path="/faculty/:slug" element={<QrStatusPage />} />
              <Route path="/qr-gallery" element={<QrGalleryPage />} />
              <Route path="/student/portal" element={<Protected role="STUDENT"><StudentPortal /></Protected>} />
              <Route path="/faculty/dashboard" element={<Protected role="PROFESSOR"><ProfessorDashboard /></Protected>} />
              <Route path="/admin/dashboard" element={<Protected role="ADMINISTRATOR"><AdminDashboard /></Protected>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </AuthProvider>
  );
}
