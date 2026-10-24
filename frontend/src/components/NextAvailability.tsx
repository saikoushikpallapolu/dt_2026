interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  notes?: string | null;
}

export function NextAvailability({ slots }: { slots?: Slot[] | null }) {
  const safeSlots = Array.isArray(slots) ? slots : [];

  if (!safeSlots.length) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">No weekly consultation hours posted yet.</p>
        <p className="mt-0.5">You can use the Request Meeting button below to propose an office consultation appointment.</p>
      </div>
    );
  }

  const now = new Date();
  const ist = new Date(now.getTime() + 330 * 60000);
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const day = ist.getUTCDay();

  // Check if currently within scheduled office hours right now
  const activeSlot = safeSlots.find((s) => {
    if (s.dayOfWeek !== day) return false;
    const [sh, sm] = (s.startTime || "00:00").split(":").map(Number);
    const [eh, em] = (s.endTime || "00:00").split(":").map(Number);
    const startMins = (sh || 0) * 60 + (sm || 0);
    const endMins = (eh || 0) * 60 + (em || 0);
    return minutes >= startMins && minutes <= endMins;
  });

  if (activeSlot) {
    return (
      <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/90 p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
            Currently In Scheduled Office Hours
          </p>
        </div>
        <p className="font-bold text-emerald-950 mt-1 text-sm">
          Today, {activeSlot.startTime} – {activeSlot.endTime} IST
          {activeSlot.notes ? ` (${activeSlot.notes})` : ""}
        </p>
        <p className="text-xs text-emerald-800 mt-0.5">
          Faculty is scheduled for office consultation right now.
        </p>
      </div>
    );
  }

  const future = safeSlots
    .map((s) => {
      let offset = (s.dayOfWeek - day + 7) % 7;
      const [h, m] = (s.startTime || "00:00").split(":").map(Number);
      const [eh, em] = (s.endTime || "00:00").split(":").map(Number);
      if (offset === 0 && (eh || 0) * 60 + (em || 0) <= minutes) offset = 7;
      return { ...s, offset, sort: offset * 1440 + (h || 0) * 60 + (m || 0) };
    })
    .sort((a, b) => a.sort - b.sort)[0];

  if (!future) return null;

  const daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const label =
    future.offset === 0
      ? "Today"
      : future.offset === 1
      ? "Tomorrow"
      : daysList[future.dayOfWeek];

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 shadow-xs">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-800">
        Next Scheduled Consultation Hours
      </p>
      <p className="font-bold text-violet-950 mt-1 text-sm">
        {label}, {future.startTime} – {future.endTime} IST
        {future.notes ? ` (${future.notes})` : ""}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">
        Planned weekly availability. Check current live status before visiting.
      </p>
    </div>
  );
}
