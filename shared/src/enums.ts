export const USER_ROLES = ["STUDENT", "PROFESSOR", "ADMINISTRATOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const FACULTY_STATUSES = [
  "AVAILABLE",
  "IN_CLASS",
  "IN_MEETING",
  "AWAY",
  "ON_LEAVE",
  "UNKNOWN",
] as const;
export type FacultyStatus = (typeof FACULTY_STATUSES)[number];

export const PROFILE_VISIBILITIES = ["PUBLIC", "HIDDEN"] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

export const MEETING_REQUEST_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "RESCHEDULE_PROPOSED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type MeetingRequestStatus = (typeof MEETING_REQUEST_STATUSES)[number];

export const FACULTY_STATUS_LABELS: Record<FacultyStatus, string> = {
  AVAILABLE: "Available",
  IN_CLASS: "In class",
  IN_MEETING: "In a meeting",
  AWAY: "Away",
  ON_LEAVE: "On leave",
  UNKNOWN: "Unknown",
};
