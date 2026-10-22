import { describe,it,expect } from 'vitest';
import { officeHoursSchema } from './office-hours.js';
const slot={dayOfWeek:1,startTime:'10:00',endTime:'11:00'};
describe('Published office hours',()=>{
 it('accepts adjacent slots and an empty schedule',()=>{expect(officeHoursSchema.safeParse({officeHours:[slot,{...slot,startTime:'11:00',endTime:'12:00'}]}).success).toBe(true);expect(officeHoursSchema.safeParse({officeHours:[]}).success).toBe(true);});
 it('rejects reversed, overlapping and invalid times',()=>{for(const officeHours of [[{...slot,endTime:'09:00'}],[slot,{...slot,startTime:'10:30',endTime:'11:30'}],[{...slot,startTime:'25:00'}]])expect(officeHoursSchema.safeParse({officeHours}).success).toBe(false);});
 it('allows same time on different days',()=>expect(officeHoursSchema.safeParse({officeHours:[slot,{...slot,dayOfWeek:2}]}).success).toBe(true));
});