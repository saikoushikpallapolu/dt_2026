import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogIn, Mail, UserPlus, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const u = await login(email.trim(), password);
        if (u.role === "PROFESSOR") {
          navigate("/faculty/dashboard");
        } else if (u.role === "ADMINISTRATOR") {
          navigate("/admin/dashboard");
        } else {
          navigate("/directory");
        }
      } else {
        await register(email.trim(), password);
        navigate("/directory");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#fcfbfe] p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-xl shadow-violet-950/5">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-900 text-amber-300 border border-amber-300/40 shadow-md shadow-violet-950/20">
              <Compass className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-violet-950">
              {mode === "login" ? "Sign In to Campus Portal" : "Student Registration"}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "login"
                ? "Sign in with your faculty or student credentials."
                : "Create a student account to browse faculty and request consultations."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="mt-6 flex rounded-2xl bg-violet-50/70 p-1 text-xs font-semibold border border-violet-100">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-xl py-2 transition ${
                mode === "login" ? "bg-white text-violet-950 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-xl py-2 transition ${
                mode === "register" ? "bg-white text-violet-950 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Register as Student
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-violet-400" />
                <input
                  type="email"
                  required
                  placeholder={mode === "login" ? "faculty@vnr.demo or student@example.com" : "student@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-xs focus:border-violet-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Password {mode === "register" && <span className="text-slate-400 font-normal">(min 8 characters)</span>}
              </label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-violet-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-xs focus:border-violet-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-900 py-3 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition disabled:opacity-50"
            >
              {mode === "login" ? <LogIn className="h-4 w-4 text-amber-300" /> : <UserPlus className="h-4 w-4 text-amber-300" />}
              <span>{isLoading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}</span>
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              VNR VJIET · Where Is My Professor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
