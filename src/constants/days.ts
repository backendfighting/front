export const DAY_OPTIONS = [
  { v: 'MONDAY', l: '월' }, { v: 'TUESDAY', l: '화' }, { v: 'WEDNESDAY', l: '수' },
  { v: 'THURSDAY', l: '목' }, { v: 'FRIDAY', l: '금' }, { v: 'SATURDAY', l: '토' }, { v: 'SUNDAY', l: '일' },
];

export const ALL_DAYS = DAY_OPTIONS.map(d => d.v);

export const sortDays = (days: string[]) => ALL_DAYS.filter(d => days.includes(d));

export const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

// ===== 통계 계산 =====
export const DOW_KEYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
