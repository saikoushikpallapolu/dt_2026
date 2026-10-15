import type {
  AdminAnalytics,
  AuditLogItem,
  AuthUser,
  DepartmentSummary,
  MeetingRequestItem,
  NotificationItem,
  ProfessorListItem,
  QrStatusResponse,
  StatusDetail,
} from "@wimp/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // send cookies
  });

  const contentType = response.headers.get("content-type");
  let data: any = null;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { code?: string; details?: any };
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth
  async getMe(): Promise<{ user: AuthUser | null }> {
    return request<{ user: AuthUser | null }>("/auth/me");
  },

  async login(email: string, password: string): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
    });
  },

  // QR
  async getQrStatus(token: string): Promise<QrStatusResponse> {
    return request<QrStatusResponse>(`/qr/${token}`);
  },

  getQrImageUrl(token: string): string {
    return `${API_BASE_URL}/qr/${token}/image`;
  },

  // Faculty Directory
  async getFacultyList(params: {
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ProfessorListItem[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.departmentId) query.set("departmentId", params.departmentId);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    return request<{ items: ProfessorListItem[]; pagination: any }>(`/faculty?${query.toString()}`);
  },

  async getFacultyBySlug(slug: string): Promise<any> {
    return request<any>(`/faculty/${slug}`);
  },

  // Faculty Me
  async getMyStatus(): Promise<{
    professorId: string;
    displayName: string;
    slug: string;
    status: StatusDetail;
    activeQrToken: string | null;
  }> {
    return request("/faculty/me/status");
  },

  async updateMyStatus(payload: {
    status: string;
    expectedReturnAt?: string | null;
    alternateLocation?: string | null;
    publicMessage?: string | null;
    ttlMinutes?: number | null;
  }): Promise<{ ok: boolean; status: StatusDetail }> {
    return request("/faculty/me/status", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getMyStatusHistory(): Promise<{ history: any[] }> {
    return request("/faculty/me/history");
  },

  async getMyFacultyRequests(): Promise<{ requests: MeetingRequestItem[] }> {
    return request("/faculty/me/requests");
  },

  async respondToFacultyRequest(
    requestId: string,
    payload: {
      action: "ACCEPT" | "DECLINE" | "PROPOSE_RESCHEDULE" | "COMPLETE";
      note?: string;
      proposedStart?: string;
      proposedEnd?: string;
    },
  ): Promise<{ ok: boolean; request: any }> {
    return request(`/faculty/me/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Student Meetings
  async requestMeeting(payload: {
    professorId: string;
    reason: string;
    proposedStart: string;
    proposedEnd: string;
    note?: string;
  }): Promise<{ ok: boolean; meeting: any }> {
    return request("/meetings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMyMeetings(): Promise<{ meetings: MeetingRequestItem[] }> {
    return request("/meetings/mine");
  },

  async cancelMeeting(id: string): Promise<{ ok: boolean }> {
    return request(`/meetings/${id}/cancel`, {
      method: "PATCH",
    });
  },

  // Student Favorites
  async getFavorites(): Promise<{ favorites: ProfessorListItem[] }> {
    return request("/favorites");
  },

  async addFavorite(professorId: string): Promise<{ ok: boolean }> {
    return request(`/favorites/${professorId}`, {
      method: "POST",
    });
  },

  async removeFavorite(professorId: string): Promise<{ ok: boolean }> {
    return request(`/favorites/${professorId}`, {
      method: "DELETE",
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return request("/notifications");
  },

  async markNotificationRead(id: string): Promise<{ ok: boolean }> {
    return request(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  async markAllNotificationsRead(): Promise<{ ok: boolean }> {
    return request("/notifications/read-all", {
      method: "POST",
    });
  },

  // Departments
  async getDepartments(): Promise<{ departments: DepartmentSummary[] }> {
    return request("/departments");
  },

  // Admin
  async getAdminProfessors(): Promise<{ professors: any[] }> {
    return request("/admin/professors");
  },

  async createAdminProfessor(payload: any): Promise<{ ok: boolean; professor: any; initialQrToken: string }> {
    return request("/admin/professors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdminProfessor(id: string, payload: any): Promise<{ ok: boolean; professor: any }> {
    return request(`/admin/professors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async generateAdminQr(professorId: string): Promise<{ ok: boolean; qr: any }> {
    return request(`/admin/professors/${professorId}/qr`, {
      method: "POST",
    });
  },

  async revokeAdminQr(qrId: string): Promise<{ ok: boolean; qr: any }> {
    return request(`/admin/qr/${qrId}/revoke`, {
      method: "POST",
    });
  },

  async getAdminBuildings(): Promise<{ buildings: any[] }> {
    return request("/admin/buildings");
  },

  async createAdminBuilding(payload: { name: string; code: string }): Promise<any> {
    return request("/admin/buildings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createAdminOffice(payload: { buildingId: string; floor: string; room: string; label?: string }): Promise<any> {
    return request("/admin/offices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createAdminDepartment(payload: { name: string; code: string }): Promise<any> {
    return request("/admin/departments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAdminAnalytics(): Promise<{ analytics: AdminAnalytics }> {
    return request("/admin/analytics");
  },

  async getAdminAuditLogs(): Promise<{ auditLogs: AuditLogItem[] }> {
    return request("/admin/audit-logs");
  },

  // Automation
  async triggerAutomationSync(options?: { simulatedTime?: string; professorId?: string }): Promise<{
    ok: boolean;
    message: string;
    appliedCount: number;
    changes: any[];
  }> {
    return request("/faculty/automate-sync", {
      method: "POST",
      body: JSON.stringify(options || {}),
    });
  },

  async getMySchedules(): Promise<{ classes: any[]; officeHours: any[] }> {
    return request("/faculty/me/schedules");
  },

  // Meta
  async fetchMeta(): Promise<any> {
    return request("/meta");
  },
};
