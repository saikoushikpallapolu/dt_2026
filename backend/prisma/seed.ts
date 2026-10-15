import { PrismaClient, FacultyStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const seedDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(seedDir, "../../.env") });
loadEnv({ path: path.resolve(seedDir, "../.env") });

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.meetingRequestEvent.deleteMany();
  await prisma.meetingRequest.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.officeHour.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.professorStatus.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.session.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.office.deleteMany();
  await prisma.building.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appSetting.deleteMany();

  await prisma.appSetting.create({
    data: {
      key: "status_default_ttl_minutes",
      value: 240,
    },
  });

  const cs = await prisma.department.create({
    data: { name: "Computer Science", code: "CS" },
  });
  const math = await prisma.department.create({
    data: { name: "Mathematics", code: "MATH" },
  });

  const hall = await prisma.building.create({
    data: { name: "Ada Lovelace Hall", code: "ALH" },
  });

  const officeRivera = await prisma.office.create({
    data: { buildingId: hall.id, floor: "2", room: "204", label: "Faculty office" },
  });
  const officeChen = await prisma.office.create({
    data: { buildingId: hall.id, floor: "3", room: "311", label: "Faculty office" },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.local",
      passwordHash,
      role: UserRole.ADMINISTRATOR,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student.patel@demo.local",
      passwordHash,
      role: UserRole.STUDENT,
    },
  });

  const riveraUser = await prisma.user.create({
    data: {
      email: "elena.rivera@demo.local",
      passwordHash,
      role: UserRole.PROFESSOR,
    },
  });

  const chenUser = await prisma.user.create({
    data: {
      email: "marcus.chen@demo.local",
      passwordHash,
      role: UserRole.PROFESSOR,
    },
  });

  const rivera = await prisma.professor.create({
    data: {
      userId: riveraUser.id,
      slug: "elena-rivera",
      displayName: "Dr. Elena Rivera",
      designation: "Associate Professor",
      departmentId: cs.id,
      officeId: officeRivera.id,
      publicContact: "elena.rivera@demo.local",
      consultationDetails: "Drop-ins during posted office hours, or request a meeting.",
      visibility: "PUBLIC",
    },
  });

  const chen = await prisma.professor.create({
    data: {
      userId: chenUser.id,
      slug: "marcus-chen",
      displayName: "Dr. Marcus Chen",
      designation: "Assistant Professor",
      departmentId: math.id,
      officeId: officeChen.id,
      visibility: "PUBLIC",
    },
  });

  const now = new Date();
  const riveraExpiry = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  await prisma.professorStatus.create({
    data: {
      professorId: rivera.id,
      status: FacultyStatus.UNKNOWN,
      expiresAt: riveraExpiry,
    },
  });

  await prisma.professorStatus.create({
    data: {
      professorId: chen.id,
      status: FacultyStatus.IN_CLASS,
      expectedReturnAt: new Date(now.getTime() - 30 * 60 * 1000),
      expiresAt: new Date(now.getTime() - 15 * 60 * 1000),
      publicMessage: "Seeded expired example for Checkpoint 3 review.",
    },
  });

  await prisma.qrCode.create({
    data: {
      professorId: rivera.id,
      token: "qr-elena-rivera-demo",
      isActive: true,
    },
  });

  await prisma.qrCode.create({
    data: {
      professorId: chen.id,
      token: "qr-marcus-chen-revoked",
      isActive: false,
      revokedAt: now,
    },
  });

  await prisma.officeHour.createMany({
    data: [
      {
        professorId: rivera.id,
        dayOfWeek: 2,
        startTime: "14:00",
        endTime: "16:00",
        notes: "Ada Lovelace Hall 204",
      },
      {
        professorId: rivera.id,
        dayOfWeek: 4,
        startTime: "10:00",
        endTime: "11:30",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: "SEED_DATABASE",
      entityType: "system",
      metadata: { studentId: student.id, note: "Fictional campus seed only" },
    },
  });

  console.log("Seed complete. Demo password for all accounts: DemoPass123!");
  console.log("  admin@demo.local (ADMINISTRATOR)");
  console.log("  elena.rivera@demo.local (PROFESSOR)");
  console.log("  marcus.chen@demo.local (PROFESSOR, expired status example)");
  console.log("  student.patel@demo.local (STUDENT)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
