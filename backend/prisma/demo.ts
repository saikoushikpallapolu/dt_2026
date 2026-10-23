import { PrismaClient, FacultyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import '../src/config/env.js';

// Additive, repeatable demo provisioning. Never deletes existing campus data.
const db = new PrismaClient();
const names = ['Ananya Reddy', 'Vikram Rao', 'Meera Sharma', 'Arjun Kumar', 'Kavitha Devi', 'Sanjay Reddy', 'Priya Nair', 'Rohit Varma', 'Lakshmi Prasad', 'Aditya Rao', 'Sneha Iyer', 'Kiran Kumar', 'Divya Reddy', 'Rahul Sharma', 'Sowmya Rao', 'Nikhil Reddy', 'Padma Devi', 'Harsha Vardhan', 'Deepthi Nair', 'Srinivas Rao'];
const departments = [['CSE', 'Computer Science & Engineering'], ['ECE', 'Electronics & Communication Engineering'], ['IT', 'Information Technology'], ['EEE', 'Electrical & Electronics Engineering'], ['MECH', 'Mechanical Engineering']];
async function main() {
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);
  for (const [email, role] of [['student@vnr.demo', 'STUDENT'], ['admin@vnr.demo', 'ADMINISTRATOR']] as const) {
    await db.user.upsert({ where: { email }, update: {}, create: { email, role, passwordHash } });
  }
  const customProfessors = [
    {
      displayName: "Prasanna Mam",
      email: "prasanna@vnr.demo",
      slug: "prasanna",
      designation: "Assistant Professor",
      deptCode: "CSE",
      deptName: "Computer Science & Engineering",
      floor: "1",
      room: "127",
      buildingCode: "VNR-1",
      buildingName: "Academic Block 1",
    },
    {
      displayName: "Thirupathi Nanuvala Sir",
      email: "thirupathi.nanuvala@vnr.demo",
      slug: "thirupathi-nanuvala",
      designation: "Associate Professor",
      deptCode: "CSE",
      deptName: "Computer Science & Engineering",
      floor: "2",
      room: "201",
      buildingCode: "VNR-1",
      buildingName: "Academic Block 1",
    },
    {
      displayName: "Akhil Sir",
      email: "akhil@vnr.demo",
      slug: "akhil",
      designation: "Assistant Professor",
      deptCode: "CSE",
      deptName: "Computer Science & Engineering",
      floor: "G",
      room: "031",
      buildingCode: "VNR-1",
      buildingName: "Academic Block 1",
    },
  ];

  for (const cp of customProfessors) {
    const dept = await db.department.upsert({ where: { code: cp.deptCode }, update: {}, create: { code: cp.deptCode, name: cp.deptName } });
    const building = await db.building.upsert({ where: { code: cp.buildingCode }, update: {}, create: { code: cp.buildingCode, name: cp.buildingName } });
    const office = await db.office.upsert({
      where: { buildingId_floor_room: { buildingId: building.id, floor: cp.floor, room: cp.room } },
      update: {},
      create: { buildingId: building.id, floor: cp.floor, room: cp.room, label: `${cp.deptCode} Room ${cp.room}` }
    });
    const user = await db.user.upsert({ where: { email: cp.email }, update: {}, create: { email: cp.email, passwordHash, role: 'PROFESSOR' } });
    const prof = await db.professor.upsert({
      where: { slug: cp.slug },
      update: { displayName: cp.displayName, designation: cp.designation, officeId: office.id, publicContact: cp.email },
      create: {
        userId: user.id,
        slug: cp.slug,
        displayName: cp.displayName,
        designation: cp.designation,
        departmentId: dept.id,
        officeId: office.id,
        publicContact: cp.email,
        consultationDetails: 'Available for coursework assistance, project mentoring and student consultations. Check current status or request a meeting.'
      }
    });
    await db.professorStatus.upsert({
      where: { professorId: prof.id },
      update: {},
      create: {
        professorId: prof.id,
        status: 'AVAILABLE',
        expiresAt: new Date(Date.now() + 8 * 3600000),
        publicMessage: 'Welcome! Available for student consultations in Room ' + cp.room
      }
    });
    await db.qrCode.upsert({ where: { token: `vnr-${cp.slug}` }, update: {}, create: { professorId: prof.id, token: `vnr-${cp.slug}` } });
    if (!await db.officeHour.count({ where: { professorId: prof.id } })) {
      await db.officeHour.createMany({
        data: [1, 2, 3, 4, 5].map(dayOfWeek => ({
          professorId: prof.id,
          dayOfWeek,
          startTime: '10:00',
          endTime: '12:00',
          notes: `Consultations in Room ${cp.room}`
        }))
      });
    }
  }

  for (let i = 0; i < names.length; i++) {
    const [code, name] = departments[Math.floor(i / 4)];
    const dept = await db.department.upsert({ where: { code }, update: {}, create: { code, name } });
    const blockCode = `VNR-${Math.floor(i / 8) + 1}`;
    const building = await db.building.upsert({ where: { code: blockCode }, update: {}, create: { code: blockCode, name: `Academic Block ${Math.floor(i / 8) + 1}` } });
    const floor = String(1 + Math.floor((i % 8) / 4));
    const room = `${floor}${String(i % 4 + 1).padStart(2, '0')}`;
    const office = await db.office.upsert({ where: { buildingId_floor_room: { buildingId: building.id, floor, room } }, update: {}, create: { buildingId: building.id, floor, room, label: `${code} Faculty Room` } });
    const slug = names[i].toLowerCase().replaceAll(' ', '-');
    const email = `${slug.replaceAll('-', '.')}@vnr.demo`;
    const user = await db.user.upsert({ where: { email }, update: {}, create: { email, passwordHash, role: 'PROFESSOR' } });
    const prof = await db.professor.upsert({ where: { slug }, update: {}, create: { userId: user.id, slug, displayName: `Dr. ${names[i]}`, designation: i % 4 === 0 ? 'Professor & HOD' : i % 2 ? 'Associate Professor' : 'Assistant Professor', departmentId: dept.id, officeId: office.id, publicContact: email, consultationDetails: 'Happy to help with coursework, project mentoring and academic guidance. Request a consultation or visit during posted office hours. All times are in IST.' } });
    const status: FacultyStatus = (['AVAILABLE', 'IN_CLASS', 'AVAILABLE', 'IN_MEETING', 'AWAY'] as const)[i % 5];
    await db.professorStatus.upsert({ where: { professorId: prof.id }, update: {}, create: { professorId: prof.id, status, expiresAt: new Date(Date.now() + 8 * 3600000), expectedReturnAt: status === 'AVAILABLE' ? null : new Date(Date.now() + (30 + i * 5) * 60000), publicMessage: status === 'AVAILABLE' ? 'Welcome! Available for student consultations.' : 'Please check my office hours or send a meeting request.' } });
    await db.qrCode.upsert({ where: { token: `vnr-${slug}` }, update: {}, create: { professorId: prof.id, token: `vnr-${slug}` } });
    if (!await db.officeHour.count({ where: { professorId: prof.id } })) await db.officeHour.createMany({ data: [1, 2, 3, 4, 5].map(dayOfWeek => ({ professorId: prof.id, dayOfWeek, startTime: i % 2 ? '14:00' : '10:00', endTime: i % 2 ? '16:00' : '12:00', notes: 'Coursework, projects & academic mentoring' })) });
  }
  console.log('Campus faculty provisioned (including Prasanna Mam, Thirupathi Nanuvala Sir, Akhil Sir). Password: DemoPass123!');
}
main().finally(() => db.$disconnect());
