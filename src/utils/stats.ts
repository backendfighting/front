import { DOW_KEYS, WEEKDAY_KO } from '../constants/days';
import { addDays, toDateStr } from './date';

// '⏱️ 시간 부족' -> '시간 부족'
export const plainReason = (r: string) => r.replace(/^[^\s가-힣]+\s*/, '');

// 가로 막대 색: 가장 높은 값(동점 포함)만 진한 색, 나머지는 다른 색
export const barColorsByRank = (rates: (number | null)[], top: string, rest: string) => {
  const max = Math.max(0, ...rates.map(r => r ?? 0));
  return rates.map(r => (max > 0 && r === max ? top : rest));
};

// 가장 높은 값(동점 포함) / 가장 낮은 값(동점 포함) / 그 외를 다른 색으로
// 기록이 없는 항목(null)은 비교에서 빼고 '그 외' 색. 모두 같은 값이면 전부 최고 색
export const barColorsTopLow = (rates: (number | null)[], top: string, rest: string, low: string) => {
  const vals = rates.filter((r): r is number => r !== null && r !== undefined);
  if (vals.length === 0) return rates.map(() => rest);
  const max = Math.max(...vals), min = Math.min(...vals);
  return rates.map(r => {
    if (r === null || r === undefined) return rest;
    if (max > 0 && r === max) return top;
    if (r === min && min < max) return low;
    return rest;
  });
};

