// Team mode: the idea development tools (workspace, lab, board, scoring) are internal.
// Public visitors see a simple ideas page; opening the team area turns team mode on in this browser only.
const K = 'd360.team';
export const isTeam = () => { try { return localStorage.getItem(K) === '1'; } catch { return false; } };
export const setTeam = (on) => { try { on ? localStorage.setItem(K, '1') : localStorage.removeItem(K); } catch {} };
