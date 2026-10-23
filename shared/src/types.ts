import type {
  FacultyStatus,
  MeetingRequestStatus,
  UserRole,
} from "./enums.js";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  professorId?: string;
  professorSlug?: string;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  professorCount?: number;
}

export interface BuildingSummary {
  id: string;
  name: string;
  code: string;
}

export interface OfficeSummary {
  id: string;
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  floor: string;
  room: string;
  label?: string | null;
}

export interface OfficeHourSummary {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  notes?: string | null;
}

export interface StatusDetail {
  status: FacultyStatus;
  expectedReturnAt: string | null;
  alternateLocation: string | null;
  publicMessage: string | null;
  expiresAt: string | null;
  updatedAt: string;
  isExpired: boolean;
  isConfidentlyCurrent: boolean;
}

export interface StatusHistoryEntry {
  id: string;
  status: FacultyStatus;
  expectedReturnAt: string | null;
  alternateLocation: string | null;
  publicMessage: string | null;
  expiresAt: string | null;
  recordedAt: string;
  recordedByName?: string;
}

export interface ProfessorListItem {
  id: string;
  slug: string;
  displayName: string;
  designation: string;
  photoUrl: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
  office: {
    id: string;
    buildingName: string;
    floor: string;
    room: string;
    label?: string | null;
  } | null;
  currentStatus: StatusDetail;
  activeQrToken?: string | null;
  isFavorited?: boolean;
  notifyWhenAvailable?: boolean;
}

export interface QrStatusResponse {
  token: string;
  isActive: boolean;
  isRevoked: boolean;
  revokedAt?: string | null;
  professor: {
    id: string;
    slug: string;
    displayName: string;
    designation: string;
    photoUrl: string | null;
    publicContact: string | null;
    consultationDetails: string | null;
    department: {
      id: string;
      name: string;
      code: string;
    };
    office: {
      id: string;
      buildingName: string;
      buildingCode: string;
      floor: string;
      room: string;
      label?: string | null;
    } | null;
  };
  status: StatusDetail;
  officeHours: OfficeHourSummary[];
  meta: {
    selfReported: boolean;
    locationTracking: boolean;
    lastUpdated: string;
    qrPublicUrl: string;
  };
}

export interface MeetingRequestItem {
  id: string;
  studentUserId: string;
  studentEmail: string;
  professorId: string;
  professorName: string;
  professorSlug: string;
  reason: string;
  proposedStart: string;
  proposedEnd: string;
  note: string | null;
  status: MeetingRequestStatus;
  createdAt: string;
  updatedAt: string;
  events?: {
    id: string;
    fromStatus: MeetingRequestStatus | null;
    toStatus: MeetingRequestStatus;
    note: string | null;
    createdAt: string;
    actorEmail?: string;
  }[];
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  payload?: any;
  readAt: string | null;
  createdAt: string;
}

export interface AdminAnalytics {
  facultyCount: number;
  departmentsCount: number;
  officesCount: number;
  activeQrCount: number;
  statusDistribution: Record<FacultyStatus, number>;
  meetingsStats: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    cancelled: number;
  };
  recentUpdatesCountLast24h: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: any;
  createdAt: string;
  actorEmail?: string | null;
}
