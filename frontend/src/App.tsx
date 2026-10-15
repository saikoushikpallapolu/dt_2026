import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/pages/HomePage";
import { QrStatusPage } from "@/pages/QrStatusPage";
import { PrintSignPage } from "@/pages/PrintSignPage";
import { DirectoryPage } from "@/pages/DirectoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfessorDashboard } from "@/pages/ProfessorDashboard";
import { StudentPortal } from "@/pages/StudentPortal";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { ScanPage } from "@/pages/ScanPage";

export function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/qr/:token" element={<QrStatusPage />} />
            <Route path="/qr/:token/print" element={<PrintSignPage />} />
            <Route path="/faculty/:slug" element={<QrStatusPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student/portal" element={<StudentPortal />} />
            <Route path="/faculty/dashboard" element={<ProfessorDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}
