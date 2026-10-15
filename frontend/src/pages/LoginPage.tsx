import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, LogIn, Mail, Sparkles, UserPlus } from "lucide-react";
import { DEMO_ACCOUNTS, useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login, register, quickSwitch } = useAuth();
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
        const u = await login(email, password);
        if (u.role === "PROFESSOR") navigate("/faculty/dashboard");
        else if (u.role === "ADMINISTRATOR") navigate("/admin/dashboard");
        else navigate("/student/portal");
      } else {
        await register(email, password);
        navigate("/student/portal");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail: string, role: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await quickSwitch(accEmail);
      if (role === "PROFESSOR") navigate("/faculty/dashboard");
      else if (role === "ADMINISTRATOR") navigate("/admin/dashboard");
      else navigate("/student/portal");
    } catch (err: any) {
      setError(err.message || "Failed to switch account");
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-900 text-amber-300 border border-amber-300/40 shadow-md shadow-violet-950/20">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-violet-950">
              {mode === "login" ? "Sign In to Campus Life" : "Create Student Account"}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "login"
                ? "Access professor status control, student meetings, or campus admin."
                : "Register for student favorites, status radar, and consultation requests."}
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
              Register (Student)
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
                  placeholder="name@demo.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-3 text-xs focus:border-violet-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-violet-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-3 text-xs focus:border-violet-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-900 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition disabled:opacity-50"
            >
              {mode === "login" ? <LogIn className="h-4 w-4 text-amber-300" /> : <UserPlus className="h-4 w-4 text-amber-300" />}
              <span>{isLoading ? "Authenticating..." : mode === "login" ? "Sign In" : "Register Account"}</span>
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-8 border-t border-violet-100 pt-5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Instant Demo Role Switch</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Sign in instantly without typing passwords (Password: <code>DemoPass123!</code>):
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email, acc.role)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left text-xs transition hover:border-violet-300 hover:bg-violet-50/50"
                >
                  <div>
                    <span className="font-bold text-slate-800">{acc.label}</span>
                    <span className="block text-[10px] text-slate-500">{acc.roleDescription}</span>
                  </div>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-violet-900 border border-violet-200 shadow-2xs">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
