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
  console.log('20 fictional VNR demo faculty provisioned. Existing records preserved. Password: DemoPass123!');
}
main().finally(() => db.$disconnect());
