type Slot={dayOfWeek:number;startTime:string;endTime:string};
export function NextAvailability({slots}:{slots:Slot[]}){
 const now=new Date(); const ist=new Date(now.getTime()+330*60000);
 const minutes=ist.getUTCHours()*60+ist.getUTCMinutes();const day=ist.getUTCDay();
 const future=slots.map(s=>{let offset=(s.dayOfWeek-day+7)%7;const [h,m]=s.startTime.split(':').map(Number);const [eh,em]=s.endTime.split(':').map(Number);if(offset===0&&eh*60+em<=minutes)offset=7;return {...s,offset,sort:offset*1440+h*60+m};}).sort((a,b)=>a.sort-b.sort)[0];
 if(!future)return <div className="panel text-sm muted">No weekly hours posted yet. Request a consultation to arrange a time.</div>;
 const label=future.offset===0?'Today':future.offset===1?'Tomorrow':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][future.dayOfWeek];
 return <div className="rounded-xl border border-violet-100 bg-violet-50 p-4"><p className="eyebrow">NEXT POSTED OFFICE HOURS</p><p className="font-semibold text-violet-950 mt-2">{label}, {future.startTime}–{future.endTime} IST</p><p className="text-xs text-slate-500 mt-1">Planned hours. Check the current status before visiting.</p></div>;
}
