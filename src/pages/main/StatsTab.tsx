import { Bell, Flag, Menu } from 'lucide-react';
import { RoutineIcon } from '../../components/RoutineIcon';
import { C } from '../../constants/colors';
import { WEEKDAY_KO } from '../../constants/days';
import { FAIL_REASONS, FAIL_REASON_MESSAGES } from '../../constants/goals';
import { addDays, toDateStr } from '../../utils/date';
import { barColorsByRank, barColorsTopLow, buildCategoryStats, buildDailyStats, buildWeekdayStats, compareRates, goalYearOf, lowestOf, monthOverMonth, plainReason, rangeRate, statsRanges, statsYearsOf, sumRange } from '../../utils/stats';

export function StatsTab({ allRoutines, failMsgSeed, goals, onOpenMenu, onOpenNoti, setStatsPeriod, setStatsYear, statsPeriod, statsRecords, statsYear }: any) {
  const today = new Date();
  const thisYear = today.getFullYear();
  const { summaryStart, weekStart, fetchStart } = statsRanges(today);
  // 보고 있는 연도: 올해 또는 연간 그래프에서 누른 지난 연도
  const years = statsYearsOf(allRoutines || [], goals || [], thisYear);
  const viewYear = statsYear !== null && statsYear < thisYear ? statsYear : thisYear;
  const isPast = viewYear < thisYear;
  const yearStart = new Date(viewYear, 0, 1);
  const yearEnd = isPast ? new Date(viewYear, 11, 31) : today; // 보고 있는 연도의 마지막 날 (올해는 오늘까지)

  // 연간 그래프에 필요한 모든 해 + 최근 3개월을 한 번에 계산해 두고 필요한 구간만 꺼내 쓴다
  const firstYearStart = new Date(years[0], 0, 1);
  const dailyStart = firstYearStart < fetchStart ? firstYearStart : fetchStart;
  const daily = buildDailyStats(allRoutines || [], statsRecords || [], dailyStart, today);
  const summaryFrom = isPast ? yearStart : summaryStart;
  const hasSummaryData = sumRange(daily, summaryFrom, yearEnd).e > 0;

  // --- 기간별 그래프: 일간=이번 주, 주간=이번 달 주차, 월간=보고 있는 연도, 연간=연도별 ---
  // 지난 연도를 볼 때는 일간·주간(이번 주·이번 달)이 의미가 없어서 월간·연간만
  let period = statsPeriod === 'day' ? 'day' : statsPeriod === 'month' ? 'month' : statsPeriod === 'year' ? 'year' : 'week';
  if (isPast && (period === 'day' || period === 'week')) period = 'month';
  const selectYear = (y: number) => setStatsYear(y >= thisYear ? null : y);
  const chartData: { label: string; rate: number | null; year?: number }[] = [];
  let periodDesc = '';

  if (period === 'day') {
    periodDesc = '이번 주 요일별 수행 통계예요';
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      chartData.push({ label: WEEKDAY_KO[d.getDay()], rate: toDateStr(d) <= toDateStr(today) ? rangeRate(daily, d, d) : null });
    }
  } else if (period === 'week') {
    periodDesc = '이번 달 주차별 수행 통계예요';
    // 달력의 한 줄(일~토)이 한 주차
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
    for (let w = 0; w < weeks; w++) {
      const rowStart = addDays(first, w * 7 - first.getDay());
      const from = rowStart < first ? first : rowStart;
      const rowEnd = addDays(rowStart, 6);
      const to = rowEnd > last ? last : rowEnd;
      chartData.push({ label: `${w + 1}주차`, rate: toDateStr(from) <= toDateStr(today) ? rangeRate(daily, from, to < today ? to : today) : null });
    }
  } else if (period === 'month') {
    periodDesc = isPast ? `${viewYear}년 월별 수행 통계예요` : '이번 년도 월별 수행 통계예요';
    for (let m = 0; m < 12; m++) {
      const from = new Date(viewYear, m, 1);
      const to = new Date(viewYear, m + 1, 0);
      chartData.push({ label: `${m + 1}월`, rate: from <= today ? rangeRate(daily, from, to < today ? to : today) : null });
    }
  } else {
    periodDesc = '연간 수행 통계예요\n그래프를 클릭하면 해당 연도의 기록을 볼 수 있어요';
    years.forEach(y => {
      const to = y === thisYear ? today : new Date(y, 11, 31);
      chartData.push({ label: `${y}년`, rate: rangeRate(daily, new Date(y, 0, 1), to), year: y } as any);
    });
  }
  // 기간별 루틴 막대: 최고 5보라 / 그 외 3보라 / 최저 1.5보라
  const chartColors = barColorsTopLow(chartData.map(c => c.rate), 'var(--p5)', 'var(--p3)', 'var(--p15)');

  // --- 요약: 올해는 최근 3개월, 지난 연도는 그 해 1년 ---
  const weekdayStats = buildWeekdayStats(daily, summaryFrom, yearEnd);
  const worstDays = lowestOf(weekdayStats);
  const daysWithData = weekdayStats.filter(d => d.rate !== null).length;
  // 올해: 지난 달 대비 / 지난 연도: 그 전 해 대비
  const mom = isPast
    ? compareRates(daily, yearStart, yearEnd, new Date(viewYear - 1, 0, 1), new Date(viewYear - 1, 11, 31))
    : monthOverMonth(daily, today);
  // 카테고리별 그래프는 보고 있는 연도 전체, 요약의 '가장 낮은 카테고리'는 요약 기간 기준
  const routineCats = buildCategoryStats(allRoutines || [], statsRecords || [], yearStart, yearEnd);
  const recentCats = isPast ? routineCats : buildCategoryStats(allRoutines || [], statsRecords || [], summaryStart, today);
  const worstRoutineCats = lowestOf(recentCats);

  // --- 목표: 보고 있는 연도 기준 ---
  const yearGoals = (goals || []).filter((g: any) => goalYearOf(g) === viewYear);
  const goalCatMap: Record<string, { success: number; done: number; total: number }> = {};
  yearGoals.forEach((g: any) => {
    const c = g.category || '기타';
    if (!goalCatMap[c]) goalCatMap[c] = { success: 0, done: 0, total: 0 };
    goalCatMap[c].total++;
    if (g.status === '성공') { goalCatMap[c].success++; goalCatMap[c].done++; }
    if (g.status === '실패') goalCatMap[c].done++;
  });
  const goalCats = Object.keys(goalCatMap).map(c => {
    const v = goalCatMap[c];
    return { name: c, ...v, rate: v.done > 0 ? Math.round((v.success / v.done) * 100) : null };
  }).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

  const failedGoals = yearGoals.filter((g: any) => g.status === '실패');
  const counts: Record<string, number> = Object.fromEntries(FAIL_REASONS.map(r => [r, 0]));
  failedGoals.forEach((g: any) => {
    if (!g.reason) return;
    g.reason.split(',').map((r: string) => r.trim()).forEach((r: string) => {
      if (counts[r] !== undefined) counts[r]++;
    });
  });
  const dynamicFailData = Object.keys(counts).map(name => ({
    name,
    rate: failedGoals.length > 0 ? Math.round((counts[name] / failedGoals.length) * 100) : 0,
  })).sort((a, b) => b.rate - a.rate);

  // 가장 많은 실패 원인 + 그 원인에 맞는 문구 (방문할 때마다 10개 중 하나, 동점이면 그중 한 원인을 골라서)
  const topFailRate = dynamicFailData.length ? dynamicFailData[0].rate : 0;
  const topFailNames = topFailRate > 0 ? dynamicFailData.filter(f => f.rate === topFailRate).map(f => plainReason(f.name)) : [];
  const pickedCause = topFailNames.length ? topFailNames[Math.floor(failMsgSeed[0] * topFailNames.length)] : '';
  const causeMsgs = FAIL_REASON_MESSAGES[pickedCause] || [];
  const failMessage = causeMsgs.length ? causeMsgs[Math.floor(failMsgSeed[1] * causeMsgs.length) % causeMsgs.length] : '';

  // 막대 색
  // 카테고리별 루틴: 최고 빨강 / 그 외 주황(목표의 '진행중' 글씨색) / 최저 흐린 주황
  const routineCatColors = barColorsTopLow(routineCats.map(c => c.rate), 'var(--red)', 'var(--orange)', 'var(--orange15)');
  // 카테고리별 목표: 최고 진한 남색 / 그 외 중간 남색 / 최저 연한 남색 (세 색의 밝기 간격을 같게)
  const goalCatColors = barColorsTopLow(goalCats.map(c => c.rate), 'var(--navy3)', 'var(--navy18)', 'var(--navy2)');
  const failColors = barColorsByRank(dynamicFailData.map(f => f.rate), 'var(--red)', 'var(--orange2)');

  // 저채도·중명도 보라 (요약에서 강조할 때)
  const MUTED_PURPLE = 'var(--p5)';

  // 심볼은 둥근 사각형 안에. 오른쪽 두 줄(이름·연도)의 높이를 사각형 높이(32px)에 딱 맞춤
  const sectionTitle = (icon: any, text: string, sub: string, color: string, boxBg: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', margin: '0 0 14px 2px' }}>
      <div className="stats-icon-box" style={{ background: boxBg }}>{icon}</div>
      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '32px' }}>
        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--g4)', lineHeight: '17px' }}>{text}</div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: color, lineHeight: '13px' }}>{sub}</div>
      </div>
    </div>
  );

  const barRow = (name: string, rate: number | null, note: string, color: string) => (
    <div key={name} style={{ fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '600', color: 'var(--g3)' }}>
        <span>{name}</span>
        <span style={{ color: rate === null ? 'var(--g1)' : 'var(--g3)' }}>
          {rate === null ? '기록 없음' : `${rate}%`}
          <span style={{ fontSize: '11px', color: 'var(--g1)', marginLeft: '6px' }}>{note}</span>
        </span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${rate ?? 0}%`, background: color, borderRadius: '4px' }}></div></div>
    </div>
  );

  // 요약 레포트 (최근 3개월): 머리말 아래에 요일 / 카테고리 / 지난 달 대비 순서
  const summaryLines: any[] = [
    // 모든 요일이 동점이면 요일을 전부 나열하는 대신 따로 안내
    daysWithData < 2 ? '요일별로 비교할 기록이 아직 부족해요.'
      : worstDays.length === daysWithData ? '요일마다 수행률이 같았어요.'
      : <><b style={{ color: MUTED_PURPLE }}>{worstDays.map(d => d.label).join(', ')}요일</b>에 가장 수행률이 저조했어요.</>,
    recentCats.length === 0 ? '카테고리별로 비교할 기록이 아직 부족해요.'
      : recentCats.length === 1 ? '카테고리가 하나뿐이라 비교할 수 없어요.'
      : worstRoutineCats.length === recentCats.length ? '카테고리마다 수행률이 같았어요.'
      : <><b style={{ color: MUTED_PURPLE }}>{worstRoutineCats.map(c => c.name).join(', ')}</b> 카테고리의 수행률이 가장 낮았어요.</>,
    mom.kind === 'none' ? (isPast ? '전년도 기록이 없어 비교할 수 없어요.' : '지난 달 기록이 없어 비교할 수 없어요.')
      : mom.kind === 'same' ? (isPast ? '전년도와 수행률이 같아요.' : '지난 달과 수행률이 같아요.')
      : <>{isPast ? '전년도' : '지난 달'} 대비 수행률은 <b style={{ color: mom.kind === 'up' ? 'var(--green)' : 'var(--red)' }}>{mom.pct}%p {mom.kind === 'up' ? '증가' : '감소'}</b>했어요.</>,
  ];

  return (
    <>
      <div className="header-row"><Menu size={22} className="cursor-pointer" color={C.g3} onClick={onOpenMenu} /><h3 className="header-title">통계</h3><Bell size={22} color={C.g3} onClick={onOpenNoti} /></div>
      <div className="scroll-content">
        {isPast && (
          <div className="past-year-bar">
            <span>📅 <b>{viewYear}년</b> 기록을 보고 있어요</span>
            <button onClick={() => setStatsYear(null)}>올해로 돌아가기</button>
          </div>
        )}
        <div style={{ fontSize: '12.5px', color: 'var(--g2)', lineHeight: 1.7, textAlign: 'left', marginBottom: '24px', fontWeight: '500' }}>
          {isPast ? `${viewYear}년의 ` : '올해의 '}<b style={{ color: 'var(--p5)' }}>루틴 수행률</b>과 <b style={{ color: 'var(--navy)' }}>목표 달성률</b>을 보여드려요.
        </div>

        {/* ===================== 루틴 ===================== */}
        <div style={{ background: '#ffffff', border: '1px solid var(--p1)', borderRadius: '20px', padding: '18px 16px', marginBottom: '28px' }}>
          {sectionTitle(<RoutineIcon size={20} strokeWidth={2.4} color={C.p5} />, '루틴', `${viewYear}년`, 'var(--p5)', 'var(--p15)')}

          <div className="stats-chart-title" style={{ marginLeft: '2px' }}>기간별 루틴 수행률</div>
          <div className="filter-tabs" style={{ padding: 0, margin: '10px 0 6px', gap: '8px' }}>
            {!isPast && <button className={`chip chip-lavender ${period === 'day' ? 'active' : ''}`} onClick={() => setStatsPeriod('day')}>일간</button>}
            {!isPast && <button className={`chip chip-lavender ${period === 'week' ? 'active' : ''}`} onClick={() => setStatsPeriod('week')}>주간</button>}
            <button className={`chip chip-lavender ${period === 'month' ? 'active' : ''}`} onClick={() => setStatsPeriod('month')}>월간</button>
            <button className={`chip chip-lavender ${period === 'year' ? 'active' : ''}`} onClick={() => setStatsPeriod('year')}>연간</button>
          </div>
          {/* 그래프 제목의 0.7배, 얇게 */}
          <div className="stats-chart-desc">{periodDesc}</div>

          <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 8px 10px', background: '#fff', border: '1px solid var(--surface)', borderRadius: '16px', marginTop: '10px' }}>
            {chartData.map((item, idx) => {
              // 연간 그래프: 막대(연도)를 누르면 그 해 기록을 본다
              const isYearBar = period === 'year' && item.year !== undefined;
              const isViewing = isYearBar && item.year === viewYear;
              return (
                <div key={idx} className={isYearBar ? 'year-bar' : undefined}
                     onClick={isYearBar ? () => selectYear(item.year as number) : undefined}
                     style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', minWidth: 0 }}>
                  <span style={{ fontSize: '8px', color: 'var(--g1)', fontWeight: '600', minHeight: '10px' }}>{item.rate === null ? '' : `${item.rate}%`}</span>
                  <div title={item.rate === null ? '기록 없음' : `${item.rate}%`}
                       style={{ height: `${(item.rate ?? 0) * 1.0}px`, width: period === 'month' ? '12px' : '20px', background: chartColors[idx], borderRadius: '5px', transition: '0.3s' }}></div>
                  <span style={{ fontSize: '9px', color: isViewing ? 'var(--p5)' : 'var(--g1)', fontWeight: isViewing ? '800' : '600', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="stats-chart-title" style={{ margin: '26px 0 0 2px' }}>카테고리별 루틴 수행률</div>
          <div className="stats-chart-desc" style={{ margin: '6px 0 10px 2px' }}>{isPast ? `${viewYear}년의` : '올해의'} 전체 루틴 수행률을 확인해 보세요</div>
          <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid var(--surface)' }}>
            {routineCats.length === 0
              ? <div style={{ fontSize: '13px', color: 'var(--g1)', paddingBottom: '16px' }}>아직 기록이 없어요.</div>
              : routineCats.map((c, i) => barRow(c.name, c.rate, `${c.done}/${c.expected}`, routineCatColors[i]))}
          </div>

          {/* 요약 레포트 (올해: 최근 3개월 / 지난 연도: 그 해 1년) */}
          <div className="stats-summary">
            {!hasSummaryData ? (
              <div className="stats-summary-item">{isPast ? `${viewYear}년 루틴 기록이 없어요.` : '아직 최근 3개월 루틴 기록이 없어요. 루틴을 만들고 체크해보세요.'}</div>
            ) : (
              <>
                <div className="stats-summary-head">{isPast ? `${viewYear}년 한 해 동안 트래커님의 루틴은` : '최근 3개월 간 트래커님의 루틴은'}</div>
                {summaryLines.map((l, i) => (
                  <div key={i} className="stats-summary-item">
                    <span className="stats-summary-dot" />
                    <span>{l}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ===================== 목표 ===================== */}
        <div style={{ background: '#ffffff', border: '1px solid var(--navy1)', borderRadius: '20px', padding: '18px 16px', marginBottom: '20px' }}>
          {sectionTitle(<Flag size={19} strokeWidth={2.4} color={C.navy} />, '목표', `${viewYear}년`, 'var(--navy)', 'var(--navy1)')}

          <div className="stats-chart-title" style={{ marginLeft: '2px' }}>카테고리별 목표 달성률</div>
          <div className="stats-chart-desc" style={{ margin: '6px 0 10px 2px' }}>{isPast ? `${viewYear}년의` : '올해의'} 카테고리별 목표 달성 통계예요</div>
          <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid var(--surface)' }}>
            {goalCats.length === 0
              ? <div style={{ fontSize: '13px', color: 'var(--g1)', paddingBottom: '16px' }}>{isPast ? `${viewYear}년에` : '올해'} 등록한 목표가 없어요.</div>
              : goalCats.map((c, i) => barRow(c.name, c.rate, c.done > 0 ? `성공 ${c.success}/완료 ${c.done}` : `진행중 ${c.total}`, goalCatColors[i]))}
          </div>

          <div className="stats-chart-title" style={{ margin: '26px 0 0 2px' }}>실패 원인 분석</div>
          <div className="stats-chart-desc" style={{ margin: '6px 0 10px 2px' }}>{isPast ? `${viewYear}년에` : '올해'} 실패한 목표들의 원인 통계예요</div>
          <div style={{ background: '#fff', padding: '18px 18px 4px', borderRadius: '16px', border: '1px solid var(--surface)' }}>
            {failedGoals.length === 0
              ? <div style={{ fontSize: '13px', color: 'var(--g1)', paddingBottom: '16px' }}>{isPast ? `${viewYear}년에` : '올해'} 실패로 기록된 목표가 없어요.</div>
              : dynamicFailData.map((f, i) => barRow(f.name, f.rate, '', failColors[i]))}
          </div>

          {/* 실패 원인 레포트 (목표 색에 맞춘 남색 계열). 실패 기록이 없으면 표시하지 않음 */}
          {topFailNames.length > 0 && (
            <div className="goal-summary">
              <div className="goal-summary-head">트래커님의 주된 목표 실패 원인은 <b>{topFailNames.join(', ')}!</b></div>
              <div className="goal-summary-body">{failMessage}</div>
            </div>
          )}

          {/* 지난 연도: 그 해의 목표 목록 (보기 전용) */}
          {isPast && (
            <>
              <div className="stats-chart-title" style={{ margin: '26px 0 10px 2px' }}>{viewYear}년 목표</div>
              <div style={{ background: '#fff', padding: '6px 16px', borderRadius: '16px', border: '1px solid var(--surface)' }}>
                {yearGoals.length === 0
                  ? <div style={{ fontSize: '13px', color: 'var(--g1)', padding: '12px 0' }}>{viewYear}년에 등록한 목표가 없어요.</div>
                  : [...yearGoals].sort((a: any, b: any) => String(b.endDate || b.startDate || '').localeCompare(String(a.endDate || a.startDate || ''))).map((g: any) => {
                    const c = g.status === '성공' ? 'var(--green)' : g.status === '실패' ? 'var(--red)' : 'var(--orange)';
                    return (
                      <div key={`pg-${g.id}`} className="past-goal">
                        <div className="past-goal-top">
                          <span className="past-goal-title">{g.title}</span>
                          <span style={{ color: c, fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{g.status}</span>
                        </div>
                        {g.status === '실패' && g.reason && <div className="past-goal-reason">{g.reason.split(',').map((r: string) => r.trim()).join(' · ')}</div>}
                        <div className="past-goal-date">{g.startDate || '-'} ~ {g.endDate || '-'}</div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </>
  );
}
