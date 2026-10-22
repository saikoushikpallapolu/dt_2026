import { EventEmitter } from 'node:events';
export const liveUpdates = new EventEmitter();
liveUpdates.setMaxListeners(0);
// No faculty or private account data is broadcast: clients re-fetch authorized APIs.
export function publishCampusChange() { liveUpdates.emit('change'); }
