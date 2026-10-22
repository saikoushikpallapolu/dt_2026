import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
export function LiveSync() {
 const client=useQueryClient();
 useEffect(()=>{
  const stream=new EventSource('/api/v1/events');
  const refresh=()=>{ void client.invalidateQueries(); };
  stream.addEventListener('campus-change',refresh);
  stream.addEventListener('connected',refresh);
  window.addEventListener('online',refresh);
  return ()=>{stream.close();window.removeEventListener('online',refresh);};
 },[client]);
 return null;
}
