import { prisma } from "../db.js";
import { updateProfessorStatus } from "./status-service.js";
import type { AppEnv } from "../config/env.js";
import type { FacultyStatus } from "@wimp/shared";

export interface ScheduledClass {
  professorSlug: string;
  courseCode: string;
  courseName: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  location: string;
}

export const FACULTY_CLASS_SCHEDULES: ScheduledClass[] = [
  // Dr. Elena Rivera (CS Dept)
  {
    professorSlug: "elena-rivera",
    courseCode: "CS201",
    courseName: "Data Structures & Algorithms",
    dayOfWeek: 2, // Tuesday
    startTime: "10:00",
    endTime: "11:30",
    location: "Ada Lovelace Lecture Hall A",
  },
  {
    professorSlug: "elena-rivera",
    courseCode: "CS201",
    courseName: "Data Structures & Algorithms",
    dayOfWeek: 4, // Thursday
    startTime: "10:00",
    endTime: "11:30",
    location: "Ada Lovelace Lecture Hall A",
  },
  {
    professorSlug: "elena-rivera",
    courseCode: "CS305",
    courseName: "Algorithms Lab",
    dayOfWeek: 1, // Monday
    startTime: "14:00",
    endTime: "15:30",
    location: "Turing Computing Lab 2",
  },
  {
    professorSlug: "elena-rivera",
    courseCode: "CS305",
    courseName: "Algorithms Lab",
    dayOfWeek: 3, // Wednesday
    startTime: "14:00",
    endTime: "15:30",
    location: "Turing Computing Lab 2",
  },

  // Dr. Marcus Chen (Math Dept)
  {
    professorSlug: "marcus-chen",
    courseCode: "MATH101",
    courseName: "Calculus I",
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "10:30",
    location: "Euler Auditorium 101",
  },
  {
    professorSlug: "marcus-chen",
    courseCode: "MATH101",
    courseName: "Calculus I",
    dayOfWeek: 3, // Wednesday
    startTime: "09:00",
    endTime: "10:30",
    location: "Euler Auditorium 101",
  },
  {
    professorSlug: "marcus-chen",
    courseCode: "MATH204",
    courseName: "Linear Algebra",
    dayOfWeek: 5, // Friday
    startTime: "11:00",
    endTime: "12:30",
    location: "Science Block Room B-12",
  },
];

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export interface AutomationResult {
  appliedCount: number;
  changes: {
    professorName: string;
    oldStatus: string;
    newStatus: string;
    reason: string;
    location?: string | null;
  }[];
}

