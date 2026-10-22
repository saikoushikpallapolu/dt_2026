import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const officeHoursSchema = z.object({
  officeHours: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), startTime: time, endTime: time, notes: z.string().max(200).optional().nullable() })).max(35),
}).superRefine(({ officeHours }, ctx) => {
  for (let i = 0; i < officeHours.length; i++) {
    const slot = officeHours[i];
    if (slot.endTime <= slot.startTime) ctx.addIssue({ code: 'custom', message: 'End time must be after start time', path: ['officeHours', i] });
    if (officeHours.some((other, j) => j < i && other.dayOfWeek === slot.dayOfWeek && other.startTime < slot.endTime && other.endTime > slot.startTime)) ctx.addIssue({ code: 'custom', message: 'Office hours cannot overlap', path: ['officeHours', i] });
  }
});
