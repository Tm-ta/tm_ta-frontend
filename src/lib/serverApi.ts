export type ListItem = {
  date: string;               // 'YYYY-MM-DD'
  startTime: string;          // 'HH:MM:SS'
  endTime: string;            // 'HH:MM:SS'
  availableUsers: string[];
  availableUserCount: number;
};

export type UserAvailable = {
  availableDateTime: { date: string; availableTime: string }[];
};

// 쿼리 유틸
function qs(params: Record<string, any>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v])=>{
    if (v==null) return;
    if (Array.isArray(v)) v.forEach(x => u.append(k, String(x)));
    else u.append(k, String(v));
  });
  return `?${u.toString()}`;
}

// ===== endpoint wrappers (프록시 경유) =====

// 1) list
export async function fetchList(appointmentId: string, op: {
  userIds?: number[];
  minUsers?: number;
  maxUsers?: number;
  minConsecutiveHours?: number;
  maxConsecutiveHours?: number;
  sortBy?: 'DATE'|'USER_COUNT'|'DURATION';
}) {
  const url = `/api/x/server/api/appointment/${appointmentId}/list` + qs(op);
  const r = await fetch(url, { cache: 'no-store' });
  if(!r.ok) throw new Error('list error');
  return (await r.json()) as ListItem[];
}

// 2) table
export async function fetchTable(appointmentId: string, op: {
  userIds?: number[];
  minUsers?: number;
  maxUsers?: number;
  minConsecutiveHours?: number;
  maxConsecutiveHours?: number;
}) {
  const url = `/api/x/server/api/appointment/${appointmentId}/table` + qs(op);
  const r = await fetch(url, { cache: 'no-store' });
  if(!r.ok) throw new Error('table error');
  return (await r.json()) as ListItem[];
}

// 3) 특정 유저 조회
export async function fetchUserAvail(appointmentId: string, userId: number) {
  const url = `/api/x/server/api/appointment/${appointmentId}/user/${userId}`;
  const r = await fetch(url, { cache: 'no-store' });
  if(!r.ok) throw new Error('user get error');
  return (await r.json()) as UserAvailable;
}

// 4) 특정 유저 수정(PUT)
export async function putUserAvail(appointmentId: string, userId: number, body: UserAvailable) {
  const url = `/api/x/server/api/appointment/${appointmentId}/user/${userId}`;
  const r = await fetch(url, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!r.ok) throw new Error('user put error');
  return await r.text();
}

// 5) 그룹 생성
export async function createAppointment(body: {
  startTime: string;   // 'HH:MM:SS'
  endTime: string;     // 'HH:MM:SS'
  dates: string[];     // ['YYYY-MM-DD', ...]
}) {
  const url = `/api/x/server/api/appointment`;
  const r = await fetch(url, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!r.ok) throw new Error('create appointment error');
  return await r.text(); // groupId(string)
}

// 6) 일정 등록(POST)
export async function registerSchedule(appointmentId: string, body: {
  userName: string;
  availableDateTime: { date: string; availableTime: string }[];
}) {
  const url = `/api/x/server/api/appointment/${appointmentId}`;
  const r = await fetch(url, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!r.ok) throw new Error('register schedule error');
  return await r.text();
}

// 7) 네임
export async function fetchRandomName(appointmentId: string) {
  const url = `/api/x/name/api/name` + qs({ appointmentId });
  const r = await fetch(url, { cache: 'no-store' });
  if(!r.ok) throw new Error('name error');
  const data = await r.json();
  // 백 스펙 미정 키 처리
  const guess = data.user_name ?? data.name ?? data.username ?? '';
  return String(guess);
}

// 8) 피드백
export async function sendFeedback(body: { text: string; appointmentId?: string; meta?: any }) {
  const url = `/api/x/fb/api/feedback`;
  const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!r.ok) throw new Error('feedback error');
  return await r.text();
}
