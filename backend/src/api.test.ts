import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { loadAppEnv } from "./config/env.js";

const app = createApp(
  loadAppEnv({
    NODE_ENV: "test",
    PUBLIC_BASE_URL: "http://localhost:5173",
    FRONTEND_ORIGIN: "http://localhost:5173",
    COOKIE_SECURE: "false",
  }),
);

describe("Checkpoint 2: Authentication & Roles", () => {
  it("rejects login with wrong credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@demo.local", password: "WrongPassword!" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("authenticates valid professor and sets session cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "elena.rivera@demo.local", password: "DemoPass123!" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("elena.rivera@demo.local");
    expect(res.body.user.role).toBe("PROFESSOR");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("prevents unauthenticated status update", async () => {
    const res = await request(app)
      .put("/api/v1/faculty/me/status")
      .send({ status: "AVAILABLE" });
    expect(res.status).toBe(401);
  });

  it("prevents professor from accessing admin endpoints", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "elena.rivera@demo.local", password: "DemoPass123!" });
    const cookie = loginRes.headers["set-cookie"];

    const adminRes = await request(app)
      .get("/api/v1/admin/analytics")
      .set("Cookie", cookie);
    expect(adminRes.status).toBe(403);
  });
});

describe("Checkpoint 3: Core QR and Status Workflow", () => {
  it("fetches public QR status for Dr. Rivera", async () => {
    const res = await request(app).get("/api/v1/qr/qr-elena-rivera-demo");
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(true);
    expect(res.body.professor.displayName).toBe("Dr. Elena Rivera");
    expect(res.body.professor.department.code).toBe("CS");
    expect(res.body.professor.office.room).toBe("204");
    expect(res.body.meta.selfReported).toBe(true);
  });

  it("handles revoked QR token gracefully", async () => {
    const res = await request(app).get("/api/v1/qr/qr-marcus-chen-revoked");
    expect(res.status).toBe(200);
    expect(res.body.isRevoked).toBe(true);
    expect(res.body.isActive).toBe(false);
  });

  it("generates QR code image", async () => {
    const res = await request(app).get("/api/v1/qr/qr-elena-rivera-demo/image");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
  });

  it("allows professor to update status atomically and appends history", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "elena.rivera@demo.local", password: "DemoPass123!" });
    const cookie = loginRes.headers["set-cookie"];

    const returnTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const updateRes = await request(app)
      .put("/api/v1/faculty/me/status")
      .set("Cookie", cookie)
      .send({
        status: "IN_CLASS",
        expectedReturnAt: returnTime,
        alternateLocation: "Ada Lovelace Lecture Hall A",
        publicMessage: "Giving lecture on Data Structures",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status.status).toBe("IN_CLASS");
    expect(updateRes.body.status.alternateLocation).toBe("Ada Lovelace Lecture Hall A");

    // Verify public QR page reflects the updated status immediately
    const qrRes = await request(app).get("/api/v1/qr/qr-elena-rivera-demo");
    expect(qrRes.status).toBe(200);
    expect(qrRes.body.status.status).toBe("IN_CLASS");
    expect(qrRes.body.status.alternateLocation).toBe("Ada Lovelace Lecture Hall A");
    expect(qrRes.body.status.isConfidentlyCurrent).toBe(true);
  });
});

describe("Checkpoint 4: Discovery & Admin", () => {
  it("searches faculty by name and filters by department", async () => {
    const res = await request(app).get("/api/v1/faculty?search=Elena");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].displayName).toBe("Dr. Elena Rivera");
  });

  it("allows admin to view analytics", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@demo.local", password: "DemoPass123!" });
    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/v1/admin/analytics")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.analytics.facultyCount).toBeGreaterThanOrEqual(2);
    expect(res.body.analytics.activeQrCount).toBeGreaterThanOrEqual(1);
  });
});

describe("Checkpoint 5: Student Meetings & Consultation Workflow", () => {
  it("allows student to request a consultation meeting", async () => {
    const studentLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "student.patel@demo.local", password: "DemoPass123!" });
    const studentCookie = studentLogin.headers["set-cookie"];

    const riveraRes = await request(app).get("/api/v1/faculty/elena-rivera");
    const riveraId = riveraRes.body.id;

    // Clear prior meetings for test idempotency
    const { prisma } = await import("./db.js");
    await prisma.meetingRequestEvent.deleteMany({ where: { meetingRequest: { professorId: riveraId } } });
    await prisma.meetingRequest.deleteMany({ where: { professorId: riveraId } });

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const start = new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString();
    const end = new Date(tomorrow.setHours(14, 30, 0, 0)).toISOString();

    const bookRes = await request(app)
      .post("/api/v1/meetings")
      .set("Cookie", studentCookie)
      .send({
        professorId: riveraId,
        reason: "Review project midterm submission",
        proposedStart: start,
        proposedEnd: end,
        note: "Need guidance on binary tree balance factor",
      });

    expect(bookRes.status).toBe(201);
    expect(bookRes.body.meeting.status).toBe("PENDING");
    const meetingId = bookRes.body.meeting.id;

    // Elena Rivera logs in and accepts meeting
    const profLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "elena.rivera@demo.local", password: "DemoPass123!" });
    const profCookie = profLogin.headers["set-cookie"];

    const acceptRes = await request(app)
      .patch(`/api/v1/faculty/me/requests/${meetingId}`)
      .set("Cookie", profCookie)
      .send({
        action: "ACCEPT",
        note: "Accepted, see you in Room 204.",
      });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.request.status).toBe("ACCEPTED");

    // Student sees accepted status in their meetings
    const studentMeetingsRes = await request(app)
      .get("/api/v1/meetings/mine")
      .set("Cookie", studentCookie);
    expect(studentMeetingsRes.status).toBe(200);
    const found = studentMeetingsRes.body.meetings.find((m: any) => m.id === meetingId);
    expect(found).toBeDefined();
    expect(found.status).toBe("ACCEPTED");
  });
});
