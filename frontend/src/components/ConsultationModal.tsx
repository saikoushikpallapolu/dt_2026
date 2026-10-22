import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface ConsultationModalProps {
  professorId: string;
  professorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConsultationModal({
  professorId,
  professorName,
  isOpen,
  onClose,
  onSuccess,
}: ConsultationModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("14:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const proposedStart = new Date(`${date}T${startTime}:00+05:30`);
      const proposedEnd = new Date(proposedStart.getTime() + durationMinutes * 60 * 1000);

      await api.requestMeeting({
        professorId,
        reason,
        proposedStart: proposedStart.toISOString(),
        proposedEnd: proposedEnd.toISOString(),
        note: note || undefined,
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit consultation request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-violet-50 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900">Request Office Consultation</h3>
        <p className="mt-1 text-xs text-slate-500">
          Submit an appointment request directly to <span className="font-semibold text-violet-900">{professorName}</span>.
        </p>

        {user?.role !== "STUDENT" ? (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-center">
            <p className="text-sm font-semibold text-amber-950">Student Sign In Required</p>
            <p className="mt-1 text-xs text-amber-800">
              You must be signed in with a student account to request a consultation.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-lg bg-violet-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-violet-800 transition"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="my-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">Request Submitted Successfully</p>
            <p className="text-xs text-slate-500">The professor will be notified immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Reason / Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. Final Project question, Grade review..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Date</label>
                <div className="relative mt-1.5">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Proposed Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Duration</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[15, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`rounded-lg border py-1.5 text-xs font-medium transition ${
                      durationMinutes === mins
                        ? "border-violet-700 bg-violet-50 text-violet-900 font-semibold ring-1 ring-violet-500/30"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Optional Notes</label>
              <textarea
                rows={2}
                placeholder="Any details to help the professor prepare..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-900 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-950/20 hover:bg-violet-800 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting..." : "Send Meeting Request"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
