import { BASE_URL, authHeaders } from '../api/client';

export const getNotified = (): string[] => {
  try { return JSON.parse(localStorage.getItem('notifiedIds') || '[]'); } catch { return []; }
};

// 컴퓨터/폰 알림 띄우기. 누르면 open 에 적힌 화면(오늘의 미션 등)이 열린다
// (클릭 처리는 public/sw-notification.js 와 App 의 메시지 수신부에서 함)
// 기기 알림 켜짐 여부는 서버(계정)에 저장된다. 꺼져 있으면 서버가 알림을 아예 만들지 않으므로
// 여기서는 브라우저 알림 허용 여부만 확인한다
export const showDeviceNotification = async (title: string, body: string, open: string = 'todo') => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { await reg.showNotification(title, { body, icon: '/pwa-192x192.png', data: { open } }); return; }
  } catch { /* 아래로 이동 */ }
  try {
    const n = new Notification(title, { body, icon: '/pwa-192x192.png' });
    n.onclick = () => { window.focus(); n.close(); window.dispatchEvent(new CustomEvent('open-tab', { detail: open })); };
  } catch { /* 이 환경에서는 알림을 띄울 수 없음 */ }
};

// ===== 서버 알림 -> 화면용 형태 =====
export const formatNotiTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return d.toDateString() === new Date().toDateString() ? `오늘 ${hh}:${mm}` : `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
};

// 서버 알림 종류별 제목 (TODO/ROUTINE/MISSION 은 새 방식, 나머지는 예전 알림)
export const SERVER_NOTI_META: Record<string, { title: string; icon: string }> = {
  TODO: { title: '오늘의 할일', icon: '📌' },
  ROUTINE: { title: '매일 루틴', icon: '🔄' },
  MISSION: { title: '오늘의 미션', icon: '📋' },
  GOAL: { title: '목표 리마인더', icon: '🚩' },
  GOAL_OVERDUE: { title: '목표 기한 지남', icon: '⌛' },
  DEADLINE: { title: '마감 임박', icon: '⏰' },
  DAILY_SUMMARY: { title: '오늘의 할 일', icon: '📋' },
};

export const toServerNoti = (n: any) => {
  const meta = SERVER_NOTI_META[n.type] || { title: '알림', icon: '🔔' };
  return {
    id: `server-${n.notificationId}`,
    serverId: n.notificationId,
    type: String(n.type || '').toLowerCase(),
    icon: meta.icon,
    title: meta.title,
    desc: n.message,
    time: formatNotiTime(n.createdAt),
    unread: !n.read,
  };
};

// 알림: 몇 분 전 (0 = 시작 시간). 30분까지 5분, 1시간까지 10분, 3시간까지 30분 단위. 그 밖은 더블클릭해서 직접 입력
export const ALARM_MINUTES = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 90, 120, 150, 180];

export const formatAlarm = (m: number, startLabel: string) => {
  if (m === 0) return startLabel;
  if (m >= 60 && m % 60 === 0) return `${m / 60}시간 전`;
  if (m > 60) return `${Math.floor(m / 60)}시간 ${m % 60}분 전`;
  return `${m}분 전`;
};

// 할 일·루틴·목표에서 알림을 켜면, 알림 설정의 해당 종류도 자동으로 켠다
// 목표에 리마인더를 켜면 알림 설정의 '목표 리마인더 알림'도 켠다
// (할 일·루틴은 따로 스위치가 없고, 하나하나 정한 알림대로 온다)
export const ensureGoalAlarmOn = async () => {
  try {
    await fetch(`${BASE_URL}/api/users/me/alarm-settings`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ goalAlarmOn: true }) });
  } catch (e) { console.error('알림 설정 변경 실패', e); }
};