// 통계에 필요한 기간: 요약은 최근 3개월, 그래프는 이번 주/이번 달/올해
export const statsRanges = (today: Date) => {
  const summaryStart = addDays(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const weekStart = addDays(today, -today.getDay());
  const fetchStart = [summaryStart, yearStart, weekStart].reduce((a, b) => (a < b ? a : b));
  return { summaryStart, yearStart, weekStart, fetchStart };
};

export type DayStat = { expected: number; done: number };

// 그 날짜에 일시정지(쉬는 중)였는지. pausedFrom <= 날짜 < resumedOn (resumedOn이 없으면 아직 쉬는 중)
// 서버가 일시정지 기록을 안 주면(예전 서버) 지금 꺼져 있는지로만 판단한다
export const isPausedOn = (r: any, k: string) => {
  if (!Array.isArray(r.pauses)) return r.active === false;
  return r.pauses.some((p: any) => p && p.pausedFrom
    && String(p.pausedFrom).slice(0, 10) <= k
    && (!p.resumedOn || k < String(p.resumedOn).slice(0, 10)));
};

// 그 날짜에 달력에 보이는 루틴인지 (쉬는 기간이 아니고, 요일이 맞고, 시작일~종료일 사이)
// 종료일은 '이 날부터 안 보임'을 뜻한다
export const isScheduledOn = (r: any, k: string, dow: string) =>
  !isPausedOn(r, k) &&
  Array.isArray(r.repeatDays) && r.repeatDays.includes(dow) &&
  (!r.startDate || String(r.startDate).slice(0, 10) <= k) &&
  (!r.endDate || k < String(r.endDate).slice(0, 10));

export const groupDoneRecords = (records: any[]) => {
  const byDate: Record<string, any[]> = {};
  records.forEach((r: any) => {
    if (r.completed === false) return;
    const k = String(r.recordDate).slice(0, 10);
    (byDate[k] = byDate[k] || []).push(r);
  });
  return byDate;
};

// 날짜마다 "해야 했던 루틴"과 "실제로 한 루틴"을 루틴 단위로 센다.
// 체크한 루틴은 그날 해야 했던 루틴에도 반드시 포함되므로 수행률이 100%를 넘지 않는다.
export const buildDailyStats = (routines: any[], records: any[], start: Date, end: Date) => {
  const doneByDate = groupDoneRecords(records);
  const out: Record<string, DayStat> = {};
  for (let d = new Date(start); toDateStr(d) <= toDateStr(end); d = addDays(d, 1)) {
    const k = toDateStr(d);
    const dow = DOW_KEYS[d.getDay()];
    const expectedIds = new Set<any>(routines.filter((r: any) => isScheduledOn(r, k, dow)).map((r: any) => r.routineId));
    const doneIds = new Set<any>((doneByDate[k] || []).map((r: any) => r.routineId));
    doneIds.forEach(id => expectedIds.add(id));
    out[k] = { expected: expectedIds.size, done: doneIds.size };
  }
  return out;
};

export const sumRange = (daily: Record<string, DayStat>, from: Date, to: Date) => {
  let e = 0, d = 0;
  for (let x = new Date(from); toDateStr(x) <= toDateStr(to); x = addDays(x, 1)) {
    const v = daily[toDateStr(x)];
    if (v) { e += v.expected; d += v.done; }
  }
  return { e, d };
};

// 기록이 하나도 없는 구간은 0%가 아니라 '기록 없음'(null)
export const rangeRate = (daily: Record<string, DayStat>, from: Date, to: Date) => {
  const { e, d } = sumRange(daily, from, to);
  return e > 0 ? Math.round((d / e) * 100) : null;
};

// 요일별 수행률 (from~to 사이만)
export const buildWeekdayStats = (daily: Record<string, DayStat>, from: Date, to: Date) => {
  const agg = Array.from({ length: 7 }, () => ({ expected: 0, done: 0 }));
  for (let x = new Date(from); toDateStr(x) <= toDateStr(to); x = addDays(x, 1)) {
    const v = daily[toDateStr(x)];
    if (!v) continue;
    agg[x.getDay()].expected += v.expected;
    agg[x.getDay()].done += v.done;
  }
  return agg.map((a, i) => ({
    label: WEEKDAY_KO[i],
    expected: a.expected,
    rate: a.expected > 0 ? Math.round((a.done / a.expected) * 100) : null,
  }));
};

// 카테고리별 루틴 수행률 (루틴 단위로 셈)
export const buildCategoryStats = (routines: any[], records: any[], start: Date, end: Date) => {
  const doneByDate = groupDoneRecords(records);
  const exp: Record<string, number> = {};
  const done: Record<string, number> = {};
  for (let d = new Date(start); toDateStr(d) <= toDateStr(end); d = addDays(d, 1)) {
    const k = toDateStr(d);
    const dow = DOW_KEYS[d.getDay()];
    const catOf = new Map<any, string>();
    routines.forEach((r: any) => { if (isScheduledOn(r, k, dow)) catOf.set(r.routineId, r.category || '기타'); });
    (doneByDate[k] || []).forEach((rec: any) => {
      if (!catOf.has(rec.routineId)) catOf.set(rec.routineId, rec.category || '기타');
      const c = catOf.get(rec.routineId) as string;
      done[c] = (done[c] || 0) + 1;
    });
    catOf.forEach(c => { exp[c] = (exp[c] || 0) + 1; });
  }
  return Object.keys(exp).map(c => ({
    name: c, done: done[c] || 0, expected: exp[c],
    rate: Math.round(((done[c] || 0) / exp[c]) * 100),
  })).sort((a, b) => b.rate - a.rate);
};

// 목표가 속한 연도: 마감일의 연도 (마감일이 없으면 시작일, 그것도 없으면 만든 날). 목표 탭과 통계가 같이 쓴다
export const goalYearOf = (g: any): number | null => {
  const base = g.endDate || g.startDate || g.createdAt;
  return base ? Number(String(base).slice(0, 4)) : null;
};

// 통계에서 볼 수 있는 연도들: 처음 루틴·목표를 만든 해부터 올해까지 (최근 5년)
export const STATS_MAX_YEARS = 5;

export const statsYearsOf = (routines: any[], goals: any[], thisYear: number) => {
  let first = thisYear;
  (routines || []).forEach((r: any) => {
    const base = r.startDate || r.createdAt;
    if (base) first = Math.min(first, Number(String(base).slice(0, 4)));
  });
  (goals || []).forEach((g: any) => { const y = goalYearOf(g); if (y) first = Math.min(first, y); });
  first = Math.max(first, thisYear - STATS_MAX_YEARS + 1);
  const years: number[] = [];
  for (let y = first; y <= thisYear; y++) years.push(y);
  return years;
};

// 두 구간의 수행률 비교 (퍼센트포인트)
export const compareRates = (daily: Record<string, DayStat>, curFrom: Date, curTo: Date, prevFrom: Date, prevTo: Date) => {
  const cur = sumRange(daily, curFrom, curTo);
  const prev = sumRange(daily, prevFrom, prevTo);
  if (cur.e === 0 || prev.e === 0) return { kind: 'none' as const };
  const diff = Math.round((cur.d / cur.e - prev.d / prev.e) * 100);
  if (diff === 0) return { kind: 'same' as const };
  return { kind: diff > 0 ? ('up' as const) : ('down' as const), pct: Math.abs(diff) };
};

// 지난 달 대비 수행률 변화 (퍼센트포인트: 40% -> 45% 이면 5%p 증가)
export const monthOverMonth = (daily: Record<string, DayStat>, today: Date) => {
  const thisM = sumRange(daily, new Date(today.getFullYear(), today.getMonth(), 1), today);
  const lastM = sumRange(daily, new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0));
  if (thisM.e === 0 || lastM.e === 0) return { kind: 'none' as const };
  const diff = Math.round((thisM.d / thisM.e - lastM.d / lastM.e) * 100);
  if (diff === 0) return { kind: 'same' as const };
  return { kind: diff > 0 ? ('up' as const) : ('down' as const), pct: Math.abs(diff) };
};

// 수행률이 가장 낮은 항목들 (동점이면 전부)
export const lowestOf = <T extends { rate: number | null }>(items: T[]) => {
  const valid = items.filter(x => x.rate !== null);
  if (valid.length === 0) return [];
  const min = Math.min(...valid.map(x => x.rate as number));
  return valid.filter(x => x.rate === min);
};