export async function runAutomationSync(
  appEnv: AppEnv,
  options: { simulatedTime?: Date; professorId?: string } = {},
): Promise<AutomationResult> {
  const now = options.simulatedTime || new Date();
  const currentDay = now.getDay();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const professors = await prisma.professor.findMany({
    where: options.professorId ? { id: options.professorId } : { visibility: "PUBLIC" },
    include: {
      user: true,
      currentStatus: true,
      officeHours: true,
      meetingRequests: {
        where: {
          status: "ACCEPTED",
          proposedStart: { lte: now },
          proposedEnd: { gte: now },
        },
      },
    },
  });

  const changes: AutomationResult["changes"] = [];

  for (const prof of professors) {
    const rawStatus = prof.currentStatus?.status || "UNKNOWN";
    let targetStatus: FacultyStatus | null = null;
    let targetLocation: string | null = null;
    let targetReturnAt: string | null = null;
    let targetMessage: string | null = null;
    let reason = "";

    // 1. Check if professor currently has an ACCEPTED student consultation meeting
    if (prof.meetingRequests.length > 0) {
      const activeMeeting = prof.meetingRequests[0];
      targetStatus = "IN_MEETING";
      targetLocation = "Office Consultation";
      targetReturnAt = activeMeeting.proposedEnd.toISOString();
      targetMessage = `In consultation: ${activeMeeting.reason}`;
      reason = "Automated sync: Accepted student meeting in progress";
    }

    // 2. Check if professor currently has a scheduled teaching class
    if (!targetStatus) {
      const activeClass = FACULTY_CLASS_SCHEDULES.find((cls) => {
        if (cls.professorSlug !== prof.slug) return false;
        if (cls.dayOfWeek !== currentDay) return false;
        const start = timeToMinutes(cls.startTime);
        const end = timeToMinutes(cls.endTime);
        return currentMins >= start && currentMins <= end;
      });

      if (activeClass) {
        targetStatus = "IN_CLASS";
        targetLocation = activeClass.location;
        const endHour = parseInt(activeClass.endTime.split(":")[0], 10);
        const endMin = parseInt(activeClass.endTime.split(":")[1], 10);
        const returnDate = new Date(now);
        returnDate.setHours(endHour, endMin, 0, 0);
        targetReturnAt = returnDate.toISOString();
        targetMessage = `Lecturing ${activeClass.courseCode} (${activeClass.courseName})`;
        reason = `Automated sync: Teaching ${activeClass.courseCode} at ${activeClass.location}`;
      }
    }

    // 3. Check if currently in posted Office Hours and not in class or meeting
    if (!targetStatus) {
      const activeOfficeHour = prof.officeHours.find((oh) => {
        if (oh.dayOfWeek !== currentDay) return false;
        const start = timeToMinutes(oh.startTime);
        const end = timeToMinutes(oh.endTime);
        return currentMins >= start && currentMins <= end;
      });

      if (activeOfficeHour) {
        if (rawStatus !== "AVAILABLE") {
          targetStatus = "AVAILABLE";
          targetLocation = null;
          const endHour = parseInt(activeOfficeHour.endTime.split(":")[0], 10);
          const endMin = parseInt(activeOfficeHour.endTime.split(":")[1], 10);
          const returnDate = new Date(now);
          returnDate.setHours(endHour, endMin, 0, 0);
          targetReturnAt = returnDate.toISOString();
          targetMessage = "Posted consultation hours in progress";
          reason = "Automated sync: Active posted office hours";
        }
      }
    }

    // 4. Check if current status return time or expiry has passed
    if (!targetStatus && prof.currentStatus) {
      const returnTime = prof.currentStatus.expectedReturnAt;
      const isReturnPassed = returnTime && returnTime.getTime() < now.getTime();
      const isExpired = prof.currentStatus.expiresAt && prof.currentStatus.expiresAt.getTime() < now.getTime();

      if ((isReturnPassed || isExpired) && rawStatus === "IN_CLASS") {
        targetStatus = "AVAILABLE";
        targetLocation = null;
        targetReturnAt = null;
        targetMessage = "Class concluded; returned to office.";
        reason = "Automated reset: Class schedule concluded";
      }
    }

    // Apply update if changed
    if (targetStatus && targetStatus !== rawStatus) {
      await updateProfessorStatus({
        professorId: prof.id,
        actorUserId: prof.userId,
        status: targetStatus,
        expectedReturnAt: targetReturnAt,
        alternateLocation: targetLocation,
        publicMessage: targetMessage,
        ttlMinutes: 180,
        appEnv,
      });

      changes.push({
        professorName: prof.displayName,
        oldStatus: rawStatus,
        newStatus: targetStatus,
        reason,
        location: targetLocation,
      });
    }
  }

  return {
    appliedCount: changes.length,
    changes,
  };
}

let automationInterval: NodeJS.Timeout | null = null;

export function startAutomationWorker(appEnv: AppEnv): void {
  if (automationInterval) return;

  // Run initial check after 2 seconds
  setTimeout(() => {
    runAutomationSync(appEnv).catch((err) => {
      console.error("Initial automation sync error:", err);
    });
  }, 2000);

  // Periodic interval every 60 seconds
  automationInterval = setInterval(() => {
    runAutomationSync(appEnv).catch((err) => {
      console.error("Periodic automation sync error:", err);
    });
  }, 60_000);

  console.log("Automated status worker initialized (interval: 60s).");
}
